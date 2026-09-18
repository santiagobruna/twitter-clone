from django.urls import path

from .views import (
    FollowersListView,
    FollowingListView,
    FollowToggleView,
    SuggestionListView,
    UserFollowersListView,
    UserFollowingListView,
    UserListView,
)

urlpatterns = [
    path('follow/<int:user_id>', FollowToggleView.as_view()),
    path('follow/<int:user_id>/', FollowToggleView.as_view(), name='follow-toggle'),
    path('following', FollowingListView.as_view()),
    path('following/', FollowingListView.as_view(), name='following-list'),
    path('followers', FollowersListView.as_view()),
    path('followers/', FollowersListView.as_view(), name='followers-list'),
    path('suggestions', SuggestionListView.as_view()),
    path('suggestions/', SuggestionListView.as_view(), name='suggestions-list'),
    path('users', UserListView.as_view()),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:user_id>/following', UserFollowingListView.as_view()),
    path(
        'users/<int:user_id>/following/',
        UserFollowingListView.as_view(),
        name='user-following-list',
    ),
    path('users/<int:user_id>/followers', UserFollowersListView.as_view()),
    path(
        'users/<int:user_id>/followers/',
        UserFollowersListView.as_view(),
        name='user-followers-list',
    ),
]
