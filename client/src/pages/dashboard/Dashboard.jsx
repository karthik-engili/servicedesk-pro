import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import PageContainer from '../../components/layout/PageContainer'
import { ROLE_LABELS, ROLE_BADGE_VARIANTS } from '../../constants/roles'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

export function Dashboard() {
  const { user } = useAuth()
  const userRole = user?.role || 'employee'
  const roleLabel = ROLE_LABELS[userRole] || userRole
  const badgeVariant = ROLE_BADGE_VARIANTS[userRole] || 'neutral'

  return (
    <PageContainer
      title="System Overview"
      description="ServiceDesk Pro Enterprise Management Foundation"
      actions={
        <Link to="/health-check">
          <Button variant="outline" size="sm">
            Verify Backend Health
          </Button>
        </Link>
      }
    >
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Welcome, {user?.name || 'Administrator'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              You are signed in to ServiceDesk Pro with active role privileges.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Current Role:</span>
            <Badge variant={badgeVariant} size="md">
              {roleLabel}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Ticket Lifecycle</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Incident tracking, SLAs, work logs, comments, and audit trails.
          </p>
          <Link to="/tickets">
            <Button variant="ghost" size="sm" className="text-xs -ml-2">
              View Tickets &rarr;
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-900">IT Asset Inventory</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Hardware tracking, vendor assignments, repair logs, and warranties.
          </p>
          <Link to="/assets">
            <Button variant="ghost" size="sm" className="text-xs -ml-2">
              View Assets &rarr;
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Knowledge Base</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Standard operating procedures, troubleshooting guides, and AI matching.
          </p>
          <Link to="/knowledge">
            <Button variant="ghost" size="sm" className="text-xs -ml-2">
              Explore Articles &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  )
}

export default Dashboard
