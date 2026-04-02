import React, { useState, useMemo } from 'react'
import { PanelRight, RefreshCw, Clock, WifiOff } from 'lucide-react'
import { useCrypto } from './hooks/useCrypto'
import { useAlerts } from './hooks/useAlerts'
import MarketTicker from './components/MarketTicker'
import Header, { DEFI_IDS, MEME_IDS } from './components/Header'
import CoinTable from './components/table/CoinTable'
import Sidebar from './components/sidebar/Sidebar'
import MarketOverviewChart from './components/MarketOverviewChart'
import CoinDetailModal from './components/CoinDetailModal'

export default function App() {
  const { coins, globalData, loading, error, flashMap, refetch, nextRefresh } = useCrypto()
  const { alerts, starred, setAlert, removeAlert, toggleStar, requestPermission } = useAlerts(coins)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedCoin, setSelectedCoin] = useState(null)

  const filteredCoins = useMemo(() => {
    let list = [...coins]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
    }
    switch (activeFilter) {
      case 'gainers':
        return [...list].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)).slice(0, 20)
      case 'losers':
        return [...list].sort((a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0)).slice(0, 20)
      case 'defi':
        return list.filter((c) => DEFI_IDS.includes(c.id))
      case 'meme':
        return list.filter((c) => MEME_IDS.includes(c.id))
      case 'starred':
        return list.filter((c) => starred.includes(c.id))
      default:
        return list
    }
  }, [coins, search, activeFilter, starred])

  // Only show hard error when we have zero data (first load failure)
  const showHardError = error && coins.length === 0
  // Soft warning when we have data but last refresh failed
  const showSoftWarning = error && coins.length > 0

  const detailCoin = selectedCoin
    ? (coins.find((c) => c.id === selectedCoin.id) ?? selectedCoin)
    : null

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <MarketTicker globalData={globalData} />

      <Header
        search={search}
        setSearch={setSearch}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        onRefresh={refetch}
        loading={loading}
        onNotifRequest={requestPermission}
      />

      <div className="flex relative">
        <main className="flex-1 min-w-0">

          {/* Status Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50 bg-slate-950/80">
            <div className="flex items-center gap-3">
              <span className="text-slate-500 text-xs">{filteredCoins.length} coins</span>

              {/* Live updating indicator */}
              {loading && coins.length > 0 && (
                <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <RefreshCw size={10} className="animate-spin text-emerald-500" />
                  <span className="text-emerald-500">Updating...</span>
                </span>
              )}

              {/* Countdown to next refresh */}
              {!loading && coins.length > 0 && nextRefresh > 0 && !showSoftWarning && (
                <span className="flex items-center gap-1 text-slate-600 text-xs">
                  <Clock size={10} />
                  Next update in {nextRefresh}s
                </span>
              )}

              {/* Soft warning — stale data but still showing */}
              {showSoftWarning && (
                <span className="flex items-center gap-1.5 text-amber-500/80 text-xs">
                  <WifiOff size={10} />
                  Showing cached data · Retrying in {nextRefresh}s
                  <button
                    onClick={refetch}
                    className="ml-1 underline underline-offset-2 hover:text-amber-400 transition-colors"
                  >
                    Retry now
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              <PanelRight size={13} />
              Tools
            </button>
          </div>

          {/* Hard error — no data at all */}
          {showHardError && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                <WifiOff size={28} className="text-slate-500" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold mb-1">Unable to load market data</p>
                <p className="text-slate-500 text-sm mb-4">
                  CoinGecko free tier rate limit reached. Retrying in {nextRefresh}s.
                </p>
                <button
                  onClick={refetch}
                  disabled={loading}
                  className="flex items-center gap-2 mx-auto bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  Retry Now
                </button>
              </div>
            </div>
          )}

          {/* Loading skeleton — first load */}
          {loading && coins.length === 0 && !showHardError && (
            <div className="p-4 space-y-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-slate-800/50 rounded-lg animate-pulse"
                  style={{ opacity: 1 - i * 0.06 }}
                />
              ))}
            </div>
          )}

          {/* Empty search result */}
          {!loading && !showHardError && filteredCoins.length === 0 && coins.length > 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-sm">No coins found for "{search || activeFilter}"</p>
            </div>
          )}

          {/* Main content */}
          {filteredCoins.length > 0 && (
            <>
              <MarketOverviewChart />
              <CoinTable
                coins={filteredCoins}
                flashMap={flashMap}
                starred={starred}
                alerts={alerts}
                toggleStar={toggleStar}
                setAlert={setAlert}
                removeAlert={removeAlert}
                onCoinClick={setSelectedCoin}
              />
            </>
          )}
        </main>

        {/* Desktop sidebar column — rendered as flex sibling of main */}
        <Sidebar
          coins={coins}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onCoinSelect={(c) => { setSelectedCoin(c); setSidebarOpen(false) }}
        />
      </div>

      {/* Coin Detail Modal */}
      {detailCoin && (
        <CoinDetailModal coin={detailCoin} onClose={() => setSelectedCoin(null)} />
      )}
    </div>
  )
}
