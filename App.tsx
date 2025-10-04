import React, { useState, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import GlobeComponent from './components/GlobeComponent';
import Sidebar from './components/Sidebar';
import CityModal from './components/CityModal';
import Legend from './components/Legend';
import { useSarData } from './hooks/useSarData';
import type { SarData, Metric, CityData } from './types';
import { Metric as MetricEnum } from './types';
import { getMetrics, INITIAL_YEAR, HIGH_RISK_THRESHOLD } from './constants';

const App: React.FC = () => {
  const { allData, citiesData, cityNames, loading } = useSarData();
  const [selectedYear, setSelectedYear] = useState<number>(INITIAL_YEAR);
  const [selectedMetric, setSelectedMetric] = useState<Metric>(MetricEnum.SoilMoisture);
  const [showHighRisk, setShowHighRisk] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const METRICS = getMetrics();

  const filteredData = useMemo(() => {
    if (loading) return [];
    
    let dataForYear = allData.filter(d => new Date(d.date).getFullYear() === selectedYear);

    if (showHighRisk) {
      dataForYear = dataForYear.filter(d => (d[selectedMetric] as number) >= HIGH_RISK_THRESHOLD);
    }
    
    if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        dataForYear = dataForYear.filter(d => d.City.toLowerCase().includes(lowerCaseQuery));
    }

    return dataForYear;
  }, [allData, selectedYear, selectedMetric, showHighRisk, searchQuery, loading]);

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

  const handlePointClick = useCallback((point: SarData) => {
    setSelectedCity(citiesData[point.City] || null);
  }, [citiesData]);

  const handleDownload = useCallback(() => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sar_data_${selectedYear}_${selectedMetric}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredData, selectedYear, selectedMetric]);

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
        <div className="md:absolute md:top-0 md:right-0 md:h-full md:w-auto z-10 p-2">
            <Sidebar
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedMetric={selectedMetric}
              setSelectedMetric={setSelectedMetric}
              showHighRisk={showHighRisk}
              setShowHighRisk={setShowHighRisk}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              cityNames={cityNames}
              onDownload={handleDownload}
            />
        </div>
        <div className="flex-1 min-h-0 relative">
          {loading ? (
            <div className="flex items-center justify-center h-full text-white text-xl">Loading SAR Data...</div>
          ) : (
            <GlobeComponent 
                pointsData={globePoints} 
                onPointClick={handlePointClick}
                selectedMetric={selectedMetric}
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