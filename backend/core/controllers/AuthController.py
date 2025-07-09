from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import check_password
from core.models import User
from core.serializers import UserSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
import re


@method_decorator(csrf_exempt, name='dispatch')
class AuthController(APIView):
    permission_classes = [AllowAny]
    
    @csrf_exempt
    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            print("Login attempt:", email)
            
            if not email or not password:
                print("Missing email or password")
                return Response({'message': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = User.objects.get(email=email)
                print("User found:", user.email, "Role:", user.role)  # Added role logging
                print("User ID:", user.id)  # Added ID logging
                
                is_valid = check_password(password, user.password)
                print("Password valid:", is_valid)
                
                if not is_valid:
                    return Response({'message': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)
                
                # Create or get token for this specific user
                token, created = Token.objects.get_or_create(user=user)
                print("Token created for user:", user.id, "Token:", token.key[:10] + "...")
                
                data = UserSerializer(user).data
                print("Serialized user data:", data)  # Debug the serialized data
                
                return Response({
                    'user': data, 
                    'token': token.key,
                    'message': 'Login successful'
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                print("User not found")
                return Response({'message': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)
                
        except Exception as e:
            print("Server error:", str(e))
            return Response({'message': f'Server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
