import axios from "axios";

export async function detectLocationFromIP() {
  const res = await axios.get("https://ipapi.co/json/");

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