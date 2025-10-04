import React from 'react';
import { AVAILABLE_YEARS, getMetrics, HIGH_RISK_THRESHOLD } from '../constants';
import type { Metric } from '../types';

interface SidebarProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMetric: Metric;
  setSelectedMetric: (metric: Metric) => void;
  showHighRisk: boolean;
  setShowHighRisk: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cityNames: string[];
  onDownload: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedYear,
  setSelectedYear,
  selectedMetric,
  setSelectedMetric,
  showHighRisk,
  setShowHighRisk,
  searchQuery,
  setSearchQuery,
  cityNames,
  onDownload
}) => {
  const METRICS = getMetrics();
  return (
    <div className="w-full md:w-80 lg:w-96 bg-gray-800/50 backdrop-blur-md p-4 flex-shrink-0 overflow-y-auto rounded-lg m-2">
      <h2 className="text-2xl font-bold mb-4 text-white">Controls</h2>

      {/* Year Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_YEARS.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedYear === year
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Metric</label>
        <div className="space-y-2">
          {Object.entries(METRICS).map(([key, { name }]) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key as Metric)}
              className={`w-full text-left p-3 rounded-lg transition-colors text-sm ${
                selectedMetric === key
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      
      {/* High Risk Zone Filter */}
      <div className="mb-6">
          <div className="flex items-center justify-between">
              <label htmlFor="high-risk-toggle" className="text-sm font-medium text-gray-300">
                  High-Risk Zones (&gt; {HIGH_RISK_THRESHOLD})
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                      type="checkbox"
                      name="high-risk-toggle"
                      id="high-risk-toggle"
                      checked={showHighRisk}
                      onChange={e => setShowHighRisk(e.target.checked)}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      style={{
                          left: showHighRisk ? '1rem' : '0',
                          transition: 'left 0.2s ease-in-out'
                      }}
                  />
                  <label htmlFor="high-risk-toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${showHighRisk ? 'bg-blue-600' : 'bg-gray-600'}`}></label>
              </div>
          </div>
      </div>


      {/* City Search */}
      <div className="mb-6">
        <label htmlFor="city-search" className="block text-sm font-medium text-gray-300 mb-2">
          Search City
        </label>
        <input
          type="text"
          id="city-search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="e.g., Tokyo"
          className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition"
          list="city-suggestions"
        />
        <datalist id="city-suggestions">
          {cityNames.map(name => <option key={name} value={name} />)}
        </datalist>
      </div>

       {/* Download Button */}
       <div>
        <button
          onClick={onDownload}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg transition-colors text-sm bg-green-600 text-white font-semibold hover:bg-green-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Download Filtered Data
        </button>
      </div>
    </div>
  );
};

export default Sidebar;