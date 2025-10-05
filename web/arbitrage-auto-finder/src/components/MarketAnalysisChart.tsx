import { KijijiCar, PolishCar } from '@/types/car';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  Layer,
} from 'recharts';

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

  const CAD_TO_PLN = 2.62;
  const DEFAULT_SHIPPING = 15000;
  const DEFAULT_EXCISE_RATE = 0.186; // assume >2.0L
  const CUSTOMS_RATE = 0.1;
  const VAT_PERCENT = 23;

  // Calculate total investment of selected car
  const kijijiPricePLN = selectedCar.price * CAD_TO_PLN;
  const customs = CUSTOMS_RATE * (kijijiPricePLN + DEFAULT_SHIPPING);
  const excise = DEFAULT_EXCISE_RATE * kijijiPricePLN;
  const vat = (VAT_PERCENT / 100) * (kijijiPricePLN + DEFAULT_SHIPPING + customs + excise);
  const totalInvestment = kijijiPricePLN + DEFAULT_SHIPPING + customs + excise + vat;

  // Mean price of Polish cars
  const polishMeanPrice =
    matchingPolishCars.length > 0
      ? matchingPolishCars.reduce((sum, c) => sum + c.price, 0) / matchingPolishCars.length
      : 0;

  // Chart data
  const chartData = [
    ...matchingPolishCars.map((car) => ({
      mileage: car.mileage,
      price: car.price,
      type: 'polish',
      name: `${car.make} ${car.model} (${car.location})`,
    })),
    {
      mileage: selectedCar.mileage,
      price: totalInvestment,
      type: 'kijiji',
      name: `Selected: ${selectedCar.make} ${selectedCar.model}`,
    },
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
                  name === 'price' ? `${value.toLocaleString()}` : `${value.toLocaleString()}`,
                  name === 'price' ? 'Price' : 'Mileage'
                ]}
                labelFormatter={(label) => `${label}`}
              />

              {/* Polish cars scatter */}
              <Scatter
                data={chartData.filter(d => d.type === 'polish')}
                fill="hsl(var(--polish-data))"
                name="Polish Cars"
              />

              {/* Selected Kijiji car */}
              <Scatter
                data={chartData.filter(d => d.type === 'kijiji')}
                fill="hsl(var(--kijiji-selected))"
                shape="star"
                name="Selected Kijiji Car"
              />

              {/* Mean line */}
              <ReferenceLine
                y={polishMeanPrice}
                stroke="blue"
                strokeDasharray="3 3"
                label={{ value: 'Mean Price', position: 'right', fill: 'blue', fontSize: 12 }}
              />

              {/* Area between red star and mean line */}
              {totalInvestment > 0 && polishMeanPrice > 0 && (
                <Layer>
                  <Area
                    type="monotone"
                    data={[{ mileage: selectedCar.mileage, price: polishMeanPrice }, { mileage: selectedCar.mileage, price: totalInvestment }]}
                    dataKey="price"
                    stroke="none"
                    fill="rgba(255,0,0,0.2)"
                  />
                </Layer>
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
