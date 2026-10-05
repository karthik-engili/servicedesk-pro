import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Button, Input, Label, Separator } from '../../components/ui'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { getErrorMessage } from '../../utils/errorHandler'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Shield,
  UserCheck,
  Wrench,
  User,
  Laptop,
} from 'lucide-react'

export function Login() {
  const [email, setEmail] = useState(() => localStorage.getItem('savedEmail') || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('savedEmail')))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, sessionExpiredMessage, clearSessionExpiredMessage } = useAuth()
  const { showSuccess, showWarning } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (sessionExpiredMessage) {
      showWarning(sessionExpiredMessage)
    }
  }, [sessionExpiredMessage, showWarning])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (rememberMe) {
        localStorage.setItem('savedEmail', email.trim())
      } else {
        localStorage.removeItem('savedEmail')
      }

      const user = await login(email.trim(), password)
      clearSessionExpiredMessage()
      showSuccess(`Welcome back, ${user.name}!`)
      navigate(from, { replace: true })
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Invalid email or password. Please verify your credentials and try again.'
        )
      )
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (demoEmail) => {
    setEmail(demoEmail)
    setPassword('Password@123')
    setError('')
    clearSessionExpiredMessage()
  }

  const demoAccounts = [
    { role: 'Admin', email: 'admin@servicedesk.local', icon: <Shield className="w-3.5 h-3.5 text-primary-500" /> },
    { role: 'IT Manager', email: 'manager@servicedesk.local', icon: <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> },
    { role: 'Asset Manager', email: 'assetmgr@servicedesk.local', icon: <Laptop className="w-3.5 h-3.5 text-sky-500" /> },
    { role: 'Technician', email: 'tech1@servicedesk.local', icon: <Wrench className="w-3.5 h-3.5 text-amber-500" /> },
    { role: 'Employee', email: 'employee1@servicedesk.local', icon: <User className="w-3.5 h-3.5 text-emerald-500" /> },
  ]

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your ServiceDesk Pro workspace."
    >
      {/* Session Expired Notice */}
      {sessionExpiredMessage && !error && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5 animate-in fade-in-50 duration-150"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{sessionExpiredMessage}</span>
        </div>
      )}

      {/* Login Error Alert */}
      {error && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5 animate-in fade-in-50 duration-150"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <Label htmlFor="login-email" required>
            Work Email
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. manager@servicedesk.local"
              className="block w-full rounded-lg text-sm transition-all duration-150 pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-primary-600 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="login-password" required>
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
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="block w-full rounded-lg text-sm transition-all duration-150 pl-9 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-primary-600 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {/* Remember Email */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500/20 dark:bg-slate-900 cursor-pointer"
            />
            <span>Remember work email</span>
          </label>
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
          <span>Sign in</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      {/* Quick Demo Credentials Autofill */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Quick Demo Accounts
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            Click to autofill
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {demoAccounts.slice(0, 4).map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => fillCredentials(acc.email)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-1.5">
                {acc.icon}
                <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
                  {acc.role}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {acc.email}
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => fillCredentials(demoAccounts[4].email)}
            className="col-span-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-1.5">
              {demoAccounts[4].icon}
              <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
                {demoAccounts[4].role}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
              {demoAccounts[4].email}
            </div>
          </button>
        </div>
      </div>

      {/* Switch to Registration */}
      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          Create one
        </Link>
      </div>
    </AuthLayout>
  )
}

export default Login
