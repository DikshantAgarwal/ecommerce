from django.shortcuts import get_object_or_404
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import GoogleSocialLoginSerializer, UserSerializer


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
                audience=None,
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
