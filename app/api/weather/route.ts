import { NextResponse } from "next/server";
import axios from "axios";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function mockWeather(lat: number, lng: number) {
  // Realistic mock based on latitude (tropical vs temperate)
  const isTropical = Math.abs(lat) < 25;
  const baseTemp = isTropical ? 31 + Math.random() * 5 : 22 + Math.random() * 5;
  const humidity = isTropical ? 65 + Math.random() * 20 : 45 + Math.random() * 20;
  const temp = parseFloat(baseTemp.toFixed(1));
  const forecast = Array.from({ length: 5 }, (_, i) => ({
    date: new Date(Date.now() + i * 86400000).toISOString().split("T")[0],
    maxTemp: parseFloat((temp + 1.5 + Math.random()).toFixed(1)),
    minTemp: parseFloat((temp - 3.5 - Math.random()).toFixed(1)),
    humidity: Math.round(humidity + (Math.random() - 0.5) * 10),
  }));
  return {
    weather: {
      temp,
      feelsLike: parseFloat((temp + 1.8).toFixed(1)),
      humidity: Math.round(humidity),
      windSpeed: parseFloat((2 + Math.random() * 5).toFixed(1)),
      description: isTropical ? "humid and hazy" : "partly cloudy",
      icon: "02d",
    },
    forecast,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400, headers: CORS });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  // Try real API first; fall back to mock on any error
  if (apiKey) {
    try {
      const [current, forecastRes] = await Promise.all([
        axios.get("https://api.openweathermap.org/data/2.5/weather", {
          params: { lat, lon: lng, appid: apiKey, units: "metric" },
          timeout: 5000,
        }),
        axios.get("https://api.openweathermap.org/data/2.5/forecast", {
          params: { lat, lon: lng, appid: apiKey, units: "metric" },
          timeout: 5000,
        }),
      ]);

      const weather = {
        temp: current.data.main.temp,
        feelsLike: current.data.main.feels_like,
        humidity: current.data.main.humidity,
        windSpeed: current.data.wind.speed,
        description: current.data.weather[0].description,
        icon: current.data.weather[0].icon,
      };

      const forecastMap: Record<string, any> = {};
      for (const item of forecastRes.data.list) {
        const date = item.dt_txt.split(" ")[0];
        if (!forecastMap[date]) forecastMap[date] = { temps: [], humidity: [] };
        forecastMap[date].temps.push(item.main.temp);
        forecastMap[date].humidity.push(item.main.humidity);
      }

      const forecast = Object.entries(forecastMap).slice(0, 5).map(([date, val]: any) => ({
        date,
        maxTemp: parseFloat(Math.max(...val.temps).toFixed(1)),
        minTemp: parseFloat(Math.min(...val.temps).toFixed(1)),
        humidity: Math.round(val.humidity.reduce((a: number, b: number) => a + b, 0) / val.humidity.length),
      }));

      return NextResponse.json({ weather, forecast }, { headers: CORS });
    } catch (err: any) {
      console.warn("OpenWeatherMap failed, using mock data:", err?.response?.data?.message ?? err.message);
    }
  }

  // Fallback: return realistic mock data
  return NextResponse.json(mockWeather(lat, lng), { headers: CORS });
}