from django.shortcuts import get_object_or_404 

from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.products.models import Category, Product
from apps.products.pagination import ProductPagination
from apps.products.serializers import CategorySerializer, ProductSerializer


class ProductListAPIView(GenericAPIView):
    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    ALLOWED_ORDERING_FIELDS = {'price', '-price', 'created_at', '-created_at'}

    def get(self, request):
        products = self.filter_queryset(self.get_queryset())
        category_slug = request.query_params.get('category')
        if category_slug:
            products = products.filter(category__slug=category_slug)

        section = request.query_params.get('section')
        if section:
            products = products.filter(category__section=section)

        search_query = request.query_params.get('search')

        if search_query:
            products = products.filter(name__icontains=search_query)

        ordering = request.query_params.get('ordering')
        if ordering in self.ALLOWED_ORDERING_FIELDS:
            products = products.order_by(ordering)

        page = self.paginate_queryset(products) # pagine_queryset is a method provided by GenericAPIView that returns a page object if pagination is applied, otherwise it returns None.
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data) #get_paginated_response is a method provided by GenericAPIView that returns a paginated response with the serialized data.

        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProductDetailAPIView(APIView):
    def get(self, request, slug):
        product = get_object_or_404(Product, slug=slug)
        serializer = ProductSerializer(product, context={'request': request})
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
