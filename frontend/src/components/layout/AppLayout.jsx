import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useMemo, useState } from 'react'

import { useAuth } from '../../contexts/AuthContext'
import { ComposeModal } from '../feed/ComposeBox'
import { Avatar } from '../ui/Avatar'
import {
  BellIcon,
  BrandMark,
  CompassIcon,
  DotsIcon,
  HomeIcon,
  ListIcon,
  MailIcon,
  UserIcon,
} from '../ui/Icons'
import { RightRail } from './RightRail'
import './AppLayout.css'

const NAV_ITEMS = [
  { to: '/', label: 'Página Inicial', icon: HomeIcon, end: true },
  { to: '/profile', label: 'Perfil', icon: UserIcon },
]

const SOON_ITEMS = [
  { label: 'Explorar', icon: CompassIcon },
  { label: 'Notificações', icon: BellIcon },
  { label: 'Mensagens', icon: MailIcon },
  { label: 'Listas', icon: ListIcon },
  { label: 'Mais', icon: DotsIcon },
]

export function AppLayout() {
  const { user, token, clearSession } = useAuth()
  const location = useLocation()
  const [composeOpen, setComposeOpen] = useState(false)
  const [lastPost, setLastPost] = useState(null)

  const displayName = user?.profile?.display_name || user?.username || 'Usuário'
  const showRail = location.pathname === '/'

  const outletContext = useMemo(
    () => ({
      lastPost,
      openCompose: () => setComposeOpen(true),
    }),
    [lastPost],
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="sidebar-brand" aria-label="Chirp">
          <BrandMark />
        </NavLink>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
          {SOON_ITEMS.map(({ label, icon: Icon }) => (
            <span key={label} className="sidebar-link is-soon" title="Em breve">
              <Icon />
              <span>{label}</span>
            </span>
          ))}
        </nav>

        <button type="button" className="sidebar-post" onClick={() => setComposeOpen(true)}>
          Postar
        </button>

        <div className="sidebar-user">
          <Avatar src={user?.profile?.avatar} name={displayName} size={40} />
          <div className="sidebar-user__meta">
            <strong>{displayName}</strong>
            <span>@{user?.username}</span>
          </div>
          <button type="button" className="sidebar-logout" onClick={clearSession}>
            Sair
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet context={outletContext} />
      </main>

      {showRail ? (
        <RightRail token={token} currentUserId={user?.id} />
      ) : (
        <div className="right-rail-spacer" aria-hidden="true" />
      )}

      <nav className="mobile-nav" aria-label="Navegação mobile">
        <NavLink to="/" end>
          <HomeIcon />
        </NavLink>
        <button type="button" onClick={() => setComposeOpen(true)} aria-label="Postar">
          +
        </button>
        <NavLink to="/profile">
          <UserIcon />
        </NavLink>
      </nav>

      {composeOpen ? (
        <ComposeModal
          user={user}
          token={token}
          onClose={() => setComposeOpen(false)}
          onCreated={(post) => setLastPost(post)}
        />
      ) : null}
    </div>
  )
}
