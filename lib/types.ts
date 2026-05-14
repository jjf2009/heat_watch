export type RiskLevel = "High" | "Medium" | "Low";

export type LocationData = {
  city: string;
  country: string;
  lat: number;
  lng: number;
};

export type WeatherData = {
  temp: number;           // celsius
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
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

export type AppData = {
  location: LocationData;
  weather: WeatherData;
  historical: HistoricalPoint[];
  forecast: ForecastPoint[];
  mlScore: MLScore;
  heatZones: HeatZone[];
  fetchedAt: string;
  uhiEngine?: any;
};
