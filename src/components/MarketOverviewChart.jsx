import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, TrendingUp, TrendingDown } from 'lucide-react'
import {
  ResponsiveContainer, ComposedChart, Area, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import { useGlobalChart } from '../hooks/useTrending'

const RANGES = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
]

const fmtK = (n) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(0)}M` : `$${n.toLocaleString()}`

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.name}: {p.dataKey === 'vol' ? fmtK(p.value) : `$${p.value?.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        </p>
      ))}
    </div>
  )
}

export default function MarketOverviewChart() {
  const [range, setRange] = useState(30)
  const data = useGlobalChart(range)

  const first = data[0]?.btc
  const last = data.at(-1)?.btc
  const change = first && last ? ((last - first) / first) * 100 : 0
  const isUp = change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 mx-4 mt-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <BarChart2 size={15} className="text-cyan-400" />
            <span className="text-white font-semibold text-sm">Bitcoin Market Overview</span>
          </div>
          {data.length > 0 && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              isUp ? 'bg-emerald-950/60 text-emerald-400' : 'bg-rose-950/60 text-rose-400'
            }`}>
              {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(change).toFixed(2)}%
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                range === r.value ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="h-44 bg-slate-800/40 rounded-lg animate-pulse" />
      ) : (
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="btcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isUp ? '#00ff88' : '#e11d48'} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={isUp ? '#00ff88' : '#e11d48'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
              <YAxis
                yAxisId="price"
                orientation="right"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                width={44}
                domain={['auto', 'auto']}
              />
              <YAxis
                yAxisId="vol"
                orientation="left"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={fmtK}
                width={52}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8', paddingTop: 8 }} />
              <Bar yAxisId="vol" dataKey="vol" name="Volume" fill="#0ea5e9" opacity={0.35} radius={[1, 1, 0, 0]} isAnimationActive={false} />
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="btc"
                name="BTC Price"
                stroke={isUp ? '#00ff88' : '#e11d48'}
                strokeWidth={2}
                fill="url(#btcGrad)"
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}
