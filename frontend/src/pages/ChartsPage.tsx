import { useState } from 'react'
import { TickerSearch } from '@/components/TickerSearch'
import { PriceChart } from '@/components/PriceChart'
import { usePriceHistory } from '@/hooks/useHistory'
import { LegacyCandleChart } from '@/components/LegacyCandleChart'

const QUICK_SYMBOLS = ['AAPL', 'AMZN', 'GOOGL', 'TSLA', 'MSFT'] as const

export const ChartsPage = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL')

  const { data: history, isLoading, error } = usePriceHistory(selectedSymbol, 60)

  const rawCandles = history?.items ?? []

  // sort them oldest → newest, but keep the same fields
  const candles = [...rawCandles].sort((a, b) => {
    const ta =
      typeof a.timestamp === 'number'
        ? a.timestamp
        : Date.parse(a.timestamp) / 1000
    const tb =
      typeof b.timestamp === 'number'
        ? b.timestamp
        : Date.parse(b.timestamp) / 1000
    return ta - tb
  })

  const hasData = candles.length > 0
  const last = hasData ? candles[candles.length - 1] : undefined
  const first = hasData ? candles[0] : undefined

  return (
    <div className="space-y-6">
      {/* Symbol selection card – unchanged */}
      <div className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Select Symbol
        </h2>

        <div className="flex flex-wrap gap-2">
          {QUICK_SYMBOLS.map((sym) => (
            <button
              key={sym}
              onClick={() => setSelectedSymbol(sym)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                selectedSymbol === sym
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>

        <div className="max-w-md">
          <TickerSearch
            onSelect={setSelectedSymbol}
            placeholder="Search for a ticker symbol..."
          />
        </div>
      </div>

      {isLoading && (
        <div className="card p-6">
          <p className="text-gray-500 dark:text-gray-400">
            Loading price history…
          </p>
        </div>
      )}

      {error && (
        <div className="card p-6">
          <p className="text-red-500">
            Failed to load history for {selectedSymbol}
          </p>
        </div>
      )}

      {hasData && last && first && (
        <>
          {/* Same summary chart as before */}
          <PriceChart
            symbol={selectedSymbol}
            data={{
              price: last.close,
              change: last.close - first.close,
              changePercent:
                ((last.close - first.close) / first.close) * 100,
              volume: last.volume,
              high: Math.max(...candles.map((c) => c.high)),
              low: Math.min(...candles.map((c) => c.low)),
            }}
            isLoading={isLoading}
          />

          {/* 🔥 NEW JS candlestick – using THE SAME candles from the backend */}
          <LegacyCandleChart
            symbol={selectedSymbol}
            data={candles}   // ← this is history.items sorted
            height={500}
          />
        </>
      )}

      {!isLoading && !error && !hasData && (
        <div className="card p-6">
          <p className="text-gray-500 dark:text-gray-400">
            No history data available for {selectedSymbol}.
          </p>
        </div>
      )}
    </div>
  )
}
