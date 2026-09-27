import React, { useState } from 'react'
import NotificationDropdown from './NotificationDropdown'
import { useNotifications } from '../../contexts/NotificationContext'
import { NotificationIcon } from '../ui/Icons'

export function NotificationBell({ className = '' }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { unreadCount } = useNotifications()

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggleDropdown}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={dropdownOpen}
        aria-haspopup="dialog"
        className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      >
        <NotificationIcon className="w-5 h-5" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-primary-600 dark:bg-primary-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        isOpen={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
      />
    </div>
  )
}

export default NotificationBell
