import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

import {
  followUser,
  getFollowers,
  getFollowing,
  getUserFollowers,
  getUserFollowing,
  getUserProfile,
  getUsers,
  unfollowUser,
} from '../api/social'
import { UserListRow } from '../components/profile/UserListRow'
import { useAuth } from '../contexts/AuthContext'
import { formatUserError } from '../utils/apiErrors'
import { profilePath, unwrapList } from '../utils/paths'
import './FollowListPage.css'
import './ProfilePage.css'

function normalizePerson(item, listType) {
  if (!item || typeof item !== 'object') return null
  if (item.username && item.id != null) {
    return {
      id: item.id,
      username: item.username,
      display_name: item.display_name || item.profile?.display_name || item.username,
      avatar: item.avatar ?? item.profile?.avatar ?? null,
      is_following: Boolean(item.is_following),
    }
  }
  const nested = listType === 'followers' ? item.follower : item.following
  if (nested) return normalizePerson(nested, listType)
  if (item.user) return normalizePerson(item.user, listType)
  return null
}

export function FollowListPage({ type }) {
  const { username } = useParams()
  const location = useLocation()
  const { token, user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const isFollowers = type === 'followers'
  const title = isFollowers ? 'Seguidores' : 'Seguindo'
  const displayName = profile?.profile?.display_name || profile?.username || username
  const isOwn = username?.toLowerCase() === user?.username?.toLowerCase()

  const load = useCallback(async () => {
    if (!token || !username) return
    setLoading(true)
    setError('')
    try {
      let target = null

      if (isOwn && user?.id) {
        target = user
      } else if (location.state?.userId) {
        target = {
          id: location.state.userId,
          username,
          profile: {
            display_name: location.state.displayName || username,
          },
        }
      } else {
        try {
          target = await getUserProfile(token, username)
        } catch {
          const found = unwrapList(await getUsers(token, username)).find(
            (person) => person.username?.toLowerCase() === username.toLowerCase(),
          )
          if (found) {
            target = {
              id: found.id,
              username: found.username,
              profile: { display_name: found.display_name, avatar: found.avatar },
            }
          }
        }
      }

      if (!target?.id) {
        const notFound = new Error('not found')
        notFound.status = 404
        throw notFound
      }

      setProfile(target)

      const list = isOwn
        ? isFollowers
          ? await getFollowers(token)
          : await getFollowing(token)
        : isFollowers
          ? await getUserFollowers(token, target.id)
          : await getUserFollowing(token, target.id)

      setPeople(
        unwrapList(list)
          .map((item) => normalizePerson(item, type))
          .filter(Boolean),
      )
    } catch (err) {
      setProfile(null)
      setPeople([])
      setError(
        err.status === 404
          ? 'Esta conta não existe.'
          : formatUserError(err, 'Não foi possível carregar esta lista.'),
      )
    } finally {
      setLoading(false)
    }
  }, [token, username, isFollowers, isOwn, user, location.state, type])

  useEffect(() => {
    load()
  }, [load])

  async function toggleFollow(person) {
    if (busyId) return
    setBusyId(person.id)
    setError('')
    const following = Boolean(person.is_following)
    try {
      if (following) {
        await unfollowUser(token, person.id)
      } else {
        await followUser(token, person.id)
      }
      setPeople((list) => {
        const next = list.map((item) =>
          item.id === person.id ? { ...item, is_following: !following } : item,
        )
        if (isOwn && !isFollowers && following) {
          return next.filter((item) => item.id !== person.id)
        }
        return next
      })
    } catch (err) {
      setError(formatUserError(err, 'Não foi possível atualizar o seguir.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="follow-list-page">
      <header className="profile-topbar">
        <Link to={profilePath(username)} className="profile-back" aria-label="Voltar">
          ←
        </Link>
        <div>
          <h1>{title}</h1>
          <p className="profile-topbar__meta">@{username}</p>
        </div>
      </header>

      <nav className="follow-list-tabs" aria-label="Listas de conexão">
        <Link
          to={`${profilePath(username)}/following`}
          state={profile?.id ? { userId: profile.id, displayName } : location.state}
          className={isFollowers ? '' : 'is-active'}
        >
          Seguindo
        </Link>
        <Link
          to={`${profilePath(username)}/followers`}
          state={profile?.id ? { userId: profile.id, displayName } : location.state}
          className={isFollowers ? 'is-active' : ''}
        >
          Seguidores
        </Link>
      </nav>

      {loading ? <p className="profile-state">Carregando…</p> : null}
      {error ? <p className="auth-error follow-list-error">{error}</p> : null}

      {!loading && !error && people.length === 0 ? (
        <p className="profile-state">
          {isFollowers
            ? `${displayName} ainda não tem seguidores.`
            : `${displayName} ainda não segue ninguém.`}
        </p>
      ) : null}

      <ul className="follow-list">
        {people.map((person) => (
          <UserListRow
            key={person.id}
            person={person}
            currentUserId={user?.id}
            busy={busyId === person.id}
            onToggle={toggleFollow}
          />
        ))}
      </ul>
    </section>
  )
}
