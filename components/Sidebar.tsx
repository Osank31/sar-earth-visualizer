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

  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '24rem',
    backgroundColor: 'rgba(31,41,55,0.5)',
    backdropFilter: 'blur(8px)',
    padding: '1rem',
    flexShrink: 0,
    overflowY: 'auto',
    borderRadius: '0.5rem',
    margin: '0.5rem',
    maxHeight: 'calc(100vh - 1rem)'
  };

  const titleStyle: React.CSSProperties = { fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Controls</h2>

      {onVisualizationModeChange && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#d1d5db', marginBottom: '0.5rem' }}>Visualization Style</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.5rem' }}>
            {(['mesh', 'hexbin', 'rings', 'hybrid'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => onVisualizationModeChange(mode)}
                style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.75rem',
                  borderRadius: '0.5rem',
                  transition: 'background-color 0.15s ease',
                  backgroundColor: visualizationMode === mode ? '#7c3aed' : '#374151',
                  color: visualizationMode === mode ? '#fff' : '#d1d5db',
                  fontWeight: visualizationMode === mode ? 600 : 400
                }}
              >
                {mode === 'mesh' && '🔷 3D Mesh'}
                {mode === 'hexbin' && '⬡ Hexagonal'}
                {mode === 'rings' && '◌ Ripple Rings'}
                {mode === 'hybrid' && '✨ Combined'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#d1d5db', marginBottom: '0.5rem' }}>📅 Selected Date</label>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={MIN_DATE}
            max={MAX_DATE}
            style={{ width: '100%', padding: '0.5rem', backgroundColor: '#374151', color: '#fff', borderRadius: '0.5rem', border: '1px solid #4b5563', fontSize: '0.875rem' }}
          />

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                const current = new Date(selectedDate);
                current.setDate(current.getDate() - 1);
                const newDate = current.toISOString().split('T')[0];
                if (newDate >= MIN_DATE) setSelectedDate(newDate);
              }}
              disabled={selectedDate <= MIN_DATE}
              style={{ flex: 1, padding: '0.5rem', background: selectedDate <= MIN_DATE ? '#4b5563' : '#2563eb', color: '#fff', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
              style={{ flex: 1, padding: '0.5rem', background: selectedDate >= MAX_DATE ? '#4b5563' : '#2563eb', color: '#fff', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              Next Day →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            <button onClick={() => setSelectedDate('2023-12-31')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#374151', color: '#d1d5db', borderRadius: '0.375rem' }}>Latest (2023)</button>
            <button onClick={() => setSelectedDate('2023-01-01')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#374151', color: '#d1d5db', borderRadius: '0.375rem' }}>Start of 2023</button>
            <button onClick={() => setSelectedDate('2022-01-01')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#374151', color: '#d1d5db', borderRadius: '0.375rem' }}>Start of 2022</button>
            <button onClick={() => setSelectedDate('2019-01-01')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#374151', color: '#d1d5db', borderRadius: '0.375rem' }}>First Day</button>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', backgroundColor: 'rgba(55,65,81,0.5)', padding: '0.5rem', borderRadius: '0.5rem' }}>
            Showing: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', borderRadius: '0.75rem', padding: '1rem', background: 'rgba(124,58,237,0.04)', border: '2px solid rgba(124,58,237,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '1rem' }}>🎬</span>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#d1d5db' }}>Time-Lapse Animation</div>
        </div>

        <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>From Date</label>
            <input type="date" value={animationStartDate} onChange={(e) => setAnimationStartDate(e.target.value)} min={MIN_DATE} max={animationEndDate} disabled={isAnimating} style={{ width: '100%', padding: '0.25rem', backgroundColor: '#374151', color: '#fff', borderRadius: '0.375rem', border: '1px solid rgba(124,58,237,0.3)', fontSize: '0.75rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>To Date</label>
            <input type="date" value={animationEndDate} onChange={(e) => setAnimationEndDate(e.target.value)} min={animationStartDate} max={MAX_DATE} disabled={isAnimating} style={{ width: '100%', padding: '0.25rem', backgroundColor: '#374151', color: '#fff', borderRadius: '0.375rem', border: '1px solid rgba(124,58,237,0.3)', fontSize: '0.75rem' }} />
          </div>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Speed</label>
            <span style={{ fontSize: '0.75rem', color: '#c4b5fd', fontFamily: 'monospace' }}>{animationSpeed}ms/day</span>
          </div>
          <input type="range" min={100} max={2000} step={100} value={animationSpeed} onChange={(e) => setAnimationSpeed(parseInt(e.target.value))} disabled={isAnimating} style={{ width: '100%', height: '0.5rem', backgroundColor: '#374151', borderRadius: '0.5rem', cursor: 'pointer' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}><span>Fast</span><span>Slow</span></div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {!isAnimating ? (
            <button onClick={onStartAnimation} style={{ flex: 1, padding: '0.5rem', background: 'linear-gradient(90deg,#16a34a,#10b981)', color: '#fff', borderRadius: '0.5rem', fontWeight: 700 }}>▶️ Play</button>
          ) : (
            <button onClick={onStopAnimation} style={{ flex: 1, padding: '0.5rem', background: 'linear-gradient(90deg,#dc2626,#ef4444)', color: '#fff', borderRadius: '0.5rem', fontWeight: 700 }}>⏸️ Pause</button>
          )}
          <button onClick={onResetAnimation} title="Reset to start" style={{ padding: '0.5rem', backgroundColor: '#374151', color: '#d1d5db', borderRadius: '0.5rem', fontWeight: 600 }}>🔁</button>
        </div>

        {isAnimating && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.5rem', borderRadius: '9999px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#86efac' }}>
              <span style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#34d399', borderRadius: '9999px', boxShadow: '0 0 6px rgba(52,211,153,0.6)' }}></span>
              Playing...
            </div>
          </div>
        )}

        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
          {Math.ceil((new Date(animationEndDate).getTime() - new Date(animationStartDate).getTime()) / (1000 * 60 * 60 * 24))} days
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#d1d5db', marginBottom: '0.5rem' }}>Metric</label>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {Object.entries(METRICS).map(([key, { name }]) => (
            <button key={key} onClick={() => setSelectedMetric(key as Metric)} style={{ width: '100%', textAlign: 'left', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', transition: 'background-color 0.15s ease', backgroundColor: selectedMetric === key ? '#2563eb' : '#374151', color: selectedMetric === key ? '#fff' : '#d1d5db', fontWeight: selectedMetric === key ? 700 : 400 }}>
              {name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label htmlFor="high-risk-toggle" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#d1d5db' }}>High-Risk Zones (&gt; {HIGH_RISK_THRESHOLD})</label>
              <div style={{ position: 'relative', width: '2.5rem', height: '1.5rem' }}>
                  <input type="checkbox" name="high-risk-toggle" id="high-risk-toggle" checked={showHighRisk} onChange={e => setShowHighRisk(e.target.checked)} style={{ position: 'absolute', width: '1.25rem', height: '1.25rem', borderRadius: '9999px', background: '#fff', border: '2px solid #e5e7eb', cursor: 'pointer', left: showHighRisk ? '1rem' : '0', transition: 'left 0.2s ease-in-out' }} />
                  <label htmlFor="high-risk-toggle" style={{ display: 'block', overflow: 'hidden', height: '1.5rem', borderRadius: '9999px', cursor: 'pointer', background: showHighRisk ? '#2563eb' : '#4b5563', width: '2.5rem' }} />
              </div>
          </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="city-search" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#d1d5db', marginBottom: '0.5rem' }}>Search City</label>
        <input
          type="text"
          id="city-search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="e.g., Tokyo"
          style={{ width: '100%', backgroundColor: '#374151', color: '#fff', borderRadius: '0.375rem', border: '1px solid #4b5563', padding: '0.5rem', transition: 'box-shadow 0.15s ease' }}
          list="city-suggestions"
        />
        <datalist id="city-suggestions">
          {cityNames.map(name => <option key={name} value={name} />)}
        </datalist>
      </div>

       <div>
        <button onClick={onDownload} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.5rem', background: '#16a34a', color: '#fff', fontWeight: 700 }}> 
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Download Filtered Data
        </button>
      </div>
    </div>
  );
};

export default Sidebar;