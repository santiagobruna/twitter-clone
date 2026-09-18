from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from accounts.serializers import UserSerializer

from .models import Follow

User = get_user_model()


def _profile(user):
    try:
        return user.profile
    except ObjectDoesNotExist:
        return None


class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ('id', 'follower', 'following', 'created_at')
        read_only_fields = fields


class UserBriefSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'display_name', 'avatar', 'is_following')

    def get_display_name(self, obj):
        profile = _profile(obj)
        name = (profile.display_name if profile else '') or ''
        return name.strip() or obj.username

    def get_avatar(self, obj):
        profile = _profile(obj)
        return profile.avatar if profile else None

    def get_is_following(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        if request.user.pk == obj.pk:
            return False
        return Follow.objects.filter(
            follower=request.user,
            following=obj,
        ).exists()
