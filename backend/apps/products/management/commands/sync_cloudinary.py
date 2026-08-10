import os
import re

from django.conf import settings
from django.core.management.base import BaseCommand

from apps.products.models import Product, ProductVariant


class Command(BaseCommand):
    help = 'Upload product/variant images to Cloudinary and store clean public_ids in the DB'

    def handle(self, *args, **options):
        if not getattr(settings, 'CLOUDINARY_CLOUD_NAME', ''):
            self.stderr.write('CLOUDINARY_* env vars not set — nothing to do')
            return

        from cloudinary import api, uploader

        existing = self._existing_public_ids()

        targets = []
        for p in Product.objects.filter(is_active=True).exclude(image=''):
            targets.append((p, p.slug))
        for v in ProductVariant.objects.filter(product__is_active=True).exclude(image=''):
            targets.append((v, v.sku))

        uploaded = 0
        skipped = 0
        failed = []
        total = len(targets)

        for i, (obj, label) in enumerate(targets, 1):
            clean_name = self._public_id(obj.image.name)          # products/slug (no ext)
            local_name = obj.image.name                           # products/slug.jpeg
            path = self._local_path(local_name)
            if clean_name in existing:
                skipped += 1
            else:
                if not os.path.isfile(path):
                    failed.append((label, f'missing local file {path}'))
                    self.stderr.write(f'  [{i}/{total}] FAILED {clean_name}: missing file')
                    continue
                try:
                    uploader.upload(path, public_id=clean_name, overwrite=True)
                    uploaded += 1
                    self.stdout.write(f'  [{i}/{total}] uploaded {clean_name}')
                except Exception as exc:  # noqa: BLE001
                    failed.append((label, str(exc)))
                    self.stderr.write(f'  [{i}/{total}] FAILED {clean_name}: {exc}')

            # Store the extension-less public_id so image.url resolves cleanly
            if obj.image.name != clean_name:
                obj.image.name = clean_name
                obj.save(update_fields=['image'])

        self.cleanup_mutated(api)

        self.stdout.write('=' * 50)
        self.stdout.write(f'Cloudinary sync done: {uploaded} uploaded, {skipped} already present, {len(failed)} failed')
        if failed:
            self.stdout.write('   Failures:')
            for slug, err in failed[:10]:
                self.stdout.write(f'   - {slug}: {err}')

    def _public_id(self, name):
        base = os.path.basename(name)
        stem, _ = os.path.splitext(base)
        folder = os.path.dirname(name).replace('\\', '/')
        return f'{folder}/{stem}' if folder else stem

    def _local_path(self, name):
        return os.path.join(settings.MEDIA_ROOT, name)

    def _existing_public_ids(self):
        from cloudinary import api
        ids = []
        cursor = None
        while True:
            res = api.resources(type='upload', prefix='products/', max_results=500, next_cursor=cursor)
            ids.extend(r['public_id'] for r in res.get('resources', []))
            cursor = res.get('next_cursor')
            if not cursor:
                break
        return set(ids)

    def cleanup_mutated(self, api):
        # Remove legacy resources whose public_id ends in "<name>.jpeg" (format mismatch)
        legacy = [pid for pid in self._existing_public_ids()
                  if re.fullmatch(r'products/[a-z0-9\-]+\.(jpeg|jpg)', pid)]
        if legacy:
            api.delete_resources(legacy)
            self.stdout.write(f'   🧹 Deleted {len(legacy)} legacy .jpeg public_ids')