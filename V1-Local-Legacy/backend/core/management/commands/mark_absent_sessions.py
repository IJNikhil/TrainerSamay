from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from core.models import Session

class Command(BaseCommand):
    help = "Automatically mark overdue scheduled sessions as Absent"

    def handle(self, *args, **options):
        now = timezone.now()
        sessions = Session.objects.filter(status="Scheduled")
        updated_count = 0

        for session in sessions:
            waiting_minutes = session.duration * 0.5 if session.duration <= 60 else 30
            cutoff = session.date + timedelta(minutes=waiting_minutes)
            if now > cutoff:
                session.status = "Absent"
                session.save()
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Marked {updated_count} session(s) as Absent."
        ))
