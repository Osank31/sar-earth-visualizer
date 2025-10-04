import { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import type { SarData, CityData } from '../types';

export const useSarData = () => {
  const [allData, setAllData] = useState<SarData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse(sarCsvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results: { data: SarData[] }) => {
        setAllData(results.data);
        setLoading(false);
      });
  }, []);

  const citiesData = useMemo<Record<string, CityData>>(() => {
    if (loading) return {};
    const grouped = allData.reduce((acc, entry) => {
      if (!entry.City) return acc;
      if (!acc[entry.City]) {
        acc[entry.City] = {
          name: entry.City,
          lat: entry.Latitude,
          lng: entry.Longitude,
          history: [],
        };
      }
      acc[entry.City].history.push(entry);
      return acc;
    }, {} as Record<string, CityData>);

    // Sort history for each city by date
    // Fix: Explicitly type `city` as `CityData` to resolve an issue where it was inferred as `unknown`.
    Object.values(grouped).forEach((city: CityData) => {
      city.history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return grouped;
  }, [allData, loading]);
  
  const cityNames = useMemo(() => Object.keys(citiesData), [citiesData]);

  return { allData, citiesData, cityNames, loading };
};
