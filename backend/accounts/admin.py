from django.contrib import admin
from django.contrib.auth import get_user_model

from .models import Profile

User = get_user_model()


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    extra = 0


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'display_name', 'created_at', 'updated_at')
    search_fields = ('user__username', 'user__email', 'display_name')
    list_filter = ('created_at',)
