import { KijijiCar, PolishCar } from '@/types/car';

const API_BASE_URL = 'http://localhost:3001/api';

// Error handling utility
const handleApiError = (error: any, operation: string) => {
  console.error(`Error ${operation}:`, error);
  throw new Error(`Failed to ${operation}. Please ensure the backend server is running.`);
};

// Fetch all Kijiji cars
export const fetchKijijiCars = async (): Promise<KijijiCar[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/kijiji-cars`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    handleApiError(error, 'fetch Kijiji cars');
    return [];
  }
};

// Fetch all Polish cars
export const fetchPolishCars = async (): Promise<PolishCar[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/polish-cars`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    handleApiError(error, 'fetch Polish cars');
    return [];
  }
};

// Fetch Polish cars matching specific criteria
export const fetchMatchingPolishCars = async (
  make: string, 
  model: string, 
  year: number, 
  mileage?: number
): Promise<PolishCar[]> => {
  try {
    const params = new URLSearchParams({
      make,
      model,
      year: year.toString(),
      ...(mileage && { mileage: mileage.toString() })
    });
    
    const response = await fetch(`${API_BASE_URL}/polish-cars/matching?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    handleApiError(error, 'fetch matching Polish cars');
    return [];
  }
};

// Health check to verify API connection
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// Combined data fetcher for dashboard initialization
export const fetchAllCarData = async (): Promise<{ kijijiCars: KijijiCar[], polishCars: PolishCar[] }> => {
  try {
    const [kijijiCars, polishCars] = await Promise.all([
      fetchKijijiCars(),
      fetchPolishCars()
    ]);
    
    return { kijijiCars, polishCars };
  } catch (error) {
    handleApiError(error, 'fetch all car data');
    return { kijijiCars: [], polishCars: [] };
  }
};