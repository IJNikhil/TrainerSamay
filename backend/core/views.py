# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status, generics
# from django.contrib.auth.hashers import check_password
# from .models import User
# from .serializers import UserSerializer, UserCreateSerializer

# # --- User List & Create ---
# class UserListCreateAPIView(generics.ListCreateAPIView):
#     queryset = User.objects.all()
#     def get_serializer_class(self):
#         if self.request.method == 'POST':
#             return UserCreateSerializer
#         return UserSerializer

# # --- User Retrieve & Update ---
# class UserRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
#     queryset = User.objects.all()
#     lookup_field = 'id'
#     def get_serializer_class(self):
#         if self.request.method in ['PUT', 'PATCH']:
#             return UserCreateSerializer
#         return UserSerializer

# # --- Login View ---
# class LoginView(APIView):
#     permission_classes = []  # Allow any user to access this view

#     def post(self, request):
#         email = request.data.get('email')
#         password = request.data.get('password')
#         if not email or not password:
#             return Response({'message': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
#         try:
#             user = User.objects.get(email=email)
#             if not check_password(password, user.password):
#                 return Response({'message': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)
#             data = UserSerializer(user).data
#             return Response({'user': data, 'message': 'Login successful'}, status=status.HTTP_200_OK)
#         except User.DoesNotExist:
#             return Response({'message': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.hashers import check_password
from .models import User
from .serializers import (
    UserSerializer, UserCreateSerializer,
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


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'message': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            if not check_password(password, user.password):
                return Response({'message': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Create or get token
            token, created = Token.objects.get_or_create(user=user)
            
            data = UserSerializer(user).data
            return Response({
                'user': data, 
                'token': token.key,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({'message': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)