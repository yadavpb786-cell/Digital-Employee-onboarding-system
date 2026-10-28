#!/usr/bin/env bash
# Exit on error
set -o errexit

pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# One-time bootstrap for demonstration account in production if explicitly enabled
if [ "$ENABLE_DEMO_BOOTSTRAP" = "true" ] || [ "$SETUP_DEMO_USER" = "true" ]; then
    python manage.py setup_demo_user
fi
