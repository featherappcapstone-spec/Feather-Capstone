// src/components/SentimentBadge.tsx
import { Diamond, Plus, Minus } from 'lucide-react'
import type { NewsItem } from '@/types'

interface SentimentBadgeProps {
  sentiment: NewsItem['sentiment']
  score?: number
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

  const normalized =
    (sentiment || 'neutral').toString().toLowerCase() as
      | 'positive'
      | 'negative'
      | 'neutral'

  const sentimentConfig: Record<
    'positive' | 'negative' | 'neutral',
    { bg: string; text: string; iconColor: string; label: string }
  > = {
    positive: {
      bg: 'bg-emerald-500/10 border border-emerald-500/30',
      text: 'text-emerald-400',
      iconColor: 'text-emerald-400',
      label: 'Positive',
    },
    negative: {
      bg: 'bg-red-500/10 border border-red-500/30',
      text: 'text-red-400',
      iconColor: 'text-red-400',
      label: 'Negative',
    },
    neutral: {
      bg: 'bg-sky-500/10 border border-sky-500/30',
      text: 'text-sky-400',
      iconColor: 'text-sky-400',
      label: 'Neutral',
    },
  }

  const config = sentimentConfig[normalized]
  const sizeNum = iconSize[size]

  const IconComponent =
    normalized === 'positive' ? (
      <div
        className="relative flex items-center justify-center"
        style={{ width: sizeNum + 4, height: sizeNum + 4 }}
      >
        <Diamond size={sizeNum} className="text-current" />
        <Plus
          size={sizeNum * 0.6}
          className={`absolute ${config.iconColor}`}
          strokeWidth={3}
        />
      </div>
    ) : normalized === 'negative' ? (
      <div
        className="relative flex items-center justify-center"
        style={{ width: sizeNum + 4, height: sizeNum + 4 }}
      >
        <Diamond size={sizeNum} className="text-current" />
        <Minus
          size={sizeNum * 0.6}
          className={`absolute ${config.iconColor}`}
          strokeWidth={3}
        />
      </div>
    ) : (
      <div
        className="relative flex items-center justify-center"
        style={{ width: sizeNum + 4, height: sizeNum + 4 }}
      >
        <Diamond size={sizeNum} className="text-current" />
      </div>
    )

  const scoreText =
    typeof score === 'number'
      ? `(${Math.round(score * 100)}%)`
      : '(N/A)'

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full font-medium ${sizeClasses[size]} ${config.bg} ${config.text}`}
    >
      <span className="flex-shrink-0">{IconComponent}</span>
      <span>{config.label}</span>
      <span className="opacity-75">{scoreText}</span>
    </div>
  )
}
