import React from 'react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function Sparkline({ data, positive }) {
  if (!data || data.length === 0) return <div className="w-24 h-10" />
  const chartData = data.map((v) => ({ v }))
  const color = positive ? '#00ff88' : '#e11d48'

  return (
    <div className="w-24 h-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`sg-${positive}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#sg-${positive})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
