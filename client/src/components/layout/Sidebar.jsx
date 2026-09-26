import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { ROLE_LABELS, ROLE_BADGE_VARIANTS } from '../../constants/roles'
import Badge from '../ui/Badge'
import {
  DashboardIcon,
  TicketIcon,
  KnowledgeIcon,
  NotificationIcon,
  AssetIcon,
  VendorIcon,
  HealthIcon,
  ProfileIcon,
  CloseIcon,
  CollapseLeftIcon,
  CollapseRightIcon,
  LogOutIcon,
} from '../ui/Icons'

export function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }) {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const userRole = user?.role || 'employee'
  const userRoleLabel = ROLE_LABELS[userRole] || userRole
  const badgeVariant = ROLE_BADGE_VARIANTS[userRole] || 'neutral'

  // Manage body scroll lock and Escape key when mobile drawer is open
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Build navigation items according to strict enterprise RBAC
  const getNavGroups = () => {
    const isStaffUser = ['technician', 'asset_manager', 'it_manager', 'system_admin'].includes(userRole)
    const isAssetUser = ['asset_manager', 'it_manager', 'system_admin'].includes(userRole)
    const isAdminUser = ['it_manager', 'system_admin'].includes(userRole)

    const groups = [
      {
        heading: 'Workspace',
        items: [
          {
            label: 'Dashboard',
            path: '/dashboard',
            icon: <DashboardIcon className="w-[18px] h-[18px] shrink-0" />,
          },
        ],
      },
      {
        heading: 'Service Operations',
        items: [
          // Tickets visible to all except dedicated asset manager
          ...(userRole !== 'asset_manager'
            ? [
                {
                  label: 'Tickets',
                  path: '/tickets',
                  icon: <TicketIcon className="w-[18px] h-[18px] shrink-0" />,
                },
              ]
            : []),
          {
            label: 'Knowledge Base',
            path: '/knowledge',
            icon: <KnowledgeIcon className="w-[18px] h-[18px] shrink-0" />,
          },
          {
            label: 'Notifications',
            path: '/notifications',
            icon: <NotificationIcon className="w-[18px] h-[18px] shrink-0" />,
            badge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : null,
          },
        ],
      },
    ]

    // Asset Management Group
    if (isStaffUser) {
      groups.push({
        heading: 'Asset Management',
        items: [
          {
            label: 'IT Assets',
            path: '/assets',
            icon: <AssetIcon className="w-[18px] h-[18px] shrink-0" />,
          },
          ...(isAssetUser
            ? [
                {
                  label: 'Vendors',
                  path: '/assets?tab=vendors',
                  icon: <VendorIcon className="w-[18px] h-[18px] shrink-0" />,
                },
              ]
            : []),
        ],
      })
    }

    // Administration Group
    if (isAdminUser) {
      groups.push({
        heading: 'Administration',
        items: [
          {
            label: 'System Health',
            path: '/health-check',
            icon: <HealthIcon className="w-[18px] h-[18px] shrink-0" />,
          },
        ],
      })
    }

    // Account Group
    groups.push({
      heading: 'Account',
      items: [
        {
          label: 'Profile & Settings',
          path: '/profile',
          icon: <ProfileIcon className="w-[18px] h-[18px] shrink-0" />,
        },
      ],
    })

    return groups
  }

  const navGroups = getNavGroups()

  // Base widths
  const desktopWidthClass = isCollapsed ? 'lg:w-16' : 'lg:w-60'

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        aria-label="Primary Navigation"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 text-slate-300 flex flex-col transition-all duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 shrink-0 ${desktopWidthClass} ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div
          className={`h-16 flex items-center border-b border-slate-800/90 shrink-0 px-3.5 ${
            isCollapsed ? 'lg:justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-primary-600 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0 select-none">
              SD
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="font-semibold text-white tracking-tight text-sm block leading-tight">
                  ServiceDesk Pro
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">
                  Enterprise ITSM
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden lg:flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              {isCollapsed ? (
                <CollapseRightIcon className="w-4 h-4" />
              ) : (
                <CollapseLeftIcon className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close navigation"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Grouped Navigation Links */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto space-y-4 overflow-x-hidden">
          {navGroups.map((group, groupIdx) => (
            <div key={group.heading} className="space-y-0.5">
              {/* Group Heading */}
              {isCollapsed ? (
                groupIdx > 0 && <div className="h-px bg-slate-800/80 my-2 mx-1" />
              ) : (
                <div className="px-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400/80 py-1 select-none">
                  {group.heading}
                </div>
              )}

              {/* Items */}
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose?.()
                  }}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-2.5 rounded-md text-xs font-medium transition-all duration-150 h-9 ${
                      isCollapsed ? 'lg:justify-center px-0' : 'px-2.5'
                    } ${
                      isActive
                        ? 'bg-primary-500/10 text-primary-400 font-semibold border-l-2 border-primary-500'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border-l-2 border-transparent'
                    }`
                  }
                >
                  {/* Icon */}
                  <span className="shrink-0">{item.icon}</span>

                  {/* Label (Expanded) */}
                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {/* Notification Count Badge */}
                  {item.badge && (
                    <span
                      className={`inline-flex items-center justify-center font-mono font-bold leading-none shrink-0 ${
                        isCollapsed
                          ? 'absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500'
                          : 'min-w-[18px] h-4.5 px-1 text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full'
                      }`}
                    >
                      {!isCollapsed && item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Sidebar User / Account Area */}
        <div className="p-2.5 border-t border-slate-800/90 bg-slate-950/70 shrink-0">
          {isCollapsed ? (
            // Collapsed view: Avatar only with tooltip
            <div className="flex flex-col items-center gap-2 py-1">
              <NavLink
                to="/profile"
                title={`${user?.name || 'User'} (${userRoleLabel})`}
                className="w-8 h-8 rounded-full bg-primary-950 text-primary-300 font-semibold text-xs flex items-center justify-center border border-primary-800/80 hover:border-primary-600 transition-colors"
              >
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SD'}
              </NavLink>
              <button
                type="button"
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded transition-colors cursor-pointer"
              >
                <LogOutIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            // Expanded view: Full user card
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-primary-950 text-primary-300 font-semibold text-[11px] flex items-center justify-center border border-primary-800/80 shrink-0">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SD'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-white truncate">
                      {user?.name || 'Authorized User'}
                    </span>
                    <Badge variant={badgeVariant} size="xs" className="shrink-0 text-[10px] py-0 px-1.5">
                      {userRoleLabel}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user?.email || 'user@servicedesk.local'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium text-slate-300 bg-slate-800/80 hover:bg-rose-950/50 hover:text-rose-300 hover:border-rose-900/50 rounded border border-slate-700/80 transition-colors cursor-pointer"
              >
                <LogOutIcon className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
