from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=255)  # char field for category name(short form)
    slug = models.SlugField(unique=True) # slug field for category slug(unique value for each category)
    is_active = models.BooleanField(default=True) # boolean field for category status(active or inactive)
    description = models.TextField(blank=True)  # text field for category description(long form)
    created_at = models.DateTimeField(auto_now_add=True) # auto_now_add=True means that the field is set to now when the object is first created. It is not updated on subsequent saves.
    updated_at = models.DateTimeField(auto_now=True) # auto_now=True means that the field is updated to now every time the object is saved. It is not set on creation.

    def __str__(self):
        return self.name




class Product(models.Model):
    name = models.CharField(max_length=255)  # char field for product name(short form)
    slug = models.SlugField(unique=True) # slug field for product slug(unique value for each product)
    description = models.TextField(blank=True)  # text field for product description(long form)
    price = models.DecimalField(max_digits=10, decimal_places=2) # decimal field for product price(more precise than float)
    stock_quantity = models.PositiveIntegerField(default=0)  # positive integer field for product stock(only positive values)
    created_at = models.DateTimeField(auto_now_add=True) # auto_now_add=True means that the field is set to now when the object is first created. It is not updated on subsequent saves.
    updated_at = models.DateTimeField(auto_now=True) # auto_now=True means that the field is updated to now every time the object is saved. It is not set on creation.
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products') # foreign key field for product category(related to Category model)
    def __str__(self):
        return self.name

