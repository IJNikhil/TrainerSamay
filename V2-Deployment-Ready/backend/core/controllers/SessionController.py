from rest_framework import generics
from core.models import Session
from core.serializers import SessionSerializer


class SessionListCreateController(generics.ListCreateAPIView):
    serializer_class = SessionSerializer

    def get_queryset(self):
        trainer_id = self.request.query_params.get('trainer')
        if trainer_id:
            return Session.objects.filter(trainer__id=trainer_id)
        return Session.objects.all()

    def perform_create(self, serializer):
        serializer.save()


class SessionDetailController(generics.RetrieveUpdateDestroyAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    lookup_field = 'id'

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()
