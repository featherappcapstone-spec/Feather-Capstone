// src/components/PriceChart.tsx
import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface PriceChartProps {
  symbol: string
  data?: {
    price: number | string
    change: number | string
    changePercent: number | string
    volume: number | string
    high: number | string
    low: number | string
  }
  isLoading?: boolean
}

type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y'

type ChartPoint = {
  time: Date
  price: number
  volume: number
}

export const PriceChart = ({ symbol, data, isLoading }: PriceChartProps) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D')

  const rawPrice = data?.price ?? 150.25
  const rawChange = data?.change ?? 2.45
  const rawChangePercent = data?.changePercent ?? 1.66
  const rawVolume = data?.volume ?? 45234567
  const rawHigh = data?.high ?? 628.35
  const rawLow = data?.low ?? 75.13

  const currentPrice = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice)
  const change = typeof rawChange === 'number' ? rawChange : Number(rawChange)
  const changePercent =
    typeof rawChangePercent === 'number'
      ? rawChangePercent
      : Number(rawChangePercent)
  const volume = typeof rawVolume === 'number' ? rawVolume : Number(rawVolume)
  const high = typeof rawHigh === 'number' ? rawHigh : Number(rawHigh)
  const low = typeof rawLow === 'number' ? rawLow : Number(rawLow)

  const isPositive = change >= 0

  const generateMockData = (period: Timeframe): ChartPoint[] => {
    const points =
      period === '1D'
        ? 24
        : period === '1W'
        ? 7
        : period === '1M'
        ? 30
        : period === '3M'
        ? 90
        : 365

    const basePrice = currentPrice || 100
    const volatility = 0.02

    return Array.from({ length: points }, (_, i) => {
      const randomChange = (Math.random() - 0.5) * volatility
      const price = basePrice * (1 + randomChange * (i + 1))
      return {
        time: new Date(
          Date.now() - ((points - i) * 24 * 60 * 60 * 1000) / points
        ),
        price: Math.max(price, basePrice * 0.5),
        volume: Math.floor(Math.random() * 1000000) + 100000,
      }
    })
  }

  const [chartData, setChartData] = useState<ChartPoint[]>(() =>
    generateMockData(timeframe)
  )
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  useEffect(() => {
    setChartData(generateMockData(timeframe))
    setHoverIndex(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, symbol])

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  const safeData = chartData.length > 0 ? chartData : generateMockData('1D')

  const maxPrice = Math.max(...safeData.map((d) => d.price))
  const minPrice = Math.min(...safeData.map((d) => d.price))
  const priceRange = maxPrice - minPrice || 1

  // Bigger chart, fills most of the box
  const width = 600
  const height = 260
  const horizontalPadding = 24
  const verticalPadding = 20

  const svgPoints = safeData.map((point, index) => {
    const x =
      horizontalPadding +
      (index / (safeData.length - 1 || 1)) * (width - horizontalPadding * 2)

    const normalized =
      priceRange === 0 ? 0.5 : (point.price - minPrice) / priceRange

    const y =
      height - verticalPadding - normalized * (height - verticalPadding * 2)

    return { x, y, point }
  })

  const pointsAttr = svgPoints.map((p) => `${p.x},${p.y}`).join(' ')

  const active =
    hoverIndex !== null &&
    hoverIndex >= 0 &&
    hoverIndex < svgPoints.length
      ? svgPoints[hoverIndex]
      : null

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {symbol} Price Chart
          </h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ${currentPrice.toFixed(2)}
              </span>
              <div
                className={`flex items-center space-x-1 ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {isPositive ? '+' : ''}
                  {change.toFixed(2)} ({isPositive ? '+' : ''}
                  {changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex space-x-2 mb-4">
        {(['1D', '1W', '1M', '3M', '1Y'] as Timeframe[]).map((period) => (
          <button
            key={period}
            onClick={() => setTimeframe(period)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              timeframe === period
                ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.1"
              />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Area fill gradients */}
          <defs>
            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Line */}
          <polyline
            fill="none"
            stroke={isPositive ? '#10b981' : '#ef4444'}
            strokeWidth="2"
            points={pointsAttr}
            className="drop-shadow-sm"
          />

          {/* Area under line */}
          <polygon
            points={`${horizontalPadding},${height - verticalPadding} ${pointsAttr} ${
              width - horizontalPadding
            },${height - verticalPadding}`}
            fill={isPositive ? 'url(#greenGradient)' : 'url(#redGradient)'}
            opacity="0.1"
          />

          {/* Hoverable points + hitboxes */}
          {svgPoints.map((p, index) => (
            <g key={index}>
              {/* visible point when hovered */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === index ? 4 : 3}
                fill={isPositive ? '#10b981' : '#ef4444'}
                opacity={hoverIndex === index ? 1 : 0}
              />
              {/* invisible vertical hitbox */}
              <rect
                x={p.x - 8}
                y={0}
                width={16}
                height={height}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            </g>
          ))}

          {/* Tooltip */}
          {active && (
            <g transform={`translate(${active.x}, ${active.y - 40})`}>
              {/* BOX */}
              <rect
                x={-55}
                y={-28}
                width={110}
                height={38}
                rx={8}
                ry={8}
                fill="#0f172a" // slate-900
                opacity="0.95"
                stroke="#1e293b" // slate-800 border
                strokeWidth="1"
                style={{
                  filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.45))',
                }}
              />

              {/* PRICE */}
              <text
                x={0}
                y={-10}
                textAnchor="middle"
                className="text-sm font-semibold"
                fill="#f1f5f9" // slate-100
              >
                ${active.point.price.toFixed(2)}
              </text>

              {/* TIME */}
              <text
                x={0}
                y={6}
                textAnchor="middle"
                className="text-[10px]"
                fill="#cbd5e1" // slate-300
              >
                {active.point.time.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">High</div>
          <div className="font-semibold text-gray-900 dark:text-white">
            ${high.toFixed(2)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Low</div>
          <div className="font-semibold text-gray-900 dark:text-white">
            ${low.toFixed(2)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Volume</div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {(volume / 1_000_000).toFixed(1)}M
          </div>
        </div>
      </div>
    </div>
  )
}
