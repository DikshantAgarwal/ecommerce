import re

from rest_framework import serializers

from .models import Address


INDIAN_PINCODE_RE = re.compile(r'^\d{6}$')


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id', 'name', 'phone', 'address_line1', 'address_line2',
            'city', 'state', 'postal_code', 'country', 'is_default',
        ]
        read_only_fields = ['id']

    def validate_phone(self, value):
        if len(value.replace('+', '')) < 10:
            raise serializers.ValidationError("Phone number must be at least 10 digits.")
        return value

    def validate_postal_code(self, value):
        if not INDIAN_PINCODE_RE.match(value):
            raise serializers.ValidationError("Postal code must be a 6-digit PIN code.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        if not Address.objects.filter(user=user).exists():
            validated_data['is_default'] = True
        return Address.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        if validated_data.get('is_default'):
            Address.objects.filter(
                user=instance.user
            ).exclude(pk=instance.pk).update(is_default=False)
        elif not Address.objects.filter(user=instance.user, is_default=True).exclude(pk=instance.pk).exists():
            validated_data['is_default'] = True
        return super().update(instance, validated_data)


class GoogleSocialLoginSerializer(serializers.Serializer):
    id_token = serializers.CharField(required=True)

    def validate_id_token(self, value):
        if not value:
            raise serializers.ValidationError("id_token is required")
        return value


class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = serializers.DictField()


class UserSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    email = serializers.EmailField(read_only=True)
    full_name = serializers.CharField()
    avatar = serializers.URLField(required=False, allow_blank=True)
    is_staff = serializers.BooleanField(read_only=True)


class UserUpdateSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=False, max_length=255)
    avatar = serializers.URLField(required=False, allow_blank=True)


class TokenRefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)
