import React from 'react'
import { Search, Zap, RefreshCw, Bell } from 'lucide-react'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'gainers', label: '🚀 Top Gainers' },
  { id: 'losers', label: '📉 Top Losers' },
  { id: 'defi', label: '⚡ DeFi' },
  { id: 'meme', label: '🐸 Meme' },
  { id: 'starred', label: '⭐ Watchlist' },
]

const DEFI_IDS = ['uniswap', 'aave', 'chainlink', 'maker', 'compound-governance-token', 'curve-dao-token', 'synthetix-network-token', 'yearn-finance', 'sushi', 'balancer']
const MEME_IDS = ['dogecoin', 'shiba-inu', 'pepe', 'floki', 'dogwifcoin', 'bonk', 'baby-doge-coin', 'samoyedcoin']

export { DEFI_IDS, MEME_IDS }

export default function Header({ search, setSearch, activeFilter, setActiveFilter, onRefresh, loading, onNotifRequest }) {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
            <Zap size={16} className="text-slate-950 fill-slate-950" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
            Crypto<span className="text-neon-emerald">Pulse</span>
          </span>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search coins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onNotifRequest}
            title="Enable price alerts"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-yellow-400 transition-colors"
          >
            <Bell size={15} />
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-neon-emerald transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              activeFilter === f.id
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </header>
  )
}
