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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Lock size={64} className="text-orange-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Premium Feature</h1>
          <p className="text-gray-600 mb-6">This feature is only available for Premium users.</p>
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
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-10 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">🌡️ HeatWatch Premium Dashboard</h1>
        <p className="text-orange-100 text-lg">
          Advanced Urban Heat Island Analysis
        </p>
        <p className="text-orange-200 text-sm mt-1">
          ML-Powered Predictions, Real-time Monitoring & Intervention Strategies
        </p>
      </div>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
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
          <div className="inline-block w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Analyzing heat patterns...</p>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-center text-red-500 mt-8">{error}</p>}

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
            <div className="border-2 rounded-2xl p-6 bg-gray-50 border-gray-200 animate-pulse h-32 flex items-center justify-center">
              <span className="text-gray-400">Calculating risk score...</span>
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
            <div className="border-2 rounded-2xl p-8 bg-white border-dashed border-gray-300 text-center">
              <div className="inline-block w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500 font-medium">Loading advanced UHI analysis...</p>
              <p className="text-sm text-gray-400 mt-1">Fetching NASA satellite data and computing regression models.</p>
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
  const colors = {
    High: 'bg-red-50 border-red-300 text-red-800',
    Medium: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    Low: 'bg-green-50 border-green-300 text-green-800',
  };
  const icons = { High: '🔴', Medium: '🟡', Low: '🟢' };

  return (
    <div
      className={`border-2 rounded-2xl p-6 ${colors[data.mlScore.riskLevel]}`}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide mb-1 text-black">
            Urban Heat Island Risk
          </p>
          <h2 className="text-3xl font-bold">
            {icons[data.mlScore.riskLevel]} {data.location.city},{' '}
            {data.location.country}
          </h2>
          <p className="mt-1 text-sm text-black">
            Estimated {data.mlScore.uhi_intensity}°C warmer than surrounding
            rural areas
          </p>
        </div>
        <div className="text-center">
          <div className="text-6xl font-black">{data.mlScore.riskScore}</div>
          <div className="text-sm font-semibold uppercase font-black">
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
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="font-bold text-lg mb-4 text-black">Current Conditions</h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Temperature', value: `${data.weather.temp}°C` },
          { label: 'Feels Like', value: `${data.weather.feelsLike}°C` },
          { label: 'Humidity', value: `${data.weather.humidity}%` },
          { label: 'Wind Speed', value: `${data.weather.windSpeed} m/s` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      {data.mlScore && (
        <div className="mt-4 p-3 bg-orange-50 rounded-xl">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
            🛰️ Satellite-Ground Composite Index
          </p>

          <div className="mt-2 flex flex-col gap-2">
            {Object.entries(data.mlScore.factors).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs w-32 capitalize text-black">
                  {key.replace('Factor', '')}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-400 h-2 rounded-full"
                    style={{ width: `${val}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-black">{val}</span>
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
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-bold text-lg mb-2 text-black">🌱 AI Recommendations</h3>
        <p className="text-sm text-gray-400">Generating AI recommendations…</p>
      </div>
    );
  }

  const priorityStyle: Record<string, string> = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Low: 'bg-green-100 text-green-700 border-green-200',
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
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-black">🌱 AI Recommendations for City Planners</h3>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
          ✨ Powered by Groq AI
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {recs.map((rec, i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-colors"
          >
            <div className="text-2xl flex-shrink-0">
              {iconMap[rec.icon] ?? iconMap.default}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-sm text-black">{rec.action}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    priorityStyle[rec.priority] ?? priorityStyle.Medium
                  }`}
                >
                  {rec.priority} Priority
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{rec.detail}</p>
              <p className="text-xs text-orange-600 font-medium mt-1.5">📉 {rec.impact}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
