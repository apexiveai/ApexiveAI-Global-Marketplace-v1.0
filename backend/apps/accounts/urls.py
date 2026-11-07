
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from . import views

app_name = "accounts"

urlpatterns = [
    # Public account registration
    path(
        "register/",
        views.RegisterView.as_view(),
        name="register",
    ),

    # JWT Authentication
    path(
        "login/",
        TokenObtainPairView.as_view(),
        name="login",
    ),
    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),

    # Authenticated account profile
    path(
        "me/",
        views.CurrentUserView.as_view(),
        name="current-user",
    ),
]
