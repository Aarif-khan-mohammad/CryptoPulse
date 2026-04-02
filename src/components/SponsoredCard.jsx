import React from 'react'
import { ExternalLink } from 'lucide-react'

const ADS = [
  {
    tag: 'Sponsored',
    title: 'Is Bitcoin Ready for Its Next Bull Run? Analysts Weigh In',
    source: 'CryptoInsider',
    time: '2h ago',
    href: '#',
  },
  {
    tag: 'Sponsored',
    title: 'Top 5 DeFi Protocols Generating Real Yield in 2025',
    source: 'DeFi Daily',
    time: '4h ago',
    href: '#',
  },
  {
    tag: 'Sponsored',
    title: 'Ethereum Layer-2 Wars: Which Chain Will Win?',
    source: 'BlockBeat',
    time: '6h ago',
    href: '#',
  },
]

export default function SponsoredCard({ index }) {
  const ad = ADS[index % ADS.length]
  return (
    <div className="mx-2 my-1 px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg flex items-center justify-between gap-4 group hover:border-slate-600 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 border border-slate-700 rounded px-1.5 py-0.5 flex-shrink-0">
          {ad.tag}
        </span>
        <div>
          <p className="text-slate-300 text-xs font-medium group-hover:text-white transition-colors line-clamp-1">
            {ad.title}
          </p>
          <p className="text-slate-500 text-[10px] mt-0.5">
            {ad.source} · {ad.time}
          </p>
        </div>
      </div>
      <a
        href={ad.href}
        className="flex-shrink-0 flex items-center gap-1 text-[10px] text-slate-500 hover:text-emerald-400 transition-colors"
      >
        Read <ExternalLink size={10} />
      </a>
    </div>
  )
}
