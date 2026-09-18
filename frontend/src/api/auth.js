/** Endpoints de autenticação — implementação nas próximas etapas. */
import { apiRequest } from './client'

export function registerUser(payload) {
  return apiRequest('/api/auth/register/', {
    method: 'POST',
    body: payload,
  })
}

export function loginUser(payload) {
  return apiRequest('/api/auth/login/', {
    method: 'POST',
    body: payload,
  })
}

export function getProfile(token) {
  return apiRequest('/api/auth/profile/', { token })
}

export function updateProfile(token, payload) {
  const isFormData = payload instanceof FormData
  return apiRequest('/api/auth/profile/', {
    method: 'PATCH',
    token,
    body: payload,
    headers: isFormData ? {} : undefined,
  })
}
