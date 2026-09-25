import React from 'react'
import { Link } from 'react-router-dom'
import { formatNotificationTime } from '../../constants/notifications'
import EmptyState from '../ui/EmptyState'

export function RecentNotificationsWidget({
  notifications = [],
  unreadCount = 0,
  className = '',
}) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Recent Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                {unreadCount} new
              </span>
            )}
          </div>
          <Link
            to="/notifications"
            className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors inline-flex items-center gap-1"
          >
            <span>View all</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            title="All caught up"
            description="No recent notifications to review."
            className="py-6"
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {notifications.map((n) => {
              const isUnread = !n.isRead
              const targetUrl = n.ticket ? `/tickets/${n.ticket}` : '/notifications'

              return (
                <Link
                  key={n._id}
                  to={targetUrl}
                  className={`py-3 first:pt-0 last:pb-0 flex items-start gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 -mx-2 px-2 rounded-xl transition-colors no-underline group ${
                    isUnread ? 'bg-primary-50/30 dark:bg-primary-950/20' : ''
                  }`}
                >
                  <div className="pt-1">
                    <span
                      className={`block w-2 h-2 rounded-full ${
                        isUnread ? 'bg-primary-600 dark:bg-primary-400' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {n.title || n.message}
                    </div>
                    {n.title && n.message && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {n.message}
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap pt-0.5">
                    {formatNotificationTime(n.createdAt)}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentNotificationsWidget
