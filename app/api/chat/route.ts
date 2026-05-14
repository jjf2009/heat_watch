import { NextResponse } from "next/server";
import { AppData } from "@/lib/types";

type Plan = "free" | "professional" | "enterprise";

function buildSystemPrompt(data: AppData, plan: Plan): string {
    const { location, weather, mlScore, uhiEngine } = data;

    let context = `
You are an expert urban heat island analyst and city planning assistant for HeatWatch.
You are helping a city/town planner make informed decisions based on real climate data.
Be specific, practical, and always reference the actual data below in your answers.
Keep responses concise but actionable. Use bullet points where helpful.

=== LOCATION ===
City: ${location.city}, ${location.country}
Coordinates: ${location.lat}, ${location.lng}

=== CURRENT CONDITIONS ===
Temperature: ${weather.temp}°C (Feels like ${weather.feelsLike}°C)
Humidity: ${weather.humidity}%
Wind Speed: ${weather.windSpeed} m/s
Conditions: ${weather.description}
`;

    if (mlScore) {
        context += `
=== RISK ASSESSMENT ===
Risk Score: ${mlScore.riskScore}/100 (${mlScore.riskLevel} Risk)
UHI Intensity: ${mlScore.uhi_intensity}°C above rural baseline
Thermal Factor: ${mlScore.factors.thermalFactor}
Humidity Factor: ${mlScore.factors.humidityFactor}
Urban Factor: ${mlScore.factors.urbanFactor}
`;
    }

    if ((plan === "professional" || plan === "enterprise") && uhiEngine) {
        context += `
=== UHI ENGINE DATA ===
Urban Temp: ${uhiEngine.urbanTemp}°C
Rural Baseline: ${uhiEngine.ruralBaseline}°C
UHI Intensity: ${uhiEngine.uhiIntensity}°C
Adjusted UHI: ${uhiEngine.adjustedUHI}°C
NASA LST: ${uhiEngine.nasa.lst}°C
NASA NDVI: ${uhiEngine.nasa.ndvi_proxy}
Trend: ${uhiEngine.regression.trend} (slope: ${uhiEngine.regression.slope}°C/year, R²: ${uhiEngine.regression.r2})

=== AI RECOMMENDATIONS ===
${uhiEngine.recommendations.map((r, i) => `${i + 1}. [${r.priority}] ${r.action}: ${r.detail} → ${r.impact}`).join("\n")}
`;
    }

    if (plan === "enterprise" && uhiEngine) {
        context += `
=== PEAK HOUR ANALYSIS ===
Peak Heat Hour: ${uhiEngine.peakHour.time} (${uhiEngine.peakHour.temp}°C, UHI Delta: +${uhiEngine.peakHour.uhiDelta}°C)

=== ONNX 20-YEAR BASELINE ===
Historical UHI Baseline: ${uhiEngine.onnxPrediction.historicalUHIBaseline}°C
Above Baseline: ${uhiEngine.onnxPrediction.aboveBaseline ? "Yes" : "No"}
Anomaly: ${uhiEngine.onnxPrediction.anomaly}°C

=== REGRESSION FORECAST (7-DAY) ===
${uhiEngine.forecast.map(f => `${f.date}: ${f.temp}°C (UHI Delta: +${f.uhiDelta}°C)`).join("\n")}
`;
    }

    context += `
=== YOUR ROLE ===
Answer the planner's questions using ONLY the data above.
If asked about construction, vegetation, or infrastructure — give heat-aware advice.
If data for a feature is unavailable on their plan, mention they can upgrade to access it.
`;

    return context;
}

export async function POST(req: Request) {
    try {
        const { message, data, plan, history } = await req.json();

        if (!message || !data) {
            return NextResponse.json({ error: "message and data required" }, { status: 400 });
        }

        const systemPrompt = buildSystemPrompt(data as AppData, plan as Plan);

        const messages = [
            ...history.map((h: { role: string; content: string }) => ({
                role: h.role,
                content: h.content,
            })),
            { role: "user", content: message },
        ];

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "system", content: systemPrompt }, ...messages],
                max_tokens: 1024,
                temperature: 0.7,
                stream: false,
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "Groq API error");
        }

        const result = await response.json();
        const reply = result.choices[0].message.content;

        return NextResponse.json({ reply });
    } catch (err: any) {
        console.error("Chat API error:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}