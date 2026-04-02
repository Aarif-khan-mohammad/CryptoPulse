import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, TrendingDown, BarChart2, Activity, ExternalLink } from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ReferenceLine, Legend, ComposedChart,
} from 'recharts'
import { useMarketChart, computeRSI, computeSMA } from '../hooks/useMarketChart'

const DAYS = [
  { label: '24H', value: 1 },
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
]

const fmtPrice = (n) => {
  if (!n) return '$0'
  if (n < 0.01) return `$${n.toFixed(6)}`
  if (n < 1) return `$${n.toFixed(4)}`
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const fmtVol = (n) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${n.toLocaleString()}`

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.name}: {p.dataKey === 'volume' ? fmtVol(p.value) : fmtPrice(p.value)}
        </p>
      ))}
    </div>
  )
}

const RSITooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const v = payload[0]?.value
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className={`font-mono font-bold ${v > 70 ? 'text-rose-400' : v < 30 ? 'text-emerald-400' : 'text-yellow-400'}`}>
        RSI: {v?.toFixed(1)}
      </p>
      <p className="text-slate-500 mt-0.5">
        {v > 70 ? '⚠ Overbought' : v < 30 ? '✅ Oversold' : '— Neutral'}
      </p>
    </div>
  )
}

export default function CoinDetailModal({ coin, onClose }) {
  const [days, setDays] = useState(7)
  const [tab, setTab] = useState('price')
  const { chartData, loading } = useMarketChart(coin.id, days)

  const prices = useMemo(() => chartData.map((d) => d.price), [chartData])
  const sma7 = useMemo(() => computeSMA(prices, 7), [prices])
  const sma25 = useMemo(() => computeSMA(prices, 25), [prices])
  const rsiValues = useMemo(() => computeRSI(prices, 14), [prices])

  const enriched = useMemo(() =>
    chartData.map((d, i) => ({
      ...d,
      sma7: sma7[i],
      sma25: sma25[i],
    })), [chartData, sma7, sma25])

  const rsiData = useMemo(() => {
    const offset = prices.length - rsiValues.length
    return rsiValues.map((v, i) => ({
      date: chartData[i + offset]?.date ?? '',
      rsi: parseFloat(v.toFixed(2)),
    }))
  }, [rsiValues, chartData, prices.length])

  const lastRSI = rsiValues[rsiValues.length - 1]
  const priceChange = prices.length > 1 ? ((prices.at(-1) - prices[0]) / prices[0]) * 100 : 0
  const isUp = priceChange >= 0
  const lastSMA7 = sma7.findLast((v) => v !== null)
  const lastSMA25 = sma25.findLast((v) => v !== null)
  const trend = lastSMA7 && lastSMA25 ? (lastSMA7 > lastSMA25 ? 'Bullish' : 'Bearish') : '—'

  const stats = [
    { label: 'Market Cap', value: fmtVol(coin.market_cap) },
    { label: '24h Volume', value: fmtVol(coin.total_volume) },
    { label: 'Circulating', value: `${(coin.circulating_supply / 1e6).toFixed(2)}M` },
    { label: 'ATH', value: fmtPrice(coin.ath) },
    { label: 'ATH Drop', value: `${coin.ath_change_percentage?.toFixed(1)}%` },
    { label: '24h High', value: fmtPrice(coin.high_24h) },
    { label: '24h Low', value: fmtPrice(coin.low_24h) },
    { label: 'Rank', value: `#${coin.market_cap_rank}` },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-bold text-lg">{coin.name}</h2>
                  <span className="text-slate-500 text-sm uppercase">{coin.symbol}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-white font-mono font-bold">{fmtPrice(coin.current_price)}</span>
                  <span className={`text-sm font-medium flex items-center gap-0.5 ${isUp ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(priceChange).toFixed(2)}% ({days}d)
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Signal Pills */}
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                lastRSI > 70 ? 'bg-rose-950/50 border-rose-700 text-rose-400' :
                lastRSI < 30 ? 'bg-emerald-950/50 border-emerald-700 text-emerald-400' :
                'bg-slate-800 border-slate-700 text-yellow-400'
              }`}>
                RSI {lastRSI?.toFixed(0) ?? '—'} · {lastRSI > 70 ? 'Overbought ⚠' : lastRSI < 30 ? 'Oversold ✅' : 'Neutral'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                trend === 'Bullish' ? 'bg-emerald-950/50 border-emerald-700 text-emerald-400' :
                trend === 'Bearish' ? 'bg-rose-950/50 border-rose-700 text-rose-400' :
                'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                SMA Trend · {trend}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                isUp ? 'bg-emerald-950/50 border-emerald-700 text-emerald-400' : 'bg-rose-950/50 border-rose-700 text-rose-400'
              }`}>
                {days}d Momentum · {isUp ? '▲ Up' : '▼ Down'}
              </span>
            </div>

            {/* Day Selector + Tab */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {DAYS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDays(d.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      days === d.value ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {['price', 'rsi', 'volume'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                      tab === t ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Charts */}
            {loading ? (
              <div className="h-56 bg-slate-800/50 rounded-xl animate-pulse" />
            ) : (
              <div className="h-56">
                {tab === 'price' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={enriched}>
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isUp ? '#00ff88' : '#e11d48'} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={isUp ? '#00ff88' : '#e11d48'} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmtPrice(v)} width={72} domain={['auto', 'auto']} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
                      <Area type="monotone" dataKey="price" name="Price" stroke={isUp ? '#00ff88' : '#e11d48'} strokeWidth={2} fill="url(#priceGrad)" dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="sma7" name="SMA 7" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} connectNulls />
                      <Line type="monotone" dataKey="sma25" name="SMA 25" stroke="#818cf8" strokeWidth={1.5} dot={false} isAnimationActive={false} connectNulls />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
                {tab === 'rsi' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rsiData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
                      <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} width={30} />
                      <Tooltip content={<RSITooltip />} />
                      <ReferenceLine y={70} stroke="#e11d48" strokeDasharray="4 4" label={{ value: 'OB 70', fill: '#e11d48', fontSize: 9 }} />
                      <ReferenceLine y={30} stroke="#00ff88" strokeDasharray="4 4" label={{ value: 'OS 30', fill: '#00ff88', fontSize: 9 }} />
                      <ReferenceLine y={50} stroke="#475569" strokeDasharray="2 4" />
                      <Line type="monotone" dataKey="rsi" name="RSI 14" stroke="#a78bfa" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                {tab === 'volume' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={fmtVol} width={60} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="volume" name="Volume" fill="#0ea5e9" opacity={0.8} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2">
              {stats.map((s) => (
                <div key={s.label} className="bg-slate-800/60 rounded-lg px-3 py-2">
                  <div className="text-slate-500 text-[10px] mb-0.5">{s.label}</div>
                  <div className="text-white text-xs font-semibold font-mono truncate">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
