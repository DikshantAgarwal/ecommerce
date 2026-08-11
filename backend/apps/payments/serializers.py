from rest_framework import serializers


class PaymentInitiateSerializer(serializers.Serializer):
    order_id = serializers.UUIDField()
    return_url = serializers.URLField(max_length=250, allow_blank=True)