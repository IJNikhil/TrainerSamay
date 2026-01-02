from rest_framework import serializers
from core.models import TrainerAvailability

class TrainerAvailabilitySerializer(serializers.ModelSerializer):
    trainer_username = serializers.CharField(source='trainer.username', read_only=True)
    start_time = serializers.TimeField(format='%H:%M:%S')
    end_time = serializers.TimeField(format='%H:%M:%S')

    class Meta:
        model = TrainerAvailability
        fields = ['id', 'trainer', 'trainer_username', 'day_of_week', 'start_time', 'end_time']
        read_only_fields = ['trainer_username']

    def validate(self, data):
        start = data.get('start_time')
        end = data.get('end_time')
        if start is not None and end is not None:
            if start >= end:
                raise serializers.ValidationError("End time must be after start time.")
        return data
