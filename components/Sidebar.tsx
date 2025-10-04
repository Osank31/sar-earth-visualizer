import React from 'react';
import { getMetrics, HIGH_RISK_THRESHOLD, MIN_DATE, MAX_DATE } from '../constants';
import type { Metric } from '../types';

interface SidebarProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedMetric: Metric;
  setSelectedMetric: (metric: Metric) => void;
  showHighRisk: boolean;
  setShowHighRisk: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cityNames: string[];
  onDownload: () => void;
  visualizationMode?: 'mesh' | 'hexbin' | 'rings' | 'hybrid';
  onVisualizationModeChange?: (mode: 'mesh' | 'hexbin' | 'rings' | 'hybrid') => void;
  // Animation props
  isAnimating: boolean;
  animationStartDate: string;
  setAnimationStartDate: (date: string) => void;
  animationEndDate: string;
  setAnimationEndDate: (date: string) => void;
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  onStartAnimation: () => void;
  onStopAnimation: () => void;
  onResetAnimation: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedDate,
  setSelectedDate,
  selectedMetric,
  setSelectedMetric,
  showHighRisk,
  setShowHighRisk,
  searchQuery,
  setSearchQuery,
  cityNames,
  onDownload,
  visualizationMode = 'hybrid',
  onVisualizationModeChange,
  isAnimating,
  animationStartDate,
  setAnimationStartDate,
  animationEndDate,
  setAnimationEndDate,
  animationSpeed,
  setAnimationSpeed,
  onStartAnimation,
  onStopAnimation,
  onResetAnimation
}) => {
  const METRICS = getMetrics();
  return (
    <div className="w-full md:w-80 lg:w-96 bg-gray-800/50 backdrop-blur-md p-4 flex-shrink-0 overflow-y-auto rounded-lg m-2 md:max-h-[calc(100vh-1rem)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-white">Controls</h2>

      {/* Visualization Mode */}
      {onVisualizationModeChange && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Visualization Style</label>
          <div className="grid grid-cols-2 gap-2">
            {(['mesh', 'hexbin', 'rings', 'hybrid'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => onVisualizationModeChange(mode)}
                className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                  visualizationMode === mode
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {mode === 'mesh' && '🔷 3D Mesh'}
                {mode === 'hexbin' && '⬡ Hexagonal'}
                {mode === 'rings' && '◎ Ripple Rings'}
                {mode === 'hybrid' && '✨ Combined'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Single Date Selector with Navigation */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">📅 Selected Date</label>
        <div className="space-y-3">
          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={MIN_DATE}
            max={MAX_DATE}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
          />
          
          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const current = new Date(selectedDate);
                current.setDate(current.getDate() - 1);
                const newDate = current.toISOString().split('T')[0];
                if (newDate >= MIN_DATE) setSelectedDate(newDate);
              }}
              disabled={selectedDate <= MIN_DATE}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
            >
              ← Previous Day
            </button>
            <button
              onClick={() => {
                const current = new Date(selectedDate);
                current.setDate(current.getDate() + 1);
                const newDate = current.toISOString().split('T')[0];
                if (newDate <= MAX_DATE) setSelectedDate(newDate);
              }}
              disabled={selectedDate >= MAX_DATE}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
            >
              Next Day →
            </button>
          </div>
          
          {/* Quick Jump Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedDate('2023-12-31')}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              Latest (2023)
            </button>
            <button
              onClick={() => setSelectedDate('2023-01-01')}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              Start of 2023
            </button>
            <button
              onClick={() => setSelectedDate('2022-01-01')}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              Start of 2022
            </button>
            <button
              onClick={() => setSelectedDate('2019-01-01')}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              First Day
            </button>
          </div>
          
          {/* Date Info */}
          <div className="text-xs text-gray-400 text-center bg-gray-700/50 p-2 rounded">
            Showing: {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Animation / Time-lapse Controls */}
      <div className="mb-6 border-2 border-purple-500/30 rounded-xl p-4 bg-purple-900/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🎬</span>
          <label className="block text-sm font-medium text-purple-300">Time-Lapse Animation</label>
        </div>
        
        {/* Animation Date Range */}
        <div className="space-y-2 mb-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">From Date</label>
            <input
              type="date"
              value={animationStartDate}
              onChange={(e) => setAnimationStartDate(e.target.value)}
              min={MIN_DATE}
              max={animationEndDate}
              disabled={isAnimating}
              className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-purple-500/50 focus:border-purple-400 focus:outline-none text-xs disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">To Date</label>
            <input
              type="date"
              value={animationEndDate}
              onChange={(e) => setAnimationEndDate(e.target.value)}
              min={animationStartDate}
              max={MAX_DATE}
              disabled={isAnimating}
              className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-purple-500/50 focus:border-purple-400 focus:outline-none text-xs disabled:opacity-50"
            />
          </div>
        </div>

        {/* Speed Control */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-gray-400">Speed</label>
            <span className="text-xs text-purple-300 font-mono">
              {animationSpeed}ms/day
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
            disabled={isAnimating}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Fast</span>
            <span>Slow</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isAnimating ? (
            <button
              onClick={onStartAnimation}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1"
            >
              ▶️ Play
            </button>
          ) : (
            <button
              onClick={onStopAnimation}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1"
            >
              ⏸️ Pause
            </button>
          )}
          <button
            onClick={onResetAnimation}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-semibold transition-colors"
            title="Reset to start"
          >
            🔄
          </button>
        </div>

        {/* Animation Status */}
        {isAnimating && (
          <div className="mt-3 text-xs text-center">
            <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-2 py-1 rounded-full inline-flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Playing...
            </div>
          </div>
        )}
        
        {/* Date Range Info */}
        <div className="mt-2 text-xs text-gray-400 text-center">
          {Math.ceil((new Date(animationEndDate).getTime() - new Date(animationStartDate).getTime()) / (1000 * 60 * 60 * 24))} days
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