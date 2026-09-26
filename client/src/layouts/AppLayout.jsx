import React, { useState, useEffect, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'

const SIDEBAR_COLLAPSED_KEY = 'servicedesk_sidebar_collapsed'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
    }
    return false
  })

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
      return next
    })
  }, [])

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-x-hidden">
      {/* Enterprise Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Sticky Enterprise Command Topbar */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
