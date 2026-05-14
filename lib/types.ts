export interface AppData {
  location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };

  weather: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
  };

  mlScore: {
    riskLevel: "High" | "Medium" | "Low";
    riskScore: number;
    uhi_intensity: number;

    factors: {
      thermalFactor: number;
      humidityFactor: number;
      urbanFactor: number;
    };

    recommendations: string[];
  };

  charts: {
    historical: Array<{
      date: string;
      avgTemp: number;
      uhiAnomaly: number;
    }>;

    forecast: Array<{
      date: string;
      predictedTemp: number;
      predictedUhi: number;
    }>;
  };

  fetchedAt: string;
}

// Legacy types kept for backward compatibility
export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed?: number;
  location?: string;
}

export interface HistoricalPoint {
  timestamp: string;
  value: number;
}

export interface MlScoreResponse {
  score: number;
  label?: string;
}
