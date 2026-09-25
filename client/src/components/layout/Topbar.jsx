import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ROLE_LABELS, ROLE_BADGE_VARIANTS } from '../../constants/roles'
import Badge from '../ui/Badge'
import { NotificationBell } from '../notifications'

export function Topbar({ onMenuClick }) {
  const { user } = useAuth()
  const userRole = user?.role || 'employee'
  const userRoleLabel = ROLE_LABELS[userRole] || userRole
  const badgeVariant = ROLE_BADGE_VARIANTS[userRole] || 'neutral'

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile hamburger & breadcrumb/status */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700 hidden sm:inline">Workspace</span>
          <span className="hidden sm:inline">/</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live Backend Connected
          </span>
        </div>
      </div>

      {/* Right: Notification and User profile */}
      <div className="flex items-center gap-3">
        <NotificationBell />

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        <Link
          to="/profile"
          className="flex items-center gap-2.5 p-1 -mr-1 rounded-lg hover:bg-slate-50 transition-colors group"
          aria-label="View user profile"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center border border-blue-200 group-hover:border-blue-300">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SD'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-blue-600">
              {user?.name || 'Administrator'}
            </p>
            <div className="mt-0.5">
              <Badge variant={badgeVariant} size="sm">
                {userRoleLabel}
              </Badge>
            </div>
          </div>
        </Link>
      </div>
    </header>
  )
}

export default Topbar
