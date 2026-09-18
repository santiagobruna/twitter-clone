import { useEffect, useId, useState } from 'react'

import { updateProfile } from '../../api/auth'
import { uploadAvatar, uploadBanner, isSupabaseConfigured } from '../../lib/supabase'
import { formatUserError } from '../../utils/apiErrors'
import { Avatar } from '../ui/Avatar'
import { PasswordToggle } from '../auth/PasswordToggle'
import '../layout/AuthLayout.css'
import './EditProfileModal.css'

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 6.5l4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function EditProfileModal({ user, token, onClose, onSaved }) {
  const titleId = useId()
  const [displayName, setDisplayName] = useState(user?.profile?.display_name || '')
  const [bio, setBio] = useState(user?.profile?.bio || '')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(user?.profile?.avatar || '')
  const [bannerPreview, setBannerPreview] = useState(user?.profile?.banner || '')
  const [file, setFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
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

  function handleBannerChange(event) {
    const next = event.target.files?.[0]
    if (!next) return
    setBannerFile(next)
    setBannerPreview(URL.createObjectURL(next))
  }

  async function uploadIfNeeded(nextFile, uploader) {
    if (!nextFile) return null
    if (!isSupabaseConfigured) {
      throw Object.assign(new Error(''), {
        message:
          'O envio de fotos ainda não está configurado. Verifique as variáveis do Supabase no .env.',
      })
    }
    return uploader(nextFile, user.id)
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

      const [avatarUrl, bannerUrl] = await Promise.all([
        uploadIfNeeded(file, uploadAvatar),
        uploadIfNeeded(bannerFile, uploadBanner),
      ])

      if (avatarUrl) payload.avatar = avatarUrl
      if (bannerUrl) payload.banner = bannerUrl

      if (password) {
        payload.password = password
        payload.password_confirm = passwordConfirm
      }

      const data = await updateProfile(token, payload)
      onSaved(data)
      onClose()
    } catch (err) {
      setError(formatUserError(err, 'Não foi possível salvar o perfil. Tente novamente.'))
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
          <h2 id={titleId}>Editar perfil</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="edit-cover">
            <div
              className={`edit-cover__banner${bannerPreview ? ' edit-cover__banner--image' : ''}`}
              style={
                bannerPreview
                  ? { backgroundImage: `url("${bannerPreview}")` }
                  : undefined
              }
            >
              <label className="edit-cover__btn">
                Trocar capa
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  hidden
                />
              </label>
            </div>

            <div className="edit-cover__avatar">
              <div className="edit-avatar">
                <Avatar
                  src={previewUrl}
                  name={displayName || user?.username}
                  size={88}
                />
                <label className="edit-avatar__icon" aria-label="Editar foto">
                  <EditIcon />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    hidden
                  />
                </label>
              </div>
            </div>
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
              rows={2}
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
                minLength={8}
                placeholder="Deixe em branco para manter"
              />
              <PasswordToggle
                show={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
              />
            </div>
            <span className="field-hint">
              Se preencher, a senha da conta é alterada de verdade e você continua logada.
            </span>
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
