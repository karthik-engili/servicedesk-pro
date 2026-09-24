import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './layouts/AppLayout'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import TicketsPage from './pages/tickets/TicketsPage'
import TicketDetailPage from './pages/tickets/TicketDetailPage'
import AssetsPage from './pages/assets/AssetsPage'
import AssetDetailPage from './pages/assets/AssetDetailPage'
import KnowledgePage from './pages/knowledge/KnowledgePage'
import ArticleDetailPage from './pages/knowledge/ArticleDetailPage'
import BookmarksPage from './pages/knowledge/BookmarksPage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import ProfilePage from './pages/profile/ProfilePage'
import HealthCheckPage from './pages/health/HealthCheckPage'
import NotFound from './pages/NotFound'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/tickets/:id" element={<TicketDetailPage />} />
                <Route path="/assets" element={<AssetsPage />} />
                <Route path="/assets/:id" element={<AssetDetailPage />} />
                <Route path="/knowledge" element={<KnowledgePage />} />
                <Route path="/knowledge/bookmarks" element={<BookmarksPage />} />
                <Route path="/knowledge/:id" element={<ArticleDetailPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/health-check" element={<HealthCheckPage />} />
              </Route>
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
