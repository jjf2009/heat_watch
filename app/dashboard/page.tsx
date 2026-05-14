'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
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
import Link from 'next/link';
import ChatBot from '@/components/ChatBot';
// HeatMap uses Leaflet which needs dynamic import (no SSR)
const HeatMap = dynamic(() => import('@/components/HeatMap'), { ssr: false });

type PlanTier = 'free' | 'professional' | 'enterprise';

const PLAN_LABELS: Record<PlanTier, string> = {
  free: '🆓 Free',
  professional: '⭐ Professional',
  enterprise: '🏢 Enterprise',
};

const PLAN_COLORS: Record<PlanTier, string> = {
  free: 'from-orange-400 to-orange-500 text-black',
  professional: 'from-[var(--accent-fire)] to-[var(--accent-danger)] text-white',
  enterprise: 'from-indigo-700 to-purple-700 text-white',
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const planParam = (searchParams.get('plan') ?? 'free') as PlanTier;
  const plan: PlanTier = ['free', 'professional', 'enterprise'].includes(planParam)
    ? planParam
    : 'free';

  const isFree = plan === 'free';
  const isPro = plan === 'professional';
  const isEnterprise = plan === 'enterprise';

  const [data, setData] = useState<AppData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
              heatZones: generateHeatZones(loc.lat, loc.lng, uhiRes.data.riskScore),
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
      <div className={`relative overflow-hidden bg-gradient-to-r ${PLAN_COLORS[plan]} py-16 px-4 text-center border-b border-[var(--border)] shadow-inner`}>
        {/* Flair / Decorative Background */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white opacity-20 rounded-full blur-3xl mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black opacity-10 rounded-full blur-3xl mix-blend-overlay pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-sans font-black mb-4 tracking-tight drop-shadow-sm">
            HeatWatch Dashboard
          </h1>
          <p className="text-xl font-bold opacity-80 uppercase tracking-widest mb-2">
            Urban Heat Island Analysis
          </p>
          <div className="h-1 w-24 bg-current opacity-20 mx-auto rounded-full mb-4"></div>
          <p className="text-base font-semibold opacity-75 max-w-2xl mx-auto">
            {isFree && 'Basic heat analysis · Weather data · Map visualization'}
            {isPro && 'AI recommendations · Export tools · UHI delta · Regression forecast'}
            {isEnterprise && 'Full access · ONNX baseline model · Intervention simulator'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xl p-6">
          <LocationSearch
            onLocationSelected={handleLocationSelected}
            onAnalyze={runAnalysis}
            hasSelectedLocation={Boolean(selectedLocation)}
            selectedLocationLabel={
              selectedLocation ? `${selectedLocation.city}, ${selectedLocation.country}` : ''
            }
            loading={loading}
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center mt-16">
          <div className="inline-block w-12 h-12 border-4 border-[var(--accent-fire)] border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-[var(--text-muted)]">Analyzing heat patterns...</p>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-center text-[var(--accent-danger)] mt-8">{error}</p>}

      {/* Results */}
      {data && !loading && (
        <div id="report-content" className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">

          {/* ─── FREE TIER COMPONENTS ─── */}

          {/* Risk Score Banner — visible to all */}
          {data.mlScore ? (
            <RiskBanner data={data} />
          ) : (
            <div className="border-2 rounded-2xl p-6 bg-[var(--surface-light)] border-[var(--border)] animate-pulse h-32 flex items-center justify-center">
              <span className="text-[var(--text-muted)]">Calculating risk score...</span>
            </div>
          )}

          {/* Urban Heat Map + Current Conditions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HeatMap data={data} />
            <WeatherCard data={data} />
          </div>

          {/* Community Heat Reports placeholder */}
          <CommunityHeatReports />

          {/* 30-Day History + 5-Day Forecast + Heat Summary + ML Risk — Charts component */}
          <Charts data={data} />

          {/* ─── PROFESSIONAL TIER COMPONENTS ─── */}
          {(isPro || isEnterprise) ? (
            <>
              {/* AI Recommendations */}
              {data.mlScore && <Recommendations data={data} />}

              {/* Export Data & Reports */}
              <ExportPDF data={data} />

              {/* Real UHI Delta */}
              {data.uhiEngine ? (
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
              ) : (
                <LoadingUHI label="Loading Real UHI Delta..." />
              )}

              {/* Regression Forecast */}
              {data.uhiEngine ? (
                <RegressionForecast
                  historical={data.uhiEngine.historical}
                  forecast={data.uhiEngine.forecast}
                  regression={data.uhiEngine.regression}
                  ruralBaseline={data.uhiEngine.ruralBaseline}
                />
              ) : (
                <LoadingUHI label="Loading Regression Forecast..." />
              )}
            </>
          ) : (
            /* Locked preview for non-pro users */
            <LockedSection
              title="Professional Features"
              items={['AI Recommendations for City Planners', 'Export Data & Reports', 'Real UHI Delta', 'Regression Forecast']}
              upgradeLink="/pricing"
              upgradePlan="Professional"
            />
          )}

          {/* ─── ENTERPRISE TIER COMPONENTS ─── */}
          {isEnterprise ? (
            <>
              {/* Diurnal UHI Cycle */}
              {data.uhiEngine ? (
                <PeakHourPanel
                  hourlyPattern={data.uhiEngine.hourlyPattern}
                  peakHour={data.uhiEngine.peakHour}
                  ruralBaseline={data.uhiEngine.ruralBaseline}
                />
              ) : (
                <LoadingUHI label="Loading UHI Diurnal Cycle..." />
              )}

              {/* ONNX 20-Year Baseline */}
              <ONNXInsight data={data} />

              {/* Intervention Simulator */}
              {data.uhiEngine && (
                <InterventionSimulator
                  currentUHI={data.uhiEngine.uhiIntensity}
                  lat={data.location.lat}
                  lng={data.location.lng}
                  city={data.location.city}
                />
              )}
            </>
          ) : (
            /* Locked preview for non-enterprise */
            <LockedSection
              title="Enterprise Features"
              items={['🤖 Climatology Model — 20-Year UHI Baseline', '🧪 Intervention Simulator']}
              upgradeLink="/pricing"
              upgradePlan="Enterprise"
            />
          )}

        </div>
      )}
      {data && !loading && (
        <ChatBot data={data} plan={plan} />
      )}
    </main>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-12 h-12 border-4 border-[var(--accent-fire)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

// ─── Helper Components ───────────────────────────────────────────────────────

function LoadingUHI({ label }: { label: string }) {
  return (
    <div className="border-2 rounded-2xl p-8 bg-[var(--surface)] border-dashed border-[var(--border)] text-center">
      <div className="inline-block w-8 h-8 border-4 border-[var(--accent-fire)] border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-[var(--foreground)] font-medium">{label}</p>
    </div>
  );
}

function LockedSection({
  title,
  items,
  upgradeLink,
  upgradePlan,
}: {
  title: string;
  items: string[];
  upgradeLink: string;
  upgradePlan: string;
}) {
  return (
    <div className="relative rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] p-8 overflow-hidden">
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-[var(--background)] bg-opacity-60 flex flex-col items-center justify-center z-10 gap-4">
        <Lock size={36} className="text-[var(--accent-fire)]" />
        <p className="text-[var(--foreground)] font-bold text-lg">{title}</p>
        <p className="text-sm text-[var(--text-muted)] text-center max-w-xs">
          Upgrade to {upgradePlan} to unlock these features.
        </p>
        <Link
          href={upgradeLink}
          className="mt-2 px-6 py-2 rounded-full bg-[var(--accent-fire)] text-white text-sm font-bold hover:opacity-90 transition"
        >
          Upgrade to {upgradePlan} →
        </Link>
      </div>
      {/* Ghost items beneath */}
      <div className="opacity-20 select-none flex flex-col gap-3">
        {items.map((item) => (
          <div key={item} className="h-12 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] flex items-center px-4 text-[var(--foreground)] text-sm font-medium">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityHeatReports() {
  const reports = [
    { area: 'City Centre', reporter: 'Municipal Sensor', temp: '+4.2°C', time: '2h ago', severity: 'High' },
    { area: 'Industrial Zone', reporter: 'Community Report', temp: '+5.1°C', time: '4h ago', severity: 'High' },
    { area: 'Residential Park', reporter: 'Green Monitor', temp: '+1.3°C', time: '6h ago', severity: 'Low' },
  ];
  const colors: Record<string, string> = { High: 'text-red-400', Medium: 'text-amber-400', Low: 'text-green-400' };
  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-lg p-6">
      <h3 className="font-serif font-bold text-lg mb-4 text-[var(--foreground)]">🗺️ Community Heat Reports</h3>
      <div className="flex flex-col gap-3">
        {reports.map((r) => (
          <div key={r.area} className="flex items-center justify-between bg-[var(--surface-light)] rounded-xl px-4 py-3 border border-[var(--border)]">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{r.area}</p>
              <p className="text-xs text-[var(--text-muted)]">{r.reporter} · {r.time}</p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-black ${colors[r.severity]}`}>{r.temp}</p>
              <p className={`text-xs font-semibold ${colors[r.severity]}`}>{r.severity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
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
  const icons = { High: '🔴', Medium: '🟡', Low: '🟢' };

  return (
    <div className="border rounded-2xl p-6 animate-fadeUp" style={{ backgroundColor: bgColor, borderColor: riskColor }}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide mb-1 text-[var(--text-muted)]">
            Urban Heat Island Risk Assessment
          </p>
          <h2 className="text-3xl font-serif font-bold text-[var(--foreground)]">
            {icons[data.mlScore.riskLevel]} {data.location.city}, {data.location.country}
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
    High: 'bg-[#c41e3a] bg-opacity-20 text-white border-[#c41e3a] border-opacity-40',
    Medium: 'bg-[#f7931e] bg-opacity-20 text-white border-[#f7931e] border-opacity-40',
    Low: 'bg-[#1e88e5] bg-opacity-20 text-white border-[#1e88e5] border-opacity-40',
  };

  const iconMap: Record<string, string> = {
    trees: '🌳', leaf: '🌿', droplet: '💧', building: '🏢', sun: '☀️', 'chart-line': '📈', default: '🔹',
  };

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-bold text-lg text-[var(--foreground)]">🌱 AI Recommendations for City Planners</h3>
        <span className="text-xs bg-[#1e88e5] bg-opacity-20 text-white px-2 py-1 rounded-full font-medium border border-[#1e88e5] border-opacity-40">
          ✨ Powered by Groq AI
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {recs.map((rec, i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-light)] hover:bg-[var(--surface)] hover:border-[var(--accent-fire)] transition-all"
          >
            <div className="text-2xl flex-shrink-0">{iconMap[rec.icon] ?? iconMap.default}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-sm text-[var(--foreground)]">{rec.action}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityStyle[rec.priority] ?? priorityStyle.Medium}`}>
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
