from django.contrib.auth import get_user_model
from rest_framework import serializers

from social.models import Follow

from .models import Comment, Like, Post

User = get_user_model()


class AuthorSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source='profile.display_name', read_only=True)
    avatar = serializers.URLField(source='profile.avatar', read_only=True, allow_null=True)
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
    image = serializers.URLField(
        required=False,
        allow_blank=True,
        allow_null=True,
        max_length=1000,
    )

    class Meta:
        model = Post
        fields = (
            'id',
            'author',
            'content',
            'image',
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
        extra_kwargs = {
            'content': {'required': False, 'allow_blank': True},
        }

    def validate(self, attrs):
        content = (attrs.get('content') or '').strip()
        image = attrs.get('image') or None
        attrs['content'] = content
        attrs['image'] = image or None
        if not content and not image:
            raise serializers.ValidationError(
                {'content': 'Escreva um texto ou adicione uma foto.'}
            )
        return attrs

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
            'image',
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
