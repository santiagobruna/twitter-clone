export function profilePath(username) {
  if (!username) return '/profile'
  return `/u/${encodeURIComponent(username)}`
}

export function unwrapList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.data)) return data.data
  return []
}
