import os
import django
from django.contrib.auth import get_user_model

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "TrainerSamay.settings")
django.setup()

User = get_user_model()
USERNAME = "admin"
EMAIL = "admin@example.com"
PASSWORD = "admin123"

def create_superuser():
    if not User.objects.filter(username=USERNAME).exists():
        print(f"Creating superuser: {USERNAME}")
        try:
            User.objects.create_superuser(USERNAME, EMAIL, PASSWORD)
            print(f"Superuser '{USERNAME}' created successfully.")
        except Exception as e:
            print(f"Error creating superuser: {e}")
    else:
        print(f"Superuser '{USERNAME}' already exists. Skipping creation.")

if __name__ == "__main__":
    create_superuser()
