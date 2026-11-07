
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from .models import User
from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
)


class RegistrationThrottle(AnonRateThrottle):
    scope = "registration"


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [RegistrationThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            {
                "message": "Account registered successfully.",
                "account": UserProfileSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
