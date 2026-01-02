from django.db import models
from django.conf import settings
from datetime import timedelta

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Confirmation'),
        ('confirmed', 'Confirmed'),
        ('cancelled_by_user', 'Cancelled by User'),
        ('cancelled_by_trainer', 'Cancelled by Trainer'),
        ('completed', 'Completed'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings_made')
    trainer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings_received', limit_choices_to={'role': 'trainer'})
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError({'end_time': "End time must be after start time."})
        min_duration = timedelta(minutes=15)
        if self.start_time and self.end_time and (self.end_time - self.start_time) < min_duration:
            raise ValidationError({'__all__': "Booking duration must be at least 15 minutes."})

    class Meta:
        ordering = ['start_time']
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"

    def __str__(self):
        return f"Booking for {self.trainer.username} by {self.user.username} from {self.start_time} to {self.end_time} ({self.status})"
