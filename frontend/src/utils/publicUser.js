import { getFeed, getUserPosts } from '../api/posts'
import { getUserFollowers, getUserFollowing, getUserProfile, getUsers } from '../api/social'
import { unwrapList } from './paths'

export function toPublicProfile(person) {
  if (!person || typeof person !== 'object') return null
  const username = person.username
  if (!username) return null

  return {
    id: person.id,
    username,
    date_joined: person.date_joined,
    profile: {
      display_name:
        person.profile?.display_name || person.display_name || username,
      avatar: person.profile?.avatar ?? person.avatar ?? null,
      banner: person.profile?.banner ?? person.banner ?? null,
      bio: person.profile?.bio ?? person.bio ?? '',
    },
    followers_count: person.followers_count,
    following_count: person.following_count,
    is_following: Boolean(person.is_following),
  }
}

export function profileLinkState(person, extra = {}) {
  return person ? { user: person, ...extra } : extra
}

export async function resolvePublicUser(token, username, fallback) {
  const handle = (username || '').replace(/^@/, '')
  if (!handle) return toPublicProfile(fallback)

  try {
    const profile = toPublicProfile(await getUserProfile(token, handle))
    if (profile) return profile
  } catch {
    // API antiga não tem /profiles/; tenta a busca de usuários.
  }

  try {
    const found = unwrapList(await getUsers(token, handle)).find(
      (person) => person.username?.toLowerCase() === handle.toLowerCase(),
    )
    if (found) return toPublicProfile(found)
  } catch {
    // Continua para o fallback vindo do post.
  }

  const fallbackProfile = toPublicProfile(fallback)
  if (fallbackProfile?.username?.toLowerCase() === handle.toLowerCase()) {
    return fallbackProfile
  }
  return fallbackProfile
}

export async function loadPostsForUser(token, userId, username) {
  if (userId) {
    try {
      return unwrapList(await getUserPosts(token, userId))
    } catch {
      // API antiga não lista posts por usuário.
    }
  }

  try {
    const feed = unwrapList(await getFeed(token))
    const handle = username?.toLowerCase()
    return feed.filter((post) => {
      const author = post.author
      if (!author) return false
      if (userId && author.id === userId) return true
      return author.username?.toLowerCase() === handle
    })
  } catch {
    return []
  }
}

export async function loadConnectionCounts(token, userId) {
  if (!userId) return null
  try {
    const [followers, following] = await Promise.all([
      getUserFollowers(token, userId),
      getUserFollowing(token, userId),
    ])
    return {
      followers_count: unwrapList(followers).length,
      following_count: unwrapList(following).length,
    }
  } catch {
    return null
  }
}
