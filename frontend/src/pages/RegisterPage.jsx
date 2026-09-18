import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { registerUser, updateProfile } from '../api/auth'
import { PasswordToggle } from '../components/auth/PasswordToggle'
import { AuthLayout } from '../components/layout/AuthLayout'
import { useAuth } from '../contexts/AuthContext'
import { formatUserError } from '../utils/apiErrors'

export function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated, setSession } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (password !== passwordConfirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    try {
      const data = await registerUser({
        username: username.trim(),
        email: email.trim(),
        password,
        password_confirm: passwordConfirm,
      })

      let user = data.user
      const name = displayName.trim()

      if (name) {
        try {
          const updated = await updateProfile(data.token, {
            display_name: name,
          })
          user = updated.user ?? updated
        } catch {
          // Conta já criada; nome de exibição pode ser ajustado depois no perfil
        }
      }

      setSession(data.token, user)
      navigate('/', { replace: true })
    } catch (err) {
      setError(formatUserError(err, 'Não foi possível criar a conta. Verifique os dados e tente novamente.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      brandTitle="Junte-se à conversa"
      brandDescription="Crie sua conta para postar, seguir pessoas e acompanhar o que está acontecendo."
    >
      <h2 className="auth-panel__title">Criar conta</h2>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="register-name">Nome completo</label>
          <input
            id="register-name"
            className="auth-input"
            name="display_name"
            autoComplete="name"
            placeholder="Nome completo"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="register-username">Nome de usuário</label>
          <input
            id="register-username"
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
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            className="auth-input"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="register-password">Senha</label>
          <div className="auth-input-wrap">
            <input
              id="register-password"
              className="auth-input auth-input--with-icon"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            <PasswordToggle
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="register-password-confirm">Confirmar senha</label>
          <input
            id="register-password-confirm"
            className="auth-input"
            name="password_confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Confirmar senha"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            minLength={8}
            required
          />
        </div>

        {error ? <p className="auth-error">{error}</p> : null}

        <button className="auth-btn auth-btn--primary" type="submit" disabled={loading}>
          {loading ? 'Criando conta…' : 'Cadastrar'}
        </button>
      </form>

      <p className="auth-footer">
        Já tem uma conta? <Link to="/login">Entrar</Link>
      </p>
    </AuthLayout>
  )
}
