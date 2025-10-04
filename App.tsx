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
    
    // Filter by exact date match (single day only)
    let dataForDate = allData.filter(d => d.date === selectedDate);
    
    console.log(`Showing data for ${selectedDate}:`, dataForDate.length, 'records');

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
    const points = filteredData.map(d => {
      const value = d[selectedMetric] as number;
      return {
        ...d,
        size: 0.05 + value * 0.2,
        color: metricConfig.colorScale(value),
      };
    });
    console.log('Globe points created:', points.length);
    console.log('First point:', points[0]);
    return points;
  }, [filteredData, selectedMetric, METRICS]);

  // Animation loop effect
  useEffect(() => {
    if (!isAnimating) return;
    
    const timer = setInterval(() => {
      setSelectedDate(currentDate => {
        const current = new Date(currentDate);
        current.setDate(current.getDate() + 1);
        const nextDate = current.toISOString().split('T')[0];
        
        // Check if we've reached the end
        if (nextDate > animationEndDate) {
          setIsAnimating(false);
          return currentDate; // Stay at current date
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

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 font-sans relative overflow-hidden">
      <header className="absolute top-0 left-0 p-4 z-20 w-full text-center md:text-left">
        <h1 className="text-xl md:text-3xl font-bold text-white drop-shadow-lg">Through the Radar Looking Glass</h1>
        <p className="text-xs md:text-sm text-gray-300 max-w-2xl">
          SAR uses radar to reveal Earth's roughness and moisture, penetrating clouds for day/night imaging.
        </p>
      </header>

      <main className="flex-1 flex flex-col md:flex-row relative">
        <div className="md:absolute md:top-0 md:right-0 md:h-full md:w-auto z-10 p-2 md:max-h-screen md:overflow-hidden">
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
        <div className="flex-1 min-h-0 relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-white">
              <div className="text-2xl mb-4">🌍 Loading Environmental Data...</div>
              <div className="text-sm text-gray-400 mb-4">Loading 803,442 records from 500 cities</div>
              <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
              </div>
              <div className="text-xs text-gray-500 mt-4">This may take 10-30 seconds on first load</div>
              <div className="text-xs text-gray-600 mt-2">Check browser console (F12) if stuck</div>
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
      
      <footer className="absolute bottom-0 right-0 p-2 text-xs text-gray-500 z-20">
        Data simulated from NASA SAR instruments like NISAR, Sentinel-1
      </footer>
      
      <CityModal cityData={selectedCity} onClose={() => setSelectedCity(null)} />
    </div>
  );
};

export default App;