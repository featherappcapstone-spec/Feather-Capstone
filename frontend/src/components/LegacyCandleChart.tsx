// src/components/LegacyCandleChart.tsx
import { useEffect, useRef, useState } from 'react'
import { Maximize2, X } from 'lucide-react'
import {
  initLegacyCandleChart,
  disposeLegacyCandleChart,
  type LegacyCandleInput,
} from '@/lib/legacyCandleChart'

export interface LegacyCandleChartProps {
  symbol: string
  data: LegacyCandleInput[]
  height?: number
}

export const LegacyCandleChart = ({
  symbol,
  data,
  height = 300,
}: LegacyCandleChartProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const fullCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // --- 1. Small preview (NON-INTERACTIVE) ---
  useEffect(() => {
    if (!previewCanvasRef.current || data.length === 0) return

    const canvas = previewCanvasRef.current
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // interactive: false → single render, auto zoom-out, no drag/zoom/buttons
    initLegacyCandleChart(canvas, data, { interactive: false })
  }, [data, height])

  // --- 2. Fullscreen interactive chart ---
  useEffect(() => {
    if (!isExpanded || !fullCanvasRef.current || data.length === 0) return

    const canvas = fullCanvasRef.current
    // ✅ use bounding rect so the loop never resizes it mid-render
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // interactive: true → full original behavior
    initLegacyCandleChart(canvas, data, { interactive: true })

    // cleanup when modal closes
    return () => {
      disposeLegacyCandleChart()
    }
  }, [isExpanded]) // ✅ remove `data` here

  return (
    <>
      {/* SMALL CARD PREVIEW (no interaction) */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {symbol} Candlestick Chart
          </h3>

          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800/70 transition-colors"
            aria-label="Expand chart"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        <div style={{ height }} className="w-full">
          {/* preview canvas – static snapshot */}
          <canvas ref={previewCanvasRef} className="w-full h-full" />
        </div>
      </div>

      {/* FULLSCREEN MODAL WITH INTERACTIVE CHART */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-950 border border-gray-800 rounded-xl shadow-2xl w-[95vw] h-[85vh] max-w-6xl flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <h3 className="text-base md:text-lg font-semibold text-gray-100">
                {symbol} Candlestick Chart
              </h3>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
                aria-label="Close chart"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Big interactive canvas */}
            <div className="flex-1">
              <canvas ref={fullCanvasRef} className="w-full h-full" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
