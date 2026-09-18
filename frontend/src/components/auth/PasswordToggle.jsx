export function PasswordToggle({ show, onToggle }) {
  return (
    <button
      type="button"
      className="auth-input-toggle"
      onClick={onToggle}
      aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
    >
      {show ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.8 9.8 0 0112 5c5 0 9.3 3.1 11 7-.5 1.2-1.2 2.3-2.1 3.2M6.1 6.1C4.3 7.4 2.9 9.1 2 12c1.7 3.9 6 7 11 7 1.4 0 2.7-.2 3.9-.7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      )}
    </button>
  )
}
