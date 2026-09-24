import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'
import PageContainer from '../../components/layout/PageContainer'
import { ROLE_LABELS, ROLE_BADGE_VARIANTS } from '../../constants/roles'
import { Button, Input, Select, Badge, Spinner } from '../../components/ui'
import { getErrorMessage, getFieldErrors } from '../../utils/errorHandler'

export function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { showSuccess, showError } = useToast()

  const [name, setName] = useState(user?.name || '')
  const [departmentId, setDepartmentId] = useState(
    user?.department?._id || user?.department || ''
  )
  const [departments, setDepartments] = useState([])
  const [loadingDepts, setLoadingDepts] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Sync state if user changes
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

  const handleCancel = () => {
    setName(user?.name || '')
    setDepartmentId(user?.department?._id || user?.department || '')
    setIsEditing(false)
    setError('')
    setFieldErrors({})
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (!name.trim() || name.trim().length < 2) {
      setFieldErrors({ name: 'Name must be at least 2 characters.' })
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
        setIsEditing(false)
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
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

  return (
    <PageContainer
      title="User Profile & Settings"
      description="Manage your personal details, workspace assignment, and view account permissions"
      actions={
        !isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>
              Save Changes
            </Button>
          </div>
        )
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
        {/* Left: Identity & Role Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs h-fit">
          <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center border-2 border-blue-200 mb-3 shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SD'}
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">{user?.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            <div className="mt-3">
              <Badge variant={badgeVariant} size="md">
                {roleLabel}
              </Badge>
            </div>
          </div>

          <div className="pt-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Account Status</span>
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {user?.status || 'active'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Email Verified</span>
              <span className="font-mono text-slate-700">
                {user?.isEmailVerified ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Member Since</span>
              <span className="text-slate-700">{formatDate(user?.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Last Sign In</span>
              <span className="text-slate-700">{formatDate(user?.lastLogin)}</span>
            </div>
          </div>
        </div>

        {/* Right: Editable Profile Information */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Personal Information</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditing
                  ? 'Update your name and department assignment below.'
                  : 'Your account credentials and workspace configuration.'}
              </p>
            </div>
            {!isEditing && (
              <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                Read Only
              </span>
            )}
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing || saving}
                required
                error={fieldErrors.name}
                helperText={isEditing ? 'Enter your legal full name or preferred display name' : null}
              />
            </div>

            <div>
              <Input
                label="Email Address (Locked)"
                value={user?.email || ''}
                disabled={true}
                helperText="Email changes require security verification through your IT administrator."
              />
            </div>

            <div>
              <Select
                label="Assigned Department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={!isEditing || saving || loadingDepts}
                placeholder={loadingDepts ? 'Loading departments...' : 'No department assigned'}
                error={fieldErrors.department}
                options={departments.map((d) => ({ value: d._id, label: d.name }))}
                helperText={isEditing ? 'Assign tickets and assets to this department' : null}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wide text-slate-700 uppercase mb-1.5">
                Security Role
              </label>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800">{roleLabel}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Role privileges are authoritative and managed exclusively by System Administrators.
                  </p>
                </div>
                <Badge variant={badgeVariant} size="sm">
                  LOCKED
                </Badge>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wide text-slate-700 uppercase mb-1.5">
                System Identifier
              </label>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <code className="text-xs font-mono text-slate-600 select-all">{user?._id}</code>
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </PageContainer>
  )
}

export default ProfilePage
