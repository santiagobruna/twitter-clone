from django.urls import path

from .views import LoginView, ProfileView, RegisterView

urlpatterns = [
    # Aceita com e sem barra final (POST não redireciona com APPEND_SLASH)
    path('register', RegisterView.as_view()),
    path('register/', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view()),
    path('login/', LoginView.as_view(), name='login'),
    path('profile', ProfileView.as_view()),
    path('profile/', ProfileView.as_view(), name='profile'),
]
