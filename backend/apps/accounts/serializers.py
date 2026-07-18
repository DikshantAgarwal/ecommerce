from rest_framework import serializers


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
    id = serializers.UUIDField()
    email = serializers.EmailField()
    full_name = serializers.CharField()
    avatar = serializers.URLField(required=False, allow_blank=True)


class TokenRefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)
