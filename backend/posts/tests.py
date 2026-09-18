from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from social.models import Follow

from .models import Comment, Like, Post

User = get_user_model()


class PostsAPITests(APITestCase):
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
        self.alice_token = Token.objects.create(user=self.alice)
        self.bob_token = Token.objects.create(user=self.bob)

    def _auth(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def test_create_post(self):
        self._auth(self.alice_token)
        response = self.client.post(
            '/api/posts/',
            {'content': 'Olá, mundo!'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'Olá, mundo!')
        self.assertEqual(Post.objects.count(), 1)

    def test_feed_shows_own_and_followed_users_posts(self):
        own_post = Post.objects.create(author=self.alice, content='Meu post')
        bob_post = Post.objects.create(author=self.bob, content='Post do Bob')
        Post.objects.create(
            author=User.objects.create_user(
                username='cara',
                email='cara@example.com',
                password='SenhaForte123!',
            ),
            content='Post da Cara',
        )
        Follow.objects.create(follower=self.alice, following=self.bob)

        self._auth(self.alice_token)
        response = self.client.get('/api/posts/feed/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        ids = [item['id'] for item in response.data['results']]
        self.assertEqual(ids, [bob_post.id, own_post.id])

    def test_like_and_comment(self):
        post = Post.objects.create(author=self.bob, content='Post')
        self._auth(self.alice_token)

        like = self.client.post(f'/api/posts/{post.id}/like/')
        self.assertEqual(like.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Like.objects.filter(user=self.alice, post=post).exists())

        comment = self.client.post(
            f'/api/posts/{post.id}/comments/',
            {'content': 'Legal!'},
            format='json',
        )
        self.assertEqual(comment.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Comment.objects.filter(
                user=self.alice,
                post=post,
                content='Legal!',
            ).exists()
        )

    def test_list_another_users_posts(self):
        bob_post = Post.objects.create(author=self.bob, content='Post do Bob')
        Post.objects.create(author=self.alice, content='Post da Alice')
        self._auth(self.alice_token)

        response = self.client.get(f'/api/posts/user/{self.bob.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], bob_post.id)
        self.assertEqual(response.data['results'][0]['content'], 'Post do Bob')

    def test_create_post_with_image(self):
        self._auth(self.alice_token)
        response = self.client.post(
            '/api/posts/',
            {
                'content': 'Foto do dia',
                'image': 'https://example.com/foto.jpg',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['image'], 'https://example.com/foto.jpg')

    def test_create_image_only_post(self):
        self._auth(self.alice_token)
        response = self.client.post(
            '/api/posts/',
            {'image': 'https://example.com/foto.jpg'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], '')
        self.assertEqual(response.data['image'], 'https://example.com/foto.jpg')

    def test_create_post_requires_text_or_image(self):
        self._auth(self.alice_token)
        response = self.client.post('/api/posts/', {'content': '  '}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
