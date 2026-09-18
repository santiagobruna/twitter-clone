from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.serializers import UserSerializer

from .models import Follow

User = get_user_model()


class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ('id', 'follower', 'following', 'created_at')
        read_only_fields = fields


class UserBriefSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source='profile.display_name', read_only=True)
    avatar = serializers.ImageField(source='profile.avatar', read_only=True)
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'display_name', 'avatar', 'is_following')

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
