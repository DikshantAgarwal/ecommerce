from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Product, ProductVariant


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0
    fields = ['size', 'color', 'color_code', 'sku', 'stock_quantity', 'price', 'image', 'image_preview']
    readonly_fields = ['image_preview']

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="80" height="80" style="object-fit:cover;border-radius:4px;" />', obj.image.url)
        return '—'
    image_preview.short_description = 'Preview'


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'section', 'is_active']
    list_filter = ['section', 'is_active']
    prepopulated_fields = {'slug': ['name']}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock_quantity', 'image_display']
    list_filter = ['category__section', 'category']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ['name']}
    inlines = [ProductVariantInline]

    def image_display(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" style="object-fit:cover;" />', obj.image.url)
        return '—'
    image_display.short_description = 'Image'


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['sku', 'product', 'color', 'size', 'stock_quantity', 'price', 'variant_image_display']
    list_filter = ['color', 'size', 'product__category']
    search_fields = ['sku', 'product__name']

    def variant_image_display(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" style="object-fit:cover;" />', obj.image.url)
        return '—'
    variant_image_display.short_description = 'Image'
