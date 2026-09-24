import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Button, Input } from '../../components/ui'
import { getErrorMessage } from '../../utils/errorHandler'

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

  return (
    <div className="min-h-screen flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            SD
          </div>
        </div>
        <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to ServiceDesk Pro
        </h1>
        <p className="mt-1 text-center text-xs text-slate-500">
          Enterprise IT Service Desk & Asset Lifecycle Platform
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-8">
          {sessionExpiredMessage && !error && (
            <div className="mb-5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{sessionExpiredMessage}</span>
            </div>
          )}

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
              label="Work Email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. manager@servicedesk.local"
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
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full rounded-lg text-sm border border-slate-300 px-3.5 py-2 text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember email</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Quick Demo Accounts (Click to Autofill)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials('admin@servicedesk.local')}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-left cursor-pointer transition-colors"
              >
                <div className="font-semibold text-slate-800">Admin</div>
                <div className="text-[10px] text-slate-500 truncate">admin@servicedesk.local</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('manager@servicedesk.local')}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-left cursor-pointer transition-colors"
              >
                <div className="font-semibold text-slate-800">IT Manager</div>
                <div className="text-[10px] text-slate-500 truncate">manager@servicedesk.local</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('assetmgr@servicedesk.local')}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-left cursor-pointer transition-colors"
              >
                <div className="font-semibold text-slate-800">Asset Manager</div>
                <div className="text-[10px] text-slate-500 truncate">assetmgr@servicedesk.local</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('tech1@servicedesk.local')}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-left cursor-pointer transition-colors"
              >
                <div className="font-semibold text-slate-800">Technician</div>
                <div className="text-[10px] text-slate-500 truncate">tech1@servicedesk.local</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('employee1@servicedesk.local')}
                className="col-span-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-left cursor-pointer transition-colors"
              >
                <div className="font-semibold text-slate-800">Employee</div>
                <div className="text-[10px] text-slate-500 truncate">employee1@servicedesk.local</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Need an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
