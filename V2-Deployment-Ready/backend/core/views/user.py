from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from core.models import User, Booking, TrainerUtilization
from core.serializers.user import UserSerializer
from core.serializers.booking import BookingSerializer
from core.serializers.trainer_utilization import TrainerUtilizationSerializer
from core.permissions import IsAdmin
from core.pagination import StandardResultsSetPagination
from rest_framework.filters import OrderingFilter
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django_filters.rest_framework import DjangoFilterBackend

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ['username', 'date_joined']
    ordering = ['username']
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_next_session(self, request):
        user = request.user
        now = timezone.now()
        next_session = None
        session_type = None

        if user.role == 'trainer':
            next_booking = Booking.objects.filter(
                trainer=user,
                status='confirmed',
                start_time__gte=now
            ).order_by('start_time').first()
            next_utilization = TrainerUtilization.objects.filter(
                trainer=user,
                start_time__gte=now
            ).order_by('start_time').first()
            if next_booking and (not next_utilization or next_booking.start_time < next_utilization.start_time):
                next_session = next_booking
                session_type = 'booking'
            elif next_utilization:
                next_session = next_utilization
                session_type = 'utilization'

        if next_session:
            if session_type == 'booking':
                serializer = BookingSerializer(next_session)
            elif session_type == 'utilization':
                serializer = TrainerUtilizationSerializer(next_session)
            return Response(serializer.data)
        else:
            return Response({"message": "No upcoming sessions found."}, status=status.HTTP_200_OK)

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
