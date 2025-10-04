import React, { useRef, useEffect } from 'react';
import Globe from 'react-globe.gl';
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
}

const GlobeComponent: React.FC<GlobeComponentProps> = ({ pointsData, onPointClick, selectedMetric }) => {
  const globeEl = useRef<any>(null);
  const METRICS = getMetrics();

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.2;
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 2000);
    }
  }, []);

  return (
    <div className="w-full h-full globe-container">
      <Globe
        ref={globeEl}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={pointsData}
        pointLat="Latitude"
        pointLng="Longitude"
        pointAltitude={0.01}
        pointRadius="size"
        pointColor="color"
        pointsMerge={true}
        pointsTransitionDuration={1000}
        onPointClick={onPointClick}
        pointLabel={d => `
          <div class="bg-gray-800 text-white p-2 rounded-md shadow-lg">
            <div class="font-bold text-lg">${(d as SarData).City}</div>
            <div>${METRICS[selectedMetric].name}: ${((d as SarData)[selectedMetric] as number).toFixed(2)}</div>
          </div>
        `}
      />
    </div>
  );
};

export default GlobeComponent;