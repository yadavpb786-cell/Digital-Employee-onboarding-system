#!/usr/bin/env bash
# Exit on error
set -o errexit

pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Safe bootstrap check for demonstration account
echo "================================================================================"
echo "[build.sh] Safe environment check for demo bootstrap:"
if [ -n "${ENABLE_DEMO_BOOTSTRAP:-}" ]; then
    echo "  * ENABLE_DEMO_BOOTSTRAP is present in shell environment (length: ${#ENABLE_DEMO_BOOTSTRAP})"
else
    echo "  * ENABLE_DEMO_BOOTSTRAP is NOT set in shell environment"
fi
if [ -n "${DEMO_USER_PASSWORD:-}" ]; then
    echo "  * DEMO_USER_PASSWORD is present in shell environment (length: ${#DEMO_USER_PASSWORD})"
else
    echo "  * DEMO_USER_PASSWORD is NOT set in shell environment"
fi
echo "================================================================================"

echo "[build.sh] Executing setup_demo_user..."
python manage.py setup_demo_user
echo "[build.sh] Build steps finished."
