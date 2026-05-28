import { useEffect, useState } from 'react'
import { fetchSystemMetrics } from '../api/monitoring.ts'
import type { SystemMetrics } from '../api/monitoring.ts'

export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    const poll = async () => {
      try {
        const data = await fetchSystemMetrics()
        if (mounted) { setMetrics(data); setError(null) }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err : new Error(String(err)))
      }
    }

    poll()
    const id = setInterval(poll, 5_000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  return { metrics, error }
}
