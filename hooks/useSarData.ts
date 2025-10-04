import { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import type { SarData, CityData } from '../types';
import { sarCsvData } from '../services/data';

export const useSarData = () => {
  const [allData, setAllData] = useState<SarData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
<<<<<<< Updated upstream
    Papa.parse(sarCsvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results: { data: SarData[] }) => {
        setAllData(results.data);
=======
    console.log('Loading CSV file...');
    // Load the new CSV file with daily data
    fetch('/sar_environmental_data_500_cities_5_years.csv')
      .then(response => {
        console.log('Response status:', response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(csvText => {
        console.log('CSV file loaded, size:', csvText.length, 'bytes');
        console.log('CSV first 200 chars:', csvText.substring(0, 200));
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
            if (validData.length > 0) {
              console.log('First row:', validData[0]);
              console.log('Date range:', validData[0]?.date, 'to', validData[validData.length - 1]?.date);
            } else {
              console.error('No valid data found in CSV!');
            }
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
        console.error('Error details:', error.message);
        alert(`Failed to load data: ${error.message}. Please check the console for details.`);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        setLoading(false);
      },
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
