export type Intervention = {
  treeCoverIncrease: number; // % increase in tree canopy (0-50)
  reflectiveSurfaces: number; // % of roofs/roads made reflective (0-100)
  waterBodies: number; // area of new water features (0-10 hectares)
  greenRoofs: number; // % of buildings with green roofs (0-50)
};

export type SimResult = {
  totalCooling: number;
  projectedUHI: number;
  breakdown: {
    treeCooling: number;
    reflectiveCooling: number;
    waterCooling: number;
    greenRoofCooling: number;
  };
  costEstimate: {
    trees: number;
    reflective: number;
    water: number;
    greenRoofs: number;
  };
};

/**
 * Simulate the cooling effect and cost of various policy interventions.
 */
export function calculateIntervention(
  currentUHI: number,
  interventions: Intervention,
): SimResult {
  // Cooling coefficients from peer-reviewed urban climate studies
  // Bowler et al. (2010): urban trees reduce temp by 0.4°C per 10% canopy increase
  const treeCooling = (interventions.treeCoverIncrease / 10) * 0.4;

  // EPA Cool Roofs study: reflective surfaces reduce ambient temp by 0.2°C per 20%
  const reflectiveCooling = (interventions.reflectiveSurfaces / 20) * 0.2;

  // Evaporative cooling from water bodies: 0.3°C per hectare within 100m
  const waterCooling = Math.min(2.0, interventions.waterBodies * 0.3);

  // Green roofs: 0.1°C per 10% building coverage
  const greenRoofCooling = (interventions.greenRoofs / 10) * 0.1;

  const totalCooling =
    treeCooling + reflectiveCooling + waterCooling + greenRoofCooling;
  const projectedUHI = Math.max(0, currentUHI - totalCooling);

  return {
    totalCooling: parseFloat(totalCooling.toFixed(2)),
    projectedUHI: parseFloat(projectedUHI.toFixed(2)),
    breakdown: {
      treeCooling: parseFloat(treeCooling.toFixed(2)),
      reflectiveCooling: parseFloat(reflectiveCooling.toFixed(2)),
      waterCooling: parseFloat(waterCooling.toFixed(2)),
      greenRoofCooling: parseFloat(greenRoofCooling.toFixed(2)),
    },
    costEstimate: {
      trees: interventions.treeCoverIncrease * 15000, // ₹15k per % canopy increase
      reflective: interventions.reflectiveSurfaces * 8000,
      water: interventions.waterBodies * 500000,
      greenRoofs: interventions.greenRoofs * 25000,
    },
  };
}
