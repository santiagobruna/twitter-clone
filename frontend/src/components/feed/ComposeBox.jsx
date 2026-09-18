import { useState } from 'react'

import { createPost } from '../../api/posts'
import { formatUserError } from '../../utils/apiErrors'
import { Avatar } from '../ui/Avatar'
import './ComposeBox.css'

const MAX_LENGTH = 280

export function ComposeBox({ user, token, onCreated, autoFocus = false }) {
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const remaining = MAX_LENGTH - content.length
  const canSubmit = content.trim().length > 0 && !loading

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit) return
    setError('')
    setLoading(true)
    try {
      const post = await createPost(token, content.trim())
      setContent('')
      onCreated?.(post)
    } catch (err) {
      setError(formatUserError(err, 'Não foi possível publicar. Tente novamente.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="compose" onSubmit={handleSubmit}>
      <Avatar
        src={user?.profile?.avatar}
        name={user?.profile?.display_name || user?.username}
        size={40}
      />
      <div className="compose__body">
        <textarea
          className="compose__input"
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="O que está acontecendo?"
          rows={3}
          maxLength={MAX_LENGTH}
          autoFocus={autoFocus}
        />
        {error ? <p className="auth-error">{error}</p> : null}
        <div className="compose__footer">
          <span className={`compose__count${remaining <= 20 ? ' is-warn' : ''}`}>
            {content.length}/{MAX_LENGTH}
          </span>
          <button className="compose__submit" type="submit" disabled={!canSubmit}>
            {loading ? 'Postando…' : 'Postar'}
          </button>
        </div>
      </div>
    </form>
  )
}

export function ComposeModal({ user, token, onClose, onCreated }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="compose-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Nova postagem"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="compose-modal__close" onClick={onClose} aria-label="Fechar">
          ×
        </button>
        <ComposeBox
          user={user}
          token={token}
          autoFocus
          onCreated={(post) => {
            onCreated?.(post)
            onClose()
          }}
        />
      </div>
    </div>
  )
}
