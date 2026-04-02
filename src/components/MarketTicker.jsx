import React from 'react'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

const fmt = (n) =>
  n >= 1e12
    ? `$${(n / 1e12).toFixed(2)}T`
    : n >= 1e9
    ? `$${(n / 1e9).toFixed(2)}B`
    : `$${(n / 1e6).toFixed(2)}M`

export default function MarketTicker({ globalData }) {
  if (!globalData) {
    return (
      <div className="bg-slate-900 border-b border-slate-800 h-9 flex items-center px-4">
        <span className="text-slate-500 text-xs animate-pulse">Loading market data...</span>
      </div>
    )
  }

  const change = globalData.market_cap_change_percentage_24h_usd
  const isUp = change >= 0

  const items = [
    { label: 'Global Market Cap', value: fmt(globalData.total_market_cap?.usd || 0), change },
    { label: '24h Volume', value: fmt(globalData.total_volume?.usd || 0) },
    { label: 'BTC Dominance', value: `${globalData.market_cap_percentage?.btc?.toFixed(1)}%` },
    { label: 'ETH Dominance', value: `${globalData.market_cap_percentage?.eth?.toFixed(1)}%` },
    { label: 'Active Coins', value: globalData.active_cryptocurrencies?.toLocaleString() },
    { label: 'Markets', value: globalData.markets?.toLocaleString() },
  ]

  const tickerItems = [...items, ...items]

  return (
    <div className="bg-slate-900/80 backdrop-blur border-b border-slate-800 overflow-hidden h-9 flex items-center">
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 border-r border-slate-700 h-full bg-slate-900">
        <Activity size={12} className="text-neon-emerald" />
        <span className="text-[10px] font-bold text-neon-emerald tracking-widest uppercase">Live</span>
      </div>
      <div className="overflow-hidden flex-1">
        <div className="ticker-scroll">
          {tickerItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-6 border-r border-slate-800/50 whitespace-nowrap">
              <span className="text-slate-400 text-xs">{item.label}:</span>
              <span className="text-white text-xs font-semibold">{item.value}</span>
              {item.change !== undefined && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(change).toFixed(2)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
