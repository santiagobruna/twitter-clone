from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import Profile

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('display_name', 'avatar', 'bio')
        read_only_fields = fields


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'date_joined', 'profile')
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm')

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('Já existe uma conta com este e-mail.')
        return email

    def validate_username(self, value):
        username = value.strip()
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError('Este nome de usuário já está em uso.')
        return username

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {'password_confirm': 'As senhas não coincidem.'}
            )
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        Token.objects.get_or_create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
    )

    def validate(self, attrs):
        from django.contrib.auth import authenticate

        user = authenticate(
            username=attrs['username'],
            password=attrs['password'],
        )
        if user is None:
            raise serializers.ValidationError('Usuário ou senha inválidos.')
        if not user.is_active:
            raise serializers.ValidationError('Esta conta está desativada.')
        attrs['user'] = user
        return attrs


class ProfileUpdateSerializer(serializers.Serializer):
    """
    Atualização parcial do perfil.
    Todos os campos são opcionais — envie apenas o que deseja alterar.
    """

    display_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    avatar = serializers.ImageField(required=False, allow_null=True)
    password = serializers.CharField(
        write_only=True,
        required=False,
        min_length=8,
        style={'input_type': 'password'},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'},
    )

    def validate(self, attrs):
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')

        if password or password_confirm:
            if not password or not password_confirm:
                raise serializers.ValidationError(
                    {
                        'password_confirm': (
                            'Informe password e password_confirm para alterar a senha.'
                        )
                    }
                )
            if password != password_confirm:
                raise serializers.ValidationError(
                    {'password_confirm': 'As senhas não coincidem.'}
                )
            validate_password(password, user=self.context['request'].user)

        return attrs

    def update(self, instance, validated_data):
        profile = instance.profile
        password = validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)

        if 'display_name' in validated_data:
            profile.display_name = validated_data['display_name']

        if 'avatar' in validated_data:
            profile.avatar = validated_data['avatar']

        profile.save()

        if password:
            instance.set_password(password)
            instance.save(update_fields=['password'])
            # Invalida tokens antigos e emite um novo
            Token.objects.filter(user=instance).delete()
            Token.objects.create(user=instance)

        return instance
