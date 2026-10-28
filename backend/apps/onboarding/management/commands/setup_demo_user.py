import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.conf import settings
from apps.onboarding.models import Employee, EmployeeProfile
from apps.onboarding.views import ensure_default_stages


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
            help='Reset password if the user already exists (requires DEMO_USER_PASSWORD or --password).'
        )

    def handle(self, *args, **options):
        is_production = bool(os.getenv('RENDER') or os.getenv('PRODUCTION', '').lower() == 'true')
        bootstrap_enabled = (
            os.getenv('ENABLE_DEMO_BOOTSTRAP', '').strip().lower() in ('true', '1', 'yes') or
            os.getenv('SETUP_DEMO_USER', '').strip().lower() in ('true', '1', 'yes')
        )

        # In production environments, require explicit environment flag authorization
        if is_production and not bootstrap_enabled:
            self.stdout.write(self.style.WARNING(
                "[!] Demo account bootstrap is disabled in production. "
                "To enable one-time creation/repair, set ENABLE_DEMO_BOOTSTRAP=true in environment."
            ))
            return

        target_username = (
            options.get('username') or
            os.getenv('DEMO_USER_USERNAME', 'rahul.kumar')
        ).strip().lower()

        raw_password = (
            options.get('password') or
            os.getenv('DEMO_USER_PASSWORD', '')
        ).strip()

        reset_password = bool(
            options.get('reset_password') or
            os.getenv('RESET_DEMO_PASSWORD', '').strip().lower() in ('true', '1', 'yes')
        )

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
                f"[!] Unknown target username '{target_username}'. Valid choices: rahul.kumar, arjun.mehta, priya.sharma, all"
            ))
            return

        self.stdout.write(self.style.NOTICE("Initializing NOVA Tech demonstration account verification..."))

        for cfg in accounts_to_process:
            # 1. Resolve or create User record
            user = (
                User.objects.filter(username__iexact=cfg["username"]).first() or
                User.objects.filter(email__iexact=cfg["email"]).first()
            )

            if not user:
                if not raw_password:
                    self.stdout.write(self.style.ERROR(
                        f"[!] Cannot create new user '{cfg['username']}': DEMO_USER_PASSWORD environment variable or --password argument is required."
                    ))
                    continue
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
                # Existing user: never automatically overwrite password unless explicitly instructed
                if reset_password and raw_password:
                    user.set_password(raw_password)
                    self.stdout.write(self.style.SUCCESS(f"  [*] Updated password for existing User '{user.username}'."))
                else:
                    self.stdout.write(self.style.NOTICE(f"  [i] User '{user.username}' already exists; preserving existing password."))

                user.email = cfg["email"]
                user.first_name = cfg["first_name"]
                user.last_name = cfg["last_name"]
                user.is_active = True
                if cfg["system_role"] == Employee.ROLE_ADMIN:
                    user.is_staff = True
                user.save()

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

        self.stdout.write(self.style.SUCCESS("NOVA Tech demonstration account verification completed successfully."))
