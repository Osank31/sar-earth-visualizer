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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col p-6 m-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">{cityData.name} - Time Series Data</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow min-h-0">
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