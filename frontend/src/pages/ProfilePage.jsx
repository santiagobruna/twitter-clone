import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getProfile } from '../api/auth'
import { getMyPosts } from '../api/posts'
import { EditProfileModal } from '../components/profile/EditProfileModal'
import { Avatar } from '../components/ui/Avatar'
import { useAuth } from '../contexts/AuthContext'
import { formatApiError } from '../utils/apiErrors'
import './ProfilePage.css'

function formatJoined(dateJoined) {
  if (!dateJoined) return ''
  const date = new Date(dateJoined)
  return date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
}

export function ProfilePage() {
  const { token, user, updateUser, setSession } = useAuth()
  const [profile, setProfile] = useState(user)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const [me, myPosts] = await Promise.all([
        getProfile(token),
        getMyPosts(token),
      ])
      setProfile(me)
      updateUser(me)
      setPosts(myPosts.results || myPosts)
    } catch (err) {
      setError(formatApiError(err, 'Não foi possível carregar o perfil.'))
    } finally {
      setLoading(false)
    }
  }, [token, updateUser])

  useEffect(() => {
    load()
  }, [load])

  function handleSaved(data) {
    if (data.token) {
      setSession(data.token, data.user)
    } else {
      updateUser(data.user)
    }
    setProfile(data.user)
  }

  const displayName =
    profile?.profile?.display_name || profile?.username || 'Usuário'
  const avatar = profile?.profile?.avatar
  const bio = profile?.profile?.bio

  return (
    <section className="profile-page">
      <header className="profile-topbar">
        <Link to="/" className="profile-back" aria-label="Voltar">
          ←
        </Link>
        <div>
          <h1>{displayName}</h1>
          <p className="profile-topbar__meta">
            {posts.length} postagen{posts.length === 1 ? '' : 's'}
          </p>
        </div>
      </header>

      <div className="profile-banner" aria-hidden="true" />

      <div className="profile-header">
        <Avatar src={avatar} name={displayName} size={96} className="profile-avatar" />
        <button
          type="button"
          className="profile-edit-btn"
          onClick={() => setEditing(true)}
        >
          Editar perfil
        </button>
      </div>

      <div className="profile-info">
        <h2>{displayName}</h2>
        <p className="profile-handle">@{profile?.username}</p>
        {bio ? <p className="profile-bio">{bio}</p> : null}
        <p className="profile-joined">Entrou em {formatJoined(profile?.date_joined)}</p>
        <div className="profile-stats">
          <span>
            <strong>{profile?.following_count ?? 0}</strong> Seguindo
          </span>
          <span>
            <strong>{profile?.followers_count ?? 0}</strong> Seguidores
          </span>
        </div>
      </div>

      <div className="profile-tabs" role="tablist">
        <button type="button" className="is-active" role="tab" aria-selected="true">
          Posts
        </button>
      </div>

      {loading ? <p className="profile-state">Carregando…</p> : null}
      {error ? <p className="auth-error">{error}</p> : null}

      {!loading && !error && posts.length === 0 ? (
        <p className="profile-state">Você ainda não fez nenhuma postagem.</p>
      ) : null}

      <ul className="profile-posts">
        {posts.map((post) => (
          <li key={post.id} className="profile-post">
            <Avatar
              src={post.author?.avatar || avatar}
              name={post.author?.display_name || displayName}
              size={40}
            />
            <div>
              <div className="profile-post__meta">
                <strong>{post.author?.display_name || displayName}</strong>
                <span>@{post.author?.username || profile?.username}</span>
                <span>· {new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <p>{post.content}</p>
              <div className="profile-post__actions">
                <span>💬 {post.comments_count ?? 0}</span>
                <span>♥ {post.likes_count ?? 0}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {editing ? (
        <EditProfileModal
          user={profile}
          token={token}
          onClose={() => setEditing(false)}
          onSaved={handleSaved}
        />
      ) : null}
    </section>
  )
}
