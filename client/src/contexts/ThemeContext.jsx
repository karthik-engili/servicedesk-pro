import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'

const ThemeContext = createContext({
  theme: 'system',
  resolvedTheme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
})

const THEME_STORAGE_KEY = 'servicedesk_theme'

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    // 1. Check local storage
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      return stored
    }
    // Default to system
    return 'system'
  })

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  // Listen to OS system color-scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      setSystemIsDark(e.matches)
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Calculate resolved theme (either dark or light)
  const resolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return systemIsDark ? 'dark' : 'light'
    }
    return theme
  }, [theme, systemIsDark])

  const isDark = resolvedTheme === 'dark'

  // Apply or remove .dark class on html element
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme, isDark])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'system'
      return 'light'
    })
  }, [])

  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light' || newTheme === 'system') {
      setThemeState(newTheme)
    }
  }, [])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDark,
      toggleTheme,
      setTheme,
    }),
    [theme, resolvedTheme, isDark, toggleTheme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext
