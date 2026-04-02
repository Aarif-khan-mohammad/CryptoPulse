import { useState, useEffect } from 'react'
import { API, apiFetch } from '../api'

export function useFearGreed() {
  const [data, setData] = useState(null)

  useEffect(() => {
    apiFetch(API.fearGreed)
      .then((json) => setData(json.data?.[0]))
      .catch(() => setData({ value: '52', value_classification: 'Neutral' }))
  }, [])

  return data
}
