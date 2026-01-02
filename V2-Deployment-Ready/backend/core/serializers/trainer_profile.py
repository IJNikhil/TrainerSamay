from rest_framework import serializers
from core.models import TrainerProfile

class TrainerProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = TrainerProfile
        fields = [
            'id', 'user', 'username', 'email', 'first_name', 'last_name',
            'specialties', 'bio', 'experience_years'
        ]
        read_only_fields = [
            'id', 'username', 'email', 'first_name', 'last_name'
        ]
