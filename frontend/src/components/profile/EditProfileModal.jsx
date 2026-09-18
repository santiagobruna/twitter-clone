import { useEffect, useId, useState } from 'react'

import { updateProfile } from '../../api/auth'
import { uploadAvatar, isSupabaseConfigured } from '../../lib/supabase'
import { formatApiError } from '../../utils/apiErrors'
import { Avatar } from '../ui/Avatar'
import { PasswordToggle } from '../auth/PasswordToggle'
import './EditProfileModal.css'

export function EditProfileModal({ user, token, onClose, onSaved }) {
  const titleId = useId()
  const [displayName, setDisplayName] = useState(user?.profile?.display_name || '')
  const [bio, setBio] = useState(user?.profile?.bio || '')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(user?.profile?.avatar || '')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function handleFileChange(event) {
    const next = event.target.files?.[0]
    if (!next) return
    setFile(next)
    setPreviewUrl(URL.createObjectURL(next))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if ((password || passwordConfirm) && password !== passwordConfirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    try {
      const payload = {
        display_name: displayName.trim(),
        bio: bio.trim(),
      }

      if (file) {
        if (!isSupabaseConfigured) {
          throw new Error(
            'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env para enviar a foto.',
          )
        }
        payload.avatar = await uploadAvatar(file, user.id)
      }

      if (password) {
        payload.password = password
        payload.password_confirm = passwordConfirm
      }

      const data = await updateProfile(token, payload)
      onSaved(data)
      onClose()
    } catch (err) {
      setError(formatApiError(err, err.message || 'Não foi possível salvar o perfil.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-card__header">
          <button type="button" className="modal-back" onClick={onClose} aria-label="Fechar">
            ←
          </button>
          <h2 id={titleId}>Editar perfil</h2>
        </header>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="edit-avatar">
            <Avatar
              src={previewUrl}
              name={displayName || user?.username}
              size={88}
            />
            <label className="edit-avatar__btn">
              Escolher imagem
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                hidden
              />
            </label>
          </div>

          <div className="auth-field">
            <label htmlFor="edit-name">Nome</label>
            <input
              id="edit-name"
              className="auth-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={150}
              placeholder="Nome de exibição"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="edit-bio">Bio</label>
            <textarea
              id="edit-bio"
              className="auth-input auth-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              placeholder="Fale um pouco sobre você"
            />
            <span className="char-count">{bio.length}/160</span>
          </div>

          <div className="auth-field">
            <label htmlFor="edit-password">Nova senha (opcional)</label>
            <div className="auth-input-wrap">
              <input
                id="edit-password"
                className="auth-input auth-input--with-icon"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Deixe em branco para manter"
              />
              <PasswordToggle
                show={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="edit-password-confirm">Confirmar nova senha</label>
            <input
              id="edit-password-confirm"
              className="auth-input"
              type={showPassword ? 'text' : 'password'}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
              placeholder="Confirmar nova senha"
            />
          </div>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="auth-btn auth-btn--primary" type="submit" disabled={loading}>
            {loading ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
