from django.db import models


def product_image_upload_to(instance, filename):
    _, ext = filename.rsplit('.', 1)
    return f'products/{instance.slug}.{ext.lower()}'


def variant_image_upload_to(instance, filename):
    _, ext = filename.rsplit('.', 1)
    return f'products/{instance.sku}.{ext.lower()}'


class Category(models.Model):
    class Section(models.TextChoices):
        MEN = 'men', 'Men'
        WOMEN = 'women', 'Women'
        UNISEX = 'unisex', 'Unisex'

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=200)
    section = models.CharField(max_length=10, choices=Section.choices, default=Section.UNISEX)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'categories'

    def __str__(self):
        return f"{self.get_section_display()} - {self.name}"


class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to=product_image_upload_to, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')

    def __str__(self):
        return self.name


class ProductVariant(models.Model):
    class Size(models.TextChoices):
        S = 'S', 'S'
        M = 'M', 'M'
        L = 'L', 'L'
        XL = 'XL', 'XL'
        XXL = 'XXL', 'XXL'

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size = models.CharField(max_length=5, choices=Size.choices)
    color = models.CharField(max_length=50)
    color_code = models.CharField(max_length=7)
    sku = models.SlugField(unique=True, max_length=200)
    stock_quantity = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    image = models.ImageField(upload_to=variant_image_upload_to, blank=True)

    class Meta:
        unique_together = ('product', 'size', 'color')

    def __str__(self):
        return f"{self.product.name} - {self.color}/{self.size}"
