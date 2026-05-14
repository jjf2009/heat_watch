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
