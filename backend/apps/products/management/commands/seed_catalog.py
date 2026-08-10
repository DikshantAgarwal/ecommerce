import os

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.products.models import Category, Product, ProductVariant

# Map image folder name -> category
CATEGORY_MAP = {
    'god': {'name': 'Gods & Mythology', 'price': 799},
    'premium': {'name': 'Premium', 'price': 1199},
    'alcohol': {'name': 'Alcohol', 'price': 899},
    'quotes': {'name': 'Motivation & Quotes', 'price': 599},
}

SECTIONS = {'Men': 'men', 'Women': 'women'}

COLOR_MAP = {
    'black': ('Black', '#1A1A1A'),
    'white': ('White', '#FFFFFF'),
}

SIZES = ['S', 'M', 'L', 'XL']

DEFAULT_STOCK_PER_VARIANT = 25

DESCRIPTIONS = {
    'god': 'Divine artwork on premium fabric. Wear your faith with pride.',
    'premium': 'Premium quality fabric with a bold, exclusive design.',
    'alcohol': 'Bold flavor-inspired design for the connoisseur.',
    'quotes': 'Wear your words. A motivational design for everyday hustle.',
}

# Designs that collide across categories within the same section get a
# distinguishing slug/build suffix here.
DESIGN_HINTS = {
    ('women', 'quotes', 'challenge'): 'challenge-quotes',
}

# Designs that collide get a distinct slug (prefix preserved automatically by
# slug generation below unless a per-design hint exists).
def _build_slug(section, design, hint):
    if hint:
        return hint if hint.startswith(section) else f'{section}-{hint}'
    return f'{section}-{slugify(design)}'


class Command(BaseCommand):
    help = 'Seed catalog from backend/media/new-images (Men/Women per theme)'

    def handle(self, *args, **options):
        root = os.path.join(settings.MEDIA_ROOT, 'new-images')

        datasets = []  # (section, category_folder, design, colors dict)

        for folder_name, section in SECTIONS.items():
            section_dir = os.path.join(root, folder_name)
            if not os.path.isdir(section_dir):
                self.stderr.write(f'   ⚠ Missing {section_dir}')
                continue
            for cat_folder in sorted(os.listdir(section_dir)):
                cat_dir = os.path.join(section_dir, cat_folder)
                if not os.path.isdir(cat_dir):
                    continue
                if cat_folder not in CATEGORY_MAP:
                    self.stderr.write(f'   ⚠ Unknown theme folder: {cat_folder}')
                    continue

                files = [f for f in os.listdir(cat_dir)
                         if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
                designs = {}
                for fname in sorted(files):
                    base, _ = os.path.splitext(fname)
                    if '-' not in base:
                        self.stderr.write(f'   ⚠ Skipping file without color: {fname}')
                        continue
                    design, color = base.rsplit('-', 1)
                    color = color.lower()
                    if color not in COLOR_MAP:
                        self.stderr.write(f'   ⚠ Unknown color token in {fname}')
                        continue
                    designs.setdefault(design, {})[color] = os.path.join(cat_dir, fname)

                for design, colors in designs.items():
                    datasets.append((section, cat_folder, design, colors))

        self.stdout.write(f'📦 Parsed {len(datasets)} designs from folder tree')

        # 1. Hide everything that isn't part of the new catalog
        self._deactivate_old_catalog()

        # 2. Create categories
        cat_by_key = {}
        for section, cat_folder, *_ in datasets:
            info = CATEGORY_MAP[cat_folder]
            slug = f"{section}-{slugify(info['name'])}"
            cat, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': info['name'],
                    'section': section,
                    'is_active': True,
                    'description': f"{section.title()}'s {info['name']} collection.",
                },
            )
            cat.is_active = True
            cat.save()
            cat_by_key[(section, cat_folder)] = cat

        # 3. Create products + variants, copying images
        created_products = 0
        created_variants = 0
        for section, cat_folder, design, colors in datasets:
            info = CATEGORY_MAP[cat_folder]
            category = cat_by_key[(section, cat_folder)]

            hint = DESIGN_HINTS.get((section, cat_folder, design))
            slug = _build_slug(section, design, hint)
            name = ' '.join(w.capitalize() for w in design.replace('-', ' ').split())

            product, was_created = Product.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'description': DESCRIPTIONS[cat_folder],
                    'price': info['price'],
                    'stock_quantity': DEFAULT_STOCK_PER_VARIANT * 2 * len(SIZES),
                    'category': category,
                    'is_active': True,
                },
            )
            if not was_created:
                product.is_active = True
                product.category = category
                product.price = info['price']
                product.save()

            # Copy product base image (prefer black, else any color)
            base = colors.get('black') or next(iter(colors.values()))
            self._save_image(product.image, base, 'products', f'{slug}.jpeg')
            product.save()

            for color, img_path in colors.items():
                color_name, color_code = COLOR_MAP[color]
                for size in SIZES:
                    sku = f"{slug}-{color}-{size.lower()}"
                    variant, v_created = ProductVariant.objects.get_or_create(
                        sku=sku,
                        defaults={
                            'product': product,
                            'size': size,
                            'color': color_name,
                            'color_code': color_code,
                            'stock_quantity': DEFAULT_STOCK_PER_VARIANT,
                        },
                    )
                    if not v_created:
                        variant.product = product
                        variant.stock_quantity = DEFAULT_STOCK_PER_VARIANT
                    self._save_image(variant.image, img_path, 'products', f'{sku}.jpeg')
                    variant.save()
                    created_variants += v_created or 0

            if was_created:
                created_products += 1

        self._print_summary(created_products, created_variants)

    # ── Helpers ───────────────────────────────────────────────────────────
    def _deactivate_old_catalog(self):
        active_slugs = [
            f"{section}-{slugify(CATEGORY_MAP[folder]['name'])}"
            for folder in CATEGORY_MAP
            for section in SECTIONS.values()
        ]
        # Deactivate every category not part of the new 4-theme catalog
        Category.objects.exclude(slug__in=active_slugs).update(is_active=False)
        # Deactivate ALL existing products — the new catalog fully replaces them
        Product.objects.all().update(is_active=False)
        self.stdout.write('   🧹 Old catalog hidden (all previous products deactivated)')

    def _save_image(self, field, source_path, subdir, name):
        cloudinary_enabled = bool(getattr(settings, 'CLOUDINARY_CLOUD_NAME', ''))
        if cloudinary_enabled:
            # Cloudinary assets already exist (uploaded via sync_cloudinary);
            # store the extension-less public_id so field.url resolves to them.
            stem = os.path.splitext(name)[0]
            field.name = f"{subdir}/{stem}"
            return
        if not os.path.isfile(source_path):
            return
        target_dir = os.path.join(settings.MEDIA_ROOT, subdir)
        target_path = os.path.join(target_dir, name)
        # Reuse an existing exact-name file so re-seeds stay idempotent
        if not os.path.isfile(target_path):
            os.makedirs(target_dir, exist_ok=True)
            with open(source_path, 'rb') as src, open(target_path, 'wb') as dst:
                dst.write(src.read())
        field.name = f"{subdir}/{name}"

    def _print_summary(self, created_products, created_variants):
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write('✅ Catalog seeding complete!')
        self.stdout.write(f'   Categories: {Category.objects.filter(is_active=True).count()}')
        self.stdout.write(f'   Products:   {Product.objects.filter(is_active=True).count()}')
        self.stdout.write(f'   Variants:   {ProductVariant.objects.filter(product__is_active=True).count()}')
        self.stdout.write(f'   (new this run: {created_products} products, {created_variants} variants)')
        self.stdout.write('=' * 50)

        for section_code, section_label in Category.Section.choices:
            prod_count = Product.objects.filter(
                is_active=True,
                category__section=section_code,
            ).count()
            self.stdout.write(f'   {section_label}: {prod_count} products')