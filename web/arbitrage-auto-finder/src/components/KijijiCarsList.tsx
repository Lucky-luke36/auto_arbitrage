import { useState, useMemo, useCallback } from "react";
import { KijijiCar, PolishCar } from "@/types/car";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CAD_TO_PLN_RATE } from "@/data/mockData";

interface KijijiCarsListProps {
  cars: KijijiCar[];
  polishCars: PolishCar[];
  selectedCar: KijijiCar | null;
  onCarSelect: (car: KijijiCar) => void;
}

export default function KijijiCarsList({
  cars,
  polishCars,
  selectedCar,
  onCarSelect,
}: KijijiCarsListProps) {
  const [hideZeroMatches, setHideZeroMatches] = useState(true);
  const [sortField, setSortField] = useState<"price" | "margin">("margin");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [filterMake, setFilterMake] = useState("");
  const [filterModel, setFilterModel] = useState("");
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minMargin, setMinMargin] = useState<number | null>(null);

  const getPolishMatches = useCallback(
    (car: KijijiCar) =>
      polishCars.filter(
        (polishCar) =>
          polishCar.make === car.make &&
          polishCar.model === car.model &&
          polishCar.year === car.year &&
          Math.abs(polishCar.mileage - car.mileage) <= 30000 &&
          polishCar.mileage > 0
      ),
    [polishCars]
  );

  const DEFAULT_SHIPPING = 15000;
  const DEFAULT_CUSTOMS = 5000;

  const processedCars = useMemo(() => {
    return cars
      .map((car) => {
        const matches = getPolishMatches(car);
        const avgPolishPrice =
          matches.length > 0
            ? matches.reduce((sum, c) => sum + c.price, 0) / matches.length
            : 0;

        const kijijiPricePLN = car.price * CAD_TO_PLN_RATE;
        const defaultVAT = Math.round((kijijiPricePLN + DEFAULT_SHIPPING) * 0.23);
        const totalCosts = kijijiPricePLN + DEFAULT_SHIPPING + defaultVAT + DEFAULT_CUSTOMS;
        const profit = avgPolishPrice - totalCosts;
        const profitPercentage = avgPolishPrice > 0 ? (profit / avgPolishPrice) * 100 : 0;

        return {
          ...car,
          polishMatches: matches.length,
          avgPolishPrice,
          profit,
          profitPercentage,
        };
      })
      .filter((car) => (hideZeroMatches ? car.polishMatches > 0 : true))
      .filter((car) => (filterMake ? car.make.toLowerCase().includes(filterMake.toLowerCase()) : true))
      .filter((car) => (filterModel ? car.model.toLowerCase().includes(filterModel.toLowerCase()) : true))
      .filter((car) => (minPrice !== null ? car.price >= minPrice : true))
      .filter((car) => (maxPrice !== null ? car.price <= maxPrice : true))
      .filter((car) => (minMargin !== null ? car.profit >= minMargin : true))
      .sort((a, b) => {
        const valA = sortField === "price" ? a.price : a.profit;
        const valB = sortField === "price" ? b.price : b.profit;
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [
    cars,
    hideZeroMatches,
    sortField,
    sortOrder,
    filterMake,
    filterModel,
    minPrice,
    maxPrice,
    minMargin,
    getPolishMatches,
  ]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 bg-kijiji-selected rounded-full"></div>
            Canadian Kijiji Listings
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <Checkbox
              id="hide-zero"
              checked={hideZeroMatches}
              onCheckedChange={(checked) => setHideZeroMatches(!!checked)}
            />
            <label htmlFor="hide-zero" className="cursor-pointer">
              Hide 0 matches
            </label>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Label>Sort by</Label>
            <Select value={sortField} onValueChange={(v: "price" | "margin") => setSortField(v)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="margin">Margin</SelectItem>
                <SelectItem value="price">Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={sortOrder} onValueChange={(v: "asc" | "desc") => setSortOrder(v)}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Asc</SelectItem>
              <SelectItem value="desc">Desc</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Input placeholder="Make" value={filterMake} onChange={(e) => setFilterMake(e.target.value)} />
          <Input placeholder="Model" value={filterModel} onChange={(e) => setFilterModel(e.target.value)} />
          <Input type="number" placeholder="Min Price" onChange={(e) => setMinPrice(Number(e.target.value) || null)} />
          <Input type="number" placeholder="Max Price" onChange={(e) => setMaxPrice(Number(e.target.value) || null)} />
          <Input type="number" placeholder="Min Margin (PLN)" onChange={(e) => setMinMargin(Number(e.target.value) || null)} />
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="divide-y divide-border h-full overflow-y-auto">
          {processedCars.map((car) => {
            const isSelected = selectedCar?.id === car.id;
            return (
              <div
                key={car.id}
                className={`p-4 cursor-pointer transition-colors hover:bg-data-hover ${
                  isSelected ? "bg-secondary border-l-4 border-l-kijiji-selected" : ""
                }`}
                onClick={() => onCarSelect(car)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-foreground">
                    {car.make} {car.model}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={car.polishMatches > 0 ? "default" : "secondary"}>
                      {car.polishMatches} Polish matches
                    </Badge>
                    <Badge
                      variant={car.profit > 0 ? "default" : "secondary"}
                      className={car.profit > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                    >
                      {car.profit > 0 ? "+" : ""}
                      {car.profit.toLocaleString()} PLN
                    </Badge>
                    <Badge variant="outline">{car.profitPercentage.toFixed(1)}%</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Year:</span> {car.year}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span> ${car.price.toLocaleString()} CAD
                  </div>
                  <div>
                    <span className="font-medium">Mileage:</span> {car.mileage.toLocaleString()} km
                  </div>
                  <div className="text-xs">{car.location}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
