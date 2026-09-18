from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import Follow

User = get_user_model()


class SocialAPITests(APITestCase):
    def setUp(self):
        self.alice = User.objects.create_user(
            username='alice',
            email='alice@example.com',
            password='SenhaForte123!',
        )
        self.bob = User.objects.create_user(
            username='bob',
            email='bob@example.com',
            password='SenhaForte123!',
        )
        self.token = Token.objects.create(user=self.alice)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_follow_and_list_following(self):
        response = self.client.post(f'/api/social/follow/{self.bob.id}/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Follow.objects.filter(
                follower=self.alice,
                following=self.bob,
            ).exists()
        )

        following = self.client.get('/api/social/following/')
        self.assertEqual(following.status_code, status.HTTP_200_OK)
        self.assertEqual(following.data['count'], 1)

    def test_cannot_follow_self(self):
        response = self.client.post(f'/api/social/follow/{self.alice.id}/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error']['code'], 'SELF_FOLLOW')

    def test_follow_twice_returns_conflict(self):
        self.client.post(f'/api/social/follow/{self.bob.id}/')
        response = self.client.post(f'/api/social/follow/{self.bob.id}/')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data['error']['code'], 'ALREADY_FOLLOWING')

    def test_unfollow(self):
        Follow.objects.create(follower=self.alice, following=self.bob)
        response = self.client.delete(f'/api/social/follow/{self.bob.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            Follow.objects.filter(
                follower=self.alice,
                following=self.bob,
            ).exists()
        )
