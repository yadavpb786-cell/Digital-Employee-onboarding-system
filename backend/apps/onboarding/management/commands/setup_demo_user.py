from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.onboarding.models import Employee


class Command(BaseCommand):
    help = 'Creates or resets development demo accounts with secure passwords and links them to Employee profiles.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("Setting up NOVA Tech demo user credentials..."))

        users_config = [
            {
                "username": "rahul.kumar",
                "email": "rahul.kumar@novatech.io",
                "password": "NovaTech@2026",
                "first_name": "Rahul",
                "last_name": "Kumar",
                "employee_id": "EMP-2026-8941",
                "system_role": "EMPLOYEE"
            },
            {
                "username": "arjun.mehta",
                "email": "arjun.mehta@novatech.io",
                "password": "NovaTech@2026",
                "first_name": "Arjun",
                "last_name": "Mehta",
                "employee_id": "EMP-2026-0010",
                "system_role": "HR_MANAGER"
            },
            {
                "username": "priya.sharma",
                "email": "priya.sharma@novatech.io",
                "password": "NovaTech@2026",
                "first_name": "Priya",
                "last_name": "Sharma",
                "employee_id": "EMP-2026-0012",
                "system_role": "ADMIN"
            }
        ]

        for cfg in users_config:
            user, _ = User.objects.get_or_create(
                username=cfg["username"],
                defaults={
                    "email": cfg["email"],
                    "first_name": cfg["first_name"],
                    "last_name": cfg["last_name"]
                }
            )
            user.set_password(cfg["password"])
            user.email = cfg["email"]
            user.first_name = cfg["first_name"]
            user.last_name = cfg["last_name"]
            user.is_active = True
            if cfg["system_role"] == "ADMIN":
                user.is_staff = True
            user.save()

            # Link with Employee model and apply system authorization role
            emp = Employee.objects.filter(employee_id=cfg["employee_id"]).first()
            if not emp:
                emp = Employee.objects.filter(email=cfg["email"]).first()

            if emp:
                emp.user = user
                emp.system_role = cfg["system_role"]
                emp.save(update_fields=['user', 'system_role'])
                self.stdout.write(self.style.SUCCESS(
                    f"  [OK] User '{user.username}' linked to Employee '{emp.name}' ({emp.employee_id}) with Role: {emp.system_role}"
                ))
            else:
                self.stdout.write(self.style.WARNING(
                    f"  [!] User '{user.username}' updated, but Employee '{cfg['employee_id']}' not found in DB."
                ))

        self.stdout.write(self.style.SUCCESS("\nDemo user accounts setup complete!"))
        self.stdout.write(self.style.NOTICE("Primary Demo Account: rahul.kumar (or rahul.kumar@novatech.io)"))
        self.stdout.write(self.style.NOTICE("Password: NovaTech@2026\n"))
