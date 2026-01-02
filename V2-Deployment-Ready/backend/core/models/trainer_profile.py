from django.db import models
from django.conf import settings

class TrainerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='trainer_profile'
    )
    specialties = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    experience_years = models.IntegerField(default=0)

    def __str__(self):
        return f"Profile for {self.user.username}"
