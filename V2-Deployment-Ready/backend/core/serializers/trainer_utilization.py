from rest_framework import serializers
from core.models import TrainerUtilization, User

class TrainerUtilizationSerializer(serializers.ModelSerializer):
    trainer_username = serializers.CharField(source='trainer.username', read_only=True)
    trainer = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='trainer'),
        required=False,
        allow_null=True
    )
    feedback = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    status = serializers.CharField(required=False)

    class Meta:
        model = TrainerUtilization
        fields = [
            'id', 'trainer', 'trainer_username', 'course_name', 'start_time', 'end_time',
            'location', 'status', 'notes', 'feedback', 'created_at', 'updated_at'
        ]

    def validate(self, data):
        start = data.get('start_time')
        end = data.get('end_time')
        trainer = (
            data.get('trainer')
            or getattr(self.instance, 'trainer', None)
            or self.context.get('request_user')
        )
        if start is not None and end is not None:
            if start >= end:
                raise serializers.ValidationError("End time must be after start time.")
            qs = TrainerUtilization.objects.filter(trainer=trainer)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            qs = qs.filter(
                start_time__lt=end,
                end_time__gt=start
            )
            if qs.exists():
                raise serializers.ValidationError("Trainer already has a session in this time slot.")
        return data
