from .base import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

SECRET_KEY = 'test-secret-key-not-for-production'

EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
