import { useEffect, useState } from 'react'
import { fetchMinecraftStatus } from '../api/monitoring.ts'
import type { MinecraftStatus } from '../api/monitoring.ts'

export function useMinecraftStatus() {
  const [status, setStatus] = useState<MinecraftStatus | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    const poll = async () => {
      try {
        const data = await fetchMinecraftStatus()
        if (mounted) { setStatus(data); setError(null) }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err : new Error(String(err)))
      }
    }

    poll()
    const id = setInterval(poll, 10_000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  return { status, error }
}
