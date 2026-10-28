import os
import sys
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from apps.onboarding.models import Employee, EmployeeProfile
from apps.onboarding.views import ensure_default_stages


def _normalize_str(val):
    if val is None:
        return ''
    s = str(val).strip()
    if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
        s = s[1:-1].strip()
    return s


def _is_truthy(val):
    clean = _normalize_str(val).lower().rstrip(';,')
    if '=' in clean:
        clean = clean.split('=', 1)[1].strip().strip('"\'')
    return clean in ('true', '1', 'yes', 't', 'y', 'enable', 'enabled', 'on')


def _is_falsy(val):
    clean = _normalize_str(val).lower().rstrip(';,')
    if '=' in clean:
        clean = clean.split('=', 1)[1].strip().strip('"\'')
    return clean in ('false', '0', 'no', 'off', 'disable', 'disabled')


def _resolve_env_password(key_aliases):
    """
    Safely resolves a password from environment variable aliases.
    Strips accidental whitespace, wrapping quotes, and pasted KEY=VALUE prefixes.
    NEVER logs or exposes the password.
    """
    for k, v in os.environ.items():
        norm_k = k.strip().upper()
        if norm_k in key_aliases:
            val = _normalize_str(v)
            for prefix in [f"{alias}=" for alias in key_aliases] + ['PASSWORD=']:
                if val.upper().startswith(prefix.upper()):
                    val = _normalize_str(val[len(prefix):])
                    break
            if val:
                return val, k.strip()
    return None, None


def _resolve_bootstrap_flag():
    """
    Robustly resolves whether demo account bootstrap is authorized.
    Scans environment variable keys case-insensitively, handles trailing spaces,
    surrounding quotes, embedded KEY=VALUE formats, and aliases.
    Also detects intent if DEMO_USER_PASSWORD, DEMO_HR_PASSWORD, or DEMO_ADMIN_PASSWORD was provided.
    Returns (authorized: bool, source_key: str, normalized_value: str).
    """
    target_keys = {
        'ENABLE_DEMO_BOOTSTRAP',
        'SETUP_DEMO_USER',
        'BOOTSTRAP_DEMO_USER',
        'ENABLE_BOOTSTRAP',
        'DEMO_BOOTSTRAP',
    }

    raw_falsy_key = None

    # 1. Scan os.environ for explicit bootstrap flags
    for k, v in os.environ.items():
        norm_k = k.strip().upper()
        if norm_k in target_keys or 'DEMO_BOOTSTRAP' in norm_k or 'BOOTSTRAP_DEMO' in norm_k:
            if _is_truthy(v):
                return True, k.strip(), 'true'
            elif _is_falsy(v):
                raw_falsy_key = k.strip()

    # 2. Check for DEMO_USER_PASSWORD, DEMO_HR_PASSWORD, or DEMO_ADMIN_PASSWORD in environment.
    has_pw, pw_source = False, None
    for k, v in os.environ.items():
        norm_k = k.strip().upper()
        if norm_k in (
            'DEMO_USER_PASSWORD', 'DEMO_PASSWORD', 'DEMO_USER_PASS', 'BOOTSTRAP_PASSWORD', 'DEMO_ACCOUNT_PASSWORD',
            'DEMO_HR_PASSWORD', 'DEMO_HR_USER_PASSWORD', 'HR_DEMO_PASSWORD',
            'DEMO_ADMIN_PASSWORD', 'DEMO_ADMIN_USER_PASSWORD', 'ADMIN_DEMO_PASSWORD'
        ):
            if bool(_normalize_str(v)):
                has_pw = True
                pw_source = k.strip()
                break

    if has_pw and not raw_falsy_key:
        return True, f"{pw_source}_DETECTED", 'true_by_password_presence'

    if raw_falsy_key:
        return False, raw_falsy_key, 'false'

    return False, None, 'not_set'


def _resolve_account_passwords(options, target_username):
    """
    Resolves passwords for employee, HR, and admin accounts from CLI or environment.
    """
    # Employee password
    emp_cli = options.get('password') if target_username in ('rahul.kumar', 'all') else None
    emp_pw = emp_cli
    emp_src = '--password CLI' if emp_pw else None
    if not emp_pw:
        emp_pw, emp_src = _resolve_env_password({
            'DEMO_USER_PASSWORD',
            'DEMO_EMPLOYEE_PASSWORD',
            'DEMO_PASSWORD',
            'DEMO_USER_PASS',
            'BOOTSTRAP_PASSWORD',
        })

    # HR Manager password
    hr_cli = options.get('hr_password') or (options.get('password') if target_username == 'arjun.mehta' else None)
    hr_pw = hr_cli
    hr_src = '--hr-password CLI' if hr_pw else None
    if not hr_pw:
        hr_pw, hr_src = _resolve_env_password({
            'DEMO_HR_PASSWORD',
            'DEMO_HR_USER_PASSWORD',
            'HR_DEMO_PASSWORD',
            'HR_PASSWORD',
        })

    # Admin password
    admin_cli = options.get('admin_password') or (options.get('password') if target_username == 'priya.sharma' else None)
    admin_pw = admin_cli
    admin_src = '--admin-password CLI' if admin_pw else None
    if not admin_pw:
        admin_pw, admin_src = _resolve_env_password({
            'DEMO_ADMIN_PASSWORD',
            'DEMO_ADMIN_USER_PASSWORD',
            'ADMIN_DEMO_PASSWORD',
            'ADMIN_PASSWORD',
        })

    return {
        'rahul.kumar': (emp_pw, emp_src),
        'arjun.mehta': (hr_pw, hr_src),
        'priya.sharma': (admin_pw, admin_src),
    }


class Command(BaseCommand):
    help = (
        'Securely creates or repairs demonstration account(s) (Employee: rahul.kumar, '
        'HR Manager: arjun.mehta, Admin: priya.sharma) and ensures proper linkage to '
        'Employee identity profiles and RBAC system roles.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default=None,
            help='Specific demo account username (rahul.kumar, arjun.mehta, priya.sharma, all). Default: rahul.kumar.'
        )
        parser.add_argument(
            '--password',
            type=str,
            default=None,
            help='Password for the demo user account (overrides DEMO_USER_PASSWORD env var).'
        )
        parser.add_argument(
            '--hr-password',
            type=str,
            default=None,
            help='Password for the HR Manager demo account (overrides DEMO_HR_PASSWORD env var).'
        )
        parser.add_argument(
            '--admin-password',
            type=str,
            default=None,
            help='Password for the Admin demo account (overrides DEMO_ADMIN_PASSWORD env var).'
        )
        parser.add_argument(
            '--reset-password',
            action='store_true',
            help='Reset password if the user already exists.'
        )

    def handle(self, *args, **options):
        is_production = bool(os.getenv('RENDER') or os.getenv('PRODUCTION', '').lower() == 'true')
        bootstrap_enabled, flag_source, flag_norm_val = _resolve_bootstrap_flag()

        target_username = (
            options.get('username') or
            os.getenv('DEMO_USER_USERNAME', 'rahul.kumar')
        ).strip().lower()

        # If CLI passwords were passed, that also authorizes bootstrap
        if bool(options.get('password') or options.get('hr_password') or options.get('admin_password')):
            bootstrap_enabled = True
            flag_source = 'CLI option'
            flag_norm_val = 'true_by_cli'

        pw_map = _resolve_account_passwords(options, target_username)

        # Collect relevant diagnostic keys (NEVER log secrets, tokens, or values)
        relevant_keys = sorted([
            k.strip() for k in os.environ.keys()
            if any(term in k.strip().upper() for term in ('BOOTSTRAP', 'DEMO', 'HR', 'ADMIN', 'RENDER', 'PRODUCTION'))
            and not any(secret in k.strip().upper() for secret in ('SECRET_KEY', 'DATABASE_URL', 'AUTH_TOKEN', 'JWT'))
        ])

        # Safe diagnostic logs (ONLY keys and booleans — NEVER print password or secrets)
        self.stdout.write("================================================================================")
        self.stdout.write("[setup_demo_user:diagnostics] Safe Environment Diagnostics:")
        self.stdout.write(f"  * is_production: {is_production} (RENDER={bool(os.getenv('RENDER'))}, PRODUCTION={os.getenv('PRODUCTION')})")
        self.stdout.write(f"  * bootstrap_flag_present: {bool(flag_source)} (source: {flag_source or 'None'})")
        self.stdout.write(f"  * normalized_bootstrap_value: {flag_norm_val}")
        self.stdout.write(f"  * bootstrap_authorized: {bootstrap_enabled}")
        self.stdout.write(f"  * employee_password_present: {bool(pw_map['rahul.kumar'][0])} (source: {pw_map['rahul.kumar'][1] or 'None'})")
        self.stdout.write(f"  * hr_password_present: {bool(pw_map['arjun.mehta'][0])} (source: {pw_map['arjun.mehta'][1] or 'None'})")
        self.stdout.write(f"  * admin_password_present: {bool(pw_map['priya.sharma'][0])} (source: {pw_map['priya.sharma'][1] or 'None'})")
        self.stdout.write(f"  * relevant_environment_keys: {relevant_keys}")
        self.stdout.write("================================================================================")

        # In production environments, require explicit authorization flag
        if is_production and not bootstrap_enabled:
            self.stdout.write(self.style.WARNING(
                "[setup_demo_user] Demo account bootstrap is disabled in production. "
                "To enable one-time creation/repair, set ENABLE_DEMO_BOOTSTRAP=true in Render Environment."
            ))
            return

        # Standard definition catalogue for demo accounts
        demo_catalog = {
            "rahul.kumar": {
                "username": "rahul.kumar",
                "email": "rahul.kumar@novatech.io",
                "first_name": "Rahul",
                "last_name": "Kumar",
                "employee_id": "EMP-2026-8941",
                "role": "Software Engineer",
                "system_role": Employee.ROLE_EMPLOYEE,
                "designation": "Software Engineer",
                "department": "Data & Technology",
                "joining_date": "Monday, September 21, 2026",
                "joining_time": "09:30 AM",
                "location": "NOVA Tech – Chandigarh Office",
                "work_mode": "Hybrid (3 Days Office / 2 Days Remote)",
                "manager_name": "Arjun Mehta",
                "manager_role": "Engineering Director",
                "manager_email": "arjun.mehta@novatech.io",
                "hr_name": "Priya Sharma",
                "hr_role": "People & Culture Lead",
                "hr_email": "priya.sharma@novatech.io",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
                "phone": "+91 98765 43210",
                "date_of_birth": "1998-07-14",
                "blood_group": "O+",
                "emergency_contact_name": "Sunita Kumar",
                "emergency_contact_relation": "Mother",
                "emergency_contact_phone": "+91 98765 11223",
            },
            "arjun.mehta": {
                "username": "arjun.mehta",
                "email": "arjun.mehta@novatech.io",
                "first_name": "Arjun",
                "last_name": "Mehta",
                "employee_id": "EMP-2026-0010",
                "role": "Engineering Director",
                "system_role": Employee.ROLE_HR_MANAGER,
                "designation": "Engineering Director",
                "department": "Data & Technology",
                "joining_date": "Monday, January 15, 2024",
                "joining_time": "09:00 AM",
                "location": "NOVA Tech – Chandigarh Office",
                "work_mode": "On-site",
                "manager_name": "Vikram Malhotra",
                "manager_role": "VP of Engineering",
                "manager_email": "vikram.malhotra@novatech.io",
                "hr_name": "Priya Sharma",
                "hr_role": "People & Culture Lead",
                "hr_email": "priya.sharma@novatech.io",
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
                "phone": "+91 98111 22334",
                "date_of_birth": "1990-05-20",
                "blood_group": "A+",
                "emergency_contact_name": "Emergency Contact",
                "emergency_contact_relation": "Partner",
                "emergency_contact_phone": "+91 98765 00000",
            },
            "priya.sharma": {
                "username": "priya.sharma",
                "email": "priya.sharma@novatech.io",
                "first_name": "Priya",
                "last_name": "Sharma",
                "employee_id": "EMP-2026-0012",
                "role": "People & Culture Lead",
                "system_role": Employee.ROLE_ADMIN,
                "designation": "People & Culture Lead",
                "department": "People Operations",
                "joining_date": "Monday, March 04, 2024",
                "joining_time": "09:00 AM",
                "location": "NOVA Tech – Chandigarh Office",
                "work_mode": "Hybrid (3 Days Office / 2 Days Remote)",
                "manager_name": "Ananya Sen",
                "manager_role": "Chief People Officer",
                "manager_email": "ananya.sen@novatech.io",
                "hr_name": "Priya Sharma",
                "hr_role": "People & Culture Lead",
                "hr_email": "priya.sharma@novatech.io",
                "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
                "phone": "+91 98222 33445",
                "date_of_birth": "1992-11-12",
                "blood_group": "B+",
                "emergency_contact_name": "Emergency Support",
                "emergency_contact_relation": "Partner",
                "emergency_contact_phone": "+91 98765 00000",
            }
        }

        if target_username == 'all':
            accounts_to_process = list(demo_catalog.values())
        elif target_username in demo_catalog:
            accounts_to_process = [demo_catalog[target_username]]
        else:
            self.stdout.write(self.style.ERROR(
                f"[setup_demo_user:FAILED] Unknown target username '{target_username}'. Valid choices: rahul.kumar, arjun.mehta, priya.sharma, all"
            ))
            sys.exit(1)

        self.stdout.write(self.style.NOTICE(f"Initializing demonstration account setup for: {[a['username'] for a in accounts_to_process]}..."))

        processed_count = 0
        preserved_count = 0

        try:
            for cfg in accounts_to_process:
                uname = cfg["username"]
                pw, pw_src = pw_map[uname]

                # 1. Resolve or create User record
                user = (
                    User.objects.filter(username__iexact=uname).first() or
                    User.objects.filter(email__iexact=cfg["email"]).first()
                )

                if not user:
                    if not pw:
                        if target_username == uname:
                            self.stdout.write(self.style.ERROR(
                                f"[setup_demo_user:FAILED] Bootstrap is enabled, but no password was detected for '{uname}'. "
                                f"Please configure DEMO_{'HR' if cfg['system_role'] == Employee.ROLE_HR_MANAGER else ('ADMIN' if cfg['system_role'] == Employee.ROLE_ADMIN else 'USER')}_PASSWORD in Render Environment."
                            ))
                            sys.exit(1)
                        else:
                            self.stdout.write(self.style.NOTICE(
                                f"  [-] Skipped '{uname}': User does not exist and no password environment variable was provided."
                            ))
                            continue

                    user = User(
                        username=uname,
                        email=cfg["email"],
                        first_name=cfg["first_name"],
                        last_name=cfg["last_name"]
                    )
                    user.set_password(pw)
                    user.is_active = True
                    if cfg["system_role"] == Employee.ROLE_ADMIN:
                        user.is_staff = True
                        user.is_superuser = True
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f"  [+] Created User '{user.username}'."))
                    processed_count += 1
                else:
                    if pw:
                        # In bootstrap mode, set/repair credentials with the provided password
                        user.set_password(pw)
                        user.email = cfg["email"]
                        user.first_name = cfg["first_name"]
                        user.last_name = cfg["last_name"]
                        user.is_active = True
                        if cfg["system_role"] == Employee.ROLE_ADMIN:
                            user.is_staff = True
                            user.is_superuser = True
                        user.save()
                        self.stdout.write(self.style.SUCCESS(f"  [*] Repaired/set credentials for User '{user.username}'."))
                        processed_count += 1
                    else:
                        # Existing user without new password provided - preserve existing credentials!
                        user.is_active = True
                        if cfg["system_role"] == Employee.ROLE_ADMIN:
                            user.is_staff = True
                            user.is_superuser = True
                        user.save(update_fields=['is_active', 'is_staff', 'is_superuser'])
                        self.stdout.write(self.style.NOTICE(f"  [*] Preserved existing credentials for User '{user.username}'."))
                        preserved_count += 1

                # Verify password set successfully if a password was passed
                if pw and not user.check_password(pw):
                    raise CommandError(f"Password verification check failed for User '{user.username}'.")

                # 2. Resolve or create Employee profile
                emp = (
                    Employee.objects.filter(employee_id__iexact=cfg["employee_id"]).first() or
                    Employee.objects.filter(email__iexact=cfg["email"]).first() or
                    Employee.objects.filter(user=user).first()
                )

                if not emp:
                    emp = Employee.objects.create(
                        user=user,
                        employee_id=cfg["employee_id"],
                        name=f"{cfg['first_name']} {cfg['last_name']}".strip(),
                        email=cfg["email"],
                        role=cfg["role"],
                        system_role=cfg["system_role"],
                        designation=cfg["designation"],
                        department=cfg["department"],
                        joining_date=cfg["joining_date"],
                        joining_time=cfg["joining_time"],
                        location=cfg["location"],
                        work_mode=cfg["work_mode"],
                        manager_name=cfg["manager_name"],
                        manager_role=cfg["manager_role"],
                        manager_email=cfg["manager_email"],
                        hr_name=cfg["hr_name"],
                        hr_role=cfg["hr_role"],
                        hr_email=cfg["hr_email"],
                        avatar=cfg["avatar"]
                    )
                    self.stdout.write(self.style.SUCCESS(
                        f"  [+] Created Employee record '{emp.name}' ({emp.employee_id}) with Role: {emp.system_role}"
                    ))
                else:
                    emp.user = user
                    emp.system_role = cfg["system_role"]
                    emp.email = cfg["email"]
                    emp.role = cfg["role"]
                    emp.designation = cfg["designation"]
                    emp.save(update_fields=['user', 'system_role', 'email', 'role', 'designation'])
                    self.stdout.write(self.style.SUCCESS(
                        f"  [OK] Linked User '{user.username}' to Employee '{emp.name}' ({emp.employee_id}) with Role: {emp.system_role}"
                    ))

                # 3. Ensure personal profile exists
                EmployeeProfile.objects.get_or_create(
                    employee=emp,
                    defaults={
                        "phone": cfg["phone"],
                        "date_of_birth": cfg["date_of_birth"],
                        "blood_group": cfg["blood_group"],
                        "address": "Flat 402, Silicon Heights, Sector 62",
                        "city": "Chandigarh",
                        "state": "Punjab",
                        "pincode": "160062",
                        "emergency_contact_name": cfg["emergency_contact_name"],
                        "emergency_contact_relation": cfg["emergency_contact_relation"],
                        "emergency_contact_phone": cfg["emergency_contact_phone"],
                        "is_completed": True
                    }
                )

            # 4. Ensure milestones exist for onboarding dashboard
            try:
                ensure_default_stages()
            except Exception:
                pass

            if processed_count == 0 and preserved_count == 0:
                self.stdout.write(self.style.ERROR("[setup_demo_user:FAILED] No accounts were configured or verified."))
                sys.exit(1)

            self.stdout.write(self.style.SUCCESS(
                f"[setup_demo_user:SUCCESS] Demonstration account verification completed successfully ({processed_count} configured/repaired, {preserved_count} preserved)."
            ))

        except Exception as err:
            self.stdout.write(self.style.ERROR(f"[setup_demo_user:FAILED] Error during account bootstrap: {err}"))
            sys.exit(1)
