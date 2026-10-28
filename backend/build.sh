#!/usr/bin/env bash
# Exit on error
set -o errexit

pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Safe bootstrap check for demonstration account
echo "[build.sh] Executing setup_demo_user check..."
python manage.py setup_demo_user
