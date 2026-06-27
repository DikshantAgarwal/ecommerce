from django.urls import path

from apps.products.views import ProductListAPIView

urlpatterns = [
    path('products/', ProductListAPIView.as_view(), name='product-list'),
]
