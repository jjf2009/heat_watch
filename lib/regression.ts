/**
 * Simple linear regression on an array of values.
 */
export function linearRegression(values: number[]): {
  slope: number;
  intercept: number;
  r2: number;
} {
  const n = values.length;
  if (n === 0) return { slope: 0, intercept: 0, r2: 0 };
  
  const x = Array.from({ length: n }, (_, i) => i);
  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  const ssXY = x.reduce(
    (sum, xi, i) => sum + (xi - xMean) * (values[i] - yMean),
    0,
  );
  const ssXX = x.reduce((sum, xi) => sum + (xi - xMean) ** 2, 0);
  const ssYY = values.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0);

  const slope = ssXX === 0 ? 0 : ssXY / ssXX;
  const intercept = yMean - slope * xMean;
  const r2 = ssXX > 0 && ssYY > 0 ? ssXY ** 2 / (ssXX * ssYY) : 0;

  return { slope, intercept, r2 };
}

/**
 * Project future temperatures using linear regression + a seasonal sine wave.
 */
export function forecastTemperatures(
  historical: number[],
  daysAhead: number[],
): number[] {
  const { slope, intercept } = linearRegression(historical);
  const n = historical.length;
  return daysAhead.map((d) => {
    const projected = intercept + slope * (n + d);
    // Add seasonal oscillation (±0.8°C daily variation)
    const seasonal = Math.sin((d / 7) * Math.PI) * 0.8;
    return parseFloat((projected + seasonal).toFixed(1));
  });
}
