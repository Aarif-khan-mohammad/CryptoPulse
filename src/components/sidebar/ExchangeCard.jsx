import React from 'react'
import { ExternalLink, Shield, Zap, Gift } from 'lucide-react'

const REFERRAL = 'https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=en&ref=GRO_28502_JBGVD&utm_source=default'

const EXCHANGES = [
  {
    name: 'Binance',
    logo: '🟡',
    tagline: "World's largest crypto exchange",
    bonus: 'Earn USDC rewards + fee discount',
    href: REFERRAL,
    color: 'from-yellow-500/20 to-yellow-600/5',
    border: 'border-yellow-500/30',
    btnColor: 'bg-yellow-400 hover:bg-yellow-300 shadow-yellow-500/25',
    btnText: 'text-slate-950',
  },
  {
    name: 'Binance Futures',
    logo: '⚡',
    tagline: 'Trade with up to 125x leverage',
    bonus: 'Up to $600 welcome bonus',
    href: REFERRAL,
    color: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-500/30',
    btnColor: 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25',
    btnText: 'text-slate-950',
  },
]

export default function ExchangeCard() {
  return (
    <div className="space-y-3">
      <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider px-1">
        Recommended Exchange
      </h3>
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
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 w-full ${ex.btnColor} ${ex.btnText} font-bold text-sm py-2.5 rounded-lg transition-all hover:shadow-lg active:scale-95`}
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
