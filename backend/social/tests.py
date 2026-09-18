from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import Profile

from .models import Follow

User = get_user_model()


def list_usernames(response):
    data = response.data
    if isinstance(data, dict):
        data = data.get('results', [])
    return [item['username'] for item in data]


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

    def test_suggestions_exclude_self_and_following(self):
        followed = User.objects.create_user(
            username='carla',
            email='carla@example.com',
            password='SenhaForte123!',
        )
        other = User.objects.create_user(
            username='diego',
            email='diego@example.com',
            password='SenhaForte123!',
        )
        Follow.objects.create(follower=self.alice, following=followed)

        response = self.client.get('/api/social/suggestions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        usernames = [item['username'] for item in response.data]
        self.assertIn(other.username, usernames)
        self.assertNotIn(self.alice.username, usernames)
        self.assertNotIn(followed.username, usernames)
        self.assertIn(self.bob.username, usernames)

    def test_user_list_excludes_self_and_allows_follow(self):
        response = self.client.get('/api/social/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        usernames = list_usernames(response)
        self.assertIn(self.bob.username, usernames)
        self.assertNotIn(self.alice.username, usernames)
        bob = next(item for item in response.data if item['username'] == 'bob')
        self.assertFalse(bob['is_following'])

    def test_user_search_by_username(self):
        User.objects.create_user(
            username='diego',
            email='diego@example.com',
            password='SenhaForte123!',
        )
        response = self.client.get('/api/social/users/', {'q': 'di'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_usernames(response), ['diego'])

    def test_user_search_by_display_name(self):
        user = User.objects.create_user(
            username='user_botafogo',
            email='fogao@example.com',
            password='SenhaForte123!',
        )
        user.profile.display_name = 'Bruna Santiago'
        user.profile.save()
        response = self.client.get('/api/social/users/', {'q': 'Bruna'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user_botafogo', list_usernames(response))

    def test_user_list_includes_users_without_profile(self):
        lone = User.objects.create_user(
            username='semperfil',
            email='semperfil@example.com',
            password='SenhaForte123!',
        )
        Profile.objects.filter(user=lone).delete()
        response = self.client.get('/api/social/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('semperfil', list_usernames(response))

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
