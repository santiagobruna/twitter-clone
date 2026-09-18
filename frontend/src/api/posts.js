/** Endpoints de posts — implementação nas próximas etapas. */
import { apiRequest } from './client'

export function getFeed(token) {
  return apiRequest('/api/posts/feed/', { token })
}

export function getMyPosts(token) {
  return apiRequest('/api/posts/', { token })
}

export function createPost(token, content) {
  return apiRequest('/api/posts/', {
    method: 'POST',
    token,
    body: { content },
  })
}

export function likePost(token, postId) {
  return apiRequest(`/api/posts/${postId}/like/`, {
    method: 'POST',
    token,
  })
}

export function unlikePost(token, postId) {
  return apiRequest(`/api/posts/${postId}/like/`, {
    method: 'DELETE',
    token,
  })
}

export function getComments(token, postId) {
  return apiRequest(`/api/posts/${postId}/comments/`, { token })
}

export function createComment(token, postId, content) {
  return apiRequest(`/api/posts/${postId}/comments/`, {
    method: 'POST',
    token,
    body: { content },
  })
}
