import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import {
  TicketIcon,
  KnowledgeIcon,
  AssetIcon,
  VendorIcon,
  NotificationIcon,
  HealthIcon,
  PlusIcon,
} from '../ui/Icons'

export function QuickActionsWidget({ role = 'employee', className = '' }) {
  const getActions = () => {
    switch (role) {
      case 'technician':
        return [
          {
            label: 'Assigned Tickets Queue',
            description: 'View tickets pending resolution',
            to: '/tickets',
            icon: <TicketIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />,
          },
          {
            label: 'Knowledge Base',
            description: 'Search solutions & SOPs',
            to: '/knowledge',
            icon: <KnowledgeIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          },
          {
            label: 'IT Assets Inventory',
            description: 'Inspect CMDB equipment',
            to: '/assets',
            icon: <AssetIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
          },
          {
            label: 'Notifications',
            description: 'Review alert updates',
            to: '/notifications',
            icon: <NotificationIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          },
        ]
      case 'asset_manager':
        return [
          {
            label: 'Asset Inventory',
            description: 'Manage hardware & lifecycles',
            to: '/assets',
            icon: <AssetIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />,
          },
          {
            label: 'Vendor Directory',
            description: 'Supplier contracts & warranty',
            to: '/assets?tab=vendors',
            icon: <VendorIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
          },
          {
            label: 'Expiring Warranties',
            description: 'Review devices near renewal',
            to: '/assets',
            icon: <AssetIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          },
        ]
      case 'it_manager':
      case 'system_admin':
        return [
          {
            label: 'Create Ticket',
            description: 'Log new incident or request',
            to: '/tickets?create=true',
            icon: <PlusIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />,
          },
          {
            label: 'Ticket Queue',
            description: 'Org-wide service operations',
            to: '/tickets',
            icon: <TicketIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
          },
          {
            label: 'Manage Assets',
            description: 'CMDB & hardware inventory',
            to: '/assets',
            icon: <AssetIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          },
          {
            label: 'Knowledge Base',
            description: 'Published documentation',
            to: '/knowledge',
            icon: <KnowledgeIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
          },
          {
            label: 'System Health',
            description: 'Infrastructure diagnostics',
            to: '/health-check',
            icon: <HealthIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          },
        ]
      case 'employee':
      default:
        return [
          {
            label: 'Create Ticket',
            description: 'Request help or report an issue',
            to: '/tickets?create=true',
            icon: <PlusIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />,
          },
          {
            label: 'My Tickets',
            description: 'Track request status & notes',
            to: '/tickets',
            icon: <TicketIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
          },
          {
            label: 'Knowledge Base',
            description: 'Self-service guides & troubleshooting',
            to: '/knowledge',
            icon: <KnowledgeIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          },
        ]
    }
  }

  const actions = getActions()

  return (
    <Card variant="bordered" className={`flex flex-col justify-between overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Quick Actions
        </h2>
      </div>

      {/* Content */}
      <div className="p-3 space-y-1.5">
        {actions.map((act) => (
          <Link
            key={act.label}
            to={act.to}
            className="flex items-center gap-3 p-2 rounded-md border border-transparent hover:border-slate-200/80 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-slate-800 dark:text-slate-200 group no-underline"
          >
            <div className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0">
              {act.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {act.label}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {act.description}
              </p>
            </div>
            <svg
              className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </Card>
  )
}

export default QuickActionsWidget
