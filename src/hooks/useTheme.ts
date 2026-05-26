import { useEffect, useState } from 'react'
import { fetchSunTimes } from '../api/sun.ts'

export type Theme = 'light' | 'dark'

// Rough initial guess so the page never starts in the wrong theme
function guessTheme(): Theme {
  const h = new Date().getHours()
  return h >= 6 && h < 22 ? 'light' : 'dark'
}

export function useTheme(lat: number, lon: number): Theme {
  const [theme, setTheme] = useState<Theme>(guessTheme)

  useEffect(() => {
    let mounted = true

    const update = async () => {
      try {
        const { sunrise, sunset } = await fetchSunTimes(lat, lon)
        const now = Date.now()
        if (mounted) {
          setTheme(now >= sunrise.getTime() && now < sunset.getTime() ? 'light' : 'dark')
        }
      } catch {
        // keep current theme on error
      }
    }

    update()
    const id = setInterval(update, 60_000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [lat, lon])

  return theme
}
