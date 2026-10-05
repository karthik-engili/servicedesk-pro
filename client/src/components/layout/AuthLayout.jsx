import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import {
  Sun,
  Moon,
  Monitor,
  Check,
} from 'lucide-react'

export function AuthLayout({ children, subtitle, title }) {
  const { theme, resolvedTheme, isDark, setTheme } = useTheme()
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const themeMenuRef = useRef(null)

  // Close theme menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target)) {
        setThemeMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header Bar with Theme Switcher */}
      <div className="w-full flex items-center justify-end px-6 py-4 sm:px-8">
        <div className="relative" ref={themeMenuRef}>
          <button
            type="button"
            onClick={() => setThemeMenuOpen((prev) => !prev)}
            title={`Current theme: ${theme} (${resolvedTheme})`}
            aria-label="Toggle theme selection"
            aria-haspopup="menu"
            aria-expanded={themeMenuOpen}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-2xs cursor-pointer"
          >
            {theme === 'system' ? (
              <Monitor className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            ) : isDark ? (
              <Moon className="w-3.5 h-3.5 text-primary-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span className="capitalize">{theme}</span>
          </button>

          {themeMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-1.5 w-36 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 text-xs animate-in fade-in-50 zoom-in-95 duration-100"
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
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </span>
                {theme === 'light' && <Check className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />}
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
                  <Moon className="w-3.5 h-3.5 text-primary-400" />
                  <span>Dark</span>
                </span>
                {theme === 'dark' && <Check className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />}
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
                  <Monitor className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>System</span>
                </span>
                {theme === 'system' && <Check className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Centered Authentication Card Layout */}
      <div className="w-full flex-1 flex flex-col justify-center items-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-[460px]">
          {/* Centered Brand Icon & Title */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center justify-center gap-2.5 group mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-xs transition-transform duration-200 group-hover:scale-105">
                SD
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-slate-100 tracking-tight">
                ServiceDesk Pro
              </span>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-2">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xs dark:shadow-none">
            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full py-5 px-6 text-center text-xs text-slate-400 dark:text-slate-500">
        ServiceDesk Pro &copy; {new Date().getFullYear()} • Enterprise IT Service Desk & Asset Lifecycle
      </div>
    </div>
  )
}

export default AuthLayout
