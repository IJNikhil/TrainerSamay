from django.core.management.base import BaseCommand
from core.models import User
from rest_framework.authtoken.models import Token

class Command(BaseCommand):
    help = 'Seed a default admin user if not exists'

    def handle(self, *args, **kwargs):
        admin_user = User.objects.filter(role='admin').first()

        if not admin_user:
            admin_user = User(
                name='Admin',
                email='admin@test.com',
                role='admin',
                avatar='https://static.vecteezy.com/system/resources/previews/019/879/186/non_2x/user-icon-on-transparent-background-free-png.png',
                is_staff=True,
                is_superuser=True,
            )
            admin_user.set_password('password')
            admin_user.save()
            created = True
        else:
            created = False

        token, _ = Token.objects.get_or_create(user=admin_user)

        if created:
            self.stdout.write(self.style.SUCCESS(f'Default admin user created. Token: {token.key}'))
        else:
            self.stdout.write(self.style.WARNING(f'Admin user already exists. Token: {token.key}'))