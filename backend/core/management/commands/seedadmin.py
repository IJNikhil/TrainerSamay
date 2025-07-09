from django.core.management.base import BaseCommand
from core.models import User
from rest_framework.authtoken.models import Token

class Command(BaseCommand):
    help = 'Seed a default admin user if not exists'

    def handle(self, *args, **kwargs):
        if not User.objects.filter(role='admin').exists():
            user = User(
                name='Admin',
                email='admin@test.com',
                role='admin',
                avatar='https://images.unsplash.com/photo-1750535135451-7c20e24b60c1?auto=format&fit=facearea&w=256&h=256&q=80',
                is_staff=True,
                is_superuser=True,
            )
            user.set_password('password')
            user.save()
            token, created = Token.objects.get_or_create(user=user)
            self.stdout.write(self.style.SUCCESS(f'Default admin user created. Token: {token.key}'))
        else:
            user = User.objects.filter(role='admin').first()
            token, created = Token.objects.get_or_create(user=user)
            self.stdout.write(self.style.WARNING(f'Admin user already exists. Token: {token.key}'))
