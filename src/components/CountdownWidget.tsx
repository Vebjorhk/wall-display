interface Props {
  label: string
  targetDate: Date
  now: number
  emoji?: string
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export function CountdownWidget({ label, targetDate, now, emoji }: Props) {
  const msLeft = targetDate.getTime() - now

  const base: React.CSSProperties = {
    background: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    transition: 'background-color 5s ease, border-color 5s ease',
  }

  if (msLeft <= 0) {
    return (
      <div className="rounded-2xl p-5" style={base}>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
          {emoji} {label}
        </p>
        <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Det er her! 🎉</p>
      </div>
    )
  }

  const days    = Math.floor(msLeft / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <div className="rounded-2xl p-6" style={base}>
      <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)', transition: 'color 5s ease' }}>
        {emoji && <span className="mr-1.5">{emoji}</span>}{label}
      </p>

      <div className="flex items-end gap-4">
        <div className="text-center">
          <div className="text-5xl font-bold tabular-nums leading-none"
            style={{ color: 'var(--text-primary)', transition: 'color 5s ease' }}>
            {days}
          </div>
          <div className="text-xs mt-1.5 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}>
            dager
          </div>
        </div>

        <div className="text-2xl font-light mb-2" style={{ color: 'var(--text-muted)' }}>:</div>
        <div className="text-center">
          <div className="text-5xl font-bold tabular-nums leading-none"
            style={{ color: 'var(--text-primary)', transition: 'color 5s ease' }}>
            {pad(hours)}
          </div>
          <div className="text-xs mt-1.5 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}>
            timer
          </div>
        </div>
        <div className="text-2xl font-light mb-2" style={{ color: 'var(--text-muted)' }}>:</div>
        <div className="text-center">
          <div className="text-5xl font-bold tabular-nums leading-none"
            style={{ color: 'var(--text-primary)', transition: 'color 5s ease' }}>
            {pad(minutes)}
          </div>
          <div className="text-xs mt-1.5 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}>
            min
          </div>
        </div>
      </div>
    </div>
  )
}
