"""
Django settings for nova_backend project.
NOVA Tech - Digital Employee Onboarding System (Phase 2 Full-Stack Architecture)
"""

import os
import socket
from urllib.parse import urlparse
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-nova-tech-onboarding-secret-key-2026-phase2')

DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = list(set([host.strip() for host in os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',') if host.strip()] + ['testserver', 'localhost', '127.0.0.1']))
render_hostname = os.getenv('RENDER_EXTERNAL_HOSTNAME')
if render_hostname and render_hostname not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(render_hostname)
if os.getenv('RENDER') and '.onrender.com' not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append('.onrender.com')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party libraries
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',

    # Internal applications
    'apps.onboarding.apps.OnboardingConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'nova_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'nova_backend.wsgi.application'

# Database configuration: PostgreSQL using DATABASE_URL with SQLite fallback
DEFAULT_SQLITE_URL = f"sqlite:///{BASE_DIR / 'db.sqlite3'}"
raw_db_url = os.getenv('DATABASE_URL', '').strip()

def is_database_reachable(url_str):
    """Check if remote database socket is reachable within 2 seconds."""
    try:
        parsed = urlparse(url_str)
        if parsed.scheme.startswith(('postgres', 'psql')):
            host = parsed.hostname or 'localhost'
            port = parsed.port or 5432
            with socket.create_connection((host, port), timeout=2.0):
                return True
        return True
    except Exception:
        return False

# In production (Render) or if DEBUG is False, trust DATABASE_URL directly if provided
is_production = bool(os.getenv('RENDER') or (not DEBUG))
if raw_db_url and raw_db_url.startswith(('postgres://', 'postgresql://')):
    if is_production or is_database_reachable(raw_db_url):
        DATABASES = {
            'default': dj_database_url.parse(
                raw_db_url,
                conn_max_age=600,
                conn_health_checks=True,
            )
        }
    else:
        # Fallback to local SQLite if PostgreSQL service is unavailable in dev
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
elif raw_db_url and not raw_db_url.startswith('sqlite'):
    DATABASES = {
        'default': dj_database_url.parse(
            raw_db_url,
            conn_max_age=600,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# WhiteNoise static file serving in production (if installed)
try:
    import whitenoise
    if 'whitenoise.middleware.WhiteNoiseMiddleware' not in MIDDLEWARE:
        sec_idx = MIDDLEWARE.index('django.middleware.security.SecurityMiddleware')
        MIDDLEWARE.insert(sec_idx + 1, 'whitenoise.middleware.WhiteNoiseMiddleware')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
except ImportError:
    pass

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
}

# SimpleJWT Authentication Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# Configurable Frontend Base URL for email invitation links (supports local dev and deployed Vercel URL)
_default_frontend = (
    'https://digital-employee-onboarding-system.vercel.app'
    if (render_hostname or os.getenv('RENDER') or not DEBUG)
    else 'http://localhost:5173'
)
FRONTEND_URL = os.getenv('FRONTEND_URL', _default_frontend).strip().rstrip('/')

# CORS & CSRF Configuration
_cors_defaults = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3002',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
_extra_cors = [origin.strip() for origin in os.getenv('CORS_ALLOWED_ORIGINS', '').split(',') if origin.strip()]
CORS_ALLOWED_ORIGINS = list(set(_cors_defaults + _extra_cors + ([FRONTEND_URL] if FRONTEND_URL.startswith(('http://', 'https://')) else [])))
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'False').lower() in ('true', '1', 'yes')

# Automatically allow Vercel production and preview subdomains
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https:\/\/.*\.vercel\.app$",
]

# CSRF Trusted Origins (required by Django 4+ for cross-origin forms/requests)
_csrf_defaults = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
_extra_csrf = [origin.strip() for origin in os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',') if origin.strip()]
CSRF_TRUSTED_ORIGINS = list(set(_csrf_defaults + _extra_csrf + ([FRONTEND_URL] if FRONTEND_URL.startswith(('http://', 'https://')) else [])))
if render_hostname:
    CSRF_TRUSTED_ORIGINS.append(f"https://{render_hostname}")
if 'https://*.vercel.app' not in CSRF_TRUSTED_ORIGINS:
    CSRF_TRUSTED_ORIGINS.append('https://*.vercel.app')
if 'https://*.onrender.com' not in CSRF_TRUSTED_ORIGINS:
    CSRF_TRUSTED_ORIGINS.append('https://*.onrender.com')

# Email Delivery Configuration
# Configurable via environment variables (SMTP with Gmail, SendGrid, Amazon SES, or Console/Locmem for dev/testing)
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')

try:
    EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
except ValueError:
    EMAIL_PORT = 587

_use_ssl_env = os.getenv('EMAIL_USE_SSL')
_use_tls_env = os.getenv('EMAIL_USE_TLS')

if _use_ssl_env is not None:
    EMAIL_USE_SSL = _use_ssl_env.lower() in ('true', '1', 'yes')
else:
    EMAIL_USE_SSL = (EMAIL_PORT == 465)

if _use_tls_env is not None:
    EMAIL_USE_TLS = _use_tls_env.lower() in ('true', '1', 'yes')
else:
    EMAIL_USE_TLS = not EMAIL_USE_SSL and (EMAIL_PORT == 587 or EMAIL_PORT == 25)

# Ensure mutual exclusivity as enforced by Django smtp.EmailBackend
if EMAIL_USE_SSL and EMAIL_USE_TLS:
    if EMAIL_PORT == 465:
        EMAIL_USE_TLS = False
    else:
        EMAIL_USE_SSL = False

EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '').strip()

# Handle Google App Passwords that may be pasted with 4x4 grouping spaces (e.g. "abcd efgh ijkl mnop")
_raw_email_pass = os.getenv('EMAIL_HOST_PASSWORD', '').strip()
if len(_raw_email_pass.replace(' ', '')) == 16 and ' ' in _raw_email_pass:
    EMAIL_HOST_PASSWORD = _raw_email_pass.replace(' ', '')
else:
    EMAIL_HOST_PASSWORD = _raw_email_pass

DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', '').strip() or (
    f"NOVA Tech Onboarding <{EMAIL_HOST_USER}>" if EMAIL_HOST_USER else 'NOVA Tech Onboarding <onboarding@novatech.io>'
)
EMAIL_TIMEOUT = int(os.getenv('EMAIL_TIMEOUT', '15'))


