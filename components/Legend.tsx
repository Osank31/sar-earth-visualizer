
import React from 'react';
import type { MetricConfig } from '../types';

interface LegendProps {
  metricConfig: MetricConfig;
}

const Legend: React.FC<LegendProps> = ({ metricConfig }) => {
  const gradientStops = Array.from({ length: 10 }, (_, i) => i / 9);
  const gradient = gradientStops.map(stop => metricConfig.colorScale(stop)).join(', ');

  return (
    <div className="absolute bottom-4 left-4 bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg shadow-lg text-white text-xs z-10 w-48">
      <h3 className="font-bold text-sm mb-2">{metricConfig.name}</h3>
      <div className="w-full h-3 rounded" style={{ background: `linear-gradient(to right, ${gradient})` }} />
      <div className="flex justify-between mt-1 text-gray-400">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
};

export default Legend;
