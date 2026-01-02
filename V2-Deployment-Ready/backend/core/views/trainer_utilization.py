from rest_framework import viewsets
from core.models import TrainerUtilization
from core.serializers.trainer_utilization import TrainerUtilizationSerializer
from core.permissions import IsTrainerSessionOwnerOrAdmin
from core.pagination import StandardResultsSetPagination
from rest_framework.filters import OrderingFilter
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django_filters.rest_framework import DjangoFilterBackend

class TrainerUtilizationViewSet(viewsets.ModelViewSet):
    queryset = TrainerUtilization.objects.all().order_by('-start_time')
    serializer_class = TrainerUtilizationSerializer
    permission_classes = [IsTrainerSessionOwnerOrAdmin]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ['start_time', 'end_time', 'course_name']
    ordering = ['start_time']
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request_user'] = self.request.user
        return context

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'admin':
            serializer.save()
        else:
            serializer.save(trainer=user)

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'trainer':
            return TrainerUtilization.objects.filter(trainer=user).order_by('-start_time')
        elif user.is_authenticated and user.role == 'admin':
            return TrainerUtilization.objects.all().order_by('-start_time')
        return TrainerUtilization.objects.none()
