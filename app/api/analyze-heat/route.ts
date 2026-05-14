import { NextRequest, NextResponse } from "next/server";

interface AppData {
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

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const cityParam = searchParams.get("city");

    if (!cityParam && (!latParam || !lngParam)) {
      return NextResponse.json(
        { error: "Please provide either ?city=CityName OR ?lat=12.34&lng=56.78" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Mock data generation
    const lat = latParam ? parseFloat(latParam) : (Math.random() * 180) - 90;
    const lng = lngParam ? parseFloat(lngParam) : (Math.random() * 360) - 180;
    const city = cityParam || `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
    
    const riskScore = Math.floor(Math.random() * 101); // 0 to 100
    let riskLevel: "High" | "Medium" | "Low";
    
    if (riskScore >= 70) {
      riskLevel = "High";
    } else if (riskScore >= 40) {
      riskLevel = "Medium";
    } else {
      riskLevel = "Low";
    }

    const temp = 25 + Math.random() * 15; // 25-40
    
    const today = new Date();
    
    const historical = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (7 - i));
      return {
        date: d.toISOString().split("T")[0],
        avgTemp: Number((temp - 5 + Math.random() * 10).toFixed(1)),
        uhiAnomaly: Number((Math.random() * 5).toFixed(2))
      };
    });

    const forecast = Array.from({ length: 5 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i + 1);
      return {
        date: d.toISOString().split("T")[0],
        predictedTemp: Number((temp - 3 + Math.random() * 8).toFixed(1)),
        predictedUhi: Number((Math.random() * 5).toFixed(2))
      };
    });

    const mockData: AppData = {
      location: {
        city: city,
        country: "Mock Country",
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
      },
      weather: {
        temp: Number(temp.toFixed(1)),
        feelsLike: Number((temp + Math.random() * 4).toFixed(1)),
        humidity: Number((30 + Math.random() * 60).toFixed(0)),
        windSpeed: Number((Math.random() * 20).toFixed(1)),
      },
      mlScore: {
        riskLevel,
        riskScore,
        uhi_intensity: Number((Math.random() * 6).toFixed(2)),
        factors: {
          thermalFactor: Number((Math.random() * 100).toFixed(0)),
          humidityFactor: Number((Math.random() * 100).toFixed(0)),
          urbanFactor: Number((Math.random() * 100).toFixed(0)),
        },
        recommendations: [
          "Increase urban canopy cover by planting shade trees.",
          "Implement cool pavements and reflective roofs.",
          "Establish green corridors to improve natural ventilation.",
          "Add water features or misters in public gathering spaces."
        ],
      },
      charts: {
        historical,
        forecast,
      },
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockData, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
