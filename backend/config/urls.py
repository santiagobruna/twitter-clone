"""
URL configuration for config project.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/social/', include('social.urls')),
    path('api/posts/', include('posts.urls')),
]

# Serve media em dev e no Render free (sem S3). Em escala, preferir storage externo.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
