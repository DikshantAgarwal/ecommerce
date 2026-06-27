from rest_framework import serializers

from apps.products.models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'is_active', 'description']


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    category_detail = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price',
            'stock_quantity', 'created_at', 'updated_at',
            'category', 'category_detail',
        ]
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True},
        }

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Price must be greater than zero.')
        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError('Stock quantity cannot be negative.')
        return value

    def validate(self, attrs):
        if not attrs.get('slug'):
            attrs['slug'] = attrs['name'].lower().replace(' ', '-')
        return attrs
