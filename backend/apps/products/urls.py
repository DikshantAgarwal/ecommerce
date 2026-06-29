from django.urls import path

from apps.products.views import (
    CategoryDetailAPIView,
    CategoryListAPIView,
    ProductDetailAPIView,
    ProductListAPIView,
)

urlpatterns = [
    path('products/', ProductListAPIView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryDetailAPIView.as_view(), name='category-detail'),
]
