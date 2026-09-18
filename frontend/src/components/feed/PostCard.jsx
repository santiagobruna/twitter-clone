import { Link } from 'react-router-dom'
import { useState } from 'react'

import { createComment, getComments, likePost, unlikePost } from '../../api/posts'
import { formatRelativeTime } from '../../utils/time'
import { formatUserError } from '../../utils/apiErrors'
import { profilePath } from '../../utils/paths'
import { getPostImage, getPostText } from '../../utils/postMedia'
import { profileLinkState } from '../../utils/publicUser'
import { Avatar } from '../ui/Avatar'
import { CommentIcon, HeartIcon } from '../ui/Icons'
import './PostCard.css'

function unwrapList(data) {
  if (Array.isArray(data)) return data
  return data?.results || []
}

export function PostCard({ post, token, onChange }) {
  const [openComments, setOpenComments] = useState(false)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const authorName = post.author?.display_name || post.author?.username || 'Usuário'
  const authorHref = profilePath(post.author?.username)
  const text = getPostText(post)
  const image = getPostImage(post)

  async function toggleLike() {
    if (busy) return
    setBusy(true)
    setError('')
    const liked = post.is_liked
    onChange?.({
      ...post,
      is_liked: !liked,
      likes_count: Math.max(0, (post.likes_count || 0) + (liked ? -1 : 1)),
    })
    try {
      const data = liked
        ? await unlikePost(token, post.id)
        : await likePost(token, post.id)
      if (typeof data?.likes_count === 'number') {
        onChange?.({
          ...post,
          is_liked: !liked,
          likes_count: data.likes_count,
        })
      }
    } catch (err) {
      onChange?.(post)
      setError(formatUserError(err, 'Não foi possível atualizar a curtida.'))
    } finally {
      setBusy(false)
    }
  }

  async function toggleComments() {
    const next = !openComments
    setOpenComments(next)
    if (!next || comments.length) return
    setLoadingComments(true)
    setError('')
    try {
      const data = await getComments(token, post.id)
      setComments(unwrapList(data))
    } catch (err) {
      setError(formatUserError(err, 'Não foi possível carregar os comentários.'))
    } finally {
      setLoadingComments(false)
    }
  }

  async function handleComment(event) {
    event.preventDefault()
    const text = comment.trim()
    if (!text || busy) return
    setBusy(true)
    setError('')
    try {
      const created = await createComment(token, post.id, text)
      setComments((list) => [...list, created])
      setComment('')
      onChange?.({
        ...post,
        comments_count: (post.comments_count || 0) + 1,
      })
    } catch (err) {
      setError(formatUserError(err, 'Não foi possível comentar.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="post-card">
      <Link
        to={authorHref}
        state={profileLinkState(post.author, { post })}
        className="post-card__avatar-link"
        aria-label={authorName}
      >
        <Avatar src={post.author?.avatar} name={authorName} size={40} />
      </Link>
      <div className="post-card__body">
        <div className="post-card__meta">
          <Link
            to={authorHref}
            state={profileLinkState(post.author, { post })}
            className="post-card__author"
          >
            <strong>{authorName}</strong>
            <span>@{post.author?.username}</span>
          </Link>
          <span>· {formatRelativeTime(post.created_at)}</span>
        </div>
        {text ? <p className="post-card__content">{text}</p> : null}
        {image ? (
          <img className="post-card__image" src={image} alt="" />
        ) : null}
        <div className="post-card__actions">
          <button
            type="button"
            className={`post-action${openComments ? ' is-active' : ''}`}
            onClick={toggleComments}
          >
            <CommentIcon />
            <span>{post.comments_count ?? 0}</span>
          </button>
          <button
            type="button"
            className={`post-action post-action--like${post.is_liked ? ' is-liked' : ''}`}
            onClick={toggleLike}
            disabled={busy}
            aria-pressed={post.is_liked}
          >
            <HeartIcon filled={Boolean(post.is_liked)} />
            <span>{post.likes_count ?? 0}</span>
          </button>
        </div>

        {error ? <p className="auth-error">{error}</p> : null}

        {openComments ? (
          <div className="post-comments">
            {loadingComments ? <p className="post-comments__state">Carregando comentários…</p> : null}
            {!loadingComments && comments.length === 0 ? (
              <p className="post-comments__state">Seja a primeira pessoa a comentar.</p>
            ) : null}
            <ul>
              {comments.map((item) => (
                <li key={item.id} className="post-comment">
                  <Link
                    to={profilePath(item.user?.username)}
                    state={profileLinkState(item.user)}
                    className="post-card__avatar-link"
                    aria-label={item.user?.display_name || item.user?.username}
                  >
                    <Avatar
                      src={item.user?.avatar}
                      name={item.user?.display_name || item.user?.username}
                      size={28}
                    />
                  </Link>
                  <div>
                    <div className="post-card__meta">
                      <Link
                        to={profilePath(item.user?.username)}
                        state={profileLinkState(item.user)}
                        className="post-card__author"
                      >
                        <strong>{item.user?.display_name || item.user?.username}</strong>
                        <span>@{item.user?.username}</span>
                      </Link>
                      <span>· {formatRelativeTime(item.created_at)}</span>
                    </div>
                    <p>{item.content}</p>
                  </div>
                </li>
              ))}
            </ul>
            <form className="post-comment-form" onSubmit={handleComment}>
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={280}
                placeholder="Escreva um comentário..."
              />
              <button className="reply-btn" type="submit" disabled={!comment.trim() || busy}>
                Responder
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </article>
  )
}
