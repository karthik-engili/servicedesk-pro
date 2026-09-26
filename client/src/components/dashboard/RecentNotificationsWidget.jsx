import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import { formatNotificationTime } from '../../constants/notifications'
import EmptyState from '../ui/EmptyState'

export function RecentNotificationsWidget({
  notifications = [],
  unreadCount = 0,
  className = '',
}) {
  return (
    <Card variant="bordered" className={`flex flex-col justify-between overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Recent Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 font-mono">
              {unreadCount} new
            </span>
          )}
        </div>
        <Link
          to="/notifications"
          className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors inline-flex items-center gap-1 select-none"
        >
          <span>View all</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Content */}
      <div className="p-0">
        {notifications.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="All caught up"
              description="No recent notifications to review."
              className="py-4"
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {notifications.map((n) => {
              const isUnread = !n.isRead
              const targetUrl = n.ticket ? `/tickets/${n.ticket}` : '/notifications'

              return (
                <Link
                  key={n._id}
                  to={targetUrl}
                  className={`px-4 sm:px-5 py-2.5 flex items-start gap-2.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors no-underline group ${
                    isUnread ? 'bg-primary-50/20 dark:bg-primary-950/15' : ''
                  }`}
                >
                  <div className="pt-1.5">
                    <span
                      className={`block w-1.5 h-1.5 rounded-full ${
                        isUnread ? 'bg-primary-600 dark:bg-primary-400' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {n.title || n.message}
                    </p>
                    {n.title && n.message && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {n.message}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap pt-0.5">
                    {formatNotificationTime(n.createdAt)}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}

export default RecentNotificationsWidget
