import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { useTheme } from '../../contexts/ThemeContext'
import api from '../../services/api'
import PageContainer from '../../components/layout/PageContainer'
import { ROLE_LABELS, ROLE_BADGE_VARIANTS } from '../../constants/roles'
import { Button, Input, Select, Badge, Modal } from '../../components/ui'
import {
  SunIcon,
  MoonIcon,
  MonitorIcon,
  CopyIcon,
  CheckIcon,
  ArrowRightIcon,
  LogOutIcon,
  TicketIcon,
  BuildingIcon,
  MailIcon,
  ShieldIcon,
  ProfileIcon,
} from '../../components/ui/Icons'
import { getErrorMessage, getFieldErrors } from '../../utils/errorHandler'

export function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const { showSuccess, showError } = useToast()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  // Form states for profile editing
  const [name, setName] = useState(user?.name || '')
  const [departmentId, setDepartmentId] = useState(
    user?.department?._id || user?.department || ''
  )
  const [departments, setDepartments] = useState([])
  const [loadingDepts, setLoadingDepts] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [copiedId, setCopiedId] = useState(false)

  // Sync state if user updates
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setDepartmentId(user.department?._id || user.department || '')
    }
  }, [user])

  // Fetch departments list
  useEffect(() => {
    let isMounted = true
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments')
        if (isMounted && res.data?.success && res.data?.data?.departments) {
          setDepartments(res.data.data.departments.filter((d) => d.status === 'active'))
        }
      } catch (err) {
        console.error('Failed to load departments:', err)
      } finally {
        if (isMounted) setLoadingDepts(false)
      }
    }

    fetchDepartments()
    return () => {
      isMounted = false
    }
  }, [])

  const userRole = user?.role || 'employee'
  const roleLabel = ROLE_LABELS[userRole] || userRole
  const badgeVariant = ROLE_BADGE_VARIANTS[userRole] || 'neutral'

  // Resolve department name
  const departmentName = useMemo(() => {
    if (user?.department && typeof user.department === 'object' && user.department.name) {
      return user.department.name
    }
    const found = departments.find(
      (d) => d._id === (user?.department?._id || user?.department)
    )
    return found ? found.name : 'Not provided'
  }, [user, departments])

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return String(dateString)
    }
  }

  const handleOpenEdit = () => {
    setName(user?.name || '')
    setDepartmentId(user?.department?._id || user?.department || '')
    setError('')
    setFieldErrors({})
    setIsEditModalOpen(true)
  }

  const handleCloseEdit = () => {
    if (saving) return
    setIsEditModalOpen(false)
    setError('')
    setFieldErrors({})
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (!name.trim() || name.trim().length < 2) {
      setFieldErrors({ name: 'Full name must be at least 2 characters.' })
      return
    }

    setSaving(true)

    try {
      const payload = {
        name: name.trim(),
        department: departmentId || null,
      }

      const res = await api.patch(`/users/${user._id}`, payload)
      if (res.data?.success && res.data?.data?.user) {
        updateUser(res.data.data.user)
        showSuccess('Profile updated successfully!')
        setIsEditModalOpen(false)
      }
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update profile. Please try again.')
      setError(msg)
      showError(msg)
      setFieldErrors(getFieldErrors(err))
    } finally {
      setSaving(false)
    }
  }

  const handleCopyId = () => {
    if (!user?._id) return
    navigator.clipboard.writeText(user._id)
    setCopiedId(true)
    showSuccess('User identifier copied to clipboard.')
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    const label = newTheme.charAt(0).toUpperCase() + newTheme.slice(1)
    showSuccess(`${label} theme preference applied.`)
  }

  const handleSignOut = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <PageContainer
      title="Profile & Settings"
      description="Manage your identity credentials, workspace assignments, and visual preferences"
    >
      <div className="max-w-5xl space-y-6">
        {/* Header Identity Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {/* Profile Avatar (72px desktop / 64px mobile) */}
              <div className="relative">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-bold text-xl sm:text-2xl flex items-center justify-center border-2 border-primary-200/80 dark:border-primary-800/80 shrink-0 shadow-xs">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SD'}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"
                  title="Active"
                />
              </div>

              {/* Identity Details */}
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user?.name || 'Authorized User'}
                  </h1>
                  <Badge variant={badgeVariant} size="sm">
                    {roleLabel}
                  </Badge>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/80 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {user?.status || 'active'}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MailIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user?.email || 'user@servicedesk.local'}</span>
                  </span>
                  <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                  <span className="flex items-center gap-1">
                    <BuildingIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{departmentName}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action: Edit Profile */}
            <div className="shrink-0 self-start sm:self-center">
              <Button variant="neutral" size="sm" onClick={handleOpenEdit}>
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Account Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information Panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Account Information
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Your authenticated credentials, security role, and organizational assignment
                  </p>
                </div>
                <Badge variant="neutral" size="xs">
                  Read Only
                </Badge>
              </div>

              {/* Label/Value Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                {/* Full Name */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Full Name
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user?.name || 'Not provided'}
                  </p>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Email Address
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {user?.email || 'Not provided'}
                    </p>
                    {user?.isEmailVerified && (
                      <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-200/60 dark:border-emerald-800/60">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Security Role */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Security Role
                  </span>
                  <div>
                    <Badge variant={badgeVariant} size="sm">
                      {roleLabel}
                    </Badge>
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Assigned Department
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {departmentName}
                  </p>
                </div>

                {/* Account Status */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Account Status
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 capitalize">
                    {user?.status || 'active'}
                  </p>
                </div>

                {/* Member Since */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Member Since
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatDate(user?.createdAt)}
                  </p>
                </div>

                {/* Last Sign In */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Last Sign In
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatDate(user?.lastLogin)}
                  </p>
                </div>

                {/* Email Verification Status */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Email Verification
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user?.isEmailVerified ? 'Confirmed' : 'Pending verification'}
                  </p>
                </div>
              </div>

              {/* System Identifier */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      System Identifier (User ID)
                    </span>
                    <p className="font-mono text-xs text-slate-700 dark:text-slate-300 mt-0.5 select-all">
                      {user?._id || 'N/A'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    title="Copy identifier"
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {copiedId ? (
                      <CheckIcon className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <CopyIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Preferences & Actions */}
          <div className="space-y-6">
            {/* Appearance Preferences Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-2xs">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Appearance
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select your visual theme preference
                </p>
              </div>

              {/* Theme Options */}
              <div className="space-y-2">
                {/* Light */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <SunIcon className="w-4 h-4 text-amber-500" />
                    <span>Light Mode</span>
                  </span>
                  {theme === 'light' && (
                    <CheckIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  )}
                </button>

                {/* Dark */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MoonIcon className="w-4 h-4 text-primary-400" />
                    <span>Dark Mode</span>
                  </span>
                  {theme === 'dark' && (
                    <CheckIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  )}
                </button>

                {/* System */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('system')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'system'
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MonitorIcon className="w-4 h-4 text-slate-400" />
                    <span>System Default</span>
                  </span>
                  {theme === 'system' && (
                    <CheckIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Account Actions Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-2xs">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Account Actions
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Navigation shortcuts and session termination
                </p>
              </div>

              <div className="space-y-2.5">
                {/* View My Tickets */}
                <Button
                  variant="neutral"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => navigate('/tickets')}
                >
                  <span className="flex items-center gap-2">
                    <TicketIcon className="w-4 h-4 text-slate-500" />
                    <span>View My Tickets</span>
                  </span>
                  <ArrowRightIcon className="w-3.5 h-3.5 text-slate-400" />
                </Button>

                {/* Sign Out */}
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full justify-center"
                  onClick={handleSignOut}
                >
                  <LogOutIcon className="w-4 h-4 mr-1.5" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal Dialog */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseEdit}
          title="Edit Profile"
          maxWidth="max-w-md"
          actions={
            <>
              <Button
                variant="neutral"
                size="sm"
                onClick={handleCloseEdit}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                isLoading={saving}
              >
                Save Changes
              </Button>
            </>
          }
        >
          <form onSubmit={handleSave} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <div>
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
                required
                error={fieldErrors.name}
                helperText="Enter your preferred display name or legal full name"
              />
            </div>

            <div>
              <Input
                label="Email Address (Locked)"
                value={user?.email || ''}
                disabled={true}
                helperText="Email changes require security authorization from your IT Administrator."
              />
            </div>

            <div>
              <Select
                label="Assigned Department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={saving || loadingDepts}
                placeholder={loadingDepts ? 'Loading departments...' : 'No department assigned'}
                error={fieldErrors.department}
                options={departments.map((d) => ({ value: d._id, label: d.name }))}
                helperText="Used for workspace ticket routing and asset assignments"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                Security Role (Locked)
              </label>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {roleLabel}
                </span>
                <Badge variant={badgeVariant} size="xs">
                  {roleLabel}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Role privileges are authoritative and managed exclusively by System Administrators.
              </p>
            </div>
          </form>
        </Modal>
      </div>
    </PageContainer>
  )
}

export default ProfilePage
