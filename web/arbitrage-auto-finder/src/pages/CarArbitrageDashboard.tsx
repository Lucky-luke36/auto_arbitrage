import { useState, useEffect } from 'react';
import { KijijiCar, PolishCar } from '@/types/car';
import { fetchAllCarData } from '@/services/carApi';
import KijijiCarsList from '@/components/KijijiCarsList';
import PolishCarsAnalysis from '@/components/PolishCarsAnalysis';
import ProfitabilityCalculator from '@/components/ProfitabilityCalculator';
import MarketAnalysisChart from '@/components/MarketAnalysisChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CarArbitrageDashboard() {
  const [selectedCar, setSelectedCar] = useState<KijijiCar | null>(null);
  const [kijijiCars, setKijijiCars] = useState<KijijiCar[]>([]);
  const [polishCars, setPolishCars] = useState<PolishCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCarData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllCarData();
        setKijijiCars(data.kijijiCars);
        setPolishCars(data.polishCars);
      } catch (err) {
        setError('Failed to load car data. Please ensure the backend server is running on http://localhost:3001');
        console.error('Error loading car data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCarData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-analytics-bg">
        <div className="text-center py-8 px-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Canada-Poland Car Arbitrage Analyzer
          </h1>
          <p className="text-muted-foreground">
            Loading car data from database...
          </p>
        </div>
        <div className="container mx-auto px-4 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:h-[65vh]">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="lg:h-[65vh]">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-analytics-bg">
        <div className="text-center py-8 px-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Canada-Poland Car Arbitrage Analyzer
          </h1>
          <Card className="max-w-md mx-auto mt-8">
            <CardHeader>
              <CardTitle className="text-destructive">Connection Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{error}</p>
              <p className="text-sm text-muted-foreground">
                Make sure you have:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                <li>Started the backend server (npm start in backend folder)</li>
                <li>Backend running on http://localhost:3001</li>
                <li>Correct database paths configured in server.js</li>
              </ul>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Retry
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-analytics-bg">
      {/* Header */}
      <div className="text-center py-8 px-4">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Canada-Poland Car Arbitrage Analyzer
        </h1>
        <p className="text-muted-foreground">
          Compare Canadian Kijiji listings with Polish market prices to identify arbitrage opportunities
        </p>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-4 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Pane: Kijiji Cars */}
          <div className="lg:h-[65vh]">
            <KijijiCarsList 
              cars={kijijiCars}
              polishCars={polishCars}
              selectedCar={selectedCar}  
              onCarSelect={setSelectedCar}
            />
          </div>
          
          {/* Right Pane: Polish Analysis */}
          <div className="lg:h-[65vh]">
            <PolishCarsAnalysis 
              selectedCar={selectedCar}
              polishCars={polishCars}
            />
          </div>
        </div>

        {/* Bottom Section: Profitability Calculator */}
        <div className="mt-8">
          <ProfitabilityCalculator 
            selectedCar={selectedCar}
            polishCars={polishCars}
          />
        </div>

        {/* Market Analysis Chart Section */}
        <div className="mt-8 pb-8">
          <MarketAnalysisChart 
            selectedCar={selectedCar}
            polishCars={polishCars}
          />
        </div>
      </div>
    </div>
  );
}