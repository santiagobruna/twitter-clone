import { useEffect, useState } from 'react'

import { createPost } from '../../api/posts'
import { isSupabaseConfigured, uploadPostImage } from '../../lib/supabase'
import { formatUserError } from '../../utils/apiErrors'
import { buildPostContent } from '../../utils/postMedia'
import { Avatar } from '../ui/Avatar'
import { ImageIcon } from '../ui/Icons'
import './ComposeBox.css'

const MAX_LENGTH = 280

export function ComposeBox({ user, token, onCreated, autoFocus = false }) {
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const remaining = MAX_LENGTH - content.length
  const canSubmit = (content.trim().length > 0 || Boolean(imageFile)) && !loading

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleImageChange(event) {
    const next = event.target.files?.[0]
    event.target.value = ''
    if (!next) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImageFile(next)
    setPreviewUrl(URL.createObjectURL(next))
    setError('')
  }

  function removeImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImageFile(null)
    setPreviewUrl('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit) return
    setError('')
    setLoading(true)
    try {
      let imageUrl = ''
      if (imageFile) {
        if (!isSupabaseConfigured) {
          throw new Error(
            'O envio de fotos ainda não está configurado. Verifique as variáveis do Supabase no .env.',
          )
        }
        imageUrl = await uploadPostImage(imageFile, user.id)
      }

      const payload = {
        content: buildPostContent(content, imageUrl),
      }
      if (imageUrl) payload.image = imageUrl

      const post = await createPost(token, payload)
      const created = {
        ...post,
        content: payload.content,
        image: imageUrl || post.image || null,
      }
      setContent('')
      removeImage()
      onCreated?.(created)
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
        {previewUrl ? (
          <div className="compose__preview">
            <img src={previewUrl} alt="Prévia da foto" />
            <button type="button" onClick={removeImage} aria-label="Remover foto">
              ×
            </button>
          </div>
        ) : null}
        {error ? <p className="auth-error">{error}</p> : null}
        <div className="compose__footer">
          <label className="compose__photo">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
            />
            <ImageIcon />
            <span>Foto</span>
          </label>
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
