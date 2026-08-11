from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

app_name = 'accounts'

urlpatterns = [
    path('auth/google/', views.GoogleLoginAPIView.as_view(), name='google-login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/me/', views.UserProfileAPIView.as_view(), name='user-profile'),
    path('addresses/', views.AddressListCreateAPIView.as_view(), name='address-list-create'),
    path('addresses/<uuid:pk>/', views.AddressDetailAPIView.as_view(), name='address-detail'),
    path('addresses/<uuid:pk>/default/', views.AddressSetDefaultAPIView.as_view(), name='address-set-default'),
]
