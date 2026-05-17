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
        addressdetails: 1,
      },
      headers: {
        "User-Agent": "HeatWatch/1.0",
        "Accept-Language": "en"
      }
    }
  );

  if (res.data.length === 0) {
    throw new Error("City not found");
  }

  const result = res.data[0];
  const { lat, lon, display_name, address } = result;

  const city = address.city || address.town || address.village || address.municipality || display_name.split(",")[0];
  const country = address.country || display_name.split(",").slice(-1)[0].trim();

  return {
    city,
    country,
    lat: parseFloat(lat),
    lng: parseFloat(lon),
    state: address.state,
    district: address.state_district || address.county,
    displayName: display_name,
  };
}

export async function detectExactLocation(): Promise<{ city: string; country: string; lat: number; lng: number; state?: string; district?: string; displayName?: string; }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by your browser."));
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocoding to get precise address details
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse`,
            {
              params: {
                lat: latitude,
                lon: longitude,
                format: "json",
                addressdetails: 1,
              },
              headers: {
                "User-Agent": "HeatWatch/1.0",
                "Accept-Language": "en"
              }
            }
          );

          if (!res.data || !res.data.address) {
             return resolve({
                city: "Current Location",
                country: "",
                lat: latitude,
                lng: longitude,
                displayName: "Unknown Location",
             });
          }

          const { address, display_name } = res.data;
          const city = address.city || address.town || address.village || address.municipality || address.suburb || "Current Location";
          const country = address.country || "";

          resolve({
            city,
            country,
            lat: latitude,
            lng: longitude,
            state: address.state,
            district: address.state_district || address.county,
            displayName: display_name,
          });

        } catch (error) {
          console.error("Reverse geocoding failed", error);
          // Fallback to coordinates if Nominatim fails
          resolve({
            city: "Current Location",
            country: "",
            lat: latitude,
            lng: longitude,
            displayName: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
          });
        }
      },
      (error) => {
        let msg = "Failed to detect location.";
        if (error.code === error.PERMISSION_DENIED) {
           msg = "Location permission denied. Please allow location access in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
           msg = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
           msg = "Location detection timed out.";
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // Wait up to 30s
        maximumAge: 0,
      }
    );
  });
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