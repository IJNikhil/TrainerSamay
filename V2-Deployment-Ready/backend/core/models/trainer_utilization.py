from django.db import models
from core.models import User

class TrainerUtilization(models.Model):
    trainer = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'trainer'})
    course_name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('confirmed', 'Confirmed'),
            ('completed', 'Completed'),
            ('cancelled', 'Cancelled')
        ],
        default='pending'
    )
    notes = models.TextField(blank=True, null=True)
    feedback = models.TextField(blank=True, null=True)  # <-- NEW
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
