import { useEffect, useState } from 'react'

import { followUser, getUsers, unfollowUser } from '../../api/social'
import { formatUserError } from '../../utils/apiErrors'
import { Avatar } from '../ui/Avatar'
import './WhoToFollow.css'

function unwrapList(data) {
  if (Array.isArray(data)) return data
  return data?.results || []
}

export function WhoToFollow({ token, currentUserId }) {
  const [query, setQuery] = useState('')
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [searched, setSearched] = useState(false)

  async function fetchPeople(search) {
    const list = unwrapList(await getUsers(token, search))
    return list.filter((person) => person.id !== currentUserId)
  }

  useEffect(() => {
    if (!token) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const list = await fetchPeople('')
        if (!cancelled) setPeople(list)
      } catch (err) {
        if (!cancelled) {
          setError(formatUserError(err, 'Não foi possível carregar pessoas para seguir.'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [token, currentUserId])

  async function handleSearch(event) {
    event.preventDefault()
    const search = query.trim().replace(/^@/, '')
    setLoading(true)
    setError('')
    setSearched(Boolean(search))
    try {
      setPeople(await fetchPeople(search))
    } catch (err) {
      setError(formatUserError(err, 'Não foi possível buscar esse usuário.'))
    } finally {
      setLoading(false)
    }
  }

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
      setPeople((list) =>
        list.map((item) =>
          item.id === person.id ? { ...item, is_following: !following } : item,
        ),
      )
    } catch (err) {
      setError(formatUserError(err, 'Não foi possível atualizar o seguir.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="who-to-follow">
      <h2>Seguir pessoas</h2>
      <p className="who-to-follow__hint">Busque pelo @ e clique em Seguir para adicionar.</p>
      <form className="who-to-follow__search" onSubmit={handleSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar @usuario"
          aria-label="Buscar usuário para seguir"
        />
        <button type="submit" disabled={loading}>
          Buscar
        </button>
      </form>
      {loading ? <p className="who-to-follow__state">Buscando pessoas…</p> : null}
      {!loading && people.length === 0 && !error ? (
        <p className="who-to-follow__state">
          {searched
            ? 'Nenhuma conta encontrada com esse nome.'
            : 'Cadastre outra conta ou busque um @ para seguir.'}
        </p>
      ) : null}
      {error ? <p className="who-to-follow__error">{error}</p> : null}
      <ul>
        {people.map((person) => (
          <li key={person.id}>
            <Avatar
              src={person.avatar}
              name={person.display_name || person.username}
              size={40}
            />
            <div>
              <strong>{person.display_name || person.username}</strong>
              <span>@{person.username}</span>
            </div>
            <button
              type="button"
              className={person.is_following ? 'is-following' : ''}
              onClick={() => toggleFollow(person)}
              disabled={busyId === person.id}
            >
              {person.is_following ? 'Seguindo' : 'Seguir'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
