import React from 'react'

export function DashboardIcon({ className = 'w-4.5 h-4.5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  )
}

export function TicketIcon({ className = 'w-4.5 h-4.5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  )
}

export function KnowledgeIcon({ className = 'w-4.5 h-4.5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

export function NotificationIcon({ className = 'w-4.5 h-4.5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

export function AssetIcon({ className = 'w-4.5 h-4.5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <rect x="2" y="4" width="20" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4" />
    </svg>
  )
}

export function VendorIcon({ className = 'w-4.5 h-4.5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

export function HealthIcon({ className = 'w-4.5 h-4.5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

export function ProfileIcon({ className = 'w-4.5 h-4.5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <circle cx="12" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 21a6.5 6.5 0 0113 0" />
    </svg>
  )
}

export function SunIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41" />
    </svg>
  )
}

export function MoonIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}

export function MonitorIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4" />
    </svg>
  )
}

export function SearchIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
    </svg>
  )
}

export function PlusIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

export function MenuIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

export function CloseIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export function ChevronDownIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export function LogOutIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}

export function CheckIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function CollapseLeftIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18M14 9l-3 3 3 3" />
    </svg>
  )
}

export function CollapseRightIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18M12 9l3 3-3 3" />
    </svg>
  )
}
