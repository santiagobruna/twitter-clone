from rest_framework import generics, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    LoginSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/

    Cria uma nova conta de usuário.
    """

    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                'user': UserSerializer(user, context={'request': request}).data,
                'token': token.key,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    POST /api/auth/login/

    Autentica o usuário e retorna um token de acesso.
    """

    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                'user': UserSerializer(user, context={'request': request}).data,
                'token': token.key,
            },
            status=status.HTTP_200_OK,
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/auth/profile/  — dados do usuário autenticado
    PATCH /api/auth/profile/  — atualiza nome, foto e/ou senha (campos opcionais)
    """

    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ProfileUpdateSerializer
        return UserSerializer

    def retrieve(self, request, *args, **kwargs):
        return Response(
            UserSerializer(request.user, context={'request': request}).data
        )

    def update(self, request, *args, **kwargs):
        # Todos os campos são opcionais (PUT e PATCH se comportam como parcial)
        partial = True
        user = self.get_object()
        serializer = ProfileUpdateSerializer(
            user,
            data=request.data,
            partial=partial,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        user.refresh_from_db()

        response_data = {
            'user': UserSerializer(user, context={'request': request}).data,
        }

        # Se a senha mudou, devolve o novo token
        token = Token.objects.filter(user=user).first()
        if token:
            response_data['token'] = token.key

        return Response(response_data)
