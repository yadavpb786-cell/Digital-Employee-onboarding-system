import os
import sys
from django.core.management import call_command


def handle_demo_bootstrap_post_migrate(sender, **kwargs):
    """
    Automatic post_migrate signal hook.
    Ensures that whenever 'python manage.py migrate' completes during deployment,
    if ENABLE_DEMO_BOOTSTRAP is explicitly enabled, the demo account is safely
    verified and linked without needing manual Render Shell access.
    """
    bootstrap_enabled = (
        os.getenv('ENABLE_DEMO_BOOTSTRAP', '').strip().lower() in ('true', '1', 'yes', 't') or
        os.getenv('SETUP_DEMO_USER', '').strip().lower() in ('true', '1', 'yes', 't') or
        os.getenv('BOOTSTRAP_DEMO_USER', '').strip().lower() in ('true', '1', 'yes', 't')
    )

    if not bootstrap_enabled:
        return

    sys.stdout.write("[post_migrate] ENABLE_DEMO_BOOTSTRAP detected. Invoking setup_demo_user...\n")
    try:
        call_command('setup_demo_user')
    except Exception as exc:
        sys.stderr.write(f"[post_migrate] Error running setup_demo_user: {exc}\n")
