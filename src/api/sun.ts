const USER_AGENT = 'wall-display-homelab/1.0 github.com/homelab/wall-display'

export interface SunTimes {
  sunrise: Date
  sunset: Date
}

export async function fetchSunTimes(lat: number, lon: number): Promise<SunTimes> {
  const res = await fetch(
    `https://api.met.no/weatherapi/sunrise/3.0/sun?lat=${lat}&lon=${lon}`,
    { headers: { 'User-Agent': USER_AGENT } },
  )
  if (!res.ok) throw new Error(`Sunrise API ${res.status}`)

  const json = await res.json() as {
    properties: {
      sunrise: { time: string }
      sunset: { time: string }
    }
  }

  return {
    sunrise: new Date(json.properties.sunrise.time),
    sunset: new Date(json.properties.sunset.time),
  }
}
