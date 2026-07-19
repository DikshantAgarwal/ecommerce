from rest_framework import serializers

from apps.products.models import Category, Product, ProductVariant


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'section', 'is_active', 'description']


class ProductVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    display_price = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            'id', 'size', 'color', 'color_code', 'sku',
            'stock_quantity', 'price', 'image',
            'product_name', 'product_slug', 'product_image',
            'display_price',
        ]

    def get_display_price(self, obj):
        return float(obj.price) if obj.price else float(obj.product.price)


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    category_detail = CategorySerializer(source='category', read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price',
            'stock_quantity', 'image', 'created_at', 'updated_at',
            'category', 'category_detail', 'variants',
        ]
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True},
            'image': {'required': False},
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
