import React from 'react'
import { ExternalLink, Shield, Zap, Gift } from 'lucide-react'

const EXCHANGES = [
  {
    name: 'Binance',
    logo: '🟡',
    tagline: 'World\'s largest crypto exchange',
    bonus: 'Up to 20% fee discount',
    href: '#affiliate-binance',
    color: 'from-yellow-500/20 to-yellow-600/5',
    border: 'border-yellow-500/30',
  },
  {
    name: 'Bybit',
    logo: '🟠',
    tagline: 'Trade with up to 100x leverage',
    bonus: '$30,000 welcome bonus',
    href: '#affiliate-bybit',
    color: 'from-orange-500/20 to-orange-600/5',
    border: 'border-orange-500/30',
  },
]

export default function ExchangeCard() {
  return (
    <div className="space-y-3">
      <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider px-1">Recommended Exchanges</h3>
      {EXCHANGES.map((ex) => (
        <div
          key={ex.name}
          className={`bg-gradient-to-br ${ex.color} border ${ex.border} rounded-xl p-4`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{ex.logo}</span>
            <div>
              <div className="text-white font-bold text-sm">{ex.name}</div>
              <div className="text-slate-400 text-[11px]">{ex.tagline}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-3 bg-slate-900/40 rounded-lg px-2.5 py-1.5">
            <Gift size={11} className="text-emerald-400 flex-shrink-0" />
            <span className="text-emerald-400 text-[11px] font-medium">{ex.bonus}</span>
          </div>
          <div className="flex items-center gap-2 mb-3 text-[10px] text-slate-400">
            <Shield size={10} className="text-slate-500" />
            <span>Regulated · Insured · 24/7 Support</span>
          </div>
          <a
            href={ex.href}
            className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm py-2.5 rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95"
          >
            <Zap size={13} className="fill-slate-950" />
            Trade Now
            <ExternalLink size={11} />
          </a>
        </div>
      ))}
    </div>
  )
}
