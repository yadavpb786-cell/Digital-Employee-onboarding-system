#!/usr/bin/env bash
# Exit on error
set -o errexit

if [ -d "backend" ]; then
    cd backend
fi

pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

echo "================================================================================"
echo "[root build.sh] Safe environment check for demo bootstrap:"
if [ -n "${ENABLE_DEMO_BOOTSTRAP:-}" ]; then
    echo "  * ENABLE_DEMO_BOOTSTRAP is present in shell environment (length: ${#ENABLE_DEMO_BOOTSTRAP})"
else
    echo "  * ENABLE_DEMO_BOOTSTRAP is NOT set in shell environment"
fi
if [ -n "${DEMO_USER_PASSWORD:-}" ]; then
    echo "  * DEMO_USER_PASSWORD (Employee) is present in shell environment (length: ${#DEMO_USER_PASSWORD})"
else
    echo "  * DEMO_USER_PASSWORD (Employee) is NOT set in shell environment"
fi
if [ -n "${DEMO_HR_PASSWORD:-}" ]; then
    echo "  * DEMO_HR_PASSWORD (HR Manager) is present in shell environment (length: ${#DEMO_HR_PASSWORD})"
else
    echo "  * DEMO_HR_PASSWORD (HR Manager) is NOT set in shell environment"
fi
if [ -n "${DEMO_ADMIN_PASSWORD:-}" ]; then
    echo "  * DEMO_ADMIN_PASSWORD (Admin) is present in shell environment (length: ${#DEMO_ADMIN_PASSWORD})"
else
    echo "  * DEMO_ADMIN_PASSWORD (Admin) is NOT set in shell environment"
fi
echo "================================================================================"

echo "[root build.sh] Executing setup_demo_user for demo accounts..."
python manage.py setup_demo_user --username all

echo "[root build.sh] Executing setup_admin_hr_users for HR and Admin..."
python manage.py setup_admin_hr_users

echo "[root build.sh] Build steps finished."
