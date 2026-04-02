// Proxy paths — upstream URLs never in the JS bundle
const CG  = '/api/coingecko/proxy?p='
const FG  = '/api/feargreed/proxy?p='
const BIN = '/api/binance/proxy?p='

// ─── Binance symbol map (CoinGecko id → Binance trading pair) ─────────────────
const BINANCE_SYMBOL = {
  bitcoin: 'BTCUSDT', ethereum: 'ETHUSDT', tether: null,
  binancecoin: 'BNBUSDT', solana: 'SOLUSDT', ripple: 'XRPUSDT',
  'usd-coin': null, cardano: 'ADAUSDT', avalanche: 'AVAXUSDT',
  dogecoin: 'DOGEUSDT', polkadot: 'DOTUSDT', chainlink: 'LINKUSDT',
  'shiba-inu': 'SHIBUSDT', 'matic-network': 'MATICUSDT', litecoin: 'LTCUSDT',
  uniswap: 'UNIUSDT', 'bitcoin-cash': 'BCHUSDT', stellar: 'XLMUSDT',
  cosmos: 'ATOMUSDT', monero: 'XMRUSDT', 'ethereum-classic': 'ETCUSDT',
  filecoin: 'FILUSDT', aave: 'AAVEUSDT', maker: 'MKRUSDT',
  'the-sandbox': 'SANDUSDT', decentraland: 'MANAUSDT', axie: 'AXSUSDT',
  pepe: 'PEPEUSDT', floki: 'FLOKIUSDT', 'near': 'NEARUSDT',
  aptos: 'APTUSDT', arbitrum: 'ARBUSDT', optimism: 'OPUSDT',
  'internet-computer': 'ICPUSDT', vechain: 'VETUSDT', algorand: 'ALGOUSDT',
}

// Binance interval map: days → { interval, limit }
function binanceParams(days) {
  if (days <= 1)  return { interval: '1h',  limit: 24  }
  if (days <= 7)  return { interval: '4h',  limit: 42  }
  if (days <= 30) return { interval: '1d',  limit: 30  }
  return              { interval: '3d',  limit: 30  }
}

export const API = {
  // CoinGecko — only used for market list + global (2 calls total on load)
  markets:  `${CG}${encodeURIComponent('/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d')}`,
  global:   `${CG}${encodeURIComponent('/global')}`,
  trending: `${CG}${encodeURIComponent('/search/trending')}`,
  fearGreed:`${FG}${encodeURIComponent('/fng/?limit=1')}`,

  // Binance klines — no rate limit issues
  binanceKlines: (symbol, days) => {
    const { interval, limit } = binanceParams(days)
    return `${BIN}${encodeURIComponent(`/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`)}`
  },

  // CoinGecko chart — fallback only when Binance symbol unknown
  marketChart: (id, days) =>
    `${CG}${encodeURIComponent(`/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? 'hourly' : 'daily'}`)}`,
}

// Helper: get Binance symbol for a CoinGecko id
export function getBinanceSymbol(coinId) {
  return BINANCE_SYMBOL[coinId] ?? null
}

// ─── TTL cache ────────────────────────────────────────────────────────────────
function getTTL(url) {
  if (url.includes('binance'))       return 600_000   // 10 min — Binance klines
  if (url.includes('coins/markets')) return 60_000    // 1 min  — price table
  if (url.includes('/global'))       return 120_000   // 2 min
  if (url.includes('trending'))      return 600_000   // 10 min
  if (url.includes('fng'))           return 3_600_000 // 1 hour — F&G updates daily
  if (url.includes('market_chart'))  return 600_000   // 10 min — CG chart fallback
  return 120_000
}

// ─── djb2 cache key ───────────────────────────────────────────────────────────
function makeKey(url, prefix = 'cp') {
  let h = 5381
  for (let i = 0; i < url.length; i++) h = ((h << 5) + h) ^ url.charCodeAt(i)
  return `${prefix}_${(h >>> 0).toString(36)}`
}

function lsGet(key) {
  try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {
    try {
      Object.keys(localStorage).filter(k => k.startsWith('cp_') || k.startsWith('cs_'))
        .forEach(k => localStorage.removeItem(k))
      localStorage.setItem(key, JSON.stringify(val))
    } catch {}
  }
}

function cacheGet(url) {
  const e = lsGet(makeKey(url, 'cp'))
  if (!e) return null
  return Date.now() - e.ts < getTTL(url) ? e.data : null
}
function staleGet(url) {
  const e = lsGet(makeKey(url, 'cs'))
  return e ? e.data : null
}
function cacheSet(url, data) {
  const p = { ts: Date.now(), data }
  lsSet(makeKey(url, 'cp'), p)
  lsSet(makeKey(url, 'cs'), p) // stale copy lives forever
}

// ─── CoinGecko rate-limit queue (max 1 req / 2.5s) ───────────────────────────
let cgLastCall = 0
const cgQueue  = []
let cgRunning  = false

function cgEnqueue(fn) {
  return new Promise((resolve, reject) => {
    cgQueue.push({ fn, resolve, reject })
    if (!cgRunning) drainCG()
  })
}

async function drainCG() {
  cgRunning = true
  while (cgQueue.length) {
    const now   = Date.now()
    const wait  = Math.max(0, cgLastCall + 2500 - now)
    if (wait > 0) await sleep(wait)
    const { fn, resolve, reject } = cgQueue.shift()
    cgLastCall = Date.now()
    try { resolve(await fn()) } catch (e) { reject(e) }
  }
  cgRunning = false
}

// ─── In-flight dedup ──────────────────────────────────────────────────────────
const inFlight = new Map()
const sleep    = ms => new Promise(r => setTimeout(r, ms))

// ─── Core fetch ───────────────────────────────────────────────────────────────
export async function apiFetch(url, { forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const hit = cacheGet(url)
    if (hit) return hit
  }
  if (inFlight.has(url)) return inFlight.get(url)

  const isCG = url.includes('/api/coingecko/')

  const doFetch = async () => {
    let lastErr = null
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) await sleep(2000 * attempt)
        const res = await fetch(url, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(15000),
        })
        if (res.status === 429) {
          lastErr = new Error('rate_limited')
          const stale = staleGet(url)
          if (stale) return stale
          await sleep(4000 * (attempt + 1))
          continue
        }
        if (!res.ok) { lastErr = new Error(`http_${res.status}`); continue }
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
  }

  // Route CoinGecko calls through the rate-limit queue
  const promise = isCG ? cgEnqueue(doFetch) : doFetch()

  inFlight.set(url, promise)
  promise.finally(() => inFlight.delete(url))
  return promise
}
