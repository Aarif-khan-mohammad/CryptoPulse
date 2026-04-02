import { useState, useEffect, useRef, useCallback } from 'react'
import { API, apiFetch } from '../api'

const POLL_MS = 60_000 // 60s — stays well within free tier limits

export function useCrypto() {
  const [coins, setCoins] = useState([])
  const [globalData, setGlobalData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [flashMap, setFlashMap] = useState({})
  const [nextRefresh, setNextRefresh] = useState(0) // countdown seconds
  const prevPrices = useRef({})
  const timerRef = useRef(null)

  const startCountdown = useCallback(() => {
    setNextRefresh(POLL_MS / 1000)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setNextRefresh((n) => {
        if (n <= 1) { clearInterval(timerRef.current); return 0 }
        return n - 1
      })
    }, 1000)
  }, [])

  const fetchCoins = useCallback(async (force = false) => {
    try {
      // Stagger global fetch by 800ms to avoid simultaneous requests
      const coinsData = await apiFetch(API.markets, { forceRefresh: force })
      const globalJson = await apiFetch(API.global, { forceRefresh: force })

      const newFlash = {}
      coinsData.forEach((coin) => {
        const prev = prevPrices.current[coin.id]
        if (prev !== undefined && prev !== coin.current_price) {
          newFlash[coin.id] = coin.current_price > prev ? 'green' : 'red'
        }
        prevPrices.current[coin.id] = coin.current_price
      })

      if (Object.keys(newFlash).length) {
        setFlashMap(newFlash)
        setTimeout(() => setFlashMap({}), 800)
      }

      setCoins(coinsData)
      setGlobalData(globalJson.data)
      setError(null)
    } catch (err) {
      // Only show error if we have no data at all
      setError(err.message)
    } finally {
      setLoading(false)
      startCountdown()
    }
  }, [startCountdown])

  useEffect(() => {
    fetchCoins()
    const interval = setInterval(() => fetchCoins(true), POLL_MS)
    return () => {
      clearInterval(interval)
      clearInterval(timerRef.current)
    }
  }, [fetchCoins])

  const refetch = useCallback(() => {
    clearInterval(timerRef.current)
    fetchCoins(true)
  }, [fetchCoins])

  return { coins, globalData, loading, error, flashMap, refetch, nextRefresh }
}
