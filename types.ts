
export interface SarData {
  City: string;
  Latitude: number;
  Longitude: number;
  date: string;
  Soil_Moisture: number;
  Flood_Inundation_Index: number;
  Vegetation_Density: number;
}

export enum Metric {
  SoilMoisture = 'Soil_Moisture',
  FloodInundation = 'Flood_Inundation_Index',
  VegetationDensity = 'Vegetation_Density',
}

export interface MetricConfig {
  name: string;
  description: string;
  tooltip: string;
  colorScale: (t: number) => string;
  units: string;
}

export interface CityData {
  name: string;
  lat: number;
  lng: number;
  history: SarData[];
}
