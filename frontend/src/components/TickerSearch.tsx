// src/components/TickerSearch.tsx
import { useState, useMemo, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useTickers } from '@/hooks/useTickers' // keep whatever hook you already use

interface TickerSearchProps {
  onSelect: (symbol: string) => void
  placeholder?: string
}

export const TickerSearch = ({ onSelect, placeholder }: TickerSearchProps) => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const { data: tickers = [] } = useTickers()

  const filtered = useMemo(
    () =>
      tickers.filter((t: any) =>
        `${t.ticker} ${t.name}`.toLowerCase().includes(query.toLowerCase())
      ),
    [tickers, query]
  )

  const handleSelect = (symbol: string) => {
    setQuery(symbol)
    setOpen(false)
    onSelect(symbol)
  }

  // 🔒 Close dropdown when clicking anywhere outside the search area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* SEARCH INPUT – light & dark mode friendly */}
      <div className="
          flex items-center rounded-md border px-3 py-2
          bg-gray-100 text-gray-900 border-gray-300
          focus-within:border-primary-500
          dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700
        "
      >
        <Search className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder ?? 'Search for a ticker symbol...'}
          className="
            w-full bg-transparent text-sm
            placeholder-gray-500 dark:placeholder-gray-500
            focus:outline-none focus:ring-0
          "
        />
      </div>

      {/* DROPDOWN RESULTS */}
      {open && filtered.length > 0 && (
        <div
          className="
            absolute z-20 mt-1 w-full overflow-hidden rounded-md
            border border-gray-200 bg-white shadow-lg
            dark:border-gray-700 dark:bg-gray-900
          "
        >
          {filtered.map((item: any) => (
            <button
              key={item.ticker}
              type="button"
              onClick={() => handleSelect(item.ticker)}
              className="
                flex w-full items-center justify-between px-3 py-2 text-sm
                text-gray-900 hover:bg-gray-100
                dark:text-gray-100 dark:hover:bg-gray-800
                focus:outline-none
              "
            >
              <span className="font-medium">{item.ticker}</span>
              <span className="ml-2 truncate text-xs text-gray-500 dark:text-gray-400">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
