// All requests go through our own proxy paths (/api/coingecko, /api/feargreed).
// In dev  → Vite server proxies to upstream (vite.config.js)
// In prod → Vercel edge rewrites to upstream (vercel.json)
// The actual upstream URLs (api.coingecko.com etc.) NEVER appear in the JS bundle.

const CG = '/api/coingecko'
const FG = '/api/feargreed'

export const API = {
  markets:     `${CG}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d`,
  global:      `${CG}/global`,
  trending:    `${CG}/search/trending`,
  marketChart: (id, days) =>
    `${CG}/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? 'hourly' : 'daily'}`,
  fearGreed:   `${FG}/fng/?limit=1`,
}

// ─── TTL cache (localStorage) ────────────────────────────────────────────────
const TTL = {
  markets:     60_000,   // 60 s
  global:     120_000,   // 2 min
  trending:   300_000,   // 5 min
  fearGreed:  600_000,   // 10 min
  marketChart:300_000,   // 5 min
}

function getTTL(url) {
  if (url.includes('/coins/markets'))    return TTL.markets
  if (url.includes('/global'))           return TTL.global
  if (url.includes('/search/trending')) return TTL.trending
  if (url.includes('fng'))              return TTL.fearGreed
  if (url.includes('market_chart'))     return TTL.marketChart
  return 60_000
}

// Safe base64 key — never stores the raw URL as a key
function cacheKey(url)      { return `cp_${btoa(url).replace(/[^a-z0-9]/gi, '').slice(0, 32)}` }
function staleCacheKey(url) { return `cp_s_${btoa(url).replace(/[^a-z0-9]/gi, '').slice(0, 32)}` }

function cacheGet(url) {
  try {
    const raw = localStorage.getItem(cacheKey(url))
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts < getTTL(url)) return data
    return null
  } catch { return null }
}

function staleGet(url) {
  try {
    const raw = localStorage.getItem(staleCacheKey(url))
    return raw ? JSON.parse(raw).data : null
  } catch { return null }
}

function cacheSet(url, data) {
  const payload = JSON.stringify({ ts: Date.now(), data })
  try {
    localStorage.setItem(cacheKey(url), payload)
    localStorage.setItem(staleCacheKey(url), payload)
  } catch {
    // Storage full — evict all our cache entries then retry once
    Object.keys(localStorage)
      .filter((k) => k.startsWith('cp_'))
      .forEach((k) => localStorage.removeItem(k))
    try { localStorage.setItem(cacheKey(url), payload) } catch {}
  }
}

// ─── In-flight deduplication ─────────────────────────────────────────────────
const inFlight = new Map()

// ─── Main fetch ───────────────────────────────────────────────────────────────
export async function apiFetch(url, { forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const hit = cacheGet(url)
    if (hit) return hit
  }

  if (inFlight.has(url)) return inFlight.get(url)

  const promise = (async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) await sleep(1500 * attempt)
        const res = await fetch(url, { headers: { Accept: 'application/json' } })
        if (res.status === 429) {
          const stale = staleGet(url)
          if (stale) return stale
          await sleep(2000 * (attempt + 1))
          continue
        }
        if (!res.ok) throw new Error(`http_${res.status}`)
        const data = await res.json()
        cacheSet(url, data)
        return data
      } catch (e) {
        if (attempt === 2) {
          const stale = staleGet(url)
          if (stale) return stale
          throw e
        }
      }
    }
  })()

  inFlight.set(url, promise)
  promise.finally(() => inFlight.delete(url))
  return promise
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
