import { YrWeatherIcon } from 'react-yr-weather-icons'
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

      {/* Hourly forecast */}
      <div className="mt-4 pt-4 flex justify-between"
        style={{ borderTop: '1px solid var(--card-border)', transition: 'border-color 5s ease' }}>
        {weather.hourly.map((h, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-xs tabular-nums font-medium"
              style={{ color: 'var(--text-secondary)', transition: 'color 5s ease' }}>
              {h.time.getHours().toString().padStart(2, '0')}:00
            </span>
            <YrWeatherIcon symbolCode={h.symbolCode as AnyCode} size={28} />
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
        ))}
      </div>
    </div>
  )
}
