import { useState, useEffect } from 'react'
import { API, apiFetch } from '../api'

export function useTrending() {
  const [trending, setTrending] = useState([])

  useEffect(() => {
    // Delay 5s — after all critical fetches complete
    const t = setTimeout(() => {
      apiFetch(API.trending)
        .then(d => setTrending(d.coins?.slice(0, 7).map(c => c.item) ?? []))
        .catch(() => {})
    }, 5000)
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

    // Use Binance BTCUSDT klines — no rate limit, instant response
    const url = API.binanceKlines('BTCUSDT', days)

    apiFetch(url)
      .then(json => {
        if (cancelled) return
        if (!Array.isArray(json) || !json.length) throw new Error('empty')
        setData(
          json.map(([ts,,,, close, vol]) => ({
            date: new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            btc:  parseFloat(close),
            vol:  parseFloat(vol),
          }))
        )
      })
      .catch(e => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [days])

  return { data, loading, error }
}
