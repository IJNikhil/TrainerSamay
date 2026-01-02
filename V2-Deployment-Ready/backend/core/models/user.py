from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('trainer', 'Trainer'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='trainer')
    # Add other fields as needed
