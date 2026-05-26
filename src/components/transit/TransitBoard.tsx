import { useEffect, useRef, useState } from 'react'
import { MetroIcon } from '@entur/icons'
import '@entur/icons/dist/styles.css'
import { useDepartures } from '../../hooks/useDepartures.ts'
import { DepartureRow } from './DepartureRow.tsx'

interface Props {
  stopId: string
  direction: 'inbound' | 'outbound'
}

const DIRECTION_LABEL: Record<Props['direction'], string> = {
  inbound:  'Mot sentrum',
  outbound: 'Mot Sognsvann/Storo',
}

export function TransitBoard({ stopId, direction }: Props) {
  const [now, setNow] = useState(Date.now())
  const { departures, loading, error } = useDepartures(stopId)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1_000)
    return () => clearInterval(id)
  }, [])

  // IDs of departed rows whose exit animation has completed — remove them from visible
  // so the replacement entry slides into view. Using a ref + forceRender avoids stale
  // closure issues and keeps the logic outside the render path.
  const exitedIdsRef = useRef(new Set<string>())
  const [, forceRender] = useState(0)

  const onExitComplete = (id: string) => {
    exitedIdsRef.current.add(id)
    forceRender(n => n + 1)
  }

  // Prune IDs that have been cleaned out of the departures state (90s safety window).
  const knownIds = new Set(departures.map(d => d.id))
  for (const id of exitedIdsRef.current) {
    if (!knownIds.has(id)) exitedIdsRef.current.delete(id)
  }

  const hasReplacement =
    departures.filter(d => d.direction === direction && d.status === 'upcoming').length >= 10

  const visible = departures
    .filter(d => {
      if (d.direction !== direction) return false
      if (exitedIdsRef.current.has(d.id)) return false
      return true
    })
    .sort((a, b) => new Date(a.expectedDepartureTime).getTime() - new Date(b.expectedDepartureTime).getTime())
    .slice(0, 10)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        transition: 'background-color 5s ease, border-color 5s ease',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          borderBottom: '1px solid var(--card-border)',
          background: 'var(--card-header-bg)',
          transition: 'background-color 5s ease, border-color 5s ease',
        }}
      >
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{ background: '#EC700C', padding: '7px' }}
        >
          <MetroIcon
            {...({ color: 'white' } as object)}
            style={{ fontSize: '1.5rem', display: 'block' }}
          />
        </div>

        <div>
          <div
            className="font-semibold text-lg leading-tight"
            style={{ color: 'var(--text-primary)', fontFamily: "'Inter', system-ui", transition: 'color 5s ease' }}
          >
            {DIRECTION_LABEL[direction]}
          </div>
          <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)', transition: 'color 5s ease' }}>
            Blindern
          </div>
        </div>
      </div>

      {loading && (
        <div className="px-4 py-8 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          Henter avganger…
        </div>
      )}
      {error && !loading && (
        <div className="px-4 py-8 text-sm text-center text-red-400">
          Kunne ikke hente avganger — prøver igjen snart.
        </div>
      )}
      {!loading && !error && visible.length === 0 && (
        <div className="px-4 py-8 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          Ingen avganger de neste 30 minutene
        </div>
      )}

      {visible.map((departure) => (
        <DepartureRow
          key={departure.id}
          departure={departure}
          now={now}
          hasReplacement={hasReplacement}
          onExitComplete={() => onExitComplete(departure.id)}
        />
      ))}

    </div>
  )
}
