import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Papa from 'papaparse';
import GlobeComponent from './components/GlobeComponentAdvanced';
import Sidebar from './components/Sidebar';
import CityModal from './components/CityModal';
import Legend from './components/Legend';
import { useSarData } from './hooks/useSarData';
import type { SarData, Metric, CityData } from './types';
import { Metric as MetricEnum } from './types';
import { getMetrics, INITIAL_SELECTED_DATE, HIGH_RISK_THRESHOLD } from './constants';

const App: React.FC = () => {
  const { allData, citiesData, cityNames, loading } = useSarData();
  const [selectedDate, setSelectedDate] = useState<string>(INITIAL_SELECTED_DATE);
  const [selectedMetric, setSelectedMetric] = useState<Metric>(MetricEnum.SoilMoisture);
  const [showHighRisk, setShowHighRisk] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [visualizationMode, setVisualizationMode] = useState<'mesh' | 'hexbin' | 'rings' | 'hybrid'>('hybrid');

  // Animation controls
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animationStartDate, setAnimationStartDate] = useState<string>(INITIAL_SELECTED_DATE);
  const [animationEndDate, setAnimationEndDate] = useState<string>('2023-01-31');
  const [animationSpeed, setAnimationSpeed] = useState<number>(500); // ms per frame

  const METRICS = getMetrics();

  const filteredData = useMemo(() => {
    if (loading) return [];
    let dataForDate = allData.filter(d => d.date === selectedDate);

    if (showHighRisk) {
      dataForDate = dataForDate.filter(d => (d[selectedMetric] as number) >= HIGH_RISK_THRESHOLD);
    }

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      dataForDate = dataForDate.filter(d => d.City.toLowerCase().includes(lowerCaseQuery));
    }

    return dataForDate;
  }, [allData, selectedDate, selectedMetric, showHighRisk, searchQuery, loading]);

  const globePoints = useMemo(() => {
    const metricConfig = METRICS[selectedMetric];
    return filteredData.map(d => {
      const value = d[selectedMetric] as number;
      return {
        ...d,
        size: 0.05 + value * 0.2,
        color: metricConfig.colorScale(value),
      };
    });
  }, [filteredData, selectedMetric, METRICS]);

  useEffect(() => {
    if (!isAnimating) return;
    const timer = setInterval(() => {
      setSelectedDate(currentDate => {
        const current = new Date(currentDate);
        current.setDate(current.getDate() + 1);
        const nextDate = current.toISOString().split('T')[0];
        if (nextDate > animationEndDate) {
          setIsAnimating(false);
          return currentDate;
        }
        return nextDate;
      });
    }, animationSpeed);
    return () => clearInterval(timer);
  }, [isAnimating, animationSpeed, animationEndDate]);

  const handlePointClick = useCallback((point: SarData) => {
    setSelectedCity(citiesData[point.City] || null);
  }, [citiesData]);

  const handleDownload = useCallback(() => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sar_data_${selectedDate}_${selectedMetric}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredData, selectedDate, selectedMetric]);

  const handleStartAnimation = useCallback(() => {
    setSelectedDate(animationStartDate);
    setIsAnimating(true);
  }, [animationStartDate]);

  const handleStopAnimation = useCallback(() => {
    setIsAnimating(false);
  }, []);

  const handleResetAnimation = useCallback(() => {
    setIsAnimating(false);
    setSelectedDate(animationStartDate);
  }, [animationStartDate]);

  const metricConfig = METRICS[selectedMetric];

  // Inline styles for layout
  const rootStyle: React.CSSProperties = {
    height: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0f172a',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    position: 'relative',
    overflow: 'hidden'
  };

  const headerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: '1rem',
    zIndex: 20,
    width: '100%',
    textAlign: 'center'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#fff',
    textShadow: '0 1px 2px rgba(0,0,0,0.6)'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#d1d5db',
    maxWidth: '42rem',
    margin: '0.25rem auto 0'
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  };

  const sidebarContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
    zIndex: 10,
    padding: '0.5rem'
  };

  const contentStyle: React.CSSProperties = { flex: 1, minHeight: 0, position: 'relative' };

  return (
    <div style={rootStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Through the Radar Looking Glass</h1>
        <p style={subtitleStyle}>
          SAR uses radar to reveal Earth's roughness and moisture, penetrating clouds for day/night imaging.
        </p>
      </header>

      <main style={mainStyle}>
        <div style={sidebarContainerStyle}>
          <Sidebar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
            showHighRisk={showHighRisk}
            setShowHighRisk={setShowHighRisk}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            cityNames={cityNames}
            onDownload={handleDownload}
            visualizationMode={visualizationMode}
            onVisualizationModeChange={setVisualizationMode}
            isAnimating={isAnimating}
            animationStartDate={animationStartDate}
            setAnimationStartDate={setAnimationStartDate}
            animationEndDate={animationEndDate}
            setAnimationEndDate={setAnimationEndDate}
            animationSpeed={animationSpeed}
            setAnimationSpeed={setAnimationSpeed}
            onStartAnimation={handleStartAnimation}
            onStopAnimation={handleStopAnimation}
            onResetAnimation={handleResetAnimation}
          />
        </div>

        <div style={contentStyle}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🌍 Loading Environmental Data...</div>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem' }}>Loading 803,442 records from 500 cities</div>
              <div style={{ width: '16rem', height: '0.5rem', backgroundColor: '#374151', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg,#3b82f6,#7c3aed)', opacity: 0.9 }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem' }}>This may take 10-30 seconds on first load</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>Check browser console (F12) if stuck</div>
            </div>
          ) : (
            <GlobeComponent
              pointsData={globePoints}
              onPointClick={handlePointClick}
              selectedMetric={selectedMetric}
              visualizationMode={visualizationMode}
            />
          )}
          {!loading && <Legend metricConfig={metricConfig} />}
        </div>
      </main>

      <footer style={{ position: 'absolute', bottom: 0, right: 0, padding: '0.5rem', fontSize: '0.75rem', color: '#9ca3af', zIndex: 20 }}>
        Data simulated from NASA SAR instruments like NISAR, Sentinel-1
      </footer>

      <CityModal cityData={selectedCity} onClose={() => setSelectedCity(null)} />
    </div>
  );
};

export default App;