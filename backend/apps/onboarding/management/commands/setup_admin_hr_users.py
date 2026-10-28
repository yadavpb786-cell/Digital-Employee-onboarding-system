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


class Command(BaseCommand):
    help = (
        'Securely creates or repairs HR Manager (arjun.mehta) and Admin (priya.sharma) '
        'demonstration accounts, ensuring exact RBAC role mapping and linked Employee profiles. '
        'Protected in production by ENABLE_DEMO_BOOTSTRAP or presence of DEMO_HR_PASSWORD/DEMO_ADMIN_PASSWORD.'
    )

    def add_arguments(self, parser):
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
            help='Password for the System Admin demo account (overrides DEMO_ADMIN_PASSWORD env var).'
        )
        parser.add_argument(
            '--reset-passwords',
            action='store_true',
            help='Force reset passwords if the users already exist.'
        )

    def handle(self, *args, **options):
        is_production = bool(os.getenv('RENDER') or os.getenv('PRODUCTION', '').lower() == 'true')

        # 1. Resolve bootstrap authorization
        bootstrap_flag_val = None
        bootstrap_flag_source = None
        for k, v in os.environ.items():
            norm_k = k.strip().upper()
            if norm_k in ('ENABLE_DEMO_BOOTSTRAP', 'SETUP_DEMO_USER', 'BOOTSTRAP_DEMO_USER', 'DEMO_BOOTSTRAP'):
                if _is_truthy(v):
                    bootstrap_flag_val = 'true'
                    bootstrap_flag_source = k.strip()
                    break
                elif _is_falsy(v):
                    bootstrap_flag_val = 'false'
                    bootstrap_flag_source = k.strip()

        # 2. Resolve passwords from CLI or Environment
        hr_password = options.get('hr_password')
        hr_password_source = '--hr-password CLI' if hr_password else None
        if not hr_password:
            hr_password, hr_password_source = _resolve_env_password({
                'DEMO_HR_PASSWORD',
                'DEMO_HR_USER_PASSWORD',
                'HR_DEMO_PASSWORD',
                'HR_PASSWORD',
            })

        admin_password = options.get('admin_password')
        admin_password_source = '--admin-password CLI' if admin_password else None
        if not admin_password:
            admin_password, admin_password_source = _resolve_env_password({
                'DEMO_ADMIN_PASSWORD',
                'DEMO_ADMIN_USER_PASSWORD',
                'ADMIN_DEMO_PASSWORD',
                'ADMIN_PASSWORD',
            })

        # Presence of HR or Admin passwords indicates operator intent
        passwords_detected = bool(hr_password or admin_password)
        is_authorized = (
            bootstrap_flag_val == 'true' or
            (passwords_detected and bootstrap_flag_val != 'false') or
            bool(options.get('hr_password') or options.get('admin_password'))
        )

        # Collect safe diagnostic key names
        relevant_keys = sorted([
            k.strip() for k in os.environ.keys()
            if any(term in k.strip().upper() for term in ('BOOTSTRAP', 'DEMO', 'HR', 'ADMIN', 'RENDER', 'PRODUCTION'))
            and not any(secret in k.strip().upper() for secret in ('SECRET_KEY', 'DATABASE_URL', 'AUTH_TOKEN', 'JWT'))
        ])

        # Safe diagnostic logs (ONLY keys, booleans, and non-sensitive sources)
        self.stdout.write("================================================================================")
        self.stdout.write("[setup_admin_hr_users:diagnostics] Safe Environment Diagnostics:")
        self.stdout.write(f"  * is_production: {is_production} (RENDER={bool(os.getenv('RENDER'))}, PRODUCTION={os.getenv('PRODUCTION')})")
        self.stdout.write(f"  * bootstrap_flag_present: {bool(bootstrap_flag_source)} (source: {bootstrap_flag_source or 'None'})")
        self.stdout.write(f"  * normalized_bootstrap_value: {bootstrap_flag_val or 'not_set'}")
        self.stdout.write(f"  * bootstrap_authorized: {is_authorized}")
        self.stdout.write(f"  * hr_password_present: {bool(hr_password)} (source: {hr_password_source or 'None'})")
        self.stdout.write(f"  * admin_password_present: {bool(admin_password)} (source: {admin_password_source or 'None'})")
        self.stdout.write(f"  * relevant_environment_keys: {relevant_keys}")
        self.stdout.write("================================================================================")

        # Production authorization safeguard
        if is_production and not is_authorized:
            self.stdout.write(self.style.WARNING(
                "[setup_admin_hr_users] HR/Admin account bootstrap is disabled in production. "
                "To enable one-time setup, set ENABLE_DEMO_BOOTSTRAP=true or configure DEMO_HR_PASSWORD and DEMO_ADMIN_PASSWORD in Render Environment."
            ))
            return

        # If neither HR nor Admin password was provided in CLI or environment:
        if not hr_password and not admin_password:
            existing_hr = User.objects.filter(username__iexact="arjun.mehta").first()
            existing_admin = User.objects.filter(username__iexact="priya.sharma").first()
            if existing_hr and existing_admin:
                self.stdout.write(self.style.SUCCESS(
                    "[setup_admin_hr_users:SUCCESS] HR and Admin demonstration accounts already exist. Preserving credentials."
                ))
                return
            else:
                self.stdout.write(self.style.NOTICE(
                    "[setup_admin_hr_users] Neither DEMO_HR_PASSWORD nor DEMO_ADMIN_PASSWORD was configured in environment. Skipping."
                ))
                return

        # Catalog definitions for HR Manager and System Administrator
        hr_admin_catalog = [
            {
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
                "password": hr_password,
                "password_source": hr_password_source,
                "is_staff": False,
                "is_superuser": False,
                "phone": "+91 98111 22334",
                "date_of_birth": "1990-05-20",
                "blood_group": "A+",
            },
            {
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
                "password": admin_password,
                "password_source": admin_password_source,
                "is_staff": True,
                "is_superuser": True,
                "phone": "+91 98222 33445",
                "date_of_birth": "1992-11-12",
                "blood_group": "B+",
            }
        ]

        self.stdout.write(self.style.NOTICE("Initializing HR Manager and Admin account verification..."))

        processed_count = 0
        try:
            for cfg in hr_admin_catalog:
                uname = cfg["username"]
                pw = cfg["password"]

                # 1. Resolve existing user
                user = (
                    User.objects.filter(username__iexact=uname).first() or
                    User.objects.filter(email__iexact=cfg["email"]).first()
                )

                if not user:
                    if not pw:
                        self.stdout.write(self.style.ERROR(
                            f"[setup_admin_hr_users:FAILED] User '{uname}' does not exist and no password was provided. "
                            f"Please configure DEMO_{'HR' if cfg['system_role'] == Employee.ROLE_HR_MANAGER else 'ADMIN'}_PASSWORD in Render Environment."
                        ))
                        sys.exit(1)

                    user = User(
                        username=uname,
                        email=cfg["email"],
                        first_name=cfg["first_name"],
                        last_name=cfg["last_name"]
                    )
                    user.set_password(pw)
                    user.is_active = True
                    user.is_staff = cfg["is_staff"]
                    user.is_superuser = cfg["is_superuser"]
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f"  [+] Created User '{user.username}'."))
                else:
                    if pw:
                        user.set_password(pw)
                        user.email = cfg["email"]
                        user.first_name = cfg["first_name"]
                        user.last_name = cfg["last_name"]
                        user.is_active = True
                        if cfg["is_staff"]:
                            user.is_staff = True
                        if cfg["is_superuser"]:
                            user.is_superuser = True
                        user.save()
                        self.stdout.write(self.style.SUCCESS(f"  [*] Repaired/set credentials for User '{user.username}'."))
                    else:
                        # Existing user without new password provided - preserve existing credentials
                        user.is_active = True
                        if cfg["is_staff"]:
                            user.is_staff = True
                        if cfg["is_superuser"]:
                            user.is_superuser = True
                        user.save(update_fields=['is_active', 'is_staff', 'is_superuser'])
                        self.stdout.write(self.style.NOTICE(f"  [*] Preserved existing credentials for User '{user.username}'."))

                # Verify password if a password was set
                if pw and not user.check_password(pw):
                    raise CommandError(f"Password verification check failed for User '{user.username}'.")

                # 2. Resolve or create linked Employee record (prevent duplicates)
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

                # 3. Ensure EmployeeProfile exists
                EmployeeProfile.objects.get_or_create(
                    employee=emp,
                    defaults={
                        "phone": cfg["phone"],
                        "date_of_birth": cfg["date_of_birth"],
                        "blood_group": cfg["blood_group"],
                        "address": "Silicon Heights, Sector 62",
                        "city": "Chandigarh",
                        "state": "Punjab",
                        "pincode": "160062",
                        "emergency_contact_name": "Emergency Support",
                        "emergency_contact_relation": "Partner",
                        "emergency_contact_phone": "+91 98765 00000",
                        "is_completed": True
                    }
                )

                processed_count += 1

            # Ensure default milestones exist
            try:
                ensure_default_stages()
            except Exception:
                pass

            self.stdout.write(self.style.SUCCESS(
                f"[setup_admin_hr_users:SUCCESS] Successfully configured {processed_count} administrative demo account(s)."
            ))

        except Exception as err:
            self.stdout.write(self.style.ERROR(f"[setup_admin_hr_users:FAILED] Error during HR/Admin bootstrap: {err}"))
            sys.exit(1)
