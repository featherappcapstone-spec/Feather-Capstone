// src/components/MarketQuotes.tsx
import React, { useEffect, useState } from "react";

type Quote = {
  ticker: string;
  company_name: string;
  last_price: number | null;
  price_change: number | null;
  percent_change: number | null;
  volume: number | null;
  high: number | null;
  low: number | null;
  open: number | null;
  prev_close: number | null;
  updated_at: string | null;
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "";

const MarketQuotes: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/market/quotes`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setQuotes(data.quotes || []);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load market data.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();

    // Optional: auto-refresh every 60s
    const id = setInterval(fetchQuotes, 60_000);
    return () => clearInterval(id);
  }, []);

  if (loading && quotes.length === 0) {
    return <div className="text-sm text-gray-500">Loading market data...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  const lastUpdated = quotes.reduce<string | null>((acc, q) => {
    if (!q.updated_at) return acc;
    return !acc || q.updated_at > acc ? q.updated_at : acc;
  }, null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Market Overview</h2>
        {lastUpdated && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left">Ticker</th>
              <th className="px-3 py-2 text-left">Company</th>
              <th className="px-3 py-2 text-right">Price</th>
              <th className="px-3 py-2 text-right">Change</th>
              <th className="px-3 py-2 text-right">% Change</th>
              <th className="px-3 py-2 text-right">Volume</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => {
              const isUp = (q.price_change ?? 0) >= 0;
              const changeClass = isUp ? "text-green-500" : "text-red-500";

              return (
                <tr
                  key={q.ticker}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="px-3 py-2 font-semibold">{q.ticker}</td>
                  <td className="px-3 py-2">{q.company_name}</td>
                  <td className="px-3 py-2 text-right">
                    {q.last_price !== null ? q.last_price.toFixed(2) : "-"}
                  </td>
                  <td className={`px-3 py-2 text-right ${changeClass}`}>
                    {q.price_change !== null ? q.price_change.toFixed(2) : "-"}
                  </td>
                  <td className={`px-3 py-2 text-right ${changeClass}`}>
                    {q.percent_change !== null
                      ? q.percent_change.toFixed(2) + "%"
                      : "-"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {q.volume !== null ? q.volume.toLocaleString() : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketQuotes;
