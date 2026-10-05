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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Enterprise Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-col min-w-0 min-h-screen transition-[margin] duration-200 ease-in-out ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        }`}
      >
        {/* Sticky Enterprise Command Topbar */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-x-hidden focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
