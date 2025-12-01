import { Diamond, Plus, Minus } from 'lucide-react'
import type { NewsItem } from '@/types'

interface SentimentBadgeProps {
  sentiment: NewsItem['sentiment']
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export const SentimentBadge = ({
  sentiment,
  score,
  size = 'md',
}: SentimentBadgeProps) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const iconSize = {
    sm: 12,
    md: 14,
    lg: 16,
  }

  const sentimentConfig = {
    Positive: {
      bg: 'bg-emerald-500/10 border border-emerald-500/30',
      text: 'text-emerald-400',
      iconColor: 'text-emerald-400',
    },
    Negative: {
      bg: 'bg-red-500/10 border border-red-500/30',
      text: 'text-red-400',
      iconColor: 'text-red-400',
    },
    Neutral: {
      // 🔵 blue neutral
      bg: 'bg-sky-500/10 border border-sky-500/30',
      text: 'text-sky-400',
      iconColor: 'text-sky-400',
    },
  } as const

  const config =
    sentimentConfig[sentiment as keyof typeof sentimentConfig] ??
    sentimentConfig.Neutral

  const sizeNum = iconSize[size]

  const IconComponent =
    sentiment === 'Positive' ? (
      <div className="relative">
        <Diamond size={sizeNum} className="text-current" />
        <Plus
          size={sizeNum * 0.6}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${config.iconColor}`}
          strokeWidth={3}
        />
      </div>
    ) : sentiment === 'Negative' ? (
      <div className="relative">
        <Diamond size={sizeNum} className="text-current" />
        <Minus
          size={sizeNum * 0.6}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${config.iconColor}`}
          strokeWidth={3}
        />
      </div>
    ) : (
      // Neutral → pure blue diamond
      <Diamond size={sizeNum} className="text-current" />
    )

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} ${config.bg} ${config.text}`}
    >
      <span className="flex-shrink-0">{IconComponent}</span>
      <span>{sentiment}</span>
      <span className="opacity-75">
        ({Math.round(score * 100)}%)
      </span>
    </div>
  )
}
