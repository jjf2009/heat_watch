export type RiskLevel = "High" | "Medium" | "Low";

export type LocationData = {
  city: string;
  country: string;
  lat: number;
  lng: number;
  state?: string;
  district?: string;
  displayName?: string;
};

export type WeatherData = {
  temp: number;           // celsius
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  cityName?: string;
  countryCode?: string;
};

export type HistoricalPoint = {
  date: string;
  temp: number;
  humidity: number;
};

export type ForecastPoint = {
  date: string;
  maxTemp: number;
  minTemp: number;
  humidity: number;
};

export type MLScore = {
  riskScore: number;        // 0-100
  riskLevel: RiskLevel;
  uhi_intensity: number;    // estimated degrees above rural baseline
  factors: {
    thermalFactor: number;
    humidityFactor: number;
    urbanFactor: number;
  };
  recommendations: string[];
};

export type HeatZone = {
  lat: number;
  lng: number;
  intensity: number;        // 0-1 for leaflet heatmap
};

export type Recommendation = {
  priority: string;
  action: string;
  detail: string;
  impact: string;
  icon: string;
};

export type SimResult = {
  totalCooling: number;
  projectedUHI: number;
  breakdown: {
    treeCooling: number;
    reflectiveCooling: number;
    waterCooling: number;
    greenRoofCooling: number;
  };
  costEstimate: {
    trees: number;
    reflective: number;
    water: number;
    greenRoofs: number;
  };
};

export type UHIEngineData = {
  urbanTemp: number;
  ruralBaseline: number;
  ruralTemps: { direction: string; temp: number; lat: number; lng: number }[];
  uhiIntensity: number;
  adjustedUHI: number;
  nasa: { lst: number; ndvi_proxy: number; longTermAvg: number; lstDelta: number };
  riskScore: number;
  riskLevel: string;
  mlScore: MLScore;
  historical: { date: string; temp: number }[];
  regression: { slope: number; r2: number; trend: string };
  forecast: { date: string; temp: number; uhiDelta: number }[];
  hourlyPattern: { time: string; temp: number; uhiDelta: number }[];
  peakHour: { time: string; temp: number; uhiDelta: number };
  interventionResult: SimResult | null;
  recommendations: Recommendation[];
  onnxPrediction: {
    historicalUHIBaseline: number;
    aboveBaseline: boolean;
    anomaly: number;
  };
  fetchedAt: string;
};


export type AppData = {
  location: LocationData;
  weather: WeatherData;
  historical: HistoricalPoint[];
  forecast: ForecastPoint[];
  mlScore: MLScore | null;
  heatZones: HeatZone[];
  fetchedAt: string;
  uhiEngine?: UHIEngineData | null;
};