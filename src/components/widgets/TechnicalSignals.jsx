import React, { useMemo } from 'react'
import { Activity, ChevronUp, ChevronDown } from 'lucide-react'
import { computeRSI, computeSMA } from '../../hooks/useMarketChart'

const TOP_COINS = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple']

const SIGNAL_STYLE = {
  BUY:    'text-emerald-400 bg-emerald-950/50 border-emerald-800/50',
  SELL:   'text-rose-400 bg-rose-950/50 border-rose-800/50',
  'HOLD+':'text-yellow-400 bg-yellow-950/50 border-yellow-800/50',
  'HOLD-':'text-slate-400 bg-slate-800/50 border-slate-700/50',
}

function getSignal(sparklinePrices) {
  if (!sparklinePrices || sparklinePrices.length < 26) return null
  const rsiArr = computeRSI(sparklinePrices, 14)
  const sma7   = computeSMA(sparklinePrices, 7)
  const sma25  = computeSMA(sparklinePrices, 25)
  const lastRSI  = rsiArr.at(-1)
  const lastSMA7  = sma7.findLast((v) => v !== null)
  const lastSMA25 = sma25.findLast((v) => v !== null)
  return {
    rsi: lastRSI,
    signal:
      lastRSI < 30 ? 'BUY'
      : lastRSI > 70 ? 'SELL'
      : lastSMA7 > lastSMA25 ? 'HOLD+'
      : 'HOLD-',
  }
}

export default function TechnicalSignals({ coins }) {
  const displayCoins = useMemo(
    () => coins.filter((c) => TOP_COINS.includes(c.id)),
    [coins]
  )

  const signals = useMemo(() => {
    const map = {}
    displayCoins.forEach((coin) => {
      const prices = coin.sparkline_in_7d?.price
      map[coin.id] = getSignal(prices)
    })
    return map
  }, [displayCoins])

  const loading = displayCoins.length === 0

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={14} className="text-violet-400" />
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Technical Signals</h3>
        <span className="ml-auto text-[10px] text-slate-600">7d RSI+SMA</span>
      </div>

      <div className="space-y-2">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 bg-slate-800/50 rounded-lg animate-pulse" />
            ))
          : displayCoins.map((coin) => {
              const sig = signals[coin.id]
              const up24 = (coin.price_change_percentage_24h ?? 0) >= 0
              return (
                <div key={coin.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-800/40">
                  <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full flex-shrink-0" loading="lazy" />
                  <span className="text-slate-300 text-xs font-medium flex-1 truncate">{coin.symbol.toUpperCase()}</span>
                  <span className={`text-[10px] flex items-center gap-0.5 ${up24 ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {up24 ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    {Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(1)}%
                  </span>
                  {sig ? (
                    <>
                      <span className="text-slate-500 text-[10px] font-mono">RSI {sig.rsi?.toFixed(0)}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${SIGNAL_STYLE[sig.signal] ?? SIGNAL_STYLE['HOLD-']}`}>
                        {sig.signal}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-600 text-[10px]">—</span>
                  )}
                </div>
              )
            })}
      </div>

      <p className="text-slate-600 text-[10px] mt-3 leading-relaxed">
        Signals from 7d sparkline data · RSI-14 &amp; SMA crossover · Not financial advice.
      </p>
    </div>
  )
}
