import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const TOKEN_KEY = 'twitter_clone_token'
const USER_KEY = 'twitter_clone_user'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => readStoredUser())
  const [busy, setBusy] = useState(null)

  const startBusy = useCallback((kind) => {
    setBusy(kind)
  }, [])

  const stopBusy = useCallback(() => {
    setBusy(null)
  }, [])

  const setSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const updateUser = useCallback((nextUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])

  const logout = useCallback(async () => {
    setBusy('logout')
    await wait(700)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    setBusy(null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      busy,
      isAuthenticated: Boolean(token),
      setSession,
      updateUser,
      startBusy,
      stopBusy,
      logout,
    }),
    [token, user, busy, setSession, updateUser, startBusy, stopBusy, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
