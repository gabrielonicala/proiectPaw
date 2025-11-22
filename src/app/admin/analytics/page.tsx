'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import ViewChart from '@/components/analytics/ViewChart';

interface AnalyticsStats {
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  timeRange: string;
  topPages: Array<{ path: string; views: number }>;
  dailyViews: Array<{ date: string; views: number }>;
  hourlyViews: Array<{ hour: number; views: number }>;
  hourly24Data: Array<{ hour: number; views: number }>;
  daily30Data: Array<{ date: string; views: number }>;
  deviceBreakdown: Array<{ device: string; views: number }>;
  browserBreakdown: Array<{ browser: string; views: number }>;
  referrerBreakdown: Array<{ source: string; views: number }>;
  countryBreakdown: Array<{ country: string; views: number }>;
}

type ChartMode = '24h' | '7d' | '30d';

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<ChartMode>('24h');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    fetchStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [status, router, chartMode]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/stats?range=${chartMode}`);
      
      if (response.status === 403) {
        setError('Access denied. Admin access required.');
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!stats) return [];

    if (chartMode === '24h') {
      return stats.hourly24Data.map(item => ({
        label: `${item.hour}`,
        value: item.views,
      }));
    } else if (chartMode === '7d') {
      return stats.dailyViews.map(item => ({
        label: new Date(item.date).getDate().toString(),
        value: item.views,
      }));
    } else {
      return stats.daily30Data.map(item => ({
        label: new Date(item.date).getDate().toString(),
        value: item.views,
      }));
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white font-pixel text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Card className="max-w-md bg-gray-900 border-red-600">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-red-400 mb-4 font-pixel">Access Denied</h1>
            <p className="text-gray-300 font-pixel">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2 font-pixel text-orange-400">
            Analytics Dashboard
          </h1>
          <p className="text-gray-400 font-pixel">Server-side page view tracking (GDPR-compliant)</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-orange-500/30 hover:border-orange-500/50 transition-all">
            <div className="p-6">
              <div className="text-gray-400 text-sm font-pixel mb-2">Total Views</div>
              <div className="text-4xl font-bold text-white font-pixel">{stats.totalViews.toLocaleString()}</div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-orange-500/30 hover:border-orange-500/50 transition-all">
            <div className="p-6">
              <div className="text-gray-400 text-sm font-pixel mb-2">Today</div>
              <div className="text-4xl font-bold text-white font-pixel">{stats.viewsToday.toLocaleString()}</div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-orange-500/30 hover:border-orange-500/50 transition-all">
            <div className="p-6">
              <div className="text-gray-400 text-sm font-pixel mb-2">This Week</div>
              <div className="text-4xl font-bold text-white font-pixel">{stats.viewsThisWeek.toLocaleString()}</div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-orange-500/30 hover:border-orange-500/50 transition-all">
            <div className="p-6">
              <div className="text-gray-400 text-sm font-pixel mb-2">This Month</div>
              <div className="text-4xl font-bold text-white font-pixel">{stats.viewsThisMonth.toLocaleString()}</div>
            </div>
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-orange-500/30 mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-pixel">Page Views</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartMode('24h')}
                  className={`px-4 py-2 rounded font-pixel text-sm transition-all ${
                    chartMode === '24h'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  24 Hours
                </button>
                <button
                  onClick={() => setChartMode('7d')}
                  className={`px-4 py-2 rounded font-pixel text-sm transition-all ${
                    chartMode === '7d'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setChartMode('30d')}
                  className={`px-4 py-2 rounded font-pixel text-sm transition-all ${
                    chartMode === '30d'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>
            <ViewChart data={getChartData()} mode={chartMode} />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Pages */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-orange-500/30">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 font-pixel">
                Top Pages {chartMode === '24h' ? '(Last 24 Hours)' : chartMode === '7d' ? '(Last 7 Days)' : '(Last 30 Days)'}
              </h2>
              <div className="space-y-3">
                {stats.topPages.length > 0 ? (
                  stats.topPages.map((page, index) => (
                    <div key={page.path} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-orange-400 font-pixel w-6">#{index + 1}</span>
                        <span className="text-white font-pixel font-mono text-sm">{page.path}</span>
                      </div>
                      <span className="text-orange-400 font-pixel font-bold">{page.views.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 font-pixel">No data yet</p>
                )}
              </div>
            </div>
          </Card>

          {/* Device, Browser, Referrer, and Country Breakdown */}
          <div className="space-y-6">
            {/* Device Breakdown */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-orange-500/30">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4 font-pixel">
                  Device Types {chartMode === '24h' ? '(24h)' : chartMode === '7d' ? '(7d)' : '(30d)'}
                </h2>
                <div className="space-y-2">
                  {stats.deviceBreakdown.length > 0 ? (
                    stats.deviceBreakdown.map((device) => (
                      <div key={device.device} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                        <span className="text-white font-pixel capitalize text-sm">{device.device}</span>
                        <span className="text-orange-400 font-pixel font-bold text-sm">{device.views.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 font-pixel text-sm">No data yet</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Browser Breakdown */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-orange-500/30">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4 font-pixel">
                  Browsers {chartMode === '24h' ? '(24h)' : chartMode === '7d' ? '(7d)' : '(30d)'}
                </h2>
                <div className="space-y-2">
                  {stats.browserBreakdown.length > 0 ? (
                    stats.browserBreakdown.map((browser) => (
                      <div key={browser.browser} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                        <span className="text-white font-pixel capitalize text-sm">{browser.browser}</span>
                        <span className="text-orange-400 font-pixel font-bold text-sm">{browser.views.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 font-pixel text-sm">No data yet</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Traffic Sources and Countries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Referrer Sources */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-orange-500/30">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 font-pixel">
                Traffic Sources {chartMode === '24h' ? '(Last 24 Hours)' : chartMode === '7d' ? '(Last 7 Days)' : '(Last 30 Days)'}
              </h2>
              <div className="space-y-3">
                {stats.referrerBreakdown.length > 0 ? (
                  stats.referrerBreakdown.map((source) => (
                    <div key={source.source} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                      <span className="text-white font-pixel capitalize">{source.source}</span>
                      <span className="text-orange-400 font-pixel font-bold">{source.views.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 font-pixel">No data yet</p>
                )}
              </div>
            </div>
          </Card>

          {/* Country Breakdown */}
          {stats.countryBreakdown.length > 0 && (
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-orange-500/30">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 font-pixel">
                  Countries {chartMode === '24h' ? '(Last 24 Hours)' : chartMode === '7d' ? '(Last 7 Days)' : '(Last 30 Days)'}
                </h2>
                <div className="space-y-3">
                  {stats.countryBreakdown.map((country) => (
                    <div key={country.country} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                      <span className="text-white font-pixel">{country.country}</span>
                      <span className="text-orange-400 font-pixel font-bold">{country.views.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="text-center text-gray-500 text-sm font-pixel">
          <p>Data refreshes every 30 seconds</p>
          <p className="mt-2">Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
}
