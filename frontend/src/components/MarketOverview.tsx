import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { systemApi, type MarketQuote } from '@/lib/api'

interface MarketData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  high: number
  low: number
  open: number
  previousClose: number
}

interface SectorData {
  name: string
  change: number
  changePercent: number
  topGainers: string[]
  topLosers: string[]
}

interface MarketOverviewData {
  primaryTickers: MarketData[]
  indices: MarketData[]
  sectors: SectorData[]
  marketMovers: {
    gainers: MarketData[]
    losers: MarketData[]
    mostActive: MarketData[]
  }
  globalMarkets: {
    name: string
    index: string
    change: number
    changePercent: number
  }[]
  crypto: {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
  }[]
  commodities: {
    name: string
    price: number
    change: number
    changePercent: number
    unit: string
  }[]
  currencies: {
    pair: string
    rate: number
    change: number
    changePercent: number
  }[]
}

export const MarketOverview = () => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1D')

  // ---------------- FALLBACK DATA ----------------
  const fallbackMarketData: MarketOverviewData = {
    primaryTickers: [
      {
        symbol: 'AAPL',
        name: 'Apple Inc',
        price: 175.25,
        change: 2.45,
        changePercent: 1.42,
        volume: 85000000,
        marketCap: 2800000000000,
        high: 178.5,
        low: 172.3,
        open: 174.5,
        previousClose: 172.8,
      },
      {
        symbol: 'TSLA',
        name: 'Tesla Inc',
        price: 285.75,
        change: 15.3,
        changePercent: 5.66,
        volume: 55000000,
        marketCap: 900000000000,
        high: 290.25,
        low: 275.5,
        open: 278.45,
        previousClose: 270.45,
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corp',
        price: 345.1,
        change: 4.8,
        changePercent: 1.41,
        volume: 32000000,
        marketCap: 2600000000000,
        high: 348.0,
        low: 338.2,
        open: 340.5,
        previousClose: 340.3,
      },
      {
        symbol: 'AMZN',
        name: 'Amazon.com Inc',
        price: 151.33,
        change: 3.83,
        changePercent: 2.6,
        volume: 51000000,
        marketCap: 1550000000000,
        high: 152.2,
        low: 147.4,
        open: 148.0,
        previousClose: 147.5,
      },
      {
        symbol: 'GOOG',
        name: 'Alphabet Inc (Google)',
        price: 138.75,
        change: 2.1,
        changePercent: 1.54,
        volume: 28000000,
        marketCap: 1750000000000,
        high: 140.2,
        low: 135.8,
        open: 136.9,
        previousClose: 136.65,
      },
    ],
    indices: [
      {
        symbol: 'SPX',
        name: 'S&P 500',
        price: 4521.54,
        change: 52.34,
        changePercent: 1.17,
        volume: 3250000000,
        high: 4530.25,
        low: 4480.15,
        open: 4495.2,
        previousClose: 4469.2,
        marketCap: 0,
      },
      {
        symbol: 'IXIC',
        name: 'NASDAQ',
        price: 14098.01,
        change: 198.45,
        changePercent: 1.43,
        volume: 4250000000,
        high: 14125.6,
        low: 13950.3,
        open: 13980.25,
        previousClose: 13899.56,
        marketCap: 0,
      },
      {
        symbol: 'DJI',
        name: 'Dow Jones',
        price: 35225.16,
        change: 425.78,
        changePercent: 1.22,
        volume: 2850000000,
        high: 35280.45,
        low: 34850.3,
        open: 34950.25,
        previousClose: 34799.38,
        marketCap: 0,
      },
      {
        symbol: 'RUT',
        name: 'Russell 2000',
        price: 1856.42,
        change: 23.15,
        changePercent: 1.26,
        volume: 1850000000,
        high: 1865.3,
        low: 1835.2,
        open: 1840.25,
        previousClose: 1833.27,
        marketCap: 0,
      },
    ],
    sectors: [],
    marketMovers: { gainers: [], losers: [], mostActive: [] },
    globalMarkets: [],
    crypto: [],
    commodities: [],
    currencies: [],
  }

  const [primaryTickers, setPrimaryTickers] = useState<MarketData[]>(fallbackMarketData.primaryTickers)
  const [indices, setIndices] = useState<MarketData[]>(fallbackMarketData.indices)
  const [loadingTickers, setLoadingTickers] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // ---------------- FETCHING LIVE DATA ----------------
  useEffect(() => {
    const fetchRealTickers = async () => {
      try {
        setLoadingTickers(true)

        const data = await systemApi.marketQuotes()

        const mapped: MarketData[] = (data.quotes || []).map((q: MarketQuote) => ({
          symbol: q.ticker,
          name: q.company_name,
          price: Number(q.last_price ?? 0),
          change: Number(q.price_change ?? 0),
          changePercent: Number(q.percent_change ?? 0),
          volume: Number(q.volume ?? 0),
          marketCap: 0,
          high: Number(q.high ?? 0),
          low: Number(q.low ?? 0),
          open: Number(q.open ?? 0),
          previousClose: Number(q.prev_close ?? 0),
        }))

        const primarySymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']

        const indexSymbolMap: Record<string, { symbol: string; name: string }> = {
          SPY: { symbol: 'SPX', name: 'S&P 500' },
          QQQ: { symbol: 'IXIC', name: 'NASDAQ' },
          DIA: { symbol: 'DJI', name: 'Dow Jones' },
          IWM: { symbol: 'RUT', name: 'Russell 2000' },
        }

        const primary = mapped.filter((m) => primarySymbols.includes(m.symbol))

        const indicesFromApi = mapped
          .filter((m) => Object.keys(indexSymbolMap).includes(m.symbol))
          .map((m) => {
            const meta = indexSymbolMap[m.symbol]
            return { ...m, symbol: meta.symbol, name: meta.name }
          })

        if (primary.length > 0) setPrimaryTickers(primary)
        if (indicesFromApi.length > 0) setIndices(indicesFromApi)

        setLoadError(null)
      } catch (err) {
        console.error(err)
        setLoadError('Failed to load live market data.')
      } finally {
        setLoadingTickers(false)
      }
    }

    fetchRealTickers()
  }, [])

  // ---------------- HELPERS ----------------
  const getChangeColor = (change: number) => (change >= 0 ? 'text-green-600' : 'text-red-600')
  const getChangeBg = (change: number) =>
    change >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
  const getChangeIcon = (change: number) =>
    change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />

  const formatNumber = (n: number) => {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
    return n.toFixed(2)
  }

  // ---------------- RENDER INDICES (LIVE) ----------------
  const renderIndicesTop = () => (
    <div className="flex justify-end">
      <div className="flex items-start gap-3">
        {/* Timeframe selector now sits directly to the left of the indices */}
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as any)}
          className="input w-28 h-10"
        >
          <option value="1D">1 Day</option>
          <option value="1W">1 Week</option>
          <option value="1M">1 Month</option>
          <option value="3M">3 Months</option>
          <option value="1Y">1 Year</option>
        </select>

        {/* SMALLER, SUBTLE INDEX CARDS (TOP-RIGHT) */}
        <div className="grid grid-cols-2 gap-1">
          {indices.map((index) => {
            const change = Number(index.change ?? 0)
            const changePercent = Number(index.changePercent ?? 0)

            return (
              <div
                key={index.symbol}
                className="card p-2.5 max-w-[170px] w-full"
              >
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {index.symbol}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {index.name}
                    </p>
                  </div>
                  <div className={`p-1 rounded-full ${getChangeBg(change)}`}>
                    {getChangeIcon(change)}
                  </div>
                </div>

                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  {index.price.toLocaleString()}
                </div>

                <div className="mt-0.5 flex items-center space-x-1 text-[12px]">
                  <span className={getChangeColor(change)}>
                    {change >= 0 ? '+' : ''}
                    {change.toFixed(2)}
                  </span>
                  <span className={getChangeColor(change)}>
                    ({changePercent >= 0 ? '+' : ''}
                    {changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )


  // ---------------- RENDER PRIMARY TICKERS ----------------
  const renderPrimaryTickers = () => (
    <div className="space-y-2">
      {loadError && (
        <p className="text-xs text-red-500 dark:text-red-300">
          {loadError} Showing fallback data.
        </p>
      )}

      {loadingTickers && !loadError && (
        <p className="text-xs text-gray-500 dark:text-gray-400">Loading live tickers...</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {primaryTickers.map((ticker) => {
          const change = Number(ticker.change ?? 0)
          const changePercent = Number(ticker.changePercent ?? 0)

          return (
            <div key={ticker.symbol} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {ticker.symbol}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{ticker.name}</p>
                </div>

                <div className={`p-2 rounded-full ${getChangeBg(change)}`}>
                  {getChangeIcon(change)}
                </div>
              </div>

              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {ticker.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>

              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${getChangeColor(change)}`}>
                  {change >= 0 ? '+' : ''}
                  {change.toFixed(2)}
                </span>

                <span className={`text-sm font-medium ${getChangeColor(change)}`}>
                  ({changePercent >= 0 ? '+' : ''}
                  {changePercent.toFixed(2)}%)
                </span>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Vol: {formatNumber(ticker.volume)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // ---------------- RETURN ----------------
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
          </div>
        </div>

        <div className="w-full lg:max-w-xl">
          {renderIndicesTop()}
        </div>
      </div>


      <div>{renderPrimaryTickers()}</div>
    </div>
  )
}
