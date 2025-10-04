
import React from 'react';
import type { MetricConfig } from '../types';

interface LegendProps {
  metricConfig: MetricConfig;
}

const Legend: React.FC<LegendProps> = ({ metricConfig }) => {
  const gradientStops = Array.from({ length: 10 }, (_, i) => i / 9);
  const gradient = gradientStops.map(stop => metricConfig.colorScale(stop)).join(', ');

  return (
    <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', backgroundColor: 'rgba(31,41,55,0.8)', backdropFilter: 'blur(6px)', padding: '0.75rem', borderRadius: '0.5rem', boxShadow: '0 8px 24px rgba(2,6,23,0.6)', color: '#fff', fontSize: '0.75rem', zIndex: 10, width: '12rem' }}>
      <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>{metricConfig.name}</h3>
      <div style={{ width: '100%', height: '0.75rem', borderRadius: '0.375rem', background: `linear-gradient(to right, ${gradient})` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', color: '#9ca3af' }}>
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
};

export default Legend;
