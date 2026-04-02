import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Bell, BellOff, ChevronUp, ChevronDown, BarChart2 } from 'lucide-react'
import Sparkline from '../Sparkline'
import SponsoredCard from '../SponsoredCard'
import CoinDetailModal from '../CoinDetailModal'

const fmt = (n) => {
  if (n === null || n === undefined) return '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  return `$${n.toLocaleString()}`
}

const fmtPrice = (n) => {
  if (!n) return '$0'
  if (n < 0.01) return `$${n.toFixed(6)}`
  if (n < 1) return `$${n.toFixed(4)}`
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const Pct = ({ v }) => {
  if (v === null || v === undefined) return <span className="text-slate-500">—</span>
  const up = v >= 0
  return (
    <span className={`flex items-center gap-0.5 font-medium ${up ? 'text-emerald-400' : 'text-rose-500'}`}>
      {up ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      {Math.abs(v).toFixed(2)}%
    </span>
  )
}

function AlertModal({ coin, onSet, onClose }) {
  const [price, setPrice] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 w-72 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-white font-semibold mb-1">Set Price Alert</h3>
        <p className="text-slate-400 text-xs mb-4">
          Get notified when <span className="text-emerald-400">{coin.name}</span> reaches your target.
        </p>
        <input
          type="number"
          placeholder={`Current: ${fmtPrice(coin.current_price)}`}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 mb-3"
        />
        <div className="flex gap-2">
          <button
            onClick={() => { onSet(coin.id, price); onClose() }}
            disabled={!price}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-semibold text-sm py-2 rounded-lg transition-colors"
          >
            Set Alert
          </button>
          <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm py-2 rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CoinTable({ coins, flashMap, starred, alerts, toggleStar, setAlert, removeAlert, onCoinClick }) {
  const [alertCoin, setAlertCoin] = useState(null)
  const [detailCoin, setDetailCoin] = useState(null)
  const [sortKey, setSortKey] = useState('market_cap_rank')
  const [sortDir, setSortDir] = useState('asc')

  const openDetail = (coin) => {
    setDetailCoin(coin)
    onCoinClick?.(coin)
  }

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = [...coins].sort((a, b) => {
    const av = a[sortKey] ?? 0
    const bv = b[sortKey] ?? 0
    return sortDir === 'asc' ? av - bv : bv - av
  })

  const SortIcon = ({ k }) =>
    sortKey === k ? (
      sortDir === 'asc' ? <ChevronUp size={11} className="text-emerald-400" /> : <ChevronDown size={11} className="text-emerald-400" />
    ) : null

  const Th = ({ label, k, className = '' }) => (
    <th
      className={`px-3 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white select-none ${className}`}
      onClick={() => handleSort(k)}
    >
      <span className="flex items-center gap-1">{label}<SortIcon k={k} /></span>
    </th>
  )

  const rows = []
  sorted.forEach((coin, i) => {
    if (i > 0 && i % 5 === 0) {
      rows.push(<SponsoredCard key={`ad-${i}`} index={i / 5 - 1} />)
    }

    const flash = flashMap[coin.id]
    const isStarred = starred.includes(coin.id)
    const hasAlert = !!alerts[coin.id]
    const sparkPositive = (coin.price_change_percentage_7d_in_currency ?? 0) >= 0

    rows.push(
      <motion.tr
        key={coin.id}
        animate={
          flash
            ? { backgroundColor: flash === 'green' ? 'rgba(0,255,136,0.12)' : 'rgba(225,29,72,0.12)' }
            : { backgroundColor: 'rgba(0,0,0,0)' }
        }
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group cursor-pointer"
      >
        {/* Rank */}
        <td className="px-3 py-3 text-slate-500 text-xs w-10" onClick={() => openDetail(coin)}>{coin.market_cap_rank}</td>

        {/* Star */}
        <td className="px-2 py-3 w-8">
          <button onClick={(e) => { e.stopPropagation(); toggleStar(coin.id) }} className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Star size={13} className={isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'} />
          </button>
        </td>

        {/* Coin */}
        <td className="px-3 py-3" onClick={() => openDetail(coin)}>
          <div className="flex items-center gap-2.5">
            <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full" loading="lazy" />
            <div>
              <div className="text-white text-sm font-semibold leading-tight">{coin.name}</div>
              <div className="text-slate-500 text-[11px] uppercase">{coin.symbol}</div>
            </div>
          </div>
        </td>

        {/* Price */}
        <td className="px-3 py-3 text-white font-mono text-sm font-semibold" onClick={() => openDetail(coin)}>{fmtPrice(coin.current_price)}</td>

        {/* 1h */}
        <td className="px-3 py-3 text-sm hidden md:table-cell" onClick={() => openDetail(coin)}>
          <Pct v={coin.price_change_percentage_1h_in_currency} />
        </td>

        {/* 24h */}
        <td className="px-3 py-3 text-sm" onClick={() => openDetail(coin)}>
          <Pct v={coin.price_change_percentage_24h} />
        </td>

        {/* 7d */}
        <td className="px-3 py-3 text-sm hidden lg:table-cell" onClick={() => openDetail(coin)}>
          <Pct v={coin.price_change_percentage_7d_in_currency} />
        </td>

        {/* Market Cap */}
        <td className="px-3 py-3 text-slate-300 text-sm hidden lg:table-cell" onClick={() => openDetail(coin)}>{fmt(coin.market_cap)}</td>

        {/* Volume */}
        <td className="px-3 py-3 text-slate-300 text-sm hidden xl:table-cell" onClick={() => openDetail(coin)}>{fmt(coin.total_volume)}</td>

        {/* Sparkline */}
        <td className="px-3 py-3 hidden md:table-cell" onClick={() => openDetail(coin)}>
          <Sparkline data={coin.sparkline_in_7d?.price} positive={sparkPositive} />
        </td>

        {/* Alert + Chart icon */}
        <td className="px-3 py-3 w-16">
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); openDetail(coin) }}
              title="View chart"
              className="text-slate-500 hover:text-cyan-400 transition-colors"
            >
              <BarChart2 size={13} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); hasAlert ? removeAlert(coin.id) : setAlertCoin(coin) }}
              title={hasAlert ? `Alert at $${alerts[coin.id]}` : 'Set alert'}
            >
              {hasAlert
                ? <Bell size={13} className="text-yellow-400 fill-yellow-400" />
                : <BellOff size={13} className="text-slate-600" />
              }
            </button>
          </div>
        </td>
      </motion.tr>
    )
  })

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50 border-b border-slate-800 sticky top-0">
            <tr>
              <Th label="#" k="market_cap_rank" className="w-10" />
              <th className="w-8" />
              <Th label="Coin" k="name" />
              <Th label="Price" k="current_price" />
              <Th label="1h %" k="price_change_percentage_1h_in_currency" className="hidden md:table-cell" />
              <Th label="24h %" k="price_change_percentage_24h" />
              <Th label="7d %" k="price_change_percentage_7d_in_currency" className="hidden lg:table-cell" />
              <Th label="Market Cap" k="market_cap" className="hidden lg:table-cell" />
              <Th label="Volume" k="total_volume" className="hidden xl:table-cell" />
              <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">7d Chart</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-2 p-3">
        {sorted.map((coin, i) => {
          const flash = flashMap[coin.id]
          const isStarred = starred.includes(coin.id)
          const hasAlert = !!alerts[coin.id]
          const up24 = (coin.price_change_percentage_24h ?? 0) >= 0

          return (
            <React.Fragment key={coin.id}>
              {i > 0 && i % 5 === 0 && <SponsoredCard index={i / 5 - 1} />}
              <motion.div
                animate={
                  flash
                    ? { backgroundColor: flash === 'green' ? 'rgba(0,255,136,0.1)' : 'rgba(225,29,72,0.1)' }
                    : { backgroundColor: 'rgba(15,23,42,0.8)' }
                }
                transition={{ duration: 0.15 }}
                className="rounded-xl border border-slate-800 p-3"
                onClick={() => openDetail(coin)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={coin.image} alt={coin.name} className="w-9 h-9 rounded-full" loading="lazy" />
                    <div>
                      <div className="text-white font-semibold text-sm">{coin.name}</div>
                      <div className="text-slate-500 text-[11px] uppercase">{coin.symbol} · #{coin.market_cap_rank}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-mono font-bold text-sm">{fmtPrice(coin.current_price)}</div>
                    <Pct v={coin.price_change_percentage_24h} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                  <span className="text-slate-500 text-[11px]">MCap: <span className="text-slate-300">{fmt(coin.market_cap)}</span></span>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); openDetail(coin) }} className="text-slate-500 hover:text-cyan-400">
                      <BarChart2 size={13} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toggleStar(coin.id) }}>
                      <Star size={13} className={isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); hasAlert ? removeAlert(coin.id) : setAlertCoin(coin) }}>
                      {hasAlert
                        ? <Bell size={13} className="text-yellow-400 fill-yellow-400" />
                        : <BellOff size={13} className="text-slate-600" />
                      }
                    </button>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          )
        })}
      </div>

      <AnimatePresence>
        {alertCoin && (
          <AlertModal
            coin={alertCoin}
            onSet={setAlert}
            onClose={() => setAlertCoin(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailCoin && (
          <CoinDetailModal
            coin={detailCoin}
            onClose={() => setDetailCoin(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
