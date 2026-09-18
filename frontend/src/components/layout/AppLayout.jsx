import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '../../contexts/AuthContext'
import { ComposeModal } from '../feed/ComposeBox'
import { Avatar } from '../ui/Avatar'
import {
  BrandMark,
  HomeIcon,
  LogoutIcon,
  MenuIcon,
  UserIcon,
} from '../ui/Icons'
import { RightRail } from './RightRail'
import './AppLayout.css'

const NAV_ITEMS = [
  { to: '/', label: 'Página Inicial', icon: HomeIcon, end: true },
  { to: '/profile', label: 'Perfil', icon: UserIcon },
]

export function AppLayout() {
  const { user, token, logout } = useAuth()
  const location = useLocation()
  const [composeOpen, setComposeOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
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

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    function onKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  function renderNav(onNavigate) {
    return NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}
        onClick={onNavigate}
      >
        <Icon />
        <span>{label}</span>
      </NavLink>
    ))
  }

  return (
    <div className={`app-shell${showRail ? ' has-rail' : ''}${menuOpen ? ' menu-open' : ''}`}>
      <header className="mobile-topbar">
        <button
          type="button"
          className="mobile-topbar__menu"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon />
        </button>
        <BrandMark size={22} />
        <span className="mobile-topbar__spacer" />
      </header>

      <aside className="sidebar">
        <NavLink to="/" className="sidebar-brand" aria-label="Chirp">
          <BrandMark />
        </NavLink>
        <nav className="sidebar-nav">{renderNav()}</nav>
        <div className="sidebar-user">
          <Avatar src={user?.profile?.avatar} name={displayName} size={40} />
          <div className="sidebar-user__meta">
            <strong>{displayName}</strong>
            <span>@{user?.username}</span>
          </div>
          <button
            type="button"
            className="sidebar-logout"
            onClick={logout}
            aria-label="Sair"
            title="Sair"
          >
            <LogoutIcon />
          </button>
        </div>
      </aside>

      {menuOpen ? (
        <div className="mobile-drawer" role="presentation" onClick={() => setMenuOpen(false)}>
          <aside
            className="mobile-drawer__panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="mobile-drawer__close"
              aria-label="Fechar menu"
              onClick={() => setMenuOpen(false)}
            >
              ×
            </button>
            <div className="mobile-drawer__user">
              <Avatar src={user?.profile?.avatar} name={displayName} size={48} />
              <strong>{displayName}</strong>
              <span>@{user?.username}</span>
            </div>
            <nav className="sidebar-nav">{renderNav(() => setMenuOpen(false))}</nav>
            <button
              type="button"
              className="sidebar-logout"
              onClick={logout}
              aria-label="Sair"
              title="Sair"
            >
              <LogoutIcon />
            </button>
          </aside>
        </div>
      ) : null}

      <main className="app-main">
        <Outlet context={outletContext} />
      </main>

      {showRail ? <RightRail token={token} currentUserId={user?.id} /> : null}

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
