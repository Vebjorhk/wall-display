import { YrWeatherIcon } from 'react-yr-weather-icons'
import { Sunrise, Sunset } from 'lucide-react'
import { useWeather } from '../../hooks/useWeather.ts'

interface Props {
  lat: number
  lon: number
  locationName: string
}

function windLabel(speed: number): string {
  if (speed < 0.5) return 'Stille'
  if (speed < 3.3) return 'Svak vind'
  if (speed < 5.5) return 'Lett bris'
  if (speed < 7.9) return 'Laber bris'
  if (speed < 13.8) return 'Frisk bris'
  return 'Stiv kuling'
}

const UV_SCALE = [
  { range: '0–2',  label: 'Lav',       description: 'Ingen beskyttelse nødvendig', color: 'var(--uv-low)',      max: 2  },
  { range: '3–5',  label: 'Moderat',   description: 'Solbeskyttelse anbefalt',     color: 'var(--uv-moderate)', max: 5  },
  { range: '6–7',  label: 'Høy',       description: 'Solbeskyttelse nødvendig',    color: 'var(--uv-high)',     max: 7  },
  { range: '8–10', label: 'Svært høy', description: 'Ekstra beskyttelse',          color: 'var(--uv-veryhigh)', max: 10 },
  { range: '11+',  label: 'Ekstrem',   description: 'Maks beskyttelse',            color: 'var(--uv-extreme)',  max: Infinity },
]

function uvInfo(index: number) {
  return UV_SCALE.find(s => index <= s.max) ?? UV_SCALE[UV_SCALE.length - 1]
}

function fmt(d: Date) {
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyCode = any

export function WeatherWidget({ lat, lon, locationName }: Props) {
  const { weather, error } = useWeather(lat, lon)

  const base: React.CSSProperties = {
    background: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    transition: 'background-color 5s ease, border-color 5s ease',
  }

  if (error || !weather) {
    return (
      <div className="rounded-2xl px-6 py-6" style={base}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {error ? 'Kunne ikke hente vær.' : 'Henter vær…'}
        </p>
      </div>
    )
  }

  const temp = Math.round(weather.temperature)
  const conditionRaw = weather.symbolCode
    .replace(/_day$|_night$|_polartwilight$/, '')
    .replace(/_/g, ' ')
  const condition = conditionRaw.charAt(0).toUpperCase() + conditionRaw.slice(1)

  return (
    <div className="rounded-2xl px-6 py-6" style={base}>
      <p className="text-xs font-medium mb-3 uppercase tracking-wide"
        style={{ color: 'var(--text-secondary)', transition: 'color 5s ease' }}>
        {locationName}
      </p>

      <div className="flex items-start gap-6 mb-3">
        {/* Current conditions */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <YrWeatherIcon symbolCode={weather.symbolCode as AnyCode} size={64} />
            <span className="text-6xl font-thin tabular-nums leading-none"
              style={{ color: 'var(--text-primary)', transition: 'color 5s ease' }}>
              {temp}°
            </span>
          </div>
          <p className="text-base font-medium"
            style={{ color: 'var(--text-primary)', transition: 'color 5s ease' }}>
            {condition}
          </p>
          <p className="text-sm mt-0.5"
            style={{ color: 'var(--text-secondary)', transition: 'color 5s ease' }}>
            {windLabel(weather.windSpeed)} · {Math.round(weather.windSpeed)} m/s
            {weather.precipitationNextHour > 0 && ` · ${weather.precipitationNextHour.toFixed(1)} mm/t`}
          </p>
        </div>

        {/* Sunrise / sunset — centred between conditions and UV */}
        {(weather.sunrise || weather.sunset) && (
          <div className="flex flex-col items-center gap-4">
            {weather.sunrise && (
              <div className="flex flex-col items-center gap-1"
                style={{ color: 'var(--text-secondary)', transition: 'color 5s ease' }}>
                <Sunrise size={32} />
                <span className="text-xs font-medium uppercase tracking-wide">Soloppgang</span>
                <span className="text-sm tabular-nums font-semibold"
                  style={{ color: 'var(--text-primary)', transition: 'color 5s ease' }}>
                  {fmt(weather.sunrise)}
                </span>
              </div>
            )}
            {weather.sunset && (
              <div className="flex flex-col items-center gap-1"
                style={{ color: 'var(--text-secondary)', transition: 'color 5s ease' }}>
                <Sunset size={32} />
                <span className="text-xs font-medium uppercase tracking-wide">Solnedgang</span>
                <span className="text-sm tabular-nums font-semibold"
                  style={{ color: 'var(--text-primary)', transition: 'color 5s ease' }}>
                  {fmt(weather.sunset)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* UV index */}
        {weather.uvIndex !== null && (() => {
          const uv = uvInfo(Math.round(weather.uvIndex))
          return (
            <div className="flex flex-col items-center gap-1.5 min-w-[110px]">
              <span className="text-sm font-medium uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}>
                UV-indeks
              </span>
              <span className="text-5xl font-bold tabular-nums leading-none" style={{ color: uv.color }}>
                {Math.round(weather.uvIndex)}
              </span>
              <span className="text-base font-semibold"
                style={{ color: uv.color, transition: 'color 5s ease' }}>
                {uv.label}
              </span>
              <span className="text-sm text-center leading-tight"
                style={{ color: 'var(--text-secondary)', transition: 'color 5s ease' }}>
                {uv.description}
              </span>
              <div className="flex gap-1 mt-2">
                {UV_SCALE.map(s => (
                  <div key={s.range} className="flex flex-col items-center gap-0.5">
                    <div className="h-2 w-7 rounded-sm" style={{ background: s.color }} />
                    <span className="text-[10px] tabular-nums" style={{ color: s.color }}>
                      {s.range}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Hourly forecast */}
      <div className="mt-4 pt-4 flex justify-between"
        style={{ borderTop: '1px solid var(--card-border)', transition: 'border-color 5s ease' }}>
        {weather.hourly.map((h, i) => {
          const hourUv = h.uvIndex !== null && h.uvIndex > 0 ? uvInfo(Math.round(h.uvIndex)) : null
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-xs tabular-nums font-medium"
                style={{ color: 'var(--text-secondary)', transition: 'color 5s ease' }}>
                {h.time.getHours().toString().padStart(2, '00')}:00
              </span>
              <div className="flex items-center gap-1">
                <YrWeatherIcon symbolCode={h.symbolCode as AnyCode} size={28} />
                {hourUv && (
                  <span className="text-xs font-bold tabular-nums" style={{ color: hourUv.color }}>
                    {Math.round(h.uvIndex!)}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold tabular-nums leading-none"
                style={{ color: 'var(--text-primary)', transition: 'color 5s ease' }}>
                {Math.round(h.temperature)}°
              </span>
              {h.precipitation > 0 && (
                <span className="text-xs tabular-nums"
                  style={{ color: 'var(--text-muted)', transition: 'color 5s ease' }}>
                  {h.precipitation.toFixed(1)}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
