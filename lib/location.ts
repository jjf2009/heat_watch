import axios from "axios";

export async function searchCityLocation(query: string) {
  if (!query.trim()) {
    throw new Error("Empty query");
  }

  const res = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: query,
        format: "json",
        limit: 1,
      },
    }
  );

  if (res.data.length === 0) {
    throw new Error("City not found");
  }

  const { lat, lon, display_name } = res.data[0];

  const city = display_name.split(",")[0];

  const country = display_name
    .split(",")
    .slice(-1)[0]
    .trim();

  return {
    city,
    country,
    lat: parseFloat(lat),
    lng: parseFloat(lon),
  };
}

export async function detectLocationFromIP() {
  const res = await axios.get(
    "https://ipapi.co/json/"
  );

  const {
    city,
    country_name,
    latitude,
    longitude,
  } = res.data;

  return {
    city,
    country: country_name,
    lat: latitude,
    lng: longitude,
  };
}