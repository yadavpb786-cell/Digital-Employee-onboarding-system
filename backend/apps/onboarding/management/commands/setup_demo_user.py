import os
import sys
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from apps.onboarding.models import Employee, EmployeeProfile
from apps.onboarding.views import ensure_default_stages


def _is_truthy(val):
    if not val:
        return False
    clean = str(val).strip().lower().strip('"\'')
    return clean in ('true', '1', 'yes', 't', 'y', 'enable', 'enabled', 'on')


def _resolve_bootstrap_flag():
    """
    Robustly resolves whether demo account bootstrap is authorized.
    Scans environment variable keys case-insensitively and handles trailing spaces/quotes.
    Also detects intent if DEMO_USER_PASSWORD was explicitly provided (unless bootstrap is explicitly false).
    """
    # 1. Direct standard names
    for key in (
        'ENABLE_DEMO_BOOTSTRAP',
        'SETUP_DEMO_USER',
        'BOOTSTRAP_DEMO_USER',
        'ENABLE_BOOTSTRAP',
        'DEMO_BOOTSTRAP',
    ):
        val = os.getenv(key)
        if val is not None and _is_truthy(val):
            return True, key

    # 2. Case-insensitive and trimmed scanning across all os.environ keys
    for k, v in os.environ.items():
        norm_k = k.strip().upper()
        if norm_k in (
            'ENABLE_DEMO_BOOTSTRAP',
            'SETUP_DEMO_USER',
            'BOOTSTRAP_DEMO_USER',
            'ENABLE_BOOTSTRAP',
            'DEMO_BOOTSTRAP',
        ):
            if _is_truthy(v):
                return True, k

    # 3. If DEMO_USER_PASSWORD or DEMO_PASSWORD is provided in env, that indicates clear intent
    # provided ENABLE_DEMO_BOOTSTRAP was not explicitly set to 'false' / '0'
    raw_flag = None
    for k, v in os.environ.items():
        if k.strip().upper() == 'ENABLE_DEMO_BOOTSTRAP':
            raw_flag = str(v).strip().lower().strip('"\'')
            break

    has_password = any(
        k.strip().upper() in ('DEMO_USER_PASSWORD', 'DEMO_PASSWORD', 'DEMO_USER_PASS', 'BOOTSTRAP_PASSWORD')
        and bool(str(v).strip())
        for k, v in os.environ.items()
    )
    if has_password and (raw_flag not in ('false', '0', 'no', 'off', 'disable', 'disabled')):
        return True, 'DEMO_USER_PASSWORD_DETECTED'

    return False, None


def _resolve_bootstrap_password(options):
    """
    Resolves demo account password from CLI options or environment variables.
    Handles key aliases, case-insensitivity, trailing whitespace, and wrapping quotes.
    NEVER logs or exposes the password value.
    """
    if options.get('password'):
        return options.get('password').strip(), '--password CLI'

    for k, v in os.environ.items():
        norm_k = k.strip().upper()
        if norm_k in (
            'DEMO_USER_PASSWORD',
            'DEMO_PASSWORD',
            'DEMO_USER_PASS',
            'BOOTSTRAP_PASSWORD',
            'DEMO_ACCOUNT_PASSWORD',
        ):
            val = str(v).strip()
            if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                val = val[1:-1].strip()
            if val:
                return val, k

    return None, None


class Command(BaseCommand):
    help = (
        'Securely creates or repairs demonstration account(s) and ensures '
        'proper linkage to Employee identity profiles. In production, this command '
        'is protected by the ENABLE_DEMO_BOOTSTRAP environment variable.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default=None,
            help='Specific demo account username to create or repair (default: rahul.kumar).'
        )
        parser.add_argument(
            '--password',
            type=str,
            default=None,
            help='Password for the demo user account (overrides DEMO_USER_PASSWORD env var).'
        )
        parser.add_argument(
            '--reset-password',
            action='store_true',
            help='Reset password if the user already exists.'
        )

    def handle(self, *args, **options):
        is_production = bool(os.getenv('RENDER') or os.getenv('PRODUCTION', '').lower() == 'true')
        bootstrap_enabled, flag_source = _resolve_bootstrap_flag()

        # If --password was explicitly passed on CLI, that also enables bootstrap
        if bool(options.get('password')):
            bootstrap_enabled = True
            flag_source = '--password CLI'

        raw_password, password_source = _resolve_bootstrap_password(options)

        # Safe diagnostic logs (ONLY keys and booleans — NEVER print password or secrets)
        relevant_keys = [
            k for k in os.environ.keys()
            if any(term in k.strip().upper() for term in ('BOOTSTRAP', 'DEMO', 'RENDER', 'PRODUCTION'))
        ]
        self.stdout.write(f"[setup_demo_user:diagnostics] is_production: {is_production}")
        self.stdout.write(f"[setup_demo_user:diagnostics] flag_detected: {bootstrap_enabled} (source: {flag_source or 'None'})")
        self.stdout.write(f"[setup_demo_user:diagnostics] password_detected: {bool(raw_password)} (source: {password_source or 'None'})")
        self.stdout.write(f"[setup_demo_user:diagnostics] relevant_env_keys: {relevant_keys}")

        # In production environments, require explicit authorization flag
        if is_production and not bootstrap_enabled:
            self.stdout.write(self.style.WARNING(
                "[setup_demo_user] Demo account bootstrap is disabled in production. "
                "To enable one-time creation/repair, set ENABLE_DEMO_BOOTSTRAP=true in environment."
            ))
            return

        # If bootstrap is enabled, password MUST be present
        if not raw_password:
            self.stdout.write(self.style.ERROR(
                "[setup_demo_user:FAILED] Bootstrap is enabled, but no password was detected. "
                "Please configure DEMO_USER_PASSWORD in Render Environment Variables."
            ))
            sys.exit(1)

        target_username = (
            options.get('username') or
            os.getenv('DEMO_USER_USERNAME', 'rahul.kumar')
        ).strip().lower()

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
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
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
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
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
                "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
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

        try:
            for cfg in accounts_to_process:
                # 1. Resolve or create User record
                user = (
                    User.objects.filter(username__iexact=cfg["username"]).first() or
                    User.objects.filter(email__iexact=cfg["email"]).first()
                )

                if not user:
                    user = User(
                        username=cfg["username"],
                        email=cfg["email"],
                        first_name=cfg["first_name"],
                        last_name=cfg["last_name"]
                    )
                    user.set_password(raw_password)
                    user.is_active = True
                    if cfg["system_role"] == Employee.ROLE_ADMIN:
                        user.is_staff = True
                        user.is_superuser = True
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f"  [+] Created User '{user.username}'."))
                else:
                    # In bootstrap mode, set/repair credentials with the provided password
                    user.set_password(raw_password)
                    user.email = cfg["email"]
                    user.first_name = cfg["first_name"]
                    user.last_name = cfg["last_name"]
                    user.is_active = True
                    if cfg["system_role"] == Employee.ROLE_ADMIN:
                        user.is_staff = True
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f"  [*] Repaired/set credentials for User '{user.username}'."))

                # Verify password set successfully
                if not user.check_password(raw_password):
                    raise CommandError(f"Password verification check failed for '{user.username}'.")

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
                    emp.save(update_fields=['user', 'system_role', 'email'])
                    self.stdout.write(self.style.SUCCESS(
                        f"  [OK] Linked User '{user.username}' to Employee '{emp.name}' ({emp.employee_id}) with Role: {emp.system_role}"
                    ))

                # 3. Ensure personal profile exists
                EmployeeProfile.objects.get_or_create(
                    employee=emp,
                    defaults={
                        "phone": "+91 98765 43210",
                        "date_of_birth": "1998-07-14",
                        "blood_group": "O+",
                        "address": "Flat 402, Silicon Heights, Sector 62",
                        "city": "Chandigarh",
                        "state": "Punjab",
                        "pincode": "160062",
                        "emergency_contact_name": "Sunita Kumar",
                        "emergency_contact_relation": "Mother",
                        "emergency_contact_phone": "+91 98765 11223",
                        "is_completed": True
                    }
                )

                # 4. Ensure milestones exist for onboarding dashboard
                try:
                    ensure_default_stages()
                except Exception:
                    pass

            self.stdout.write(self.style.SUCCESS("[setup_demo_user:SUCCESS] Demonstration account verification and setup completed successfully."))

        except Exception as err:
            self.stdout.write(self.style.ERROR(f"[setup_demo_user:FAILED] Error during account bootstrap: {err}"))
            sys.exit(1)
