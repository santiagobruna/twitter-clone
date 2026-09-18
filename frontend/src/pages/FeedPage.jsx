import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import { getFeed, getMyPosts } from '../api/posts'
import { ComposeBox } from '../components/feed/ComposeBox'
import { PostCard } from '../components/feed/PostCard'
import { WhoToFollow } from '../components/feed/WhoToFollow'
import { useAuth } from '../contexts/AuthContext'
import { formatUserError } from '../utils/apiErrors'
import './FeedPage.css'

function unwrapList(data) {
  if (Array.isArray(data)) return data
  return data?.results || []
}

function normalizePost(payload) {
  if (!payload || typeof payload !== 'object') return null
  if (payload.post?.id) return payload.post
  if (payload.id) return payload
  return null
}

function mergePosts(...groups) {
  const map = new Map()
  for (const group of groups) {
    for (const post of group) {
      const item = normalizePost(post)
      if (item?.id != null) map.set(item.id, item)
    }
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  )
}

export function FeedPage() {
  const { token, user } = useAuth()
  const { lastPost } = useOutletContext() || {}
  const lastPostRef = useRef(lastPost)
  const [posts, setPosts] = useState([])
  const [nextPage, setNextPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    lastPostRef.current = lastPost
    const created = normalizePost(lastPost)
    if (!created) return
    setPosts((current) => mergePosts(current, [created]))
  }, [lastPost])

  useEffect(() => {
    if (!token) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [feedResult, mineResult] = await Promise.allSettled([
          getFeed(token),
          getMyPosts(token),
        ])

        if (cancelled) return

        if (feedResult.status === 'rejected' && mineResult.status === 'rejected') {
          throw feedResult.reason
        }

        const feed = feedResult.status === 'fulfilled' ? feedResult.value : null
        const mine = mineResult.status === 'fulfilled' ? mineResult.value : null

        setPosts((current) =>
          mergePosts(
            unwrapList(feed),
            unwrapList(mine),
            current,
            [lastPostRef.current],
          ),
        )
        setNextPage(feed?.next || null)
      } catch (err) {
        if (!cancelled) {
          setError(formatUserError(err, 'Não foi possível carregar o feed.'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [token])

  function handleCreated(post) {
    const created = normalizePost(post)
    if (!created) return
    setPosts((current) => mergePosts([created], current))
  }

  function handleChange(updated) {
    const next = normalizePost(updated)
    if (!next) return
    setPosts((current) => current.map((item) => (item.id === next.id ? next : item)))
  }

  async function loadMore() {
    if (!nextPage || !token) return
    try {
      const data = await getFeed(token, nextPage)
      setPosts((current) => mergePosts(current, unwrapList(data)))
      setNextPage(data.next || null)
    } catch (err) {
      setError(formatUserError(err, 'Não foi possível carregar mais postagens.'))
    }
  }

  return (
    <section className="feed-page">
      <header className="feed-page__header">
        <h1>Página Inicial</h1>
      </header>

      <div className="feed-follow-mobile">
        <WhoToFollow token={token} currentUserId={user?.id} compact />
      </div>

      <ComposeBox user={user} token={token} onCreated={handleCreated} />

      {loading && posts.length === 0 ? (
        <p className="feed-state">Carregando o feed…</p>
      ) : null}
      {error ? <p className="auth-error feed-state">{error}</p> : null}

      {!loading && !error && posts.length === 0 ? (
        <p className="feed-state">
          Ainda não há postagens. Escreva a primeira no campo acima.
        </p>
      ) : null}

      <div className="feed-list">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            token={token}
            onChange={handleChange}
          />
        ))}
      </div>

      {nextPage ? (
        <button type="button" className="feed-more" onClick={loadMore}>
          Carregar mais
        </button>
      ) : null}
    </section>
  )
}
