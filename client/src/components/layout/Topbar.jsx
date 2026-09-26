import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { ROLE_LABELS, ROLE_BADGE_VARIANTS } from '../../constants/roles'
import Badge from '../ui/Badge'
import { NotificationBell } from '../notifications'
import {
  MenuIcon,
  SearchIcon,
  PlusIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  CheckIcon,
  ChevronDownIcon,
  ProfileIcon,
  LogOutIcon,
} from '../ui/Icons'

export function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, resolvedTheme, isDark, setTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const userRole = user?.role || 'employee'
  const userRoleLabel = ROLE_LABELS[userRole] || userRole
  const badgeVariant = ROLE_BADGE_VARIANTS[userRole] || 'neutral'
  const canCreateTicket = userRole !== 'asset_manager'

  // Dropdown states
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const themeMenuRef = useRef(null)
  const profileMenuRef = useRef(null)

  // Search input state
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef(null)

  // Live online/offline status
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      } else if (e.key === 'Escape') {
        setThemeMenuOpen(false)
        setProfileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target)) {
        setThemeMenuOpen(false)
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Derive dynamic breadcrumb / page title from current route
  const getRouteMeta = (pathname) => {
    if (pathname.startsWith('/dashboard')) return { section: 'Workspace', title: 'Dashboard' }
    if (pathname.startsWith('/tickets/')) return { section: 'Service Operations', title: 'Ticket Detail' }
    if (pathname.startsWith('/tickets')) return { section: 'Service Operations', title: 'Tickets' }
    if (pathname.startsWith('/knowledge/bookmarks')) return { section: 'Service Operations', title: 'Bookmarks' }
    if (pathname.startsWith('/knowledge/')) return { section: 'Service Operations', title: 'Article Detail' }
    if (pathname.startsWith('/knowledge')) return { section: 'Service Operations', title: 'Knowledge Base' }
    if (pathname.startsWith('/notifications')) return { section: 'Service Operations', title: 'Notifications' }
    if (pathname.startsWith('/assets/')) return { section: 'Asset Management', title: 'Asset Detail' }
    if (pathname.startsWith('/assets')) return { section: 'Asset Management', title: 'IT Assets' }
    if (pathname.startsWith('/health-check')) return { section: 'Administration', title: 'System Health' }
    if (pathname.startsWith('/profile')) return { section: 'Account', title: 'Profile & Settings' }
    return { section: 'Workspace', title: 'Operations' }
  }

  const routeMeta = getRouteMeta(location.pathname)

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return

    // Safely route to contextual search without inventing unbacked endpoints
    if (location.pathname.startsWith('/knowledge')) {
      navigate(`/knowledge?q=${encodeURIComponent(q)}`)
    } else if (location.pathname.startsWith('/assets')) {
      navigate(`/assets?search=${encodeURIComponent(q)}`)
    } else if (canCreateTicket) {
      navigate(`/tickets?search=${encodeURIComponent(q)}`)
    } else {
      navigate(`/assets?search=${encodeURIComponent(q)}`)
    }
  }

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-5 lg:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors shrink-0">
      {/* Left: Mobile hamburger & Dynamic Page Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors"
          aria-label="Open navigation menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
          <span className="font-medium hidden sm:inline text-slate-500 dark:text-slate-400 select-none">
            {routeMeta.section}
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600 select-none">/</span>
          <h1 className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm">
            {routeMeta.title}
          </h1>
        </div>
      </div>

      {/* Center: Command / Search UI shell */}
      <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
        <form onSubmit={handleSearchSubmit} className="w-full relative">
          <div className="relative flex items-center w-full">
            <span className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none">
              <SearchIcon className="w-4 h-4" />
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets, assets, articles..."
              className="w-full h-9 pl-9 pr-14 text-xs bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-md text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
            <kbd className="absolute right-2.5 hidden sm:inline-flex items-center text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600/60 rounded px-1.5 py-0.5 shadow-2xs select-none">
              Ctrl K
            </kbd>
          </div>
        </form>
      </div>

      {/* Right: Actions, Connection, Theme, Notifications & User Menu */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Create Ticket Action (only for authorized roles) */}
        {canCreateTicket && (
          <Link
            to="/tickets?create=true"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500 rounded-md transition-colors shadow-2xs cursor-pointer select-none"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Ticket</span>
          </Link>
        )}

        {/* Subtle Connection Status */}
        <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium select-none">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
            }`}
          />
          <span className={isOnline ? 'text-slate-500 dark:text-slate-400' : 'text-rose-500'}>
            {isOnline ? 'Connected' : 'Offline'}
          </span>
        </div>

        {/* Compact Theme Switcher Menu */}
        <div className="relative" ref={themeMenuRef}>
          <button
            type="button"
            onClick={() => setThemeMenuOpen((prev) => !prev)}
            title={`Current theme: ${theme} (${resolvedTheme})`}
            aria-label="Toggle theme selection"
            aria-haspopup="menu"
            aria-expanded={themeMenuOpen}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          >
            {theme === 'system' ? (
              <MonitorIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            ) : isDark ? (
              <MoonIcon className="w-4 h-4 text-primary-400" />
            ) : (
              <SunIcon className="w-4 h-4 text-amber-500" />
            )}
          </button>

          {themeMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-36 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 text-xs animate-in fade-in-50 zoom-in-95 duration-100"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setTheme('light')
                  setThemeMenuOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors cursor-pointer ${
                  theme === 'light'
                    ? 'text-primary-600 dark:text-primary-400 font-semibold bg-slate-50 dark:bg-slate-800/50'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <SunIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </span>
                {theme === 'light' && <CheckIcon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />}
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setTheme('dark')
                  setThemeMenuOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'text-primary-600 dark:text-primary-400 font-semibold bg-slate-50 dark:bg-slate-800/50'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <MoonIcon className="w-3.5 h-3.5 text-primary-400" />
                  <span>Dark</span>
                </span>
                {theme === 'dark' && <CheckIcon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />}
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setTheme('system')
                  setThemeMenuOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors cursor-pointer ${
                  theme === 'system'
                    ? 'text-primary-600 dark:text-primary-400 font-semibold bg-slate-50 dark:bg-slate-800/50'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <MonitorIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>System</span>
                </span>
                {theme === 'system' && <CheckIcon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Control */}
        <NotificationBell />

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* User / Profile Menu */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            aria-label="User account menu"
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer select-none"
          >
            <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-semibold text-xs flex items-center justify-center border border-primary-200/80 dark:border-primary-800/80 shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SD'}
            </div>
            <div className="hidden md:block text-left max-w-[120px]">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
                {userRoleLabel}
              </p>
            </div>
            <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 hidden md:block shrink-0" />
          </button>

          {profileMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 animate-in fade-in-50 zoom-in-95 duration-100"
            >
              {/* Profile Summary Header */}
              <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user?.name || 'Authorized User'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'user@servicedesk.local'}
                </p>
                <div className="mt-1.5">
                  <Badge variant={badgeVariant} size="xs">
                    {userRoleLabel}
                  </Badge>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="py-1">
                <Link
                  to="/profile"
                  role="menuitem"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ProfileIcon className="w-4 h-4 text-slate-400" />
                  <span>Profile & Settings</span>
                </Link>
              </div>

              {/* Sign out */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOutIcon className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar
