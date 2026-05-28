import { fetchSunTimes } from './sun.ts'

const USER_AGENT = 'wall-display-homelab/1.0 github.com/homelab/wall-display'

export interface HourlyForecast {
  time: Date
  temperature: number
  symbolCode: string
  precipitation: number
  uvIndex: number | null
}

export interface Weather {
  temperature: number
  symbolCode: string
  windSpeed: number
  windDirection: number
  precipitationNextHour: number
  uvIndex: number | null
  sunrise: Date | null
  sunset: Date | null
  hourly: HourlyForecast[]
}

type TimeseriesEntry = {
  time: string
  data: {
    instant: { details: { air_temperature: number; wind_speed: number; wind_from_direction: number; ultraviolet_index_clear_sky?: number } }
    next_1_hours?: { summary: { symbol_code: string }; details: { precipitation_amount: number } }
    next_6_hours?: { summary: { symbol_code: string } }
  }
}

function symbolCode(entry: TimeseriesEntry): string {
  return (
    entry.data.next_1_hours?.summary.symbol_code ??
    entry.data.next_6_hours?.summary.symbol_code ??
    'cloudy'
  )
}

export async function fetchWeather(lat: number, lon: number): Promise<Weather> {
  const [weatherRes, sunTimes] = await Promise.all([
    fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${lat}&lon=${lon}`,
      { headers: { 'User-Agent': USER_AGENT } },
    ),
    fetchSunTimes(lat, lon).catch(() => null),
  ])

  if (!weatherRes.ok) throw new Error(`MET API ${weatherRes.status}`)

  const json = await weatherRes.json() as { properties: { timeseries: TimeseriesEntry[] } }

  const [now, ...rest] = json.properties.timeseries

  const hourly: HourlyForecast[] = rest.slice(0, 6).map(entry => ({
    time: new Date(entry.time),
    temperature: entry.data.instant.details.air_temperature,
    symbolCode: symbolCode(entry),
    precipitation: entry.data.next_1_hours?.details.precipitation_amount ?? 0,
    uvIndex: entry.data.instant.details.ultraviolet_index_clear_sky ?? null,
  }))

  const uvIndex = now.data.instant.details.ultraviolet_index_clear_sky ?? null

  return {
    temperature: now.data.instant.details.air_temperature,
    windSpeed: now.data.instant.details.wind_speed,
    windDirection: now.data.instant.details.wind_from_direction,
    precipitationNextHour: now.data.next_1_hours?.details.precipitation_amount ?? 0,
    symbolCode: symbolCode(now),
    uvIndex,
    sunrise: sunTimes?.sunrise ?? null,
    sunset: sunTimes?.sunset ?? null,
    hourly,
  }
}
