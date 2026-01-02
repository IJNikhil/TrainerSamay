from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from core.models import TrainerAvailability, User, TrainerProfile, TrainerUtilization
from core.serializers.trainer_availability import TrainerAvailabilitySerializer
from core.serializers.trainer_profile import TrainerProfileSerializer
from core.permissions import IsOwnerOrAdmin
from core.pagination import StandardResultsSetPagination
from rest_framework.filters import OrderingFilter
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime
from django.utils import timezone
from django.db.models import Q

class TrainerAvailabilityViewSet(viewsets.ModelViewSet):
    queryset = TrainerAvailability.objects.all().order_by('day_of_week', 'start_time')
    serializer_class = TrainerAvailabilitySerializer
    permission_classes = [IsOwnerOrAdmin]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ['day_of_week', 'start_time', 'end_time']
    ordering = ['day_of_week', 'start_time']
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'admin':
            serializer.save()
        else:
            serializer.save(trainer=user)

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'role'):
            if user.role == 'trainer':
                return TrainerAvailability.objects.filter(trainer=user).order_by('day_of_week', 'start_time')
            elif user.role == 'admin':
                return TrainerAvailability.objects.all().order_by('day_of_week', 'start_time')
        return TrainerAvailability.objects.none()

    @action(detail=False, methods=['get'], url_path='find_available_trainers')
    def find_available_trainers(self, request):
        start_time_str = request.query_params.get('start_time')
        end_time_str = request.query_params.get('end_time')
        date_str = request.query_params.get('date')

        if not start_time_str or not end_time_str or not date_str:
            return Response(
                {'error': 'start_time, end_time (HH:MM:SS), and date (YYYY-MM-DD) query parameters are required.'},
                status=400
            )
        try:
            query_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            query_start_time_only = datetime.strptime(start_time_str, '%H:%M:%S').time()
            query_end_time_only = datetime.strptime(end_time_str, '%H:%M:%S').time()

            query_start_datetime_for_util = timezone.make_aware(
                datetime.combine(query_date, query_start_time_only),
                timezone.get_current_timezone()
            )
            query_end_datetime_for_util = timezone.make_aware(
                datetime.combine(query_date, query_end_time_only),
                timezone.get_current_timezone()
            )
        except ValueError:
            return Response(
                {'error': 'Invalid date or time format. Use YYYY-MM-DD for date, HH:MM:SS for time.'},
                status=400
            )

        if query_start_time_only >= query_end_time_only:
            return Response(
                {'error': 'End time must be after start time.'},
                status=400
            )

        query_day_of_week = query_date.strftime('%A')

        available_trainers_by_slot = User.objects.filter(role='trainer').distinct().filter(
            availabilities__day_of_week=query_day_of_week,
            availabilities__start_time__lte=query_start_time_only,
            availabilities__end_time__gte=query_end_time_only
        )

        conflicting_trainers_ids = TrainerUtilization.objects.filter(
            Q(trainer__in=available_trainers_by_slot) &
            Q(start_time__lt=query_end_datetime_for_util, end_time__gt=query_start_datetime_for_util)
        ).values_list('trainer_id', flat=True).distinct()

        final_available_trainers = available_trainers_by_slot.exclude(id__in=conflicting_trainers_ids)

        serializer = TrainerProfileSerializer(
            TrainerProfile.objects.filter(user__in=final_available_trainers).select_related('user'),
            many=True
        )
        return Response(serializer.data)
