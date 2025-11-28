import { useState } from 'react'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

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

  const marketData: MarketOverviewData = {
    // MAIN 5 TICKERS ROW (AAPL, TSLA, MSFT, AMZN, GOOG)
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
        previousClose: 172.8
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
        previousClose: 270.45
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
        previousClose: 340.3
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
        previousClose: 147.5
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
        previousClose: 136.65
      }
    ],

    // INDICES (order only controls display)
    indices: [
      {
        symbol: 'SPX',
        name: 'S&P 500',
        price: 4521.54,
        change: 52.34,
        changePercent: 1.17,
        volume: 3250000000,
        marketCap: 0,
        high: 4530.25,
        low: 4480.15,
        open: 4495.2,
        previousClose: 4469.2
      },
      {
        symbol: 'IXIC',
        name: 'NASDAQ',
        price: 14098.01,
        change: 198.45,
        changePercent: 1.43,
        volume: 4250000000,
        marketCap: 0,
        high: 14125.6,
        low: 13950.3,
        open: 13980.25,
        previousClose: 13899.56
      },
      {
        symbol: 'DJI',
        name: 'Dow Jones',
        price: 35225.16,
        change: 425.78,
        changePercent: 1.22,
        volume: 2850000000,
        marketCap: 0,
        high: 35280.45,
        low: 34850.3,
        open: 34950.25,
        previousClose: 34799.38
      },
      {
        symbol: 'RUT',
        name: 'Russell 2000',
        price: 1856.42,
        change: 23.15,
        changePercent: 1.26,
        volume: 1850000000,
        marketCap: 0,
        high: 1865.3,
        low: 1835.2,
        open: 1840.25,
        previousClose: 1833.27
      }
    ],

    // everything else unchanged
    sectors: [
      { name: 'Technology', change: 2.15, changePercent: 1.85, topGainers: ['NVDA', 'AMD', 'INTC'], topLosers: ['META', 'SNAP', 'TWTR'] },
      { name: 'Healthcare', change: 1.45, changePercent: 1.25, topGainers: ['JNJ', 'PFE', 'MRK'], topLosers: ['GILD', 'BIIB', 'REGN'] },
      { name: 'Financials', change: 0.85, changePercent: 0.95, topGainers: ['JPM', 'BAC', 'WFC'], topLosers: ['GS', 'MS', 'C'] },
      { name: 'Energy', change: -0.45, changePercent: -0.65, topGainers: ['XOM', 'CVX', 'COP'], topLosers: ['SLB', 'HAL', 'EOG'] },
      { name: 'Consumer Discretionary', change: 1.25, changePercent: 1.15, topGainers: ['AMZN', 'TSLA', 'HD'], topLosers: ['NFLX', 'ROKU', 'PTON'] },
      { name: 'Industrials', change: 0.95, changePercent: 0.85, topGainers: ['CAT', 'BA', 'GE'], topLosers: ['FDX', 'UPS', 'LMT'] }
    ],
    marketMovers: {
      gainers: [
        { symbol: 'NVDA', name: 'NVIDIA Corp', price: 425.30, change: 25.45, changePercent: 6.36, volume: 45000000, marketCap: 1050000000000, high: 430.25, low: 400.15, open: 402.50, previousClose: 399.85 },
        { symbol: 'AMD', name: 'Advanced Micro Devices', price: 125.45, change: 8.25, changePercent: 7.03, volume: 35000000, marketCap: 200000000000, high: 128.50, low: 118.20, open: 119.30, previousClose: 117.20 },
        { symbol: 'TSLA', name: 'Tesla Inc', price: 285.75, change: 15.30, changePercent: 5.66, volume: 55000000, marketCap: 900000000000, high: 290.25, low: 275.50, open: 278.45, previousClose: 270.45 }
      ],
      losers: [
        { symbol: 'META', name: 'Meta Platforms', price: 185.25, change: -12.45, changePercent: -6.29, volume: 40000000, marketCap: 500000000000, high: 200.50, low: 180.30, open: 198.50, previousClose: 197.70 },
        { symbol: 'NFLX', name: 'Netflix Inc', price: 245.80, change: -8.25, changePercent: -3.25, volume: 25000000, marketCap: 110000000000, high: 255.50, low: 240.25, open: 252.30, previousClose: 254.05 },
        { symbol: 'SNAP', name: 'Snap Inc', price: 8.45, change: -0.85, changePercent: -9.14, volume: 30000000, marketCap: 15000000000, high: 9.50, low: 8.20, open: 9.30, previousClose: 9.30 }
      ],
      mostActive: [
        { symbol: 'AAPL', name: 'Apple Inc', price: 175.25, change: 2.45, changePercent: 1.42, volume: 85000000, marketCap: 2800000000000, high: 178.50, low: 172.30, open: 174.50, previousClose: 172.80 },
        { symbol: 'TSLA', name: 'Tesla Inc', price: 285.75, change: 15.30, changePercent: 5.66, volume: 55000000, marketCap: 900000000000, high: 290.25, low: 275.50, open: 278.45, previousClose: 270.45 },
        { symbol: 'NVDA', name: 'NVIDIA Corp', price: 425.30, change: 25.45, changePercent: 6.36, volume: 45000000, marketCap: 1050000000000, high: 430.25, low: 400.15, open: 402.50, previousClose: 399.85 }
      ]
    },
    globalMarkets: [
      { name: 'FTSE 100', index: 'UKX', change: 45.25, changePercent: 0.65 },
      { name: 'DAX', index: 'DAX', change: 125.50, changePercent: 0.85 },
      { name: 'CAC 40', index: 'CAC', change: 35.75, changePercent: 0.55 },
      { name: 'Nikkei 225', index: 'N225', change: 185.30, changePercent: 0.75 },
      { name: 'Hang Seng', index: 'HSI', change: -45.25, changePercent: -0.25 },
      { name: 'ASX 200', index: 'AXJO', change: 25.50, changePercent: 0.35 }
    ],
    crypto: [
      { symbol: 'BTC', name: 'Bitcoin', price: 42500.50, change: 1250.25, changePercent: 3.03 },
      { symbol: 'ETH', name: 'Ethereum', price: 2850.75, change: 125.50, changePercent: 4.61 },
      { symbol: 'BNB', name: 'Binance Coin', price: 325.45, change: 15.25, changePercent: 4.91 },
      { symbol: 'ADA', name: 'Cardano', price: 0.485, change: 0.025, changePercent: 5.43 },
      { symbol: 'SOL', name: 'Solana', price: 95.25, change: 8.50, changePercent: 9.80 }
    ],
    commodities: [
      { name: 'Gold', price: 1985.50, change: 15.25, changePercent: 0.77, unit: 'per oz' },
      { name: 'Silver', price: 24.85, change: 0.45, changePercent: 1.84, unit: 'per oz' },
      { name: 'Crude Oil', price: 82.45, change: -1.25, changePercent: -1.49, unit: 'per barrel' },
      { name: 'Natural Gas', price: 3.25, change: 0.15, changePercent: 4.84, unit: 'per MMBtu' },
      { name: 'Copper', price: 4.25, change: 0.05, changePercent: 1.19, unit: 'per lb' }
    ],
    currencies: [
      { pair: 'EUR/USD', rate: 1.0850, change: 0.0025, changePercent: 0.23 },
      { pair: 'GBP/USD', rate: 1.2650, change: 0.0050, changePercent: 0.40 },
      { pair: 'USD/JPY', rate: 149.25, change: -0.75, changePercent: -0.50 },
      { pair: 'USD/CAD', rate: 1.3650, change: 0.0025, changePercent: 0.18 },
      { pair: 'AUD/USD', rate: 0.6550, change: 0.0050, changePercent: 0.77 }
    ]
  }

  const getChangeColor = (change: number) =>
    change >= 0 ? 'text-green-600' : 'text-red-600'

  const getChangeBg = (change: number) =>
    change >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'

  const getChangeIcon = (change: number) =>
    change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(2)
  }


// SMALLER, SUBTLE INDEX CARDS (TOP-RIGHT)
const renderIndicesTop = () => (
  <div className="flex justify-end">
    <div className="grid grid-cols-[repeat(2,min-content)] gap-1">
      {marketData.indices.map((index) => (
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
            <div className={`p-1 rounded-full ${getChangeBg(index.change)}`}>
              {getChangeIcon(index.change)}
            </div>
          </div>

          <div className="text-base font-semibold text-gray-900 dark:text-white">
            {index.price.toLocaleString()}
          </div>

          <div className="mt-0.5 flex items-center space-x-1 text-[12px]">
            <span className={getChangeColor(index.change)}>
              {index.change >= 0 ? '+' : ''}
              {index.change.toFixed(2)}
            </span>
            <span className={getChangeColor(index.change)}>
              ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)





  // MAIN TICKERS ROW (where indices used to be originally)
  const renderPrimaryTickers = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {marketData.primaryTickers.map((ticker) => (
        <div key={ticker.symbol} className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {ticker.symbol}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {ticker.name}
              </p>
            </div>
            <div className={`p-2 rounded-full ${getChangeBg(ticker.change)}`}>
              {getChangeIcon(ticker.change)}
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {ticker.price.toLocaleString()}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${getChangeColor(ticker.change)}`}>
              {ticker.change >= 0 ? '+' : ''}
              {ticker.change.toFixed(2)}
            </span>
            <span className={`text-sm font-medium ${getChangeColor(ticker.change)}`}>
              ({ticker.changePercent >= 0 ? '+' : ''}
              {ticker.changePercent.toFixed(2)}%)
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Vol: {formatNumber(ticker.volume)}
          </div>
        </div>
      ))}
    </div>
  )

  const renderMarketMovers = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Gainers */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
          Top Gainers
        </h3>
        <div className="space-y-3">
          {marketData.marketMovers.gainers.map((stock) => (
            <div key={stock.symbol} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">${stock.price.toFixed(2)}</div>
                <div className="text-sm text-green-600">
                  +{stock.change.toFixed(2)} (+{stock.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Losers */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
          Top Losers
        </h3>
        <div className="space-y-3">
          {marketData.marketMovers.losers.map((stock) => (
            <div key={stock.symbol} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">${stock.price.toFixed(2)}</div>
                <div className="text-sm text-red-600">
                  {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most Active */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Activity className="h-5 w-5 text-blue-500 mr-2" />
          Most Active
        </h3>
        <div className="space-y-3">
          {marketData.marketMovers.mostActive.map((stock) => (
            <div key={stock.symbol} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">${stock.price.toFixed(2)}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Vol: {formatNumber(stock.volume)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* HEADER + INDICES ON TOP RIGHT */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Market Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time market data and analysis
              </p>
            </div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="input w-28"
            >
              <option value="1D">1 Day</option>
              <option value="1W">1 Week</option>
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="1Y">1 Year</option>
            </select>
          </div>
        </div>

        {/* 4 INDEX CARDS IN TOP-RIGHT */}
        <div className="w-full lg:max-w-xl">
          {renderIndicesTop()}
        </div>
      </div>

      {/* MAIN 5 TICKERS ROW */}
      <div>
        {renderPrimaryTickers()}
      </div>

      {/* (Optional) Movers section if you want to show it under the tickers later */}
      {/* <div>{renderMarketMovers()}</div> */}
    </div>
  )
}
