import React from 'react'
import { useFearGreed } from '../../hooks/useFearGreed'

const COLORS = {
  'Extreme Fear': '#e11d48',
  Fear: '#f97316',
  Neutral: '#eab308',
  Greed: '#22c55e',
  'Extreme Greed': '#00ff88',
}

export default function FearGreedMeter() {
  const data = useFearGreed()
  const value = data ? parseInt(data.value) : 50
  const label = data?.value_classification ?? 'Loading...'
  const color = COLORS[label] ?? '#eab308'

  // SVG arc gauge
  const r = 54
  const cx = 70
  const cy = 70
  const startAngle = 180
  const endAngle = 0
  const angle = startAngle - (value / 100) * 180
  const toRad = (deg) => (deg * Math.PI) / 180
  const needleX = cx + r * Math.cos(toRad(angle))
  const needleY = cy - r * Math.sin(toRad(angle))

  const arcPath = (start, end, color, strokeWidth = 10) => {
    const s = toRad(start)
    const e = toRad(end)
    const x1 = cx + r * Math.cos(s)
    const y1 = cy - r * Math.sin(s)
    const x2 = cx + r * Math.cos(e)
    const y2 = cy - r * Math.sin(e)
    const large = Math.abs(end - start) > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 0 ${x2} ${y2}`
  }

  const segments = [
    { start: 180, end: 144, color: '#e11d48' },
    { start: 144, end: 108, color: '#f97316' },
    { start: 108, end: 72, color: '#eab308' },
    { start: 72, end: 36, color: '#22c55e' },
    { start: 36, end: 0, color: '#00ff88' },
  ]

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Fear & Greed Index</h3>
      <div className="flex flex-col items-center">
        <svg width="140" height="80" viewBox="0 0 140 80">
          {segments.map((seg, i) => (
            <path
              key={i}
              d={arcPath(seg.start, seg.end, seg.color)}
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.3"
            />
          ))}
          {/* Active arc */}
          <path
            d={arcPath(180, angle, color)}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="4" fill="white" />
          {/* Value */}
          <text x={cx} y={cy + 18} textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
            {value}
          </text>
        </svg>
        <span className="text-sm font-semibold mt-1" style={{ color }}>{label}</span>
        {data?.time_until_update && (
          <span className="text-slate-600 text-[10px] mt-1">Updates in {Math.floor(data.time_until_update / 3600)}h</span>
        )}
      </div>
    </div>
  )
}
