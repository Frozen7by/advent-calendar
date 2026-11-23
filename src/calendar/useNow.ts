import { useEffect, useRef, useState } from 'react'

/**
 * The current time, re-read when the app returns to the foreground and once a
 * minute, so a door unlocks at midnight without restarting an installed app.
 */
export function useNow(getNow: () => Date): Date {
  const [now, setNow] = useState(getNow)
  const latest = useRef(getNow)

  useEffect(() => {
    latest.current = getNow
  })

  useEffect(() => {
    const refresh = () => setNow(latest.current())
    document.addEventListener('visibilitychange', refresh)
    const timer = window.setInterval(refresh, 60_000)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
      window.clearInterval(timer)
    }
  }, [])

  return now
}
