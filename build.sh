#!/usr/bin/env bash
# Exit on error
set -o errexit

if [ -d "backend" ]; then
    cd backend
fi

pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

echo "[root build.sh] Executing setup_demo_user check..."
python manage.py setup_demo_user
