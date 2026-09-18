from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from config.api_responses import bad_request, conflict, not_found

from .models import Follow
from .serializers import FollowSerializer, UserBriefSerializer

User = get_user_model()


class FollowToggleView(APIView):
    """
    POST   /api/social/follow/<user_id>/  — seguir
    DELETE /api/social/follow/<user_id>/  — deixar de seguir
    """

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, user_id):
        target = get_object_or_404(User, pk=user_id)
        if target == request.user:
            return bad_request(
                'Você não pode seguir a si mesmo.',
                code='SELF_FOLLOW',
            )

        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            following=target,
        )
        if not created:
            return conflict(
                'Você já segue este usuário.',
                code='ALREADY_FOLLOWING',
            )

        return Response(
            FollowSerializer(follow, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request, user_id):
        target = get_object_or_404(User, pk=user_id)
        deleted, _ = Follow.objects.filter(
            follower=request.user,
            following=target,
        ).delete()
        if not deleted:
            return not_found(
                'Você não segue este usuário.',
                code='NOT_FOLLOWING',
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class FollowingListView(generics.ListAPIView):
    """GET /api/social/following/ — quem o usuário autenticado segue."""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserBriefSerializer

    def get_queryset(self):
        return User.objects.filter(
            followers_set__follower=self.request.user,
        ).select_related('profile').order_by('username')


class FollowersListView(generics.ListAPIView):
    """GET /api/social/followers/ — quem segue o usuário autenticado."""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserBriefSerializer

    def get_queryset(self):
        return User.objects.filter(
            following_set__following=self.request.user,
        ).select_related('profile').order_by('username')


class UserFollowingListView(generics.ListAPIView):
    """GET /api/social/users/<user_id>/following/"""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserBriefSerializer

    def get_queryset(self):
        user = get_object_or_404(User, pk=self.kwargs['user_id'])
        return User.objects.filter(
            followers_set__follower=user,
        ).select_related('profile').order_by('username')


class UserFollowersListView(generics.ListAPIView):
    """GET /api/social/users/<user_id>/followers/"""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserBriefSerializer

    def get_queryset(self):
        user = get_object_or_404(User, pk=self.kwargs['user_id'])
        return User.objects.filter(
            following_set__following=user,
        ).select_related('profile').order_by('username')
