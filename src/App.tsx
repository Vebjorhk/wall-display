import { useEffect, useState } from 'react'
import { TransitBoard } from './components/transit/TransitBoard.tsx'
import { WeatherWidget } from './components/weather/WeatherWidget.tsx'
import { CountdownWidget } from './components/CountdownWidget.tsx'
import { useTheme } from './hooks/useTheme.ts'

const BLINDERN_STOP_ID = 'NSR:StopPlace:6332'
const LAT = 59.940
const LON = 10.716

const GTA6  = new Date(2026, 10, 19) // Nov 19 local midnight
const HYTTE = new Date(2026, 5,  24) // Jun 24 local midnight

const URGENCY_LEGEND = [
  { color: '#22c55e', label: 'God tid' },
  { color: '#eab308', label: 'Løp!' },
  { color: '#ef4444', label: 'Rekker det neppe' },
]

function DigitalClock({ now }: { now: number }) {
  const d = new Date(now)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  const s = d.getSeconds().toString().padStart(2, '0')
  const weekday = d.toLocaleDateString('no-NO', { weekday: 'long' })
  const dayMonth = d.toLocaleDateString('no-NO', { day: 'numeric', month: 'long' })

  return (
    <div className="flex flex-col items-start" style={{ gap: '0.3rem' }}>
      <div className="flex items-baseline tabular-nums" style={{ lineHeight: 1 }}>
        <span
          style={{
            fontSize: '7.5rem',
            fontWeight: 200,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            transition: 'color 5s ease',
          }}
        >
          {h}:{m}
        </span>
        <span
          style={{
            fontSize: '3.5rem',
            fontWeight: 200,
            letterSpacing: '-0.02em',
            color: 'var(--text-muted)',
            transition: 'color 5s ease',
            marginLeft: '3px',
          }}
        >
          :{s}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="capitalize"
          style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)', transition: 'color 5s ease' }}
        >
          {weekday}
        </span>
        <span style={{ fontSize: '1.35rem', fontWeight: 400, color: 'var(--text-secondary)', transition: 'color 5s ease' }}>
          {dayMonth}
        </span>
      </div>
    </div>
  )
}

export default function App() {
  const theme = useTheme(LAT, LON)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="h-screen overflow-hidden"
      style={{
        background: 'var(--app-bg)',
        fontFamily: "'Inter', system-ui, sans-serif",
        cursor: 'none',
        transition: 'background-color 5s ease',
      }}
    >
      {/* Two columns: transit section | info panel */}
      <div className="grid h-full gap-6 p-8" style={{ gridTemplateColumns: '1fr 700px' }}>

        {/* ── Left — both transit boards + shared legend ── */}
        <div className="flex flex-col gap-3">
          <div className="grid items-start gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <TransitBoard stopId={BLINDERN_STOP_ID} direction="inbound" />
            <TransitBoard stopId={BLINDERN_STOP_ID} direction="outbound" />
          </div>
          <div className="flex items-center gap-6 px-1">
            {URGENCY_LEGEND.map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)', transition: 'color 5s ease' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right — Weather, countdowns, clock ── */}
        <div className="flex flex-col gap-5 h-full">
          <WeatherWidget lat={LAT} lon={LON} locationName="Oslo / Blindern" />
          <div className="grid grid-cols-2 gap-5">
            <CountdownWidget label="GTA VI"     targetDate={GTA6}  now={now} emoji="🎮" />
            <CountdownWidget label="Hytteturen" targetDate={HYTTE} now={now} emoji="🏕️" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <DigitalClock now={now} />
          </div>
        </div>

      </div>
    </div>
  )
}
