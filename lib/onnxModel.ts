import path from "path";
import * as ort from "onnxruntime-node";

// ─── Singleton session ────────────────────────────────────────────────────────

let session: ort.InferenceSession | null = null;

async function getSession(): Promise<ort.InferenceSession> {
  if (session) return session;
  const modelPath = path.join(process.cwd(), "uhi_model.onnx");
  session = await ort.InferenceSession.create(modelPath);
  return session;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ONNXPrediction = {
  /** 20-year climatological mean UHI intensity for this location + month (°C) */
  historicalUHIBaseline: number;
  /** Whether current real-time UHI is above the 20-year historical norm */
  aboveBaseline: boolean;
  /** How much the current UHI deviates from the 20-year mean (°C) */
  anomaly: number;
};

// ─── Inference ────────────────────────────────────────────────────────────────

/**
 * Run the ONNX UHI model trained on 20 years of MODIS/ERA5 data.
 *
 * Input tensor:  float_input [1, 3]  → [latitude, longitude, month (1-12)]
 * Output tensor: variable    [1, 1]  → raw UHI index (scale × 1000 = °C)
 *
 * @param lat            City latitude
 * @param lng            City longitude
 * @param realtimeUHI    Current measured UHI intensity (°C) from weather sensors
 */
export async function predictUHI(
  lat: number,
  lng: number,
  realtimeUHI: number,
): Promise<ONNXPrediction> {
  try {
    const month = new Date().getMonth() + 1; // 1-12

    const sess = await getSession();
    const inputTensor = new ort.Tensor(
      "float32",
      Float32Array.from([lat, lng, month]),
      [1, 3],
    );

    const results = await sess.run({ float_input: inputTensor });
    const rawOutput = results["variable"].data[0] as number;

    // Scale factor: raw model output × 1000 = °C
    const historicalUHIBaseline = parseFloat((rawOutput * 1000).toFixed(2));

    const anomaly = parseFloat((realtimeUHI - historicalUHIBaseline).toFixed(2));
    const aboveBaseline = anomaly > 0;

    return { historicalUHIBaseline, aboveBaseline, anomaly };
  } catch (err) {
    console.error("ONNX inference failed:", err);
    // Graceful fallback — don't crash the main API
    return {
      historicalUHIBaseline: 0,
      aboveBaseline: false,
      anomaly: 0,
    };
  }
}
