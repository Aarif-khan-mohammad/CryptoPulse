import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Waves } from 'lucide-react'

const WHALES = [
  { from: 'Unknown Wallet', to: 'Binance', coin: 'BTC', amount: 1240, usd: 84_200_000 },
  { from: 'Coinbase', to: 'Unknown Wallet', coin: 'ETH', amount: 18_500, usd: 62_900_000 },
  { from: 'Unknown Wallet', to: 'Kraken', coin: 'BTC', amount: 890, usd: 60_500_000 },
  { from: 'Unknown Wallet', to: 'Unknown Wallet', coin: 'USDT', amount: 50_000_000, usd: 50_000_000 },
  { from: 'Binance', to: 'Unknown Wallet', coin: 'SOL', amount: 420_000, usd: 71_400_000 },
  { from: 'Unknown Wallet', to: 'OKX', coin: 'ETH', amount: 9_800, usd: 33_300_000 },
  { from: 'Kraken', to: 'Unknown Wallet', coin: 'BTC', amount: 560, usd: 38_100_000 },
  { from: 'Unknown Wallet', to: 'Bybit', coin: 'XRP', amount: 45_000_000, usd: 27_000_000 },
]

const fmt = (n) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : `$${(n / 1e6).toFixed(1)}M`

const timeAgo = (secs) =>
  secs < 60 ? `${secs}s ago` : `${Math.floor(secs / 60)}m ago`

export default function WhaleAlerts() {
  const [alerts, setAlerts] = useState([])
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const add = () => {
      const whale = WHALES[Math.floor(Math.random() * WHALES.length)]
      setAlerts((prev) => [
        { ...whale, id: Date.now(), ts: 0 },
        ...prev.slice(0, 4),
      ])
    }
    add()
    const interval = setInterval(add, 8000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Waves size={14} className="text-cyan-400" />
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Whale Alerts</h3>
        <span className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] text-cyan-400">Live</span>
        </span>
      </div>
      <div className="space-y-2 overflow-hidden">
        <AnimatePresence initial={false}>
          {alerts.map((a) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-800/60 rounded-lg px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-cyan-300 font-bold text-xs">{fmt(a.usd)}</span>
                <span className="text-slate-500 text-[10px]">{timeAgo(Math.floor((Date.now() - a.id) / 1000))}</span>
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5 truncate">
                <span className="text-white">{a.amount.toLocaleString()} {a.coin}</span>
                {' '}moved from{' '}
                <span className="text-slate-300">{a.from}</span>
                {' '}→{' '}
                <span className="text-slate-300">{a.to}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
