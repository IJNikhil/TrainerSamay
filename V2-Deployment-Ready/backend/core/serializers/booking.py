from rest_framework import serializers
from core.models import Booking, TrainerUtilization, TrainerAvailability, User

class BookingSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    trainer_username = serializers.ReadOnlyField(source='trainer.username')

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'user_username', 'trainer', 'trainer_username',
            'start_time', 'end_time', 'status', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'user_username', 'trainer_username', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def validate(self, data):
        instance = self.instance
        user = self.context['request'].user
        trainer = data.get('trainer') or (instance.trainer if instance else None)

        # Only block self-booking on creation
        if self.instance is None and trainer and user == trainer:
            raise serializers.ValidationError("Trainers cannot book themselves.")

        # Only check availability/overlap if times or trainer are being changed or if confirming
        is_new = instance is None
        is_confirming = (instance and instance.status != 'confirmed' and data.get('status') == 'confirmed')
        times_changing = 'start_time' in data or 'end_time' in data or 'trainer' in data

        if is_new or is_confirming or times_changing:
            start_time = data.get('start_time') or (instance.start_time if instance else None)
            end_time = data.get('end_time') or (instance.end_time if instance else None)
            if not all([trainer, start_time, end_time]):
                raise serializers.ValidationError("Trainer, start_time, and end_time are required for booking.")
            day_of_week = start_time.strftime('%A')
            is_available_in_slot = TrainerAvailability.objects.filter(
                trainer=trainer,
                day_of_week=day_of_week,
                start_time__lte=start_time.time(),
                end_time__gte=end_time.time()
            ).exists()
            if not is_available_in_slot:
                raise serializers.ValidationError("Trainer is not available during the specified time slot.")
            overlapping_utilizations = TrainerUtilization.objects.filter(
                trainer=trainer,
                start_time__lt=end_time,
                end_time__gt=start_time
            )
            if instance and hasattr(instance, 'utilization') and instance.utilization:
                overlapping_utilizations = overlapping_utilizations.exclude(pk=instance.utilization.pk)
            if overlapping_utilizations.exists():
                raise serializers.ValidationError({"overlap": "Trainer is already utilized during this time."})

        if instance and 'status' in data:
            current_status = instance.status
            new_status = data['status']
            if current_status == 'confirmed' and new_status == 'pending':
                raise serializers.ValidationError("Cannot change confirmed booking back to pending.")
            if current_status == 'completed' and new_status != 'completed':
                raise serializers.ValidationError("Cannot change status of a completed booking.")
        return data
