from django.core.management.base import BaseCommand
from core.models import User, TrainerProfile, TrainerAvailability
from django.utils import timezone
from datetime import time

class Command(BaseCommand):
    help = 'Create sample trainers and availabilities'

    def handle(self, *args, **kwargs):
        trainer, created = User.objects.get_or_create(
            username='trainer1',
            defaults={'email': 'trainer1@example.com', 'role': 'trainer'}
        )
        if created:
            trainer.set_password('trainerpass')
            trainer.save()
            self.stdout.write(self.style.SUCCESS('Created trainer1'))

        profile, _ = TrainerProfile.objects.get_or_create(user=trainer)
        TrainerAvailability.objects.get_or_create(
            trainer=trainer,
            day_of_week='Monday',
            start_time=time(9, 0),
            end_time=time(17, 0),
        )
        self.stdout.write(self.style.SUCCESS('Sample data created.'))
