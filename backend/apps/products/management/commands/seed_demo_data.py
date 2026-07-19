import os
import random
from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.products.models import Category, Product, ProductVariant

# ── Section + Theme definitions ──────────────────────────────────────────
THEMES = [
    {'name': 'Anime', 'sections': ['men', 'women']},
    {'name': 'Gods & Mythology', 'sections': ['men', 'women']},
    {'name': 'Motivation & Quotes', 'sections': ['men', 'women', 'unisex']},
    {'name': 'Street Art', 'sections': ['men', 'women']},
    {'name': 'Music & Bands', 'sections': ['men', 'women']},
    {'name': 'Minimalist', 'sections': ['men', 'women', 'unisex']},
    {'name': 'Retro & Vintage', 'sections': ['men', 'women']},
    {'name': 'Gaming', 'sections': ['men', 'women']},
    {'name': 'Pop Culture', 'sections': ['men', 'women', 'unisex']},
    {'name': 'Nature & Wildlife', 'sections': ['men', 'women', 'unisex']},
]

# ── Product types ────────────────────────────────────────────────────────
PRODUCT_TYPES = [
    'T-Shirt', 'Oversized T-Shirt', 'Polo', 'Hoodie',
    'Crewneck', 'Joggers', 'Cap', 'Poster',
]

# ── Theme-specific name templates ────────────────────────────────────────
THEME_DATA = {
    'Anime': {
        'subjects': [
            'Naruto Uzumaki', 'Sasuke Uchiha', 'Goku', 'Vegeta',
            'Luffy', 'Zoro', 'Mikasa Ackerman', 'Levi Ackerman',
            'Tanjiro Kamado', 'Nezuko Kamado', 'Gojo Satoru',
            'Itachi Uchiha', 'Kakashi Hatake', 'Eren Yeager',
        ],
        'designs': [
            'Akatsuki Clouds', 'Sharingan', 'Kamehameha Wave',
            'Straw Hat Pirates', 'Scout Regiment Wings', 'Demon Slayer Mark',
            'Six Eyes', 'Mangekyo Sharingan', 'Thunder Breathing',
            'Gear 5',
        ],
    },
    'Gods & Mythology': {
        'subjects': [
            'Shiva', 'Vishnu', 'Ganesha', 'Hanuman',
            'Krishna', 'Durga Maa', 'Kali Maa', 'Saraswati',
            'Lakshmi', 'Rama', 'Bajrang Bali',
        ],
        'designs': [
            'Trishul', 'Om Namah Shivaya', 'Maha Kaal',
            'Sudarshan Chakra', 'Flying Hanuman', 'Flute of Krishna',
            'Navadurga', 'Sarswati Veena', 'Ram Darbar',
        ],
    },
    'Motivation & Quotes': {
        'subjects': [
            'Stay Hustlin\'', 'Never Give Up', 'Dream Big',
            'Work Hard', 'Stay Focused', 'Rise and Grind',
            'Be Your Own Hero', 'No Pain No Gain', 'Keep Going',
            'Believe in Yourself', 'Hustle Loyalty Respect',
            'Legendary', 'Unstoppable',
        ],
        'designs': [
            'Lion Crown', 'Wolf Pack', 'Eagle Eye',
            'Arrow Target', 'Mountain Peak', 'Phoenix Rising',
            'Iron Fist', 'Broken Chains', 'Crown',
            'Wings of Freedom',
        ],
    },
    'Street Art': {
        'subjects': [
            'Graffiti King', 'Street Vibes', 'Urban Legend',
            'Spray Culture', 'Tag Master', 'Borough King',
            'City Lights', 'Underground',
        ],
        'designs': [
            'Spray Can Art', 'Brick Wall', 'Neon Tag',
            'Wild Style', 'Throw Up', 'Stencil Face',
            'Street Mural', 'Train Tag',
        ],
    },
    'Music & Bands': {
        'subjects': [
            'Rock On', 'Vinyl Vibes', 'Bass Drop', 'Rhythm King',
            'Soulful Notes', 'Electric Guitar', 'Drum Beat',
            'Mixtape', 'Vinyl Records',
        ],
        'designs': [
            'Cassette Tape', 'Vinyl Record', 'Guitar Silhouette',
            'Headphones', 'Sound Waves', 'Microphone',
            'Vinyl Spinning', 'Note Cascade',
        ],
    },
    'Minimalist': {
        'subjects': [
            'Less is More', 'Pure Form', 'Silhouette',
            'Line Art', 'Negative Space', 'Essential',
            'Monochrome', 'Geometry of Life',
        ],
        'designs': [
            'Single Line Face', 'Dot Mandala', 'Geometric Wolf',
            'Circle of Life', 'Abstract Curve', 'Minimal Face',
            'Line Art Mountain', 'Simple Moon',
        ],
    },
    'Retro & Vintage': {
        'subjects': [
            'Retro Wave', '80s Vibes', 'Vintage Nostalgia',
            'Old School', 'Classic 90s', 'Sunset Drive',
            'Neon Nights', 'Arcade Era',
        ],
        'designs': [
            'Retro Sunset', 'Pixel Heart', 'Neon Grid',
            'Old TV Static', 'Cassette Futurism', 'Synth Wave',
            'Retro Arcade', 'Vintage Badge',
        ],
    },
    'Gaming': {
        'subjects': [
            'Player One', 'Game Over', 'Level Up', 'Pixel King',
            'Respawn', 'Controller Queen', 'Save Point',
            'Extra Life', 'Power Up',
        ],
        'designs': [
            'Pixel Sword', 'Retro Console', 'Controller', 'Health Bar',
            'Dice Roll', 'Joystick', '8-Bit Heart', 'Game Cartridge',
            'Keyboard Warrior',
        ],
    },
    'Pop Culture': {
        'subjects': [
            'Marvel Fan', 'DC Universe', 'Star Wars', 'Stranger Things',
            'Squid Game', 'TV Binge', 'Movie Buff', 'Comic Geek',
        ],
        'designs': [
            'Shield Logo', 'Bat Signal', 'Light Saber', 'Upside Down',
            'Red Light Green Light', 'Clapper Board', 'Speech Bubble',
            'Quote Bubble', 'Pop Art Dot',
        ],
    },
    'Nature & Wildlife': {
        'subjects': [
            'Wild Spirit', 'Forest Walk', 'Ocean Deep', 'Mountain High',
            'Safari King', 'Jungle Book', 'Arctic Fox',
            'Desert Storm', 'Tropical Vibes',
        ],
        'designs': [
            'Wolf Howling', 'Mountain Silhouette', 'Palm Leaves',
            'Tree of Life', 'Bear Track', 'Feather',
            'Wave Crashing', 'Sun Rays', 'Lion Roar',
        ],
    },
}

# ── Description pool ─────────────────────────────────────────────────────
DESCRIPTIONS = [
    'Premium quality fabric with vibrant print. Perfect for daily wear.',
    'Made from 100% cotton for maximum comfort. Trendy design.',
    'Soft and breathable material. Features a unique artwork.',
    'High-quality print that lasts through multiple washes. Comfortable fit.',
    'Express your style with this exclusive design. Limited edition.',
    'Eco-friendly fabric with fade-resistant print. A wardrobe essential.',
    'Designed for true fans. Bold artwork on premium fabric.',
    'Lightweight and comfortable. The design speaks for itself.',
    'Stand out from the crowd with this unique piece. Ultra-comfortable fit.',
    'A perfect blend of style and comfort. High-resolution print.',
]

# ── Variant dimensions ───────────────────────────────────────────────────
COLORS = [
    ('Black', '#1A1A1A'),
    ('White', '#FFFFFF'),
]

SIZES = ['S', 'M', 'L', 'XL']

VARIANTS_PER_PRODUCT = len(COLORS) * len(SIZES)  # 8


class Command(BaseCommand):
    help = 'Seed the database with demo categories, products, and variants'

    def add_arguments(self, parser):
        parser.add_argument(
            '--products',
            type=int,
            default=100,
            help='Number of products to create (default: 100)',
        )
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Delete existing demo data before seeding',
        )

    def handle(self, *args, **options):
        product_count = options['products']
        reset = options['reset']

        if reset:
            self.stdout.write('🧹 Removing existing demo data...')
            ProductVariant.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write('   Done.')

        self._variant_images = {}
        self._create_categories()
        self._create_products(product_count)
        self._create_variants()
        self._print_summary()

    # ── Category creation ────────────────────────────────────────────────
    def _create_categories(self):
        created = 0
        for theme in THEMES:
            for section in theme['sections']:
                slug_base = slugify(f"{section}-{theme['name']}")

                _, was_created = Category.objects.get_or_create(
                    slug=slug_base,
                    defaults={
                        'name': theme['name'],
                        'section': section,
                        'is_active': True,
                        'description': f"{section.title()}'s {theme['name']} collection — bold designs that speak your vibe.",
                    },
                )
                if was_created:
                    created += 1

        self.stdout.write(f'📁 Categories: {created} created, {Category.objects.count()} total')

    # ── Product creation ─────────────────────────────────────────────────
    def _create_products(self, target_count):
        categories = list(Category.objects.all())
        image_pool = self._load_images() or [None]

        existing = Product.objects.count()
        needed = max(0, target_count - existing)

        if needed == 0:
            self.stdout.write(f'📦 Products: {existing} already exist (use --reset to recreate)')
            return

        batch = []
        for _ in range(needed):
            category = random.choice(categories)
            name = self._generate_product_name(category)
            slug_base = slugify(name)

            slug = slug_base
            counter = 1
            while Product.objects.filter(slug=slug).exists() or any(b['slug'] == slug for b in batch):
                slug = f"{slug_base}-{counter}"
                counter += 1

            img_black = random.choice(image_pool) if image_pool else None
            img_white = random.choice(image_pool) if image_pool else None

            self._variant_images[slug] = {'black': img_black, 'white': img_white}

            batch.append({
                'name': name,
                'slug': slug,
                'description': random.choice(DESCRIPTIONS),
                'price': random.choice([499, 599, 699, 799, 899, 999, 1199, 1499]),
                'stock_quantity': random.randint(80, 200),
                'category': category,
                'image_path': random.choice([img_black, img_white]) if image_pool else None,
            })

        products_to_create = []
        for item in batch:
            product = Product(
                name=item['name'],
                slug=item['slug'],
                description=item['description'],
                price=item['price'],
                stock_quantity=item['stock_quantity'],
                category=item['category'],
            )
            if item['image_path']:
                with open(item['image_path'], 'rb') as f:
                    filename = os.path.basename(item['image_path'])
                    product.image.save(filename, File(f), save=False)
            products_to_create.append(product)

        Product.objects.bulk_create(products_to_create, batch_size=50)
        self.stdout.write(f'📦 Products: {needed} created ({Product.objects.count()} total)')

    def _generate_product_name(self, category):
        theme_name = category.name
        data = THEME_DATA.get(theme_name, THEME_DATA['Minimalist'])
        subject = random.choice(data['subjects'])
        design = random.choice(data['designs'])
        product_type = random.choice(PRODUCT_TYPES)
        return f'{subject} {design} {product_type}'

    # ── Variant creation ─────────────────────────────────────────────────
    def _create_variants(self):
        products = list(Product.objects.all())
        existing_variants = ProductVariant.objects.count()
        if existing_variants > 0:
            self.stdout.write(f'🧬 Variants: {existing_variants} already exist')
            return

        demo_dir = os.path.join(settings.MEDIA_ROOT, 'demo', 'products')

        variants_to_create = []
        for product in products:
            base_price = float(product.price)
            total_stock = product.stock_quantity
            stock_per_variant = total_stock // VARIANTS_PER_PRODUCT
            remaining_stock = total_stock - stock_per_variant * VARIANTS_PER_PRODUCT

            for color_name, color_code in COLORS:
                for size in SIZES:
                    color_slug = slugify(color_name)
                    sku = f"{product.slug}-{color_slug}-{size.lower()}"

                    price_variant = random.choice(
                        [0, -50, -30, 0, 0, 30, 50, 100]
                    )

                    variant = ProductVariant(
                        product=product,
                        size=size,
                        color=color_name,
                        color_code=color_code,
                        sku=sku,
                        stock_quantity=stock_per_variant + max(0, remaining_stock),
                        price=max(0, base_price + price_variant) if price_variant != 0 else None,
                    )
                    remaining_stock = 0

                    # Map variant image by color
                    color_images = self._variant_images.get(product.slug, {})
                    color_image = color_images.get(color_slug)
                    if color_image:
                        with open(color_image, 'rb') as f:
                            filename = os.path.basename(color_image)
                            variant.image.save(filename, File(f), save=False)

                    variants_to_create.append(variant)

        ProductVariant.objects.bulk_create(variants_to_create, batch_size=200)
        total_variants = ProductVariant.objects.count()
        self.stdout.write(f'🧬 Variants: {total_variants} created ({VARIANTS_PER_PRODUCT} per product)')

    # ── Image loading ────────────────────────────────────────────────────
    def _load_images(self):
        demo_dir = os.path.join(settings.MEDIA_ROOT, 'demo', 'products')
        if not os.path.isdir(demo_dir):
            self.stdout.write(self.style.WARNING(f'   ⚠ No images found at {demo_dir}'))
            return []

        extensions = {'.jpg', '.jpeg', '.png', '.webp', '.avif'}
        images = []
        for fname in sorted(os.listdir(demo_dir)):
            if os.path.splitext(fname)[1].lower() in extensions:
                images.append(os.path.join(demo_dir, fname))

        if not images:
            self.stdout.write(self.style.WARNING(f'   ⚠ No image files found in {demo_dir}'))
            return []

        self.stdout.write(f'   🖼 Images found: {len(images)}')
        return images

    # ── Summary ──────────────────────────────────────────────────────────
    def _print_summary(self):
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write('✅ Seeding complete!')
        self.stdout.write(f'   Categories: {Category.objects.count()}')
        self.stdout.write(f'   Products:   {Product.objects.count()}')
        self.stdout.write(f'   Variants:   {ProductVariant.objects.count()}')
        self.stdout.write('=' * 50)

        self.stdout.write('\n📊 By section:')
        for section_code, section_label in Category.Section.choices:
            cat_count = Category.objects.filter(section=section_code).count()
            prod_count = Product.objects.filter(category__section=section_code).count()
            self.stdout.write(f'   {section_label}: {cat_count} categories, {prod_count} products')

        self.stdout.write('\n📊 By theme:')
        for theme in THEMES:
            count = Product.objects.filter(category__name=theme['name']).count()
            self.stdout.write(f'   {theme["name"]}: {count} products')
