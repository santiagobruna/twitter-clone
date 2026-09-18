import { Link, Outlet } from 'react-router-dom'

import { useAuth } from '../../contexts/AuthContext'
import './AppLayout.css'

export function AppLayout() {
  const { isAuthenticated, user, clearSession } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          Chirp
        </Link>
        <nav className="app-nav">
          <Link to="/">Feed</Link>
          <Link to="/profile">Perfil</Link>
          {isAuthenticated ? (
            <>
              <span className="nav-user">@{user?.username}</span>
              <button type="button" onClick={clearSession}>
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Entrar</Link>
              <Link to="/register">Cadastrar</Link>
            </>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
