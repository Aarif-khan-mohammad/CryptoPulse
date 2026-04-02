import React, { useState } from 'react'
import { Calculator, TrendingUp } from 'lucide-react'

export default function ProfitCalculator({ coins }) {
  const [coinId, setCoinId] = useState('bitcoin')
  const [investment, setInvestment] = useState('')
  const [targetPrice, setTargetPrice] = useState('')

  const coin = coins.find((c) => c.id === coinId)
  const currentPrice = coin?.current_price ?? 0

  const invested = parseFloat(investment) || 0
  const target = parseFloat(targetPrice) || 0
  const tokens = currentPrice > 0 ? invested / currentPrice : 0
  const futureValue = tokens * target
  const profit = futureValue - invested
  const roi = invested > 0 ? (profit / invested) * 100 : 0
  const isProfit = profit >= 0

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={14} className="text-emerald-400" />
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Profit Calculator</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-slate-500 text-[11px] mb-1 block">Coin</label>
          <select
            value={coinId}
            onChange={(e) => setCoinId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            {coins.slice(0, 20).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-slate-500 text-[11px] mb-1 block">Investment ($)</label>
          <input
            type="number"
            placeholder="e.g. 1000"
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-slate-500 text-[11px] mb-1 block">Target Price ($)</label>
          <input
            type="number"
            placeholder={`Current: $${currentPrice.toLocaleString()}`}
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {invested > 0 && target > 0 && (
          <div className={`rounded-lg p-3 border ${isProfit ? 'bg-emerald-950/40 border-emerald-800/50' : 'bg-rose-950/40 border-rose-800/50'}`}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Tokens</span>
              <span className="text-white font-mono">{tokens.toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Future Value</span>
              <span className="text-white font-mono">${futureValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Profit/Loss</span>
              <span className={`font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-500'}`}>
                {isProfit ? '+' : ''}${profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-700">
              <span className="text-slate-400">ROI</span>
              <span className={`font-bold text-sm flex items-center gap-1 ${isProfit ? 'text-emerald-400' : 'text-rose-500'}`}>
                <TrendingUp size={12} />
                {roi.toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
