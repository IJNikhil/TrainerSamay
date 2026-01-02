from django.db import models
from django.conf import settings

class TrainerAvailability(models.Model):
    trainer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={'role': 'trainer'}, related_name='availabilities', null=True, blank=True)
    DAY_CHOICES = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday'),
    ]
    day_of_week = models.CharField(max_length=10, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        ordering = ['day_of_week', 'start_time']
        unique_together = ('trainer', 'day_of_week', 'start_time', 'end_time')
        verbose_name_plural = "Trainer Availabilities"

    def __str__(self):
        return f"{self.trainer.username} - {self.day_of_week} {self.start_time} to {self.end_time}"
