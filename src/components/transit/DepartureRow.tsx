import { MetroIcon } from '@entur/icons'
import '@entur/icons/dist/styles.css'
import type { DepartureWithStatus } from '../../hooks/useDepartures.ts'

interface Props {
  departure: DepartureWithStatus
  now: number
  hasReplacement: boolean
  onExitComplete: () => void
}

type Urgency = 'green' | 'yellow' | 'red' | 'gone'

const URGENCY: Record<Urgency, { bg: string; glow: string }> = {
  green:  { bg: '#22c55e', glow: 'rgba(34, 197, 94, 0.30)'  },
  yellow: { bg: '#eab308', glow: 'rgba(234, 179, 8, 0.30)'  },
  red:    { bg: '#ef4444', glow: 'rgba(239, 68, 68, 0.30)'  },
  gone:   { bg: '#4b5563', glow: 'transparent'              },
}

function getUrgency(minutesLeft: number, direction: 'inbound' | 'outbound', status: 'upcoming' | 'departed'): Urgency {
  if (status === 'departed') return 'red'
  if (direction === 'inbound') {
    if (minutesLeft > 5) return 'green'
    if (minutesLeft >= 2) return 'yellow'
    return 'red'
  }
  // outbound: mot Sognsvann/Storo
  if (minutesLeft > 3) return 'green'
  if (minutesLeft >= 2) return 'yellow'
  return 'red'
}

function formatExactTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export function DepartureRow({ departure, now, hasReplacement, onExitComplete }: Props) {
  const {
    line, lineColor, lineTextColor, destination,
    expectedDepartureTime, direction, status, departedAt,
  } = departure

  const msLeft = new Date(expectedDepartureTime).getTime() - now
  // Math.ceil so the last 0–60 seconds always display as "1 min", never "0 min".
  const minutesLeft = Math.ceil(msLeft / 60_000)

  const timeLabel =
    status === 'departed' ? 'Nå'
    : minutesLeft > 12    ? formatExactTime(expectedDepartureTime)
    : msLeft <= 0         ? 'Nå'
    :                       `${minutesLeft} min`

  const urgency = getUrgency(minutesLeft, direction, status)
  const { bg: urgencyBg, glow: urgencyGlow } = URGENCY[urgency]

  const isDeparted = status === 'departed'
  const age = isDeparted && departedAt !== null ? now - departedAt : 0

  // Phase 1 (0–10s): "Nå" at full opacity with red glow — departure is happening now.
  // Phase 2 (10s–70s, no replacement): grayed out, waiting for a replacement.
  // Phase 3 (replacement ready, or 70s timeout): exit animation plays.
  const isWaiting = isDeparted && age >= 10_000 && age < 70_000 && !hasReplacement
  const isExiting = isDeparted && age >= 10_000 && (hasReplacement || age >= 70_000)

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3.5 ${
        isWaiting ? 'opacity-35 transition-opacity' : ''
      } ${isExiting ? 'animate-row-exit' : ''}`}
      onAnimationEnd={isExiting ? (e: React.AnimationEvent<HTMLDivElement>) => {
        // Guard against child animations (e.g. pulse-glow) bubbling up.
        if (e.animationName === 'row-exit') onExitComplete()
      } : undefined}
    >
      {/* Line badge — orange pill with white T-bane logo + line number */}
      <div
        className="flex items-center gap-1.5 rounded-lg shrink-0"
        style={{
          backgroundColor: lineColor,
          height: '2.25rem',
          paddingInline: '0.5rem',
          paddingBlock: '0.375rem',
        }}
      >
        {/* MetroIcon: color="white" on orange bg → white ring + white T = T-bane logo */}
        <MetroIcon
          {...({ color: lineTextColor } as object)}
          style={{ fontSize: '1.35rem', display: 'block', flexShrink: 0 }}
        />
        <span
          className="font-bold text-base leading-none tabular-nums tracking-tight"
          style={{ color: lineTextColor, fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          {line}
        </span>
      </div>

      {/* Destination */}
      <div className="flex-1 min-w-0">
        <span className="text-lg font-medium truncate block" style={{ color: 'var(--text-primary)', transition: 'color 5s ease' }}>
          {destination}
        </span>
      </div>

      {/* Time */}
      <div className="shrink-0 min-w-[4rem] text-right">
        <span
          className="font-semibold text-lg tabular-nums"
          style={{ color: isWaiting ? 'var(--text-secondary)' : 'var(--text-primary)', transition: 'color 5s ease' }}
        >
          {timeLabel}
        </span>
      </div>

      {/* Urgency pulse */}
      <div className="shrink-0 w-4 flex items-center justify-center">
        <div
          className={`w-3 h-3 rounded-full ${urgency !== 'gone' ? 'animate-pulse-glow' : ''}`}
          style={{
            backgroundColor: urgencyBg,
            '--glow-color': urgencyGlow,
          } as React.CSSProperties}
        />
      </div>
    </div>
  )
}
