import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { loginUser } from '../api/auth'
import { PasswordToggle } from '../components/auth/PasswordToggle'
import { AuthLayout } from '../components/layout/AuthLayout'
import { useAuth } from '../contexts/AuthContext'
import { formatApiError } from '../utils/apiErrors'

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, setSession } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginUser({
        username: username.trim(),
        password,
      })
      setSession(data.token, data.user)
      navigate('/', { replace: true })
    } catch (err) {
      setError(formatApiError(err, 'Usuário ou senha inválidos.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      brandTitle="O que está acontecendo?"
      brandDescription="Entre para se conectar com pessoas, compartilhar ideias e ver o que está acontecendo no mundo."
    >
      <h2 className="auth-panel__title">Entrar na sua conta</h2>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="login-username">Nome de usuário</label>
          <input
            id="login-username"
            className="auth-input"
            name="username"
            autoComplete="username"
            placeholder="Nome de usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">Senha</label>
          <div className="auth-input-wrap">
            <input
              id="login-password"
              className="auth-input auth-input--with-icon"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordToggle
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
            />
          </div>
        </div>

        {error ? <p className="auth-error">{error}</p> : null}

        <button className="auth-btn auth-btn--primary" type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>


      <div className="auth-divider" aria-hidden="true">
        ou
      </div>

      <Link to="/register" className="auth-btn auth-btn--ghost">
        Criar uma conta
      </Link>
    </AuthLayout>
  )
}
