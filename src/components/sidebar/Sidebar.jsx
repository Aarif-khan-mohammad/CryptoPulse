import React from 'react'
import { X } from 'lucide-react'
import FearGreedMeter from '../widgets/FearGreedMeter'
import ProfitCalculator from '../widgets/ProfitCalculator'
import WhaleAlerts from '../widgets/WhaleAlerts'
import ExchangeCard from './ExchangeCard'
import TechnicalSignals from '../widgets/TechnicalSignals'
import TradingTips from '../widgets/TradingTips'
import TrendingCoins from '../widgets/TrendingCoins'

export default function Sidebar({ coins, isOpen, onClose, onCoinSelect }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose} />
      )}

      {/* Mobile drawer — fixed, slides in from right */}
      <aside className={`
        fixed right-0 top-0 h-full z-40 w-72 bg-slate-950 border-l border-slate-800
        overflow-y-auto transform transition-transform duration-300 ease-in-out
        lg:hidden
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold text-sm">Tools</span>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
          <SidebarContent coins={coins} onCoinSelect={onCoinSelect} />
        </div>
      </aside>

      {/* Desktop static column — only rendered on lg+ */}
      <aside className="hidden lg:block w-72 flex-shrink-0 border-l border-slate-800">
        <div className="sticky top-[105px] overflow-y-auto max-h-[calc(100vh-105px)]">
          <div className="p-4 space-y-4">
            <SidebarContent coins={coins} onCoinSelect={onCoinSelect} />
          </div>
        </div>
      </aside>
    </>
  )
}

function SidebarContent({ coins, onCoinSelect }) {
  return (
    <>
      <FearGreedMeter />
      <TechnicalSignals coins={coins} />
      <TrendingCoins onSelect={onCoinSelect} />
      <WhaleAlerts />
      <ProfitCalculator coins={coins} />
      <TradingTips />
      <ExchangeCard />
    </>
  )
}
