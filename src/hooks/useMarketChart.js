import { useState, useEffect, useCallback } from 'react'
import { API, apiFetch, getBinanceSymbol } from '../api'

// Parse Binance kline: [openTime, open, high, low, close, volume, ...]
function parseBinanceKlines(klines, days) {
  return klines.map(([ts,, , , close, vol]) => ({
    ts,
    date: days <= 1
      ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    price:  parseFloat(close),
    volume: parseFloat(vol),
  }))
}

function parseCGChart(json, days) {
  return json.prices.map(([ts, price], i) => ({
    ts,
    date: days <= 1
      ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    price,
    volume: json.total_volumes[i]?.[1] ?? 0,
  }))
}

export function useMarketChart(coinId, days = 7) {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [source, setSource]       = useState(null) // 'binance' | 'coingecko'

  const fetch_ = useCallback(async () => {
    if (!coinId) { setLoading(false); return }
    setLoading(true)
    setError(null)

    const symbol = getBinanceSymbol(coinId)

    // ── Try Binance first (no rate limit) ──────────────────────────────────
    if (symbol) {
      try {
        const json = await apiFetch(API.binanceKlines(symbol, days))
        if (Array.isArray(json) && json.length > 0) {
          setChartData(parseBinanceKlines(json, days))
          setSource('binance')
          setLoading(false)
          return
        }
      } catch { /* fall through to CoinGecko */ }
    }

    // ── Fallback: CoinGecko (rate-limited, queued) ─────────────────────────
    try {
      const json = await apiFetch(API.marketChart(coinId, days))
      if (!json?.prices?.length) throw new Error('empty_response')
      setChartData(parseCGChart(json, days))
      setSource('coingecko')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [coinId, days])

  useEffect(() => { fetch_() }, [fetch_])

  return { chartData, loading, error, source, refetch: fetch_ }
}

// RSI-14
export function computeRSI(prices, period = 14) {
  if (prices.length < period + 1) return []
  const rsi = []
  let gains = 0, losses = 0
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1]
    if (diff >= 0) gains += diff; else losses -= diff
  }
  let avgGain = gains / period
  let avgLoss = losses / period
  rsi.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss))
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1]
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period
    rsi.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss))
  }
  return rsi
}

// SMA
export function computeSMA(prices, period) {
  return prices.map((_, i) =>
    i < period - 1
      ? null
      : prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
  )
}
