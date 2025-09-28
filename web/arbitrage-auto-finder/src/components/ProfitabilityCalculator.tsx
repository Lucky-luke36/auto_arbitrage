import { useState, useMemo } from 'react';
import { KijijiCar, PolishCar, ProfitCalculation } from '@/types/car';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CAD_TO_PLN_RATE } from '@/data/mockData';

interface ProfitabilityCalculatorProps {
  selectedCar: KijijiCar | null;
  polishCars: PolishCar[];
}

export default function ProfitabilityCalculator({ selectedCar, polishCars }: ProfitabilityCalculatorProps) {
  const [shipping, setShipping] = useState(15000);
  const [vatPercent, setVatPercent] = useState(23); // VAT as percentage
  const [customs, setCustoms] = useState(5000);

  if (!selectedCar) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Select a car to calculate profitability</p>
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

  const avgPolishPrice = matchingPolishCars.length
    ? matchingPolishCars.reduce((sum, c) => sum + c.price, 0) / matchingPolishCars.length
    : 0;

  const kijijiPricePLN = selectedCar.price * CAD_TO_PLN_RATE;
  const vat = ((kijijiPricePLN + shipping) * vatPercent) / 100;

  const calculation: ProfitCalculation = {
    kijijiPricePLN,
    avgPolishPrice,
    shipping,
    vat,
    customs,
    totalCosts: kijijiPricePLN + shipping + vat + customs,
    profit: avgPolishPrice - (kijijiPricePLN + shipping + vat + customs),
  };

  const profitPercentage = avgPolishPrice > 0 ? (calculation.profit / avgPolishPrice) * 100 : 0;

  const renderPLN = (amount: number) => (
    <span title={`$${(amount / CAD_TO_PLN_RATE).toLocaleString()} CAD`}>
      {amount.toLocaleString()} PLN
    </span>
  );

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Profit Analysis - {selectedCar.make} {selectedCar.model} {selectedCar.year}
            </span>
            <div
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                calculation.profit > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {calculation.profit > 0 ? 'Profitable' : 'Loss'}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Average Polish Price</p>
              <p className="text-2xl font-bold text-polish-data">{renderPLN(avgPolishPrice)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Investment</p>
              <p className="text-2xl font-bold">{renderPLN(calculation.totalCosts)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Potential Profit</p>
              <p
                className={`text-3xl font-bold ${
                  calculation.profit > 0 ? 'text-profit-positive' : 'text-profit-negative'
                }`}
              >
                {calculation.profit > 0 ? '+' : ''}
                {renderPLN(calculation.profit)}
              </p>
              <p className={`text-sm ${calculation.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitPercentage > 0 ? '+' : ''}
                {profitPercentage.toFixed(1)}% margin
              </p>
            </div>
          </div>
          {matchingPolishCars.length === 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ No Polish cars found for comparison within ±30,000 km mileage
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold">Additional Costs (PLN)</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="shipping">Shipping</Label>
                  <Input
                    id="shipping"
                    type="number"
                    value={shipping}
                    onChange={(e) => setShipping(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="vat">VAT (%)</Label>
                  <Input
                    id="vat"
                    type="number"
                    value={vatPercent}
                    onChange={(e) => setVatPercent(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="customs">Customs</Label>
                  <Input
                    id="customs"
                    type="number"
                    value={customs}
                    onChange={(e) => setCustoms(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Cost Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Kijiji Price (CAD):</span>
                  <span>${selectedCar.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kijiji Price (PLN):</span>
                  {renderPLN(calculation.kijijiPricePLN)}
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  {renderPLN(shipping)}
                </div>
                <div className="flex justify-between">
                  <span>VAT:</span>
                  {renderPLN(vat)}
                </div>
                <div className="flex justify-between">
                  <span>Customs:</span>
                  {renderPLN(customs)}
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total Costs:</span>
                  {renderPLN(calculation.totalCosts)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
