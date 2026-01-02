import django_filters
from core.models import TrainerAvailability, TrainerUtilization, Booking, TrainerProfile, User

class TrainerAvailabilityFilter(django_filters.FilterSet):
    day_of_week = django_filters.CharFilter(field_name='day_of_week', lookup_expr='iexact')

    class Meta:
        model = TrainerAvailability
        fields = ['trainer', 'day_of_week', 'start_time', 'end_time']

class TrainerUtilizationFilter(django_filters.FilterSet):
    trainer = django_filters.ModelChoiceFilter(queryset=User.objects.filter(role='trainer'))
    start_date = django_filters.DateFilter(field_name='start_time', lookup_expr='date__gte')
    end_date = django_filters.DateFilter(field_name='end_time', lookup_expr='date__lte')

    class Meta:
        model = TrainerUtilization
        fields = ['trainer', 'course_name', 'location', 'start_time', 'end_time']

class BookingFilter(django_filters.FilterSet):
    user = django_filters.ModelChoiceFilter(queryset=User.objects.all())
    trainer = django_filters.ModelChoiceFilter(queryset=User.objects.filter(role='trainer'))
    status = django_filters.CharFilter(field_name='status', lookup_expr='iexact')
    start_date_gte = django_filters.DateFilter(field_name='start_time', lookup_expr='date__gte')
    end_date_lte = django_filters.DateFilter(field_name='end_time', lookup_expr='date__lte')

    class Meta:
        model = Booking
        fields = ['user', 'trainer', 'status', 'start_time', 'end_time']

class TrainerProfileFilter(django_filters.FilterSet):
    specialties = django_filters.CharFilter(lookup_expr='icontains')
    experience_years = django_filters.NumberFilter()
    username = django_filters.CharFilter(field_name='user__username', lookup_expr='icontains')

    class Meta:
        model = TrainerProfile
        fields = ['specialties', 'experience_years', 'username']
