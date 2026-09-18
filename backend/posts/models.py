from django.conf import settings
from django.db import models


class Post(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts',
    )
    content = models.CharField(max_length=280, blank=True)
    image = models.URLField(
        'foto da postagem',
        max_length=1000,
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'postagem'
        verbose_name_plural = 'postagens'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.author}: {self.content[:40] or "foto"}'


class Like(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='likes',
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='likes',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'curtida'
        verbose_name_plural = 'curtidas'
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'post'],
                name='unique_like',
            ),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user} curtiu {self.post_id}'


class Comment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments',
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments',
    )
    content = models.CharField(max_length=280)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'comentário'
        verbose_name_plural = 'comentários'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.user} em {self.post_id}: {self.content[:40]}'
