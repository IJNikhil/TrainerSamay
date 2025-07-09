# Updated urls.py

from django.urls import path

from core.auth_token import ObtainAuthTokenByEmail
from core.controllers.UserController import CurrentUserController 
from core.controllers.AuthController import AuthController 
from core.controllers.UserController import (
    UserListCreateController,
    UserDetailController,
    UserPasswordChangeController,
)
from core.controllers.SessionController import SessionListCreateController, SessionDetailController
from core.controllers.AvailabilityController import (
    AvailabilityListController,
    TrainerAvailabilitiesController,
    AllTrainersController
)
from core.controllers.TrainerController import TrainerListController

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', AuthController.as_view(), name='auth_login'),
    path('auth/token/', ObtainAuthTokenByEmail.as_view(), name='api_token_auth'),
    path('auth/me/', CurrentUserController.as_view(), name='current_user'),  # NEW ENDPOINT

    # User endpoints
    path('users/', UserListCreateController.as_view(), name='user_list_create'),
    path('users/<str:id>/', UserDetailController.as_view(), name='user_detail'),
    path('users/<str:id>/change-password/', UserPasswordChangeController.as_view(), name='user_change_password'),

    # Session endpoints
    path('sessions/', SessionListCreateController.as_view(), name='session_list_create'),
    path('sessions/<str:id>/', SessionDetailController.as_view(), name='session_detail'),

    # Availability endpoints
    path('availabilities/', AvailabilityListController.as_view(), name='availability_list'),
    path('availabilities/trainers/', AllTrainersController.as_view(), name='all_trainers'),
    path('availabilities/<str:trainerId>/', TrainerAvailabilitiesController.as_view(), name='trainer_availabilities'),

    # Trainer endpoints
    path('trainers/', TrainerListController.as_view(), name='trainer_list'),
]