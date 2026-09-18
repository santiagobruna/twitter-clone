/** Endpoints de posts — implementação nas próximas etapas. */
import { apiRequest } from './client'

export function getFeed(token, pageUrl) {
  const path = toApiPath(pageUrl, '/api/posts/feed/')
  return apiRequest(path, { token })
}

function toApiPath(pageUrl, fallback) {
  if (!pageUrl) return fallback
  try {
    const url = new URL(pageUrl, window.location.origin)
    return `${url.pathname}${url.search}`
  } catch {
    return fallback
  }
}

export function getMyPosts(token) {
  return apiRequest('/api/posts/', { token })
}

export function getUserPosts(token, userId) {
  return apiRequest(`/api/posts/user/${userId}/`, { token })
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
