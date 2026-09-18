function Icon({ children, size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function HomeIcon() {
  return (
    <Icon>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </Icon>
  )
}

export function UserIcon() {
  return (
    <Icon>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </Icon>
  )
}

export function CommentIcon({ size = 18 }) {
  return (
    <Icon size={size}>
      <path d="M5 6.5h14a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H9l-4 3v-3H5A1.5 1.5 0 0 1 3.5 15V8A1.5 1.5 0 0 1 5 6.5z" />
    </Icon>
  )
}

export function HeartIcon({ filled = false, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.6 12 20 12 20z" />
    </svg>
  )
}

export function BrandMark({ size = 28 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  )
}

export function MenuIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  )
}

export function LogoutIcon({ size = 22 }) {
  return (
    <Icon size={size}>
      <path d="M10 7V5.8A1.8 1.8 0 0 1 11.8 4h7.4A1.8 1.8 0 0 1 21 5.8v12.4a1.8 1.8 0 0 1-1.8 1.8h-7.4A1.8 1.8 0 0 1 10 18.2V17" />
      <path d="M3 12h11M11 8.5 14.5 12 11 15.5" />
    </Icon>
  )
}

export function ImageIcon({ size = 20 }) {
  return (
    <Icon size={size}>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m7.5 16.5 3.2-3.4 2.3 2.3 3-3.4 3.5 4.5" />
    </Icon>
  )
}
