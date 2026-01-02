from rest_framework import viewsets, serializers
from core.models import Booking, User, TrainerUtilization
from core.serializers.booking import BookingSerializer
from core.permissions import IsBookingOwnerOrTrainerOrAdmin
from core.pagination import StandardResultsSetPagination
from rest_framework.filters import OrderingFilter
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django_filters.rest_framework import DjangoFilterBackend

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsBookingOwnerOrTrainerOrAdmin]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ['start_time', 'end_time', 'status', 'created_at']
    ordering = ['start_time']
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == 'admin':
                return Booking.objects.all()
            elif user.role == 'trainer':
                return Booking.objects.filter(trainer=user)
        return Booking.objects.none()

    def perform_create(self, serializer):
        trainer_id = self.request.data.get('trainer')
        if not trainer_id:
            raise serializers.ValidationError({"trainer": "Trainer ID is required for creating a booking."})
        try:
            trainer_obj = User.objects.get(pk=trainer_id, role='trainer')
        except User.DoesNotExist:
            raise serializers.ValidationError({"trainer": "Invalid trainer ID or user is not a trainer."})
        booking = serializer.save(trainer=trainer_obj)

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        booking = serializer.save()
        new_status = booking.status
        if old_status != 'confirmed' and new_status == 'confirmed':
            util = TrainerUtilization.objects.create(
                trainer=booking.trainer,
                course_name=f"Booking: {booking.id} - {booking.notes or 'Session'}",
                start_time=booking.start_time,
                end_time=booking.end_time,
                location="N/A (Booked Session)"
            )
            booking.utilization = util
            booking.save(update_fields=['utilization'])
        elif old_status == 'confirmed' and new_status != 'confirmed':
            if booking.utilization:
                booking.utilization.delete()
                booking.utilization = None
                booking.save(update_fields=['utilization'])

    def perform_destroy(self, instance):
        if instance.utilization:
            instance.utilization.delete()
        instance.delete()
