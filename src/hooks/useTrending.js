import { useState, useEffect } from 'react'
import { API, apiFetch } from '../api'

export function useTrending() {
  const [trending, setTrending] = useState([])

  useEffect(() => {
    // Delay by 1.5s so it doesn't compete with the main useCrypto fetch on mount
    const t = setTimeout(() => {
      apiFetch(API.trending)
        .then((d) => setTrending(d.coins?.slice(0, 7).map((c) => c.item) ?? []))
        .catch(() => {})
    }, 1500)
    return () => clearTimeout(t)
  }, [])

  return trending
}

export function useGlobalChart(days = 30) {
  const [data, setData] = useState([])

  useEffect(() => {
    // Delay by 2s to stagger away from mount burst
    const t = setTimeout(() => {
      apiFetch(API.marketChart('bitcoin', days))
        .then((json) => {
          setData(
            (json.prices ?? []).map(([ts, price], i) => ({
              date: new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' }),
              btc: price,
              vol: json.total_volumes[i]?.[1] ?? 0,
            }))
          )
        })
        .catch(() => {})
    }, 2000)
    return () => clearTimeout(t)
  }, [days])

  return data
}
