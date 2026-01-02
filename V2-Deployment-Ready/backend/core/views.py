from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.hashers import check_password
from rest_framework.authtoken.models import Token

from .models import User
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    ChangePasswordSerializer
)

# --- User List & Create ---
class UserListCreateAPIView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer


# --- User Retrieve & Update ---
class UserRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    lookup_field = 'id'


# --- User Login View ---
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {"message": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"message": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not check_password(password, user.password):
            return Response(
                {"message": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token, _ = Token.objects.get_or_create(user=user)
        user_data = UserSerializer(user).data

        return Response({
            "message": "Login successful",
            "token": token.key,
            "user": user_data
        }, status=status.HTTP_200_OK)
