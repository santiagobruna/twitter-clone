import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

import { getProfile } from '../api/auth'
import { getMyPosts } from '../api/posts'
import { followUser, unfollowUser } from '../api/social'
import { PostCard } from '../components/feed/PostCard'
import { EditProfileModal } from '../components/profile/EditProfileModal'
import { Avatar } from '../components/ui/Avatar'
import { FeedSkeleton } from '../components/ui/Loader'
import { useAuth } from '../contexts/AuthContext'
import { formatUserError } from '../utils/apiErrors'
import { profilePath, unwrapList } from '../utils/paths'
import {
  loadConnectionCounts,
  loadPostsForUser,
  resolvePublicUser,
  toPublicProfile,
} from '../utils/publicUser'
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
  const { username } = useParams()
  const location = useLocation()
  const { token, user, updateUser, setSession } = useAuth()
  const fallbackUser = location.state?.user
  const fallbackPost = location.state?.post
  const [profile, setProfile] = useState(() =>
    username ? toPublicProfile(fallbackUser) : user,
  )
  const [posts, setPosts] = useState(() =>
    fallbackPost?.id ? [fallbackPost] : [],
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [followBusy, setFollowBusy] = useState(false)

  const isOwn =
    !username || username.toLowerCase() === user?.username?.toLowerCase()

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      if (isOwn) {
        const [me, myPosts] = await Promise.all([
          getProfile(token),
          getMyPosts(token),
        ])
        setProfile(me)
        updateUser(me)
        setPosts(unwrapList(myPosts))
        return
      }

      const other = await resolvePublicUser(token, username, fallbackUser)
      if (!other) {
        setProfile(null)
        setPosts([])
        setError(`Não encontramos @${username}.`)
        return
      }

      setProfile(other)

      const loadedPosts = await loadPostsForUser(token, other.id, other.username)
      const clickedPost =
        fallbackPost?.id &&
        fallbackPost.author?.username?.toLowerCase() === username.toLowerCase()
          ? [fallbackPost]
          : []
      const merged = new Map()
      for (const post of [...clickedPost, ...loadedPosts]) {
        if (post?.id != null) merged.set(post.id, post)
      }
      setPosts([...merged.values()])

      if (other.followers_count == null || other.following_count == null) {
        const counts = await loadConnectionCounts(token, other.id)
        if (counts) {
          setProfile((current) => (current ? { ...current, ...counts } : current))
        }
      }
    } catch (err) {
      setError(formatUserError(err, 'Não foi possível carregar o perfil.'))
    } finally {
      setLoading(false)
    }
  }, [token, username, isOwn, updateUser, fallbackUser, fallbackPost])

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

  async function toggleFollow() {
    if (!profile || isOwn || followBusy) return
    setFollowBusy(true)
    setError('')
    const following = Boolean(profile.is_following)
    try {
      if (following) {
        await unfollowUser(token, profile.id)
      } else {
        await followUser(token, profile.id)
      }
      setProfile((current) => ({
        ...current,
        is_following: !following,
        followers_count: Math.max(
          0,
          (current.followers_count || 0) + (following ? -1 : 1),
        ),
      }))
    } catch (err) {
      setError(formatUserError(err, 'Não foi possível atualizar o seguir.'))
    } finally {
      setFollowBusy(false)
    }
  }

  const displayName =
    profile?.profile?.display_name || profile?.username || username || 'Usuário'
  const avatar = profile?.profile?.avatar
  const banner = profile?.profile?.banner
  const bio = (profile?.profile?.bio || '').trim()
  const handle = profile?.username || username
  const connectionsBase = profilePath(handle)

  return (
    <section className="profile-page">
      <header className="profile-topbar">
        <Link to="/" className="profile-back" aria-label="Voltar">
          ←
        </Link>
        <div>
          <h1>{displayName}</h1>
          <p className="profile-topbar__meta">
            {posts.length === 1 ? '1 postagem' : `${posts.length} postagens`}
          </p>
        </div>
      </header>

      <div
        className={`profile-banner${banner ? ' profile-banner--image' : ''}`}
        style={banner ? { backgroundImage: `url("${banner}")` } : undefined}
        aria-hidden="true"
      />

      <div className="profile-header">
        <Avatar src={avatar} name={displayName} size={96} className="profile-avatar" />
        {isOwn ? (
          <button
            type="button"
            className="profile-edit-btn"
            onClick={() => setEditing(true)}
          >
            Editar perfil
          </button>
        ) : profile ? (
          <button
            type="button"
            className={`profile-follow-btn${profile.is_following ? ' is-following' : ''}`}
            onClick={toggleFollow}
            disabled={followBusy}
          >
            {profile.is_following ? 'Seguindo' : 'Seguir'}
          </button>
        ) : null}
      </div>

      <div className="profile-info">
        <h2>{displayName}</h2>
        <p className="profile-handle">@{handle}</p>
        {bio ? <p className="profile-bio">{bio}</p> : null}
        {profile?.date_joined ? (
          <p className="profile-joined">Entrou em {formatJoined(profile.date_joined)}</p>
        ) : null}
        {profile ? (
          <div className="profile-stats">
            <Link
              to={`${connectionsBase}/following`}
              state={{ userId: profile.id, displayName }}
            >
              <strong>{profile.following_count ?? 0}</strong> Seguindo
            </Link>
            <Link
              to={`${connectionsBase}/followers`}
              state={{ userId: profile.id, displayName }}
            >
              <strong>{profile.followers_count ?? 0}</strong> Seguidores
            </Link>
          </div>
        ) : null}
      </div>

      <div className="profile-tabs" role="tablist">
        <button type="button" className="is-active" role="tab" aria-selected="true">
          Posts
        </button>
      </div>

      {loading && posts.length === 0 ? <FeedSkeleton /> : null}
      {error ? <p className="auth-error">{error}</p> : null}

      {!loading && !error && posts.length === 0 ? (
        <p className="profile-state">
          {isOwn
            ? 'Você ainda não fez nenhuma postagem.'
            : 'Nenhuma postagem para mostrar aqui ainda.'}
        </p>
      ) : null}

      <ul className="profile-posts">
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard
              post={post}
              token={token}
              onChange={(updated) =>
                setPosts((current) =>
                  current.map((item) => (item.id === updated.id ? updated : item)),
                )
              }
            />
          </li>
        ))}
      </ul>

      {editing && isOwn ? (
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
