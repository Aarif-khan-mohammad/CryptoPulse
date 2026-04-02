import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, ChevronDown, ChevronUp, BookOpen, Shield, Zap, TrendingUp, AlertTriangle } from 'lucide-react'
import { useFearGreed } from '../../hooks/useFearGreed'

const STATIC_TIPS = [
  {
    icon: Shield,
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/40 border-emerald-800/40',
    title: 'Risk Management First',
    body: 'Never risk more than 1–2% of your portfolio on a single trade. Use stop-loss orders to protect capital before thinking about profits.',
  },
  {
    icon: TrendingUp,
    color: 'text-cyan-400',
    bg: 'bg-cyan-950/40 border-cyan-800/40',
    title: 'Dollar-Cost Averaging (DCA)',
    body: 'Instead of timing the market, invest a fixed amount weekly. DCA reduces the impact of volatility and removes emotional decision-making.',
  },
  {
    icon: BookOpen,
    color: 'text-violet-400',
    bg: 'bg-violet-950/40 border-violet-800/40',
    title: 'Understand What You Buy',
    body: 'Read the whitepaper, check the team, tokenomics, and use-case before investing. Hype fades — fundamentals don\'t.',
  },
  {
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-950/40 border-yellow-800/40',
    title: 'Volume Confirms Moves',
    body: 'A price breakout on high volume is far more reliable than one on low volume. Always check the volume chart before entering a trade.',
  },
  {
    icon: AlertTriangle,
    color: 'text-orange-400',
    bg: 'bg-orange-950/40 border-orange-800/40',
    title: 'Beware of FOMO & FUD',
    body: 'Fear Of Missing Out and Fear/Uncertainty/Doubt are the two biggest killers of retail portfolios. Stick to your strategy.',
  },
]

const SENTIMENT_TIPS = {
  'Extreme Fear': {
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/50 border-emerald-700/50',
    icon: '🟢',
    title: 'Market in Extreme Fear — Potential Opportunity',
    body: 'Historically, extreme fear signals are contrarian buy opportunities. Consider DCA-ing into strong projects. "Be greedy when others are fearful." — Warren Buffett',
  },
  Fear: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/40 border-emerald-800/40',
    icon: '📉',
    title: 'Fear in the Market — Watch for Reversals',
    body: 'Fear-driven sell-offs often overshoot fair value. Look for coins holding key support levels — they may be the first to recover.',
  },
  Neutral: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-950/40 border-yellow-800/40',
    icon: '⚖️',
    title: 'Neutral Sentiment — Wait for Confirmation',
    body: 'The market is undecided. Avoid large positions. Wait for a clear breakout with volume before committing capital.',
  },
  Greed: {
    color: 'text-orange-400',
    bg: 'bg-orange-950/40 border-orange-800/40',
    icon: '⚠️',
    title: 'Greed Rising — Tighten Stop-Losses',
    body: 'Greed phases can extend further but risk is elevated. Consider taking partial profits on positions up 50%+. Don\'t let winners turn into losers.',
  },
  'Extreme Greed': {
    color: 'text-rose-400',
    bg: 'bg-rose-950/50 border-rose-700/50',
    icon: '🔴',
    title: 'Extreme Greed — High Risk Zone',
    body: 'Markets are euphoric. This is historically when smart money distributes to retail. Reduce exposure, secure profits, and avoid chasing pumps.',
  },
}

function TipCard({ icon: Icon, color, bg, title, body }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-xl overflow-hidden ${bg}`}>
      <button
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <Icon size={13} className={`flex-shrink-0 ${color}`} />
        <span className="text-slate-200 text-xs font-medium flex-1">{title}</span>
        {open ? <ChevronUp size={12} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={12} className="text-slate-500 flex-shrink-0" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="px-3 pb-3 text-slate-400 text-[11px] leading-relaxed border-t border-slate-700/50 pt-2">
              {body}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TradingTips() {
  const fgData = useFearGreed()
  const label = fgData?.value_classification ?? null
  const sentimentTip = label ? SENTIMENT_TIPS[label] : null

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={14} className="text-yellow-400" />
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Trader Tips</h3>
      </div>

      <div className="space-y-2">
        {/* Dynamic sentiment tip at top */}
        {sentimentTip && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-xl px-3 py-2.5 ${sentimentTip.bg}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{sentimentTip.icon}</span>
              <span className={`text-xs font-semibold ${sentimentTip.color}`}>{sentimentTip.title}</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">{sentimentTip.body}</p>
          </motion.div>
        )}

        {/* Static expandable tips */}
        {STATIC_TIPS.map((tip) => (
          <TipCard key={tip.title} {...tip} />
        ))}
      </div>
    </div>
  )
}
