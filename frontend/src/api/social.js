/** Endpoints sociais — implementação nas próximas etapas. */
import { apiRequest } from './client'

export function followUser(token, userId) {
  return apiRequest(`/api/social/follow/${userId}/`, {
    method: 'POST',
    token,
  })
}

export function unfollowUser(token, userId) {
  return apiRequest(`/api/social/follow/${userId}/`, {
    method: 'DELETE',
    token,
  })
}

export function getFollowing(token) {
  return apiRequest('/api/social/following/', { token })
}

export function getFollowers(token) {
  return apiRequest('/api/social/followers/', { token })
}
