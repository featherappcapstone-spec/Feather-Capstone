import { Routes, Route } from 'react-router-dom'
import { AuthGuard } from '@/components/AuthGuard'
import { AppLayout } from '@/components/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { TickerPage } from '@/pages/TickerPage'
import { NewsPage } from '@/pages/NewsPage'
import { AlertsPage } from '@/pages/AlertsPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { MarketPage } from '@/pages/MarketPage'
import { RecommendationsPage } from '@/pages/RecommendationsPage'
import { ChartsPage } from '@/pages/ChartsPage'
import { RiskPage } from '@/pages/RiskPage'
import { SettingsPage } from '@/pages/SettingsPage' 

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <AuthGuard>
            <AppLayout>
              <Routes>
                <Route path="/" element={<MarketPage />} />
                <Route path="/ticker/:symbol" element={<TickerPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/market" element={<MarketPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/charts" element={<ChartsPage />} />
                <Route path="/risk" element={<RiskPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </AppLayout>
          </AuthGuard>
        }
      />
    </Routes>
  )
}

export default App
