from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Comment, Like, Post

User = get_user_model()


class AuthorSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source='profile.display_name', read_only=True)
    avatar = serializers.ImageField(source='profile.avatar', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'display_name', 'avatar')


class CommentSerializer(serializers.ModelSerializer):
    user = AuthorSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'user', 'content', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')


class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = (
            'id',
            'author',
            'content',
            'created_at',
            'updated_at',
            'likes_count',
            'comments_count',
            'is_liked',
            'comments',
        )
        read_only_fields = (
            'id',
            'author',
            'created_at',
            'updated_at',
            'likes_count',
            'comments_count',
            'is_liked',
            'comments',
        )

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.likes.filter(user=request.user).exists()


class PostListSerializer(PostSerializer):
    """Lista/feed sem embutir todos os comentários."""

    class Meta(PostSerializer.Meta):
        fields = (
            'id',
            'author',
            'content',
            'created_at',
            'updated_at',
            'likes_count',
            'comments_count',
            'is_liked',
        )
        read_only_fields = fields


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ('content',)
