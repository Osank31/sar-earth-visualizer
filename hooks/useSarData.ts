import { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import type { SarData, CityData } from '../types';

export const useSarData = () => {
  const [allData, setAllData] = useState<SarData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Loading CSV file...');
    // Load the new CSV file with daily data
    fetch('/sar_environmental_data_500_cities_5_years.csv')
      .then(response => response.text())
      .then(csvText => {
        console.log('CSV file loaded, parsing...');
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results: { data: any[] }) => {
            // Filter out invalid rows and ensure date field exists
            const validData = results.data.filter((row: any) => 
              row.City && row.Latitude && row.Longitude && row.date
            );
            console.log('CSV parsed:', validData.length, 'valid rows');
            console.log('First row:', validData[0]);
            console.log('Date range:', validData[0]?.date, 'to', validData[validData.length - 1]?.date);
            setAllData(validData as SarData[]);
            setLoading(false);
          },
          error: (error: any) => {
            console.error('CSV parse error:', error);
            setLoading(false);
          }
        });
      })
      .catch(error => {
        console.error('Error loading CSV:', error);
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
