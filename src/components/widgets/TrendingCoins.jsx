import React from 'react'
import { Flame } from 'lucide-react'
import { useTrending } from '../../hooks/useTrending'

export default function TrendingCoins({ onSelect }) {
  const trending = useTrending()

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Flame size={14} className="text-orange-400" />
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Trending Now</h3>
        <span className="ml-auto text-[10px] text-slate-600">via CoinGecko</span>
      </div>

      {trending.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-slate-800/50 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {trending.map((coin, i) => (
            <button
              key={coin.id}
              onClick={() => onSelect?.(coin)}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors group text-left"
            >
              <span className="text-slate-600 text-[11px] w-4 flex-shrink-0">#{i + 1}</span>
              <img
                src={coin.thumb}
                alt={coin.name}
                className="w-5 h-5 rounded-full flex-shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <span className="text-slate-300 text-xs font-medium group-hover:text-white transition-colors truncate block">
                  {coin.name}
                </span>
              </div>
              <span className="text-slate-500 text-[10px] uppercase flex-shrink-0">{coin.symbol}</span>
              <span className="text-orange-400 text-[10px] flex-shrink-0">🔥</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
