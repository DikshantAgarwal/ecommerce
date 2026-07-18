from .base import *

SECRET_KEY = 'django-insecure-dev-only-key-do-not-use-in-production'
DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ecommerce_db',
        'USER': 'ecommerce_user',
        'PASSWORD': 'ecommerce_user',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'authorization',
    'content-type',
    'x-session-id',
    'x-requested-with',
]

try:
    import django_extensions
    INSTALLED_APPS += ['django_extensions']
except ImportError:
    pass

try:
    import debug_toolbar
    # INSTALLED_APPS += ['debug_toolbar']
    # MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
    INTERNAL_IPS = ['127.0.0.1']
except ImportError:
    pass
