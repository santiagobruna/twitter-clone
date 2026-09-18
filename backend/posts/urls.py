from django.urls import path

from .views import (
    CommentDestroyView,
    CommentListCreateView,
    FeedView,
    LikeToggleView,
    PostDetailView,
    PostListCreateView,
)

urlpatterns = [
    path('', PostListCreateView.as_view(), name='post-list-create'),
    path('feed', FeedView.as_view()),
    path('feed/', FeedView.as_view(), name='feed'),
    path('comments/<int:pk>', CommentDestroyView.as_view()),
    path('comments/<int:pk>/', CommentDestroyView.as_view(), name='comment-destroy'),
    path('<int:pk>/like', LikeToggleView.as_view()),
    path('<int:pk>/like/', LikeToggleView.as_view(), name='post-like'),
    path('<int:pk>/comments', CommentListCreateView.as_view()),
    path('<int:pk>/comments/', CommentListCreateView.as_view(), name='post-comments'),
    path('<int:pk>', PostDetailView.as_view()),
    path('<int:pk>/', PostDetailView.as_view(), name='post-detail'),
]
