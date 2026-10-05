import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'
import { Button, Label, Select } from '../../components/ui'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { getErrorMessage, getFieldErrors } from '../../utils/errorHandler'
import {
  User,
  Mail,
  Lock,
  Building2,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Check,
} from 'lucide-react'

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
          const rawDepts = res.data.data.departments || []
          // Keep active departments, filter out automated test artifacts, deduplicate by name, and sort alphabetically
          const uniqueMap = new Map()
          rawDepts
            .filter((d) => d.status === 'active')
            .filter((d) => !/\d{10,}/.test(d.name))
            .forEach((d) => {
              const cleanName = d.name.trim()
              if (!uniqueMap.has(cleanName.toLowerCase())) {
                uniqueMap.set(cleanName.toLowerCase(), d)
              }
            })

          const cleaned = Array.from(uniqueMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
          )
          setDepartments(cleaned)
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
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const isPasswordValid = formData.password.length >= 6
  const doPasswordsMatch =
    formData.password && formData.confirmPassword
      ? formData.password === formData.confirmPassword
      : false

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
    <AuthLayout
      title="Create your account"
      subtitle="Set up your account to access the ServiceDesk Pro workspace."
    >
      {/* Registration Error Banner */}
      {error && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5 animate-in fade-in-50 duration-150"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <Label htmlFor="register-name" required>
            Full Name
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <input
              id="register-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Alex Johnson"
              className={`block w-full rounded-lg text-sm transition-all duration-150 pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                fieldErrors.name
                  ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 dark:border-slate-700 focus:border-primary-600 dark:focus:border-primary-500 focus:ring-primary-500/20'
              }`}
            />
          </div>
          {fieldErrors.name && (
            <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {fieldErrors.name}
            </p>
          )}
        </div>

        {/* Work Email */}
        <div>
          <Label htmlFor="register-email" required>
            Work Email
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="register-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. alex.j@company.local"
              className={`block w-full rounded-lg text-sm transition-all duration-150 pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                fieldErrors.email
                  ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 dark:border-slate-700 focus:border-primary-600 dark:focus:border-primary-500 focus:ring-primary-500/20'
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Department (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="register-dept">
              Department <span className="text-slate-400 font-normal">(Optional)</span>
            </Label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Building2 className="w-4 h-4" />
            </div>
            <select
              id="register-dept"
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={loadingDepts}
              className="block w-full rounded-lg text-sm transition-all duration-150 pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-600 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 cursor-pointer"
            >
              <option value="">
                {loadingDepts ? 'Loading departments...' : 'Select your department'}
              </option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          {fieldErrors.department && (
            <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {fieldErrors.department}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="register-password" required>
              Password
            </Label>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium cursor-pointer transition-colors"
            >
              {showPassword ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Show</span>
                </>
              )}
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="register-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className={`block w-full rounded-lg text-sm transition-all duration-150 pl-9 pr-10 py-2.5 bg-white dark:bg-slate-900 border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                fieldErrors.password
                  ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 dark:border-slate-700 focus:border-primary-600 dark:focus:border-primary-500 focus:ring-primary-500/20'
              }`}
            />
          </div>
          {fieldErrors.password && (
            <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="register-confirm-password" required>
            Confirm Password
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className={`block w-full rounded-lg text-sm transition-all duration-150 pl-9 pr-10 py-2.5 bg-white dark:bg-slate-900 border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                formData.confirmPassword && !doPasswordsMatch
                  ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 dark:border-slate-700 focus:border-primary-600 dark:focus:border-primary-500 focus:ring-primary-500/20'
              }`}
            />
          </div>
          {formData.confirmPassword && !doPasswordsMatch && (
            <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
              Passwords do not match
            </p>
          )}
        </div>

        {/* Password Strength Checklist */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1.5">
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition-colors ${
                isPasswordValid
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}
            >
              {isPasswordValid ? <Check className="w-3 h-3 stroke-[2.5]" /> : '•'}
            </div>
            <span
              className={
                isPasswordValid
                  ? 'text-slate-800 dark:text-slate-200 font-medium'
                  : 'text-slate-500 dark:text-slate-400'
              }
            >
              Minimum 6 characters
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition-colors ${
                doPasswordsMatch
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}
            >
              {doPasswordsMatch ? <Check className="w-3 h-3 stroke-[2.5]" /> : '•'}
            </div>
            <span
              className={
                doPasswordsMatch
                  ? 'text-slate-800 dark:text-slate-200 font-medium'
                  : 'text-slate-500 dark:text-slate-400'
              }
            >
              Passwords match
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-3 h-11 font-semibold text-sm shadow-xs"
          isLoading={loading}
          disabled={loading}
        >
          <span>Create account</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      {/* Switch to Sign In */}
      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  )
}

export default Register
