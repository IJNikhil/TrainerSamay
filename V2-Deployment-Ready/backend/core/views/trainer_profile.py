from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from core.models import TrainerProfile, TrainerUtilization, TrainerAvailability, Booking
from core.serializers.trainer_profile import TrainerProfileSerializer
from core.serializers.trainer_utilization import TrainerUtilizationSerializer
from core.serializers.trainer_availability import TrainerAvailabilitySerializer
from core.permissions import IsAdminOrTrainerReadOnly, IsOwnerOrAdmin, IsSelfOrAdmin
from core.pagination import StandardResultsSetPagination
from rest_framework.filters import OrderingFilter
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django_filters.rest_framework import DjangoFilterBackend
from core.utils import generate_ics_for_trainer

class TrainerProfileViewSet(viewsets.ModelViewSet):
    queryset = TrainerProfile.objects.all().select_related('user').order_by('user__username')
    serializer_class = TrainerProfileSerializer
    permission_classes = [IsAdminOrTrainerReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ['user__username', 'user__date_joined']
    ordering = ['user__username']
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def get_permissions(self):
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return [IsSelfOrAdmin()]
        return [permission() for permission in self.permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'trainer':
            return TrainerProfile.objects.filter(user=user)
        elif user.is_authenticated and user.role == 'admin':
            return TrainerProfile.objects.all()
        return TrainerProfile.objects.none()

    @action(detail=True, methods=['get'], permission_classes=[IsOwnerOrAdmin])
    def utilizations(self, request, pk=None):
        profile = self.get_object()
        utilizations = TrainerUtilization.objects.filter(trainer=profile.user).order_by('-start_time')
        serializer = TrainerUtilizationSerializer(utilizations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsOwnerOrAdmin])
    def availabilities(self, request, pk=None):
        profile = self.get_object()
        availabilities = TrainerAvailability.objects.filter(trainer=profile.user).order_by('start_time')
        serializer = TrainerAvailabilitySerializer(availabilities, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsSelfOrAdmin])
    def export_schedule_ics(self, request, pk=None):
        profile = self.get_object()
        trainer = profile.user
        confirmed_bookings = Booking.objects.filter(
            trainer=trainer,
            status='confirmed'
        ).order_by('start_time')
        ics_content = generate_ics_for_trainer(
            trainer,
            booking_data=confirmed_bookings,
        )
        response = HttpResponse(ics_content, content_type='text/calendar')
        response['Content-Disposition'] = f'attachment; filename="{trainer.username}_schedule.ics"'
        return response
