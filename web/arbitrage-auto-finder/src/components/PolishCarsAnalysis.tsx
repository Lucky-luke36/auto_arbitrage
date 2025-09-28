import { KijijiCar, PolishCar } from '@/types/car';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PolishCarsAnalysisProps {
  selectedCar: KijijiCar | null;
  polishCars: PolishCar[];
}

export default function PolishCarsAnalysis({ selectedCar, polishCars }: PolishCarsAnalysisProps) {
  if (!selectedCar) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Select a Kijiji car to view Polish market analysis</p>
        </CardContent>
      </Card>
    );
  }

  const matchingPolishCars = polishCars.filter(
    (car) =>
      car.make === selectedCar.make &&
      car.model === selectedCar.model &&
      car.year === selectedCar.year &&
      Math.abs(car.mileage - selectedCar.mileage) <= 30000
  );

  const avgPolishPrice = matchingPolishCars.length > 0
    ? matchingPolishCars.reduce((sum, car) => sum + car.price, 0) / matchingPolishCars.length
    : 0;


  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Average Price Card */}
      <Card className="flex-shrink-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-3 h-3 bg-polish-data rounded-full"></div>
            Polish Market Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Matching Cars</p>
              <p className="text-2xl font-bold">{matchingPolishCars.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Price</p>
              <p className="text-2xl font-bold">{avgPolishPrice.toLocaleString()} PLN</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Polish Cars Table */}
      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle className="text-lg">Matching Polish Listings</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-4 pt-0">
          {matchingPolishCars.length > 0 ? (
            <ScrollArea className="h-full w-full">
              <div className="space-y-2 pr-4">
                {matchingPolishCars.map((car) => (
                  <div key={car.id} className="flex justify-between items-center p-3 bg-analytics-bg rounded-lg">
                    <div>
                      <p className="font-medium">{car.location}</p>
                      <p className="text-sm text-muted-foreground">{car.mileage.toLocaleString()} km</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-polish-data">{car.price.toLocaleString()} PLN</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No matching Polish cars found within ±30,000 km mileage</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}