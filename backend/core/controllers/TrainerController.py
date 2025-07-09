from rest_framework import generics
from core.models import User
from core.serializers import UserSerializer

class TrainerListController(generics.ListAPIView):
    queryset = User.objects.filter(role='trainer')
    serializer_class = UserSerializer
