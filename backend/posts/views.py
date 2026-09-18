from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from config.api_responses import conflict, not_found
from social.models import Follow

from .models import Comment, Like, Post
from .serializers import (
    CommentCreateSerializer,
    CommentSerializer,
    PostListSerializer,
    PostSerializer,
)


class IsAuthorOrReadOnly(permissions.BasePermission):
    message = 'Você só pode alterar o próprio conteúdo.'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        author = getattr(obj, 'author', None) or getattr(obj, 'user', None)
        return author == request.user


class PostListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/posts/ — postagens do usuário autenticado
    POST /api/posts/ — criar postagem
    """

    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PostSerializer
        return PostListSerializer

    def get_queryset(self):
        return (
            Post.objects.filter(author=self.request.user)
            .select_related('author__profile')
            .prefetch_related('likes', 'comments')
        )

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class FeedView(generics.ListAPIView):
    """
    GET /api/posts/feed/

    Postagens do usuário autenticado e das pessoas que ele segue.
    """

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = PostListSerializer

    def get_queryset(self):
        following_ids = Follow.objects.filter(
            follower=self.request.user,
        ).values_list('following_id', flat=True)
        return (
            Post.objects.filter(
                Q(author=self.request.user) | Q(author_id__in=following_ids)
            )
            .select_related('author__profile')
            .prefetch_related('likes', 'comments')
        )


class PostDetailView(generics.RetrieveDestroyAPIView):
    """
    GET    /api/posts/<id>/
    DELETE /api/posts/<id>/  — apenas o autor
    """

    permission_classes = (permissions.IsAuthenticated, IsAuthorOrReadOnly)
    serializer_class = PostSerializer
    queryset = Post.objects.select_related('author__profile').prefetch_related(
        'likes',
        'comments__user__profile',
    )


class LikeToggleView(APIView):
    """
    POST   /api/posts/<id>/like/  — curtir
    DELETE /api/posts/<id>/like/  — remover curtida
    """

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if not created:
            return conflict(
                'Você já curtiu esta postagem.',
                code='ALREADY_LIKED',
            )
        return Response(
            {
                'message': 'Curtida adicionada.',
                'likes_count': post.likes.count(),
            },
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        deleted, _ = Like.objects.filter(user=request.user, post=post).delete()
        if not deleted:
            return not_found(
                'Você ainda não curtiu esta postagem.',
                code='NOT_LIKED',
            )
        return Response(
            {
                'message': 'Curtida removida.',
                'likes_count': post.likes.count(),
            },
            status=status.HTTP_200_OK,
        )


class CommentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/posts/<id>/comments/
    POST /api/posts/<id>/comments/
    """

    permission_classes = (permissions.IsAuthenticated,)

    def get_post(self):
        return get_object_or_404(Post, pk=self.kwargs['pk'])

    def get_queryset(self):
        return (
            Comment.objects.filter(post=self.get_post())
            .select_related('user__profile')
        )

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommentCreateSerializer
        return CommentSerializer

    def create(self, request, *args, **kwargs):
        post = self.get_post()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = Comment.objects.create(
            user=request.user,
            post=post,
            content=serializer.validated_data['content'],
        )
        return Response(
            CommentSerializer(comment, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class CommentDestroyView(generics.DestroyAPIView):
    """DELETE /api/posts/comments/<id>/ — apenas o autor do comentário."""

    permission_classes = (permissions.IsAuthenticated, IsAuthorOrReadOnly)
    serializer_class = CommentSerializer
    queryset = Comment.objects.all()
