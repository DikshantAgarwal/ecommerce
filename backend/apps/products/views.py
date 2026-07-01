from django.shortcuts import get_object_or_404 

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.products.models import Category, Product
from apps.products.serializers import CategorySerializer, ProductSerializer


ALLOWED_ORDERING_FIELDS = {'price', '-price', 'created_at', '-created_at'}


class ProductListAPIView(APIView):
    def get(self, request):
        products = Product.objects.select_related('category').all()
        category_slug = request.query_params.get('category')
        if category_slug:
            products = products.filter(category__slug=category_slug)

        search_query = request.query_params.get('search')
        if search_query:
            products = products.filter(name__icontains=search_query)

        ordering = request.query_params.get('ordering')
        if ordering in ALLOWED_ORDERING_FIELDS:
            products = products.order_by(ordering)

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProductDetailAPIView(APIView):
    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CategoryListAPIView(APIView):
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CategoryDetailAPIView(APIView):
    def get(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        serializer = CategorySerializer(category)
        return Response(serializer.data, status=status.HTTP_200_OK)
