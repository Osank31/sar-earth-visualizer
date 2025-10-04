import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMetrics } from '../constants';
import { Metric, type CityData } from '../types';

interface CityModalProps {
  cityData: CityData | null;
  onClose: () => void;
}

const CityModal: React.FC<CityModalProps> = ({ cityData, onClose }) => {
  if (!cityData) return null;

  const METRICS = getMetrics();

  // Format date for display - show full date for daily data
  const chartData = cityData.history.map(d => ({
    date: d.date, // Keep as YYYY-MM-DD
    displayDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    [Metric.SoilMoisture]: d.Soil_Moisture,
    [Metric.FloodInundation]: d.Flood_Inundation_Index,
    [Metric.VegetationDensity]: d.Vegetation_Density,
  }));

  const metricColors = {
    [Metric.SoilMoisture]: '#3b82f6',
    [Metric.FloodInundation]: '#ef4444',
    [Metric.VegetationDensity]: '#22c55e',
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: '#1f2937', borderRadius: '1rem', boxShadow: '0 20px 50px rgba(2,6,23,0.6)', width: '100%', maxWidth: '64rem', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '1.5rem', margin: '1rem', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{cityData.name} - Time Series Data</h2>
          <button onClick={onClose} style={{ color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div style={{ flexGrow: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
              <XAxis 
                dataKey="date" 
                stroke="#a0aec0"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#a0aec0" domain={[0, 1]}/>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                  borderColor: '#4a5568',
                  borderRadius: '0.5rem'
                }} 
                labelStyle={{ color: '#e2e8f0' }}
                labelFormatter={(value) => `Date: ${value}`}
              />
              <Legend wrapperStyle={{ color: '#e2e8f0' }} />
              <Line 
                type="monotone" 
                dataKey={Metric.SoilMoisture} 
                name={METRICS[Metric.SoilMoisture].name}
                stroke={metricColors[Metric.SoilMoisture]} 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey={Metric.FloodInundation} 
                name={METRICS[Metric.FloodInundation].name}
                stroke={metricColors[Metric.FloodInundation]} 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey={Metric.VegetationDensity} 
                name={METRICS[Metric.VegetationDensity].name}
                stroke={metricColors[Metric.VegetationDensity]} 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CityModal;