from django.contrib import admin

from .models import Comment, Like, Post


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'content', 'created_at')
    search_fields = ('author__username', 'content')
    list_filter = ('created_at',)
    inlines = (CommentInline,)


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'created_at')
    search_fields = ('user__username',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'post', 'content', 'created_at')
    search_fields = ('user__username', 'content')
