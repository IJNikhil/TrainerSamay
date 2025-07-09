from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from core.models import Availability, User
from core.serializers import AvailabilitySerializer, UserSerializer

class AvailabilityListController(generics.ListAPIView):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer

class TrainerAvailabilitiesController(APIView):
    def get(self, request, trainerId):
        avails = Availability.objects.filter(trainer__id=trainerId)
        serializer = AvailabilitySerializer(avails, many=True)
        return Response(serializer.data)

    def put(self, request, trainerId):
        Availability.objects.filter(trainer__id=trainerId).delete()
        availabilities = request.data
        trainer = User.objects.get(id=trainerId)
        for a in availabilities:
            Availability.objects.create(
                trainer=trainer,
                day=a['day'],
                startTime=a['startTime'],
                endTime=a['endTime']
            )
        return Response({'success': True})

class AllTrainersController(generics.ListAPIView):
    queryset = User.objects.filter(role='trainer')
    serializer_class = UserSerializer
