import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { hasAnyRole, ROLE_LABELS } from '../constants/roles'
import Spinner from '../components/ui/Spinner'

export function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Spinner size="lg" color="primary" />
        <p className="mt-3 text-xs font-medium text-slate-500 tracking-wide uppercase">
          Verifying session...
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check RBAC permissions if allowedRoles specified
  if (allowedRoles.length > 0 && !hasAnyRole(user, allowedRoles)) {
    const roleLabel = ROLE_LABELS[user?.role] || user?.role || 'User'
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 00-8 0v4h8V4z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Access Restricted</h2>
          <p className="mt-2 text-sm text-slate-600">
            Your current account role (<strong>{roleLabel}</strong>) does not have permission to access this module.
          </p>
          <div className="mt-6">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  return children ? children : <Outlet />
}

export default ProtectedRoute
