import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
 console.log(process.env.OPENWEATHER_API_KEY)
  try {
    const [current, forecast] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather?`, {
        params: { lat, lon: lng, appid: process.env.OPENWEATHER_API_KEY, units: "metric" },
      }),
      axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: { lat, lon: lng, appid: process.env.OPENWEATHER_API_KEY, units: "metric" },
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

    // Process 5-day forecast — one entry per day
    const forecastMap: Record<string, any> = {};
    for (const item of forecast.data.list) {
      const date = item.dt_txt.split(" ")[0];
      if (!forecastMap[date]) {
        forecastMap[date] = { temps: [], humidity: [] };
      }
      forecastMap[date].temps.push(item.main.temp);
      forecastMap[date].humidity.push(item.main.humidity);
    }

    const forecastData = Object.entries(forecastMap).slice(0, 5).map(([date, val]: any) => ({
      date,
      maxTemp: Math.max(...val.temps),
      minTemp: Math.min(...val.temps),
      humidity: Math.round(val.humidity.reduce((a: number, b: number) => a + b, 0) / val.humidity.length),
    }));

    return NextResponse.json({ weather, forecast: forecastData });
  } catch (err: any) {
  console.error("FULL ERROR:");
  console.error(err);
  console.error("RESPONSE:");
  console.error(err?.response?.data);

  return NextResponse.json(
    {
      error: "Failed to fetch weather",
      details: err?.response?.data || err.message,
    },
    { status: 500 }
  );
}
}