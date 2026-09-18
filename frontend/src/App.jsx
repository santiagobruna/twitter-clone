import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/routing/ProtectedRoute'
import { ScreenLoader } from './components/ui/Loader'
import { FeedPage } from './pages/FeedPage'
import { FollowListPage } from './pages/FollowListPage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'

const BUSY_LABELS = {
  login: 'Entrando…',
  logout: 'Saindo…',
  register: 'Criando sua conta…',
}

function AuthBusyOverlay() {
  const { busy } = useAuth()
  if (!busy) return null
  return <ScreenLoader label={BUSY_LABELS[busy] || 'Carregando…'} />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<FeedPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/u/:username/followers" element={<FollowListPage type="followers" />} />
              <Route path="/u/:username/following" element={<FollowListPage type="following" />} />
              <Route path="/u/:username" element={<ProfilePage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AuthBusyOverlay />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
