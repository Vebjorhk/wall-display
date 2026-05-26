const USER_AGENT = 'wall-display-homelab/1.0 github.com/homelab/wall-display'

export interface HourlyForecast {
  time: Date
  temperature: number
  symbolCode: string
  precipitation: number
}

export interface Weather {
  temperature: number
  symbolCode: string
  windSpeed: number
  windDirection: number
  precipitationNextHour: number
  hourly: HourlyForecast[]
}

type TimeseriesEntry = {
  time: string
  data: {
    instant: { details: { air_temperature: number; wind_speed: number; wind_from_direction: number } }
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
  const res = await fetch(
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
    { headers: { 'User-Agent': USER_AGENT } },
  )
  if (!res.ok) throw new Error(`MET API ${res.status}`)

  const json = await res.json() as { properties: { timeseries: TimeseriesEntry[] } }

  const [now, ...rest] = json.properties.timeseries

  const hourly: HourlyForecast[] = rest.slice(0, 6).map(entry => ({
    time: new Date(entry.time),
    temperature: entry.data.instant.details.air_temperature,
    symbolCode: symbolCode(entry),
    precipitation: entry.data.next_1_hours?.details.precipitation_amount ?? 0,
  }))

  return {
    temperature: now.data.instant.details.air_temperature,
    windSpeed: now.data.instant.details.wind_speed,
    windDirection: now.data.instant.details.wind_from_direction,
    precipitationNextHour: now.data.next_1_hours?.details.precipitation_amount ?? 0,
    symbolCode: symbolCode(now),
    hourly,
  }
}
