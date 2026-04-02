import { useState, useEffect } from 'react'
import { API, apiFetch } from '../api'

export function useTrending() {
  const [trending, setTrending] = useState([])

  useEffect(() => {
    // Delay 3s — well after the main useCrypto sequential fetches finish
    const t = setTimeout(() => {
      apiFetch(API.trending)
        .then((d) => setTrending(d.coins?.slice(0, 7).map((c) => c.item) ?? []))
        .catch(() => {})
    }, 3000)
    return () => clearTimeout(t)
  }, [])

  return trending
}

export function useGlobalChart(days = 30) {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setData([])

    // Delay 4s so it doesn't compete with markets + global fetches on mount
    const t = setTimeout(async () => {
      try {
        const json = await apiFetch(API.marketChart('bitcoin', days))
        if (cancelled) return
        if (!json?.prices?.length) throw new Error('empty')
        setData(
          json.prices.map(([ts, price], i) => ({
            date: new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            btc: price,
            vol: json.total_volumes[i]?.[1] ?? 0,
          }))
        )
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 4000)

    return () => { cancelled = true; clearTimeout(t) }
  }, [days])

  return { data, loading, error }
}
