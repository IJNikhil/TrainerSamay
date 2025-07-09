from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.models import User
from core.serializers import UserSerializer, UserCreateSerializer, ChangePasswordSerializer

class UserListCreateController(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_queryset(self):
        role = self.request.query_params.get('role')
        if role:
            return User.objects.filter(role=role)
        return User.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'success': True, 'id': serializer.data['id']}, status=status.HTTP_201_CREATED)

class UserDetailController(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserCreateSerializer
        return UserSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class UserPasswordChangeController(APIView):
    # Temporarily remove authentication for debugging
    # permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        print("=== Password Change Attempt ===")
        print("request.user:", request.user)
        print("request.user.id:", getattr(request.user, 'id', None))
        print("request.user.is_staff:", getattr(request.user, 'is_staff', None))
        print("id param:", id)
        print("===============================")

        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            print("User not found for id:", id)
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ChangePasswordSerializer(data=request.data, context={'user': user})
        if serializer.is_valid():
            serializer.save()
            print("Password updated successfully for user id:", id)
            return Response({'detail': 'Password updated successfully.'}, status=status.HTTP_200_OK)
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CurrentUserController(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current authenticated user"""
        print("Current user request - User:", request.user)
        print("Current user ID:", request.user.id)
        print("Current user role:", request.user.role)
        
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)