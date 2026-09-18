export function formatApiError(error, fallback = 'Algo deu errado. Tente novamente.') {
  const data = error?.data
  if (!data) return fallback
  if (typeof data === 'string') return data
  if (typeof data !== 'object') return fallback

  if (typeof data.detail === 'string') return data.detail

  if (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) {
    return String(data.non_field_errors[0])
  }

  for (const key of Object.keys(data)) {
    const value = data[key]
    if (Array.isArray(value) && value[0]) return String(value[0])
    if (typeof value === 'string') return value
  }

  return fallback
}
