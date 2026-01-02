from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from core.models import Availability, User
from core.serializers import AvailabilitySerializer, UserSerializer
from django.shortcuts import get_object_or_404


class AvailabilityListController(generics.ListAPIView):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer


class TrainerAvailabilitiesController(APIView):
    def get(self, request, trainerId):
        avails = Availability.objects.filter(trainer__id=trainerId)
        serializer = AvailabilitySerializer(avails, many=True)
        return Response(serializer.data)

    def put(self, request, trainerId):
        trainer = get_object_or_404(User, id=trainerId)

        if not isinstance(request.data, list):
            return Response(
                {"message": "Request body should be a list of availability records."},
                status=status.HTTP_400_BAD_REQUEST
            )

        Availability.objects.filter(trainer=trainer).delete()

        for a in request.data:
            Availability.objects.create(
                trainer=trainer,
                day=a.get("day"),
                startTime=a.get("startTime"),
                endTime=a.get("endTime")
            )

        return Response({"success": True}, status=status.HTTP_200_OK)


class AllTrainersController(generics.ListAPIView):
    queryset = User.objects.filter(role="trainer")
    serializer_class = UserSerializer
