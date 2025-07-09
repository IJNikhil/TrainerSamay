from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.contrib.auth import authenticate

class ObtainAuthTokenByEmail(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        # Accept both 'username' and 'email' for login
        email = request.data.get('email') or request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, email=email, password=password)
        if user is None:
            return Response({'detail': 'Invalid credentials'}, status=400)
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})
