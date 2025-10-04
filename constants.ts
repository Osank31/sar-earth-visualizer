import { Metric, type MetricConfig } from './types';
import { scaleSequential } from 'd3-scale';
import { interpolateYlGnBu, interpolateYlOrRd, interpolateGreens } from 'd3-scale-chromatic';

let METRICS_CACHE: Record<Metric, MetricConfig> | null = null;

export function getMetrics(): Record<Metric, MetricConfig> {
  if (METRICS_CACHE) {
    return METRICS_CACHE;
  }

  METRICS_CACHE = {
    [Metric.SoilMoisture]: {
      name: 'Soil Moisture',
      description: 'Water content in soil, crucial for agriculture and drought monitoring.',
      tooltip: "High values indicate increased backscatter due to water's dielectric properties.",
      colorScale: scaleSequential(interpolateYlGnBu).domain([0, 1]),
      units: 'Index',
    },
    [Metric.FloodInundation]: {
      name: 'Flood Inundation Index',
      description: 'Likelihood of flooding, vital for disaster response and urban planning.',
      tooltip: "High values suggest flooding, tied to low backscatter from water surfaces.",
      colorScale: scaleSequential(interpolateYlOrRd).domain([0, 1]),
      units: 'Index',
    },
    [Metric.VegetationDensity]: {
      name: 'Vegetation Density',
      description: 'Amount of vegetation cover, used for tracking deforestation and crop health.',
      tooltip: "HV polarization detects dense canopies; high values suggest green spaces.",
      colorScale: scaleSequential(interpolateGreens).domain([0, 1]),
      units: 'Index',
    },
  };
  return METRICS_CACHE;
}

export const INITIAL_SELECTED_DATE = '2023-01-01';
export const MIN_DATE = '2019-01-01';
export const MAX_DATE = '2023-12-31';
export const HIGH_RISK_THRESHOLD = 0.7;