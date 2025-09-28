import { KijijiCar, PolishCar } from '@/types/car';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MarketAnalysisChartProps {
  selectedCar: KijijiCar | null;
  polishCars: PolishCar[];
}

export default function MarketAnalysisChart({ selectedCar, polishCars }: MarketAnalysisChartProps) {
  if (!selectedCar) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Select a Kijiji car to view market analysis chart</p>
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

  // Prepare data for scatter chart
  const chartData = [
    ...matchingPolishCars.map((car) => ({
      mileage: car.mileage,
      price: car.price,
      type: 'polish',
      name: `${car.make} ${car.model} (${car.location})`
    })),
    {
      mileage: selectedCar.mileage,
      price: selectedCar.price * 2.62, // Convert to PLN
      type: 'kijiji',
      name: `Selected: ${selectedCar.make} ${selectedCar.model}`
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Market Analysis Chart</CardTitle>
        <p className="text-muted-foreground">Price vs Mileage comparison between Kijiji and Polish markets</p>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="mileage" 
                name="Mileage" 
                unit=" km"
                type="number"
                domain={['dataMin - 10000', 'dataMax + 10000']}
              />
              <YAxis 
                dataKey="price" 
                name="Price" 
                unit=" PLN"
                type="number"
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'price' ? `${value.toLocaleString()} PLN` : `${value.toLocaleString()} km`,
                  name === 'price' ? 'Price' : 'Mileage'
                ]}
                labelFormatter={(label) => `${label}`}
              />
              <Scatter 
                data={chartData.filter(d => d.type === 'polish')} 
                fill="hsl(var(--polish-data))"
                name="Polish Cars"
              />
              <Scatter 
                data={chartData.filter(d => d.type === 'kijiji')} 
                fill="hsl(var(--kijiji-selected))"
                shape="star"
                name="Selected Kijiji Car"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}