import React from 'react'
import { ExternalLink, Zap } from 'lucide-react'

const REFERRAL = 'https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=en&ref=GRO_28502_JBGVD&utm_source=default'

const ADS = [
  {
    tag: 'Sponsored',
    title: 'Is Bitcoin Ready for Its Next Bull Run? Trade BTC on Binance',
    source: 'Binance',
    time: 'Sponsored',
  },
  {
    tag: 'Sponsored',
    title: 'Earn USDC Rewards — Join Binance via CryptoPulse & Get Bonuses',
    source: 'Binance',
    time: 'Sponsored',
  },
  {
    tag: 'Sponsored',
    title: 'Top DeFi Yields in 2025 — Start Trading on Binance Today',
    source: 'Binance',
    time: 'Sponsored',
  },
]

export default function SponsoredCard({ index }) {
  const ad = ADS[index % ADS.length]
  return (
    <div className="mx-2 my-1 px-4 py-3 bg-slate-900/50 border border-yellow-500/20 rounded-lg flex items-center justify-between gap-4 group hover:border-yellow-500/40 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-widest text-yellow-600 border border-yellow-700/50 rounded px-1.5 py-0.5 flex-shrink-0">
          {ad.tag}
        </span>
        <div className="min-w-0">
          <p className="text-slate-300 text-xs font-medium group-hover:text-white transition-colors line-clamp-1">
            {ad.title}
          </p>
          <p className="text-slate-500 text-[10px] mt-0.5">
            {ad.source} · {ad.time}
          </p>
        </div>
      </div>
      <a
        href={REFERRAL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold text-yellow-500 hover:text-yellow-400 transition-colors whitespace-nowrap"
      >
        <Zap size={9} className="fill-yellow-500" />
        Trade <ExternalLink size={9} />
      </a>
    </div>
  )
}
