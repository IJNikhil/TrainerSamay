from rest_framework_simplejwt.views import TokenObtainPairView
from core.serializers.token_serializer import MyTokenObtainPairSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
