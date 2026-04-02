import { useState, useEffect, useRef, useCallback } from 'react'
import { API, apiFetch } from '../api'

const POLL_MS = 60_000

export function useCrypto() {
  const [coins, setCoins]           = useState([])
  const [globalData, setGlobalData] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [flashMap, setFlashMap]     = useState({})
  const [nextRefresh, setNextRefresh] = useState(0)
  const prevPrices  = useRef({})
  const countdownRef = useRef(null)
  const mountedRef   = useRef(true)

  useEffect(() => () => { mountedRef.current = false }, [])

  const startCountdown = useCallback(() => {
    clearInterval(countdownRef.current)
    setNextRefresh(POLL_MS / 1000)
    countdownRef.current = setInterval(() => {
      setNextRefresh((n) => {
        if (n <= 1) { clearInterval(countdownRef.current); return 0 }
        return n - 1
      })
    }, 1000)
  }, [])

  const fetchCoins = useCallback(async (force = false) => {
    if (!mountedRef.current) return
    setLoading(true)

    try {
      // Sequential — avoids firing 2 requests simultaneously on first load
      const coinsData  = await apiFetch(API.markets, { forceRefresh: force })
      const globalJson = await apiFetch(API.global,  { forceRefresh: force })

      if (!mountedRef.current) return

      // Flash detection
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
      if (!mountedRef.current) return
      // Keep existing coins visible — only surface error when truly empty
      setError(err.message)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
        startCountdown()
      }
    }
  }, [startCountdown])

  useEffect(() => {
    fetchCoins()
    const interval = setInterval(() => fetchCoins(true), POLL_MS)
    return () => {
      clearInterval(interval)
      clearInterval(countdownRef.current)
    }
  }, [fetchCoins])

  const refetch = useCallback(() => {
    clearInterval(countdownRef.current)
    setNextRefresh(0)
    fetchCoins(true)
  }, [fetchCoins])

  return { coins, globalData, loading, error, flashMap, refetch, nextRefresh }
}
