import React, { useRef, useEffect, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { Metric, type SarData } from '../types';
import { getMetrics } from '../constants';

interface GlobePoint extends SarData {
  size: number;
  color: string;
}

interface GlobeComponentProps {
  pointsData: GlobePoint[];
  onPointClick: (point: SarData) => void;
  selectedMetric: Metric;
  visualizationMode?: 'mesh' | 'hexbin' | 'rings' | 'hybrid';
}

const GlobeComponent: React.FC<GlobeComponentProps> = ({ 
  pointsData, 
  onPointClick, 
  selectedMetric,
  visualizationMode = 'hybrid'
}) => {
  const globeEl = useRef<any>(null);
  const METRICS = getMetrics();

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.2;
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 2000);
    }
  }, []);

  // Create custom 3D object based on metric type
  const getCustomObject = (d: any) => {
    const value = d[selectedMetric] as number;
    const size = 0.3 + value * 1.5;
    const height = 0.5 + value * 3;
    
    let geometry;
    const color = new THREE.Color(d.color);
    
    // Different geometries for different metrics
    switch (selectedMetric) {
      case Metric.SoilMoisture:
        geometry = new THREE.ConeGeometry(size, height, 8);
        break;
      case Metric.FloodInundation:
        geometry = new THREE.CylinderGeometry(size, size, height, 6);
        break;
      case Metric.VegetationDensity:
        geometry = new THREE.OctahedronGeometry(size, 2);
        geometry.scale(1, height / size, 1);
        break;
      default:
        geometry = new THREE.CylinderGeometry(size, size, height, 6);
    }

    const material = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: value * 0.5,
      transparent: true,
      opacity: 0.7 + value * 0.3,
      shininess: 100,
      specular: new THREE.Color(0xffffff),
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    if (value > 0.7 && selectedMetric === Metric.FloodInundation) {
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.15;
      mesh.scale.set(scale, 1, scale);
    }

    return mesh;
  };

  // Custom layer data
  const customLayerData = useMemo(() => {
    return pointsData.map(point => ({
      ...point,
      altitude: 0.015 + (point[selectedMetric] as number) * 0.08,
    }));
  }, [pointsData, selectedMetric]);

  // Hex bin data
  const hexBinData = useMemo(() => {
    return pointsData.map(point => ({
      ...point,
      weight: point[selectedMetric] as number,
    }));
  }, [pointsData, selectedMetric]);

  // Rings data
  const ringsData = useMemo(() => {
    return pointsData
      .filter(p => (p[selectedMetric] as number) > 0.5)
      .map(point => ({
        ...point,
        maxR: 2 + (point[selectedMetric] as number) * 6,
        propagationSpeed: 1 + (point[selectedMetric] as number) * 2,
        repeatPeriod: 1200 - (point[selectedMetric] as number) * 400,
      }));
  }, [pointsData, selectedMetric]);

  const customThreeObjectUpdate = (obj: any, d: any) => {
    const value = d[selectedMetric] as number;
    if (value > 0.7 && selectedMetric === Metric.FloodInundation) {
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.15;
      obj.scale.set(scale, 1, scale);
    }
    Object.assign(obj.position, globeEl.current?.getCoords(d.Latitude, d.Longitude, d.altitude));
  };

  const customLayerLabel = (d: any) => `
    <div class="bg-gray-800/95 text-white p-3 rounded-lg shadow-2xl border border-gray-600">
      <div class="font-bold text-xl mb-1 text-blue-300">${(d as SarData).City}</div>
      <div class="text-sm mb-1">
        <span class="text-gray-400">${METRICS[selectedMetric].name}:</span> 
        <span class="text-yellow-300 font-semibold">${((d as SarData)[selectedMetric] as number).toFixed(3)}</span>
      </div>
      <div class="text-xs text-gray-300 italic mt-2 max-w-xs">
        ${METRICS[selectedMetric].tooltip}
      </div>
    </div>
  `;

  const ringColorFunc = (d: any) => {
    const color = new THREE.Color(d.color);
    return `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, 0.4)`;
  };

  const hexAltitudeFunc = (d: any) => d.sumWeight / d.points.length * 0.15;
  
  const hexTopColorFunc = (d: any) => {
    const avgValue = d.sumWeight / d.points.length;
    return METRICS[selectedMetric].colorScale(avgValue);
  };
  
  const hexSideColorFunc = (d: any) => {
    const avgValue = d.sumWeight / d.points.length;
    const color = new THREE.Color(METRICS[selectedMetric].colorScale(avgValue));
    color.multiplyScalar(0.6);
    return `#${color.getHexString()}`;
  };

  const showMesh = visualizationMode === 'mesh' || visualizationMode === 'hybrid';
  const showRings = visualizationMode === 'rings' || visualizationMode === 'hybrid';
  const showHexbin = visualizationMode === 'hexbin' || visualizationMode === 'hybrid';

  console.log('GlobeComponent render:', {
    pointsDataLength: pointsData.length,
    visualizationMode,
    showMesh,
    showRings,
    showHexbin,
    customLayerDataLength: customLayerData.length
  });

  // Simplified version for debugging
  if (pointsData.length === 0) {
    return (
      <div className="w-full h-full globe-container flex items-center justify-center">
        <div className="text-white text-xl">No data available</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full globe-container">
      <Globe
        ref={globeEl}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
        
        // Start with simple points first
        pointsData={pointsData}
        pointLat="Latitude"
        pointLng="Longitude"
        pointAltitude={0.01}
        pointRadius="size"
        pointColor="color"
        pointsMerge={true}
        pointsTransitionDuration={1000}
        onPointClick={onPointClick}
        pointLabel={(d: any) => `
          <div class="bg-gray-800/95 text-white p-3 rounded-lg shadow-2xl border border-gray-600">
            <div class="font-bold text-xl mb-1 text-blue-300">${d.City}</div>
            <div class="text-sm mb-1">
              <span class="text-gray-400">${METRICS[selectedMetric].name}:</span> 
              <span class="text-yellow-300 font-semibold">${(d[selectedMetric] as number).toFixed(3)}</span>
            </div>
          </div>
        `}
      />
    </div>
  );
};

export default GlobeComponent;