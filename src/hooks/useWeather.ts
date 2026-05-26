import { useEffect, useState } from 'react'
import { fetchWeather } from '../api/yr.ts'
import type { Weather } from '../api/yr.ts'

export function useWeather(lat: number, lon: number) {
  const [weather, setWeather] = useState<Weather | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    const poll = async () => {
      try {
        const data = await fetchWeather(lat, lon)
        if (mounted) { setWeather(data); setError(null) }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err : new Error(String(err)))
      }
    }

    poll()
    const id = setInterval(poll, 2 * 60_000) // every 2 minutes
    return () => { mounted = false; clearInterval(id) }
  }, [lat, lon])

  return { weather, error }
}
