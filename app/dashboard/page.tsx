'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import LocationSearch from '@/components/LocationSearch';
import Charts from '@/components/Charts';
import ExportPDF from '@/components/ExportPDF';
import { AppData, LocationData } from '@/lib/types';
import { useState } from 'react';
import UHIDeltaPanel from '@/components/UHIDeltaPanel';
import PeakHourPanel from '@/components/PeakHourPanel';
import RegressionForecast from '@/components/RegressionForecast';
import InterventionSimulator from '@/components/InterventionSimulator';
import ONNXInsight from '@/components/ONNXInsight';
import { generateHeatZones } from '@/lib/heatZones';
import { Lock } from 'lucide-react';

// HeatMap uses Leaflet which needs dynamic import (no SSR)
const HeatMap = dynamic(() => import('@/components/HeatMap'), { ssr: false });

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AppData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect to home if not logged in or not premium
  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    if (user.plan !== 'premium') {
      router.push('/pricing');
    }
  }, [user, router]);

  if (!user || user.plan !== 'premium') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <Lock size={64} className="text-[var(--accent-fire)] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Premium Feature</h1>
          <p className="text-[var(--text-muted)] mb-6">This feature is only available for Premium users.</p>
        </div>
      </div>
    );
  }

  const handleLocationSelected = (loc: LocationData) => {
    setSelectedLocation(loc);
    setError('');
  };

  const runAnalysis = async () => {
    if (!selectedLocation) {
      setError('Please select a location first.');
      return;
    }

    const loc = selectedLocation;
    setLoading(true);
    setError('');

    try {
      const [weatherRes, historicalRes] = await Promise.all([
        axios.get(`/api/weather?lat=${loc.lat}&lng=${loc.lng}`),
        axios.get(`/api/historical?lat=${loc.lat}&lng=${loc.lng}`),
      ]);

      const { weather, forecast } = weatherRes.data;
      const { historical } = historicalRes.data;

      const heatZones = generateHeatZones(loc.lat, loc.lng, 50);

      setData({
        location: loc,
        weather,
        historical,
        forecast,
        mlScore: null,
        heatZones,
        uhiEngine: null,
        fetchedAt: new Date().toISOString(),
      });
      setLoading(false);

      try {
        const uhiRes = await axios.post('/api/uhi-engine', {
          lat: loc.lat,
          lng: loc.lng,
          city: loc.city,
        });

        setData((prev) =>
          prev
            ? {
                ...prev,
                uhiEngine: uhiRes.data,
                mlScore: uhiRes.data.mlScore,
                heatZones: generateHeatZones(
                  loc.lat,
                  loc.lng,
                  uhiRes.data.riskScore
                ),
              }
            : prev
        );
      } catch (e) {
        console.warn('UHI Engine failed, core results still visible', e);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch climate data. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--accent-fire)] to-[var(--accent-danger)] text-[var(--foreground)] py-12 px-4 text-center border-b border-[var(--border)]">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">🌡️ Premium Dashboard</h1>
        <p className="text-lg text-[var(--foreground)] opacity-90">
          AI-Powered Urban Heat Island Analysis & Mitigation
        </p>
        <p className="text-sm mt-1 text-[var(--text-muted)]">
          Real-time monitoring • ML predictions • Intervention simulator
        </p>
      </div>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xl p-6">
          <LocationSearch
            onLocationSelected={handleLocationSelected}
            onAnalyze={runAnalysis}
            hasSelectedLocation={Boolean(selectedLocation)}
            selectedLocationLabel={
              selectedLocation
                ? `${selectedLocation.city}, ${selectedLocation.country}`
                : ''
            }
            loading={loading}
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center mt-16">
          <div className="inline-block w-12 h-12 border-4 border-[var(--accent-fire)] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[var(--text-muted)]">Analyzing heat patterns...</p>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-center text-[var(--accent-danger)] mt-8">{error}</p>}

      {/* Results */}
      {data && !loading && (
        <div
          id="report-content"
          className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8"
        >
          {/* Risk Score Banner */}
          {data.mlScore ? (
            <RiskBanner data={data} />
          ) : (
            <div className="border-2 rounded-2xl p-6 bg-[var(--surface-light)] border-[var(--border)] animate-pulse h-32 flex items-center justify-center">
              <span className="text-[var(--text-muted)]">Calculating risk score...</span>
            </div>
          )}

          {/* Map + Current Weather */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HeatMap data={data} />
            <WeatherCard data={data} />
          </div>

          {/* Charts */}
          <Charts data={data} />

          {/* Recommendations */}
          {data.mlScore && <Recommendations data={data} />}

          {/* Export */}
          <ExportPDF data={data} />

          {/* Advanced UHI Engine Panels */}
          {data.uhiEngine ? (
            <>
              <UHIDeltaPanel
                urbanTemp={data.uhiEngine.urbanTemp}
                ruralBaseline={data.uhiEngine.ruralBaseline}
                ruralTemps={data.uhiEngine.ruralTemps}
                uhiIntensity={data.uhiEngine.uhiIntensity}
                adjustedUHI={data.uhiEngine.adjustedUHI}
                nasaLST={data.uhiEngine.nasa.lst}
                nasaNDVI={data.uhiEngine.nasa.ndvi_proxy}
                city={data.location.city}
              />

              <PeakHourPanel
                hourlyPattern={data.uhiEngine.hourlyPattern}
                peakHour={data.uhiEngine.peakHour}
                ruralBaseline={data.uhiEngine.ruralBaseline}
              />

              <RegressionForecast
                historical={data.uhiEngine.historical}
                forecast={data.uhiEngine.forecast}
                regression={data.uhiEngine.regression}
                ruralBaseline={data.uhiEngine.ruralBaseline}
              />

              <ONNXInsight data={data} />

              <InterventionSimulator
                currentUHI={data.uhiEngine.uhiIntensity}
                lat={data.location.lat}
                lng={data.location.lng}
                city={data.location.city}
              />
            </>
          ) : (
            <div className="border-2 rounded-2xl p-8 bg-[var(--surface)] border-dashed border-[var(--border)] text-center">
              <div className="inline-block w-8 h-8 border-4 border-[var(--accent-fire)] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-[var(--foreground)] font-medium">Loading advanced UHI analysis...</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Fetching NASA satellite data and computing regression models.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

// Risk Banner Component
function RiskBanner({ data }: { data: AppData }) {
  if (!data.mlScore) return null;
  const riskColor = data.mlScore.riskLevel === 'High' ? 'var(--accent-danger)' : 
                    data.mlScore.riskLevel === 'Medium' ? 'var(--accent-heat)' : 
                    'var(--accent-cool)';
  const bgColor = data.mlScore.riskLevel === 'High' ? 'rgba(196, 30, 58, 0.1)' : 
                  data.mlScore.riskLevel === 'Medium' ? 'rgba(247, 147, 30, 0.1)' : 
                  'rgba(30, 136, 229, 0.1)';
  const borderColor = `1px solid ${riskColor}`;
  const icons = { High: '🔴', Medium: '🟡', Low: '🟢' };

  return (
    <div
      className="border rounded-2xl p-6 animate-fadeUp"
      style={{ backgroundColor: bgColor, borderColor: riskColor }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide mb-1 text-[var(--text-muted)]">
            Urban Heat Island Risk Assessment
          </p>
          <h2 className="text-3xl font-serif font-bold text-[var(--foreground)]">
            {icons[data.mlScore.riskLevel]} {data.location.city},{' '}
            {data.location.country}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {data.mlScore.uhi_intensity}°C warmer than rural baseline
          </p>
        </div>
        <div className="text-center">
          <div className="text-6xl font-black" style={{ color: riskColor }}>{data.mlScore.riskScore}</div>
          <div className="text-sm font-semibold uppercase" style={{ color: riskColor }}>
            {data.mlScore.riskLevel} Risk
          </div>
        </div>
      </div>
    </div>
  );
}

// Weather Card
function WeatherCard({ data }: { data: AppData }) {
  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-lg p-6">
      <h3 className="font-serif font-bold text-lg mb-4 text-[var(--foreground)]">Current Conditions</h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Temperature', value: `${data.weather.temp}°C` },
          { label: 'Feels Like', value: `${data.weather.feelsLike}°C` },
          { label: 'Humidity', value: `${data.weather.humidity}%` },
          { label: 'Wind Speed', value: `${data.weather.windSpeed} m/s` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[var(--surface-light)] rounded-xl p-3 border border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)]">{label}</p>
            <p className="text-xl font-bold text-[var(--foreground)]">{value}</p>
          </div>
        ))}
      </div>

      {data.mlScore && (
        <div className="mt-4 p-3 bg-[var(--surface-light)] border border-[var(--accent-fire)] border-opacity-30 rounded-xl">
          <p className="text-xs text-[var(--accent-fire)] uppercase font-bold tracking-wider">
            🛰️ Satellite-Ground Composite Index
          </p>

          <div className="mt-2 flex flex-col gap-2">
            {Object.entries(data.mlScore.factors).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs w-32 capitalize text-[var(--text-muted)]">
                  {key.replace('Factor', '')}
                </span>
                <div className="flex-1 bg-[var(--surface)] rounded-full h-2 border border-[var(--border)]">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[var(--accent-fire)] to-[var(--accent-heat)]"
                    style={{ width: `${val}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-[var(--foreground)]">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Recommendations
function Recommendations({ data }: { data: AppData }) {
  const recs = data.uhiEngine?.recommendations;

  if (!recs || recs.length === 0) {
    if (!data.uhiEngine) return null;
    return (
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow p-6">
        <h3 className="font-serif font-bold text-lg mb-2 text-[var(--foreground)]">🌱 AI Recommendations</h3>
        <p className="text-sm text-[var(--text-muted)]">Generating AI recommendations…</p>
      </div>
    );
  }

  const priorityStyle: Record<string, string> = {
    High: 'bg-[var(--accent-danger)] bg-opacity-20 text-[var(--accent-danger)] border-[var(--accent-danger)] border-opacity-30',
    Medium: 'bg-[var(--accent-heat)] bg-opacity-20 text-[var(--accent-heat)] border-[var(--accent-heat)] border-opacity-30',
    Low: 'bg-[var(--accent-cool)] bg-opacity-20 text-[var(--accent-cool)] border-[var(--accent-cool)] border-opacity-30',
  };

  const iconMap: Record<string, string> = {
    trees: '🌳',
    leaf: '🌿',
    droplet: '💧',
    building: '🏢',
    sun: '☀️',
    'chart-line': '📈',
    default: '🔹',
  };

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-bold text-lg text-[var(--foreground)]">🌱 AI Recommendations for City Planners</h3>
        <span className="text-xs bg-[var(--accent-cool)] bg-opacity-20 text-[var(--accent-cool)] px-2 py-1 rounded-full font-medium">
          ✨ Powered by Groq AI
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {recs.map((rec, i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-light)] hover:bg-[var(--surface)] hover:border-[var(--accent-fire)] transition-all"
          >
            <div className="text-2xl flex-shrink-0">
              {iconMap[rec.icon] ?? iconMap.default}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-sm text-[var(--foreground)]">{rec.action}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    priorityStyle[rec.priority] ?? priorityStyle.Medium
                  }`}
                >
                  {rec.priority} Priority
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{rec.detail}</p>
              <p className="text-xs text-[var(--accent-fire)] font-medium mt-1.5">📉 {rec.impact}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
