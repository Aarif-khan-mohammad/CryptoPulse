import { useState, useEffect, useRef } from 'react'

export function useAlerts(coins) {
  const [alerts, setAlerts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cp_alerts') || '{}')
    } catch {
      return {}
    }
  })
  const [starred, setStarred] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cp_starred') || '[]')
    } catch {
      return []
    }
  })
  const triggered = useRef(new Set())

  useEffect(() => {
    localStorage.setItem('cp_alerts', JSON.stringify(alerts))
  }, [alerts])

  useEffect(() => {
    localStorage.setItem('cp_starred', JSON.stringify(starred))
  }, [starred])

  useEffect(() => {
    if (!coins.length) return
    coins.forEach((coin) => {
      const alert = alerts[coin.id]
      if (!alert) return
      const key = `${coin.id}-${alert}`
      if (triggered.current.has(key)) return
      const price = coin.current_price
      if (price >= alert) {
        triggered.current.add(key)
        if (Notification.permission === 'granted') {
          new Notification(`🚀 ${coin.name} hit $${alert.toLocaleString()}!`, {
            body: `Current price: $${price.toLocaleString()}`,
            icon: coin.image,
          })
        }
      }
    })
  }, [coins, alerts])

  const requestPermission = () => Notification.requestPermission()

  const setAlert = (coinId, price) => {
    triggered.current.delete(`${coinId}-${alerts[coinId]}`)
    setAlerts((prev) => ({ ...prev, [coinId]: Number(price) }))
  }

  const removeAlert = (coinId) => {
    setAlerts((prev) => {
      const next = { ...prev }
      delete next[coinId]
      return next
    })
  }

  const toggleStar = (coinId) => {
    setStarred((prev) =>
      prev.includes(coinId) ? prev.filter((id) => id !== coinId) : [...prev, coinId]
    )
  }

  return { alerts, starred, setAlert, removeAlert, toggleStar, requestPermission }
}
