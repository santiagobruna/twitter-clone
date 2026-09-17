from django.urls import path

from .views import RegisterView

urlpatterns = [
    # Aceita com e sem barra final (POST não redireciona com APPEND_SLASH)
    path('register', RegisterView.as_view()),
    path('register/', RegisterView.as_view(), name='register'),
]
