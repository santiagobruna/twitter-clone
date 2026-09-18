const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

/**
 * Cliente HTTP mínimo para a API Django.
 * Nas próximas etapas: auth header, tratamento de erro e endpoints tipados.
 */
export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, token, headers: customHeaders } = options

  const headers = {
    ...(body && !(body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...customHeaders,
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body:
      body == null
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  })

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    const error = new Error('API request failed')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export { API_URL }
