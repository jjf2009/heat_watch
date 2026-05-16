import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

export type Recommendation = {
  priority: string;
  action: string;
  detail: string;
  impact: string;
  icon: string;
};

/**
 * Generate actionable recommendations based on UHI intensity and NDVI using Groq AI.
 */
export async function generateRecommendations(
  uhiIntensity: number,
  ndvi: number,
  riskLevel: string,
  city: string,
): Promise<Recommendation[]> {
  try {
    const prompt = `You are an expert urban climate planner. Generate exactly 4 highly specific, actionable recommendations to reduce the Urban Heat Island (UHI) effect for the city of ${city}.

Context:
- UHI Intensity (urban vs rural temperature gap): +${uhiIntensity.toFixed(1)}°C
- NDVI (Vegetation Density Proxy, 0-1 scale): ${ndvi.toFixed(2)}
- Overall Risk Level: ${riskLevel}

Respond ONLY with a valid JSON array (no markdown, no explanation). Each item must have exactly these fields:
- priority: one of "High", "Medium", or "Low"
- action: short 2-4 word title
- detail: 1-2 sentence specific explanation referencing the numbers above
- impact: expected temperature reduction (e.g. "Estimated -0.8°C reduction")
- icon: a single word like "trees", "droplet", "building", "sun", or "leaf"

Example format:
[{"priority":"High","action":"Green Corridor Expansion","detail":"...","impact":"Estimated -1.2°C reduction","icon":"trees"}]`;

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt,
      temperature: 0.4,
    });

    // Extract JSON array from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found in response");
    const parsed = JSON.parse(jsonMatch[0]) as Recommendation[];
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid recommendations array");
    return parsed;
  } catch (error) {
    console.error("Groq AI recommendation generation failed:", error);
    // Fallback to static if Groq fails or API key is missing
    return getStaticRecommendations(uhiIntensity, ndvi, riskLevel, city);
  }
}

function getStaticRecommendations(
  uhiIntensity: number,
  ndvi: number,
  riskLevel: string,
  city: string,
): Recommendation[] {
  const recs: Recommendation[] = [];

  if (uhiIntensity > 4) {
    recs.push({
      priority: "High",
      action: "Emergency Green Corridor",
      detail: `${city} is ${uhiIntensity.toFixed(1)}°C hotter than surroundings. Immediate tree planting required.`,
      impact: `Estimated -${(uhiIntensity * 0.15).toFixed(1)}°C reduction`,
      icon: "trees",
    });
  }

  if (ndvi < 0.3) {
    recs.push({
      priority: "High",
      action: "Vegetation Restoration",
      detail: `NDVI index (${ndvi.toFixed(2)}) indicates critically low vegetation cover. Target 30% canopy coverage.`,
      impact: "Estimated -1.2°C reduction",
      icon: "leaf",
    });
  }

  if (recs.length === 0) {
    recs.push({
      priority: "Medium",
      action: "Cool Roof Initiative",
      detail: "Deploy reflective coating on commercial rooftops.",
      impact: "Estimated -0.6°C reduction",
      icon: "building",
    });
  }

  return recs;
}
