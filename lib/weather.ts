import axios from "axios";
import { WeatherData, ForecastPoint } from "./types";

/**
 * Fetch current weather for a single coordinate point.
 * Used by /api/weather and /api/uhi-engine.
 */
export async function fetchCurrentWeather(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<WeatherData> {
  const res = await axios.get(
    "https://api.openweathermap.org/data/2.5/weather",
    {
      params: { lat, lon: lng, appid: apiKey, units: "metric" },
      timeout: 5000,
    },
  );

  return {
    temp: res.data.main.temp,
    feelsLike: res.data.main.feels_like,
    humidity: res.data.main.humidity,
    windSpeed: res.data.wind.speed,
    description: res.data.weather[0].description,
    icon: res.data.weather[0].icon,
  };
}

/**
 * Fetch just the temperature for a coordinate.
 * Used by uhi-engine for rural baseline points.
 */
export async function fetchTemp(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<number> {
  const res = await axios.get(
    "https://api.openweathermap.org/data/2.5/weather",
    {
      params: { lat, lon: lng, appid: apiKey, units: "metric" },
      timeout: 5000,
    },
  );
  return res.data.main.temp;
}

/**
 * Fetch 5-day forecast, aggregated to one entry per day.
 */
export async function fetchForecast(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<ForecastPoint[]> {
  const res = await axios.get(
    "https://api.openweathermap.org/data/2.5/forecast",
    {
      params: { lat, lon: lng, appid: apiKey, units: "metric" },
      timeout: 5000,
    },
  );

  const forecastMap: Record<string, { temps: number[]; humidity: number[] }> =
    {};

  for (const item of res.data.list) {
    const date = item.dt_txt.split(" ")[0];
    if (!forecastMap[date]) {
      forecastMap[date] = { temps: [], humidity: [] };
    }
    forecastMap[date].temps.push(item.main.temp);
    forecastMap[date].humidity.push(item.main.humidity);
  }

  return Object.entries(forecastMap)
    .slice(0, 5)
    .map(([date, val]) => ({
      date,
      maxTemp: Math.max(...val.temps),
      minTemp: Math.min(...val.temps),
      humidity: Math.round(
        val.humidity.reduce((a, b) => a + b, 0) / val.humidity.length,
      ),
    }));
}

export type HourlyPoint = {
  time: string;
  temp: number;
  uhiDelta: number;
};

/**
 * Fetch next N hourly forecast entries.
 * Used by uhi-engine for peak UHI hour detection.
 */
export async function fetchHourlyForecast(
  lat: number,
  lng: number,
  apiKey: string,
  ruralBaseline: number,
  count: number = 8,
): Promise<HourlyPoint[]> {
  const res = await axios.get(
    "https://api.openweathermap.org/data/2.5/forecast",
    {
      params: { lat, lon: lng, appid: apiKey, units: "metric", cnt: count },
      timeout: 5000,
    },
  );

  return res.data.list.map((item: any) => ({
    time: new Date(item.dt * 1000).getHours() + ":00",
    temp: item.main.temp,
    uhiDelta: parseFloat((item.main.temp - ruralBaseline).toFixed(1)),
  }));
}
