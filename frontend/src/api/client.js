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

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body:
        body == null
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    })
  } catch {
    const error = new Error('Failed to fetch')
    error.status = 0
    throw error
  }

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      // Evita mostrar HTML cru (ex.: Bad Request do Django) ao usuário
      data = text.trim().startsWith('<') ? null : text
    }
  }

  if (!response.ok) {
    const error = new Error(
      data?.error?.message || data?.detail || 'API request failed',
    )
    error.status = response.status
    error.data = data
    error.code = data?.error?.code || null
    throw error
  }

  return data
}

export { API_URL }
