import axios from "axios";
import { HistoricalPoint } from "./types";

/**
 * Fetch 30-day historical weather data from Open-Meteo.
 * Includes real humidity data using relative_humidity_2m_max and min.
 */
export async function fetchHistoricalWeather(
  lat: number,
  lng: number,
): Promise<HistoricalPoint[]> {
  const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
    params: {
      latitude: lat,
      longitude: lng,
      daily:
        "temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max,relative_humidity_2m_min",
      past_days: 30,
      timezone: "auto",
    },
    timeout: 8000,
  });

  const { daily } = response.data;

  return daily.time.map((date: string, i: number) => {
    // Average of max and min temp
    const temp = parseFloat(
      ((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2).toFixed(
        1,
      ),
    );

    // Average of max and min relative humidity
    let humidity = 60; // fallback
    if (
      daily.relative_humidity_2m_max &&
      daily.relative_humidity_2m_min &&
      daily.relative_humidity_2m_max[i] !== null &&
      daily.relative_humidity_2m_min[i] !== null
    ) {
      humidity = Math.round(
        (daily.relative_humidity_2m_max[i] +
          daily.relative_humidity_2m_min[i]) /
          2,
      );
    }

    return {
      date,
      temp,
      humidity,
    };
  });
}
