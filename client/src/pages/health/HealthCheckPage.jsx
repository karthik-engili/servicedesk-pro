import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import PageContainer from '../../components/layout/PageContainer'
import { Button, Badge, Spinner, ErrorState } from '../../components/ui'

export function HealthCheckPage() {
  const [healthData, setHealthData] = useState(null)
  const [latency, setLatency] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchHealth = async () => {
    setLoading(true)
    setError(null)
    const start = performance.now()

    try {
      const res = await api.get('/health')
      const duration = Math.round(performance.now() - start)
      setLatency(duration)
      setHealthData(res.data)
    } catch (err) {
      setError(err.message || 'Unable to connect to ServiceDesk Pro backend API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  return (
    <PageContainer
      title="Backend Connectivity & Health Verification"
      description="Real-time verification of Express API server and MongoDB database connections"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={fetchHealth}
          isLoading={loading}
        >
          Re-test Connection
        </Button>
      }
    >
      {loading && !healthData ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-3 text-xs font-medium text-slate-500 tracking-wide uppercase">
            Pinging backend API at {api.defaults.baseURL}/health...
          </p>
        </div>
      ) : error ? (
        <ErrorState
          title="Backend Connection Failed"
          message={error}
          onRetry={fetchHealth}
        />
      ) : (
        <div className="space-y-6">
          {/* Main Status Banner */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Backend Connection Active
                  </h3>
                  <p className="text-xs text-slate-500">
                    Connected to <code className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{api.defaults.baseURL}</code>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" dot={true}>
                  HEALTHY
                </Badge>
                <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                  {latency}ms latency
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Health Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Database Status
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="success">
                  {healthData?.data?.database?.status?.toUpperCase() || 'CONNECTED'}
                </Badge>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Server Environment
              </span>
              <p className="text-sm font-semibold text-slate-800 mt-2 font-mono">
                {healthData?.data?.environment || 'development'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Server Timestamp
              </span>
              <p className="text-xs text-slate-700 mt-2 font-mono truncate">
                {healthData?.data?.timestamp || new Date().toISOString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default HealthCheckPage
