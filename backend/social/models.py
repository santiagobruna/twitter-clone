from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Follow(models.Model):
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='following_set',
    )
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='followers_set',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'seguimento'
        verbose_name_plural = 'seguimentos'
        constraints = [
            models.UniqueConstraint(
                fields=['follower', 'following'],
                name='unique_follow',
            ),
            models.CheckConstraint(
                condition=~models.Q(follower=models.F('following')),
                name='prevent_self_follow',
            ),
        ]
        ordering = ['-created_at']

    def clean(self):
        if self.follower_id == self.following_id:
            raise ValidationError('Você não pode seguir a si mesmo.')

    def __str__(self):
        return f'{self.follower} → {self.following}'
