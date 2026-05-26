import { useEffect, useState } from 'react'
import { fetchDepartures } from '../api/ruter.ts'
import type { Departure } from '../api/ruter.ts'

export interface DepartureWithStatus extends Departure {
  status: 'upcoming' | 'departed'
  departedAt: number | null
}

function mergeWithFresh(prev: DepartureWithStatus[], fresh: Departure[]): DepartureWithStatus[] {
  const now = Date.now()

  // Keep departed entries for 90s — display logic in TransitBoard decides when to hide them.
  const recentlyDeparted = prev.filter(
    (d) => d.status === 'departed' && d.departedAt !== null && now - d.departedAt < 90_000,
  )

  // Race guard: poll fires before the 1s tick at the exact departure second.
  // Transition these now so the API can't resurrect them as upcoming.
  const justMissed = prev
    .filter((d) => d.status === 'upcoming' && new Date(d.expectedDepartureTime).getTime() <= now)
    .map((d): DepartureWithStatus => ({ ...d, status: 'departed', departedAt: now }))

  const departedIds = new Set([
    ...recentlyDeparted.map((d) => d.id),
    ...justMissed.map((d) => d.id),
  ])

  const upcoming: DepartureWithStatus[] = fresh
    .filter((d) => !departedIds.has(d.id) && new Date(d.expectedDepartureTime).getTime() > now)
    .map((d) => ({ ...d, status: 'upcoming', departedAt: null }))

  return [...recentlyDeparted, ...justMissed, ...upcoming].sort(
    (a, b) =>
      new Date(a.expectedDepartureTime).getTime() - new Date(b.expectedDepartureTime).getTime(),
  )
}

export function useDepartures(stopId: string) {
  const [departures, setDepartures] = useState<DepartureWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // API polling — refreshes expectedDepartureTime values to capture delays
  useEffect(() => {
    let mounted = true

    const poll = async () => {
      try {
        const fresh = await fetchDepartures(stopId)
        if (mounted) {
          setDepartures((prev) => mergeWithFresh(prev, fresh))
          setLoading(false)
          setError(null)
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err : new Error(String(err)))
      }
    }

    poll()
    const id = setInterval(poll, 30_000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [stopId])

  // 1-second tick — transitions upcoming → departed, removes entries older than 30s
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      setDepartures((prev) => {
        let changed = false

        const updated = prev
          .map((d) => {
            const expected = new Date(d.expectedDepartureTime).getTime()
            if (d.status === 'upcoming' && expected <= now) {
              changed = true
              return { ...d, status: 'departed' as const, departedAt: now }
            }
            return d
          })
          .filter((d) => {
            if (d.status === 'departed' && d.departedAt !== null) {
              const keep = now - d.departedAt < 90_000
              if (!keep) changed = true
              return keep
            }
            return true
          })

        if (!changed) return prev
        return updated.sort(
          (a, b) => new Date(a.expectedDepartureTime).getTime() - new Date(b.expectedDepartureTime).getTime(),
        )
      })
    }, 1_000)

    return () => clearInterval(id)
  }, [])

  return { departures, loading, error }
}
