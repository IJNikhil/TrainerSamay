import os
import django
from django.contrib.auth import get_user_model

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "TrainerSamay.settings")
django.setup()

User = get_user_model()
EMAIL = "admin@example.com"
NAME = "Admin User"
ROLE = "admin"
PASSWORD = "admin123"

def create_superuser():
    if not User.objects.filter(email=EMAIL).exists():
        print(f"Creating superuser: {EMAIL}")
        try:
            # Custom User model requires name and role
            User.objects.create_superuser(email=EMAIL, name=NAME, role=ROLE, password=PASSWORD)
            print(f"Superuser '{EMAIL}' created successfully.")
        except Exception as e:
            print(f"Error creating superuser: {e}")
    else:
        print(f"Superuser '{EMAIL}' already exists. Skipping creation.")

if __name__ == "__main__":
    create_superuser()
