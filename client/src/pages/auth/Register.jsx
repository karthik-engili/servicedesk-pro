import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'
import { Button, Input, Select } from '../../components/ui'
import { getErrorMessage, getFieldErrors } from '../../utils/errorHandler'

export function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    password: '',
    confirmPassword: '',
  })
  const [departments, setDepartments] = useState([])
  const [loadingDepts, setLoadingDepts] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const { showSuccess } = useToast()
  const navigate = useNavigate()

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear specific field error
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const isPasswordValid = formData.password.length >= 6
  const doPasswordsMatch =
    formData.password && formData.confirmPassword
      ? formData.password === formData.confirmPassword
      : true

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (formData.name.trim().length < 2) {
      setFieldErrors((prev) => ({ ...prev, name: 'Name must be at least 2 characters.' }))
      return
    }

    if (formData.password.length < 6) {
      setFieldErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters.' }))
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }))
      return
    }

    setLoading(true)

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      }
      if (formData.department) {
        payload.department = formData.department
      }

      const user = await register(payload)
      showSuccess(`Account created successfully! Welcome, ${user.name}.`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Registration failed. Please check your information and try again.'
        )
      )
      setFieldErrors(getFieldErrors(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            SD
          </div>
        </div>
        <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Create an Employee Account
        </h1>
        <p className="mt-1 text-center text-xs text-slate-500">
          Register to submit helpdesk tickets and access corporate IT resources
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-8">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              type="text"
              required
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              error={fieldErrors.name}
              placeholder="e.g. Alex Johnson"
            />

            <Input
              label="Work Email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={fieldErrors.email}
              placeholder="e.g. alex.j@company.local"
            />

            <Select
              label="Department (Optional)"
              name="department"
              value={formData.department}
              onChange={handleChange}
              error={fieldErrors.department}
              placeholder={loadingDepts ? 'Loading departments...' : 'Select your department'}
              disabled={loadingDepts}
              options={departments.map((d) => ({ value: d._id, label: d.name }))}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold tracking-wide text-slate-700 uppercase">
                  Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative rounded-lg shadow-2xs">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className={`block w-full rounded-lg text-sm border px-3.5 py-2 text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                    fieldErrors.password
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-rose-600">{fieldErrors.password}</p>
              )}
            </div>

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={
                !doPasswordsMatch && formData.confirmPassword
                  ? 'Passwords do not match'
                  : fieldErrors.confirmPassword
              }
              placeholder="Re-enter password"
            />

            {/* Password Requirements Checklist */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className={isPasswordValid ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                  {isPasswordValid ? '✓' : '○'}
                </span>
                <span>Minimum 6 characters</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span
                  className={
                    formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'text-emerald-600 font-bold'
                      : 'text-slate-400'
                  }
                >
                  {formData.confirmPassword && formData.password === formData.confirmPassword
                    ? '✓'
                    : '○'}
                </span>
                <span>Passwords match</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={loading}
            >
              Complete Registration
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
