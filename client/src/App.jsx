import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './layouts/AppLayout'

// Lazy-loaded page components for optimal production bundle chunking
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const TicketsPage = lazy(() => import('./pages/tickets/TicketsPage'))
const TicketDetailPage = lazy(() => import('./pages/tickets/TicketDetailPage'))
const AssetsPage = lazy(() => import('./pages/assets/AssetsPage'))
const AssetDetailPage = lazy(() => import('./pages/assets/AssetDetailPage'))
const KnowledgePage = lazy(() => import('./pages/knowledge/KnowledgePage'))
const ArticleDetailPage = lazy(() => import('./pages/knowledge/ArticleDetailPage'))
const BookmarksPage = lazy(() => import('./pages/knowledge/BookmarksPage'))
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))
const HealthCheckPage = lazy(() => import('./pages/health/HealthCheckPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] py-16">
      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      <span className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">Loading view...</span>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <Suspense fallback={<PageLoadingFallback />}>
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
            </Suspense>
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
