from django.apps import AppConfig

class OnboardingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.onboarding'
    label = 'onboarding'
    verbose_name = 'Employee Onboarding System'

    def ready(self):
        from django.db.models.signals import post_migrate
        from .signals import handle_demo_bootstrap_post_migrate
        post_migrate.connect(handle_demo_bootstrap_post_migrate, sender=self)
