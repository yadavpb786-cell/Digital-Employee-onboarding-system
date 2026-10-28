import os
import sys
from django.core.management import call_command
from .management.commands.setup_demo_user import _resolve_bootstrap_flag


def handle_demo_bootstrap_post_migrate(sender, **kwargs):
    """
    Automatic post_migrate signal hook.
    Ensures that whenever 'python manage.py migrate' completes during deployment,
    if ENABLE_DEMO_BOOTSTRAP is explicitly enabled, the demo account is safely
    verified and linked without needing manual Render Shell access.
    """
    bootstrap_enabled, flag_source = _resolve_bootstrap_flag()

    if not bootstrap_enabled:
        return

    sys.stdout.write(f"[post_migrate] Demo bootstrap authorized via {flag_source}. Invoking setup_demo_user...\n")
    try:
        call_command('setup_demo_user')
    except Exception as exc:
        sys.stderr.write(f"[post_migrate] Error running setup_demo_user: {exc}\n")
