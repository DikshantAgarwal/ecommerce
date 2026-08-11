from django.conf import settings
from django.shortcuts import get_object_or_404
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Address, User
from .serializers import (
    AddressSerializer,
    GoogleSocialLoginSerializer,
    UserSerializer,
    UserUpdateSerializer,
)


class GoogleLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleSocialLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data['id_token']

        try:
            info = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                audience=settings.GOOGLE_CLIENT_ID or None,
            )
        except ValueError:
            return Response(
                {'error': {'code': 'invalid_token', 'detail': 'Invalid or expired Google ID token'}},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if info.get('iss') not in ('accounts.google.com', 'https://accounts.google.com'):
            return Response(
                {'error': {'code': 'invalid_issuer', 'detail': 'Token issuer is not Google'}},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        email = info.get('email')
        if not email:
            return Response(
                {'error': {'code': 'missing_email', 'detail': 'Google account has no email'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        full_name = info.get('name', '')
        avatar = info.get('picture', '')

        user, created = User.objects.get_or_create(
            email=email,
            defaults={'full_name': full_name, 'avatar': avatar},
        )

        if not created:
            changed = False
            if full_name and user.full_name != full_name:
                user.full_name = full_name
                changed = True
            if avatar and user.avatar != avatar:
                user.avatar = avatar
                changed = True
            if changed:
                user.save()

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer({
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'avatar': user.avatar,
        }).data

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_data,
        }, status=status.HTTP_200_OK)


class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer({
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'avatar': user.avatar,
        })
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        user = request.user
        serializer = UserUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        changed = False
        if 'full_name' in data and data['full_name'] != user.full_name:
            user.full_name = data['full_name']
            changed = True
        if 'avatar' in data and data['avatar'] != user.avatar:
            user.avatar = data['avatar']
            changed = True
        if changed:
            user.save()

        response_serializer = UserSerializer({
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'avatar': user.avatar,
        })
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class AddressListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        addresses = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AddressSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AddressDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        return get_object_or_404(Address, pk=pk, user=request.user)

    def put(self, request, pk):
        address = self.get_object(request, pk)
        serializer = AddressSerializer(address, data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        address = self.get_object(request, pk)
        if address.is_default:
            next_default = Address.objects.filter(user=request.user).exclude(pk=address.pk).first()
            if next_default:
                next_default.is_default = True
                next_default.save(update_fields=['is_default'])
        address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AddressSetDefaultAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        address = get_object_or_404(Address, pk=pk, user=request.user)
        Address.objects.filter(user=request.user).exclude(pk=address.pk).update(is_default=False)
        address.is_default = True
        address.save(update_fields=['is_default'])
        serializer = AddressSerializer(address)
        return Response(serializer.data, status=status.HTTP_200_OK)
