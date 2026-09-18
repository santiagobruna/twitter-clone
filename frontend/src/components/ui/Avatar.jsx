function initials(name) {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

export function Avatar({ src, name, size = 48, className = '' }) {
  const style = {
    width: size,
    height: size,
    fontSize: Math.max(12, size * 0.35),
  }

  if (src) {
    return (
      <img
        className={`avatar ${className}`}
        src={src}
        alt={name || 'Avatar'}
        style={style}
      />
    )
  }

  return (
    <div className={`avatar avatar--fallback ${className}`} style={style} aria-hidden="true">
      {initials(name)}
    </div>
  )
}
