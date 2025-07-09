from django.contrib.auth.backends import ModelBackend
from core.models import User

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        # Accept both 'username' and 'email' as the email field
        email = kwargs.get('email') or username
        if email is None or password is None:
            return None
        try:
            user = User.objects.get(email=email)
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        except User.DoesNotExist:
            return None
