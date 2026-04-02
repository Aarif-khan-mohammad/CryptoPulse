// All API calls go through Vercel serverless proxy functions (/api/coingecko/proxy, /api/feargreed/proxy)
// The actual upstream URLs never appear in the browser JS bundle or network tab destination

const CG = '/api/coingecko/proxy?p='
const FG = '/api/feargreed/proxy?p='

// CoinGecko upstream paths
const CG_BASE = '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d'
const CG_GLOBAL = '/global'
const CG_TRENDING = '/search/trending'

export const API = {
  markets:     `${CG}${encodeURIComponent(CG_BASE)}`,
  global:      `${CG}${encodeURIComponent(CG_GLOBAL)}`,
  trending:    `${CG}${encodeURIComponent(CG_TRENDING)}`,
  marketChart: (id, days) =>
    `${CG}${encodeURIComponent(`/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? 'hourly' : 'daily'}`)}`,
  fearGreed:   `${FG}${encodeURIComponent('/fng/?limit=1')}`,
}

// ─── TTL per endpoint ─────────────────────────────────────────────────────────
function getTTL(url) {
  if (url.includes('markets'))       return 60_000
  if (url.includes('global'))        return 120_000
  if (url.includes('trending'))      return 300_000
  if (url.includes('fng'))           return 600_000
  if (url.includes('market_chart'))  return 300_000
  return 60_000
}

// ─── Safe djb2 cache key ──────────────────────────────────────────────────────
function makeKey(url, prefix = 'cp') {
  let h = 5381
  for (let i = 0; i < url.length; i++) h = ((h << 5) + h) ^ url.charCodeAt(i)
  return `${prefix}_${(h >>> 0).toString(36)}`
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
function lsGet(key) {
  try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
}

function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('cp_') || k.startsWith('cs_'))
        .forEach((k) => localStorage.removeItem(k))
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }
}

function cacheGet(url) {
  const entry = lsGet(makeKey(url, 'cp'))
  if (!entry) return null
  if (Date.now() - entry.ts < getTTL(url)) return entry.data
  return null
}

function staleGet(url) {
  const entry = lsGet(makeKey(url, 'cs'))
  return entry ? entry.data : null
}

function cacheSet(url, data) {
  const payload = { ts: Date.now(), data }
  lsSet(makeKey(url, 'cp'), payload)
  lsSet(makeKey(url, 'cs'), payload)
}

// ─── In-flight deduplication ──────────────────────────────────────────────────
const inFlight = new Map()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ─── Core fetch ───────────────────────────────────────────────────────────────
export async function apiFetch(url, { forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const hit = cacheGet(url)
    if (hit) return hit
  }

  if (inFlight.has(url)) return inFlight.get(url)

  const promise = (async () => {
    let lastErr = null

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) await sleep(2000 * attempt)

        const res = await fetch(url, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(12000),
        })

        if (res.status === 429) {
          lastErr = new Error('rate_limited')
          const stale = staleGet(url)
          if (stale) return stale
          await sleep(3000 * (attempt + 1))
          continue
        }

        if (!res.ok) {
          lastErr = new Error(`http_${res.status}`)
          continue
        }

        const data = await res.json()
        cacheSet(url, data)
        return data

      } catch (e) {
        lastErr = e
        if (e.name === 'AbortError' || e.name === 'TimeoutError') break
      }
    }

    const stale = staleGet(url)
    if (stale) return stale

    throw lastErr ?? new Error('fetch_failed')
  })()

  inFlight.set(url, promise)
  promise.finally(() => inFlight.delete(url))
  return promise
}
