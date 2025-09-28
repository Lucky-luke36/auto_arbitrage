import { useState, useMemo, useCallback } from "react";
import { KijijiCar, PolishCar } from "@/types/car";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
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
  const [sortField, setSortField] = useState<"price" | "margin" | "matches">("margin");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [filterMake, setFilterMake] = useState("");
  const [filterModel, setFilterModel] = useState("");
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minMarginPct, setMinMarginPct] = useState<number | null>(null);
  const [minMatches, setMinMatches] = useState<number | null>(null);

  const DEFAULT_SHIPPING = 15000;
  const DEFAULT_VAT_PERCENT = 23;
  const DEFAULT_EXCISE_RATE = 0.186; // default >2L
  const CUSTOMS_RATE = 0.1; // 10%

  // Memoized function to find matching Polish cars
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

  // Process cars with profitability calculation
  const processedCars = useMemo(() => {
    return cars
      .map((car) => {
        const matches = getPolishMatches(car);
        const avgPolishPrice = matches.length
          ? matches.reduce((sum, c) => sum + c.price, 0) / matches.length
          : 0;

        const kijijiPricePLN = car.price * CAD_TO_PLN_RATE;

        // Customs, excise, VAT calculations
        const customs = CUSTOMS_RATE * (kijijiPricePLN + DEFAULT_SHIPPING);
        const excise = DEFAULT_EXCISE_RATE * kijijiPricePLN;
        const vat = (DEFAULT_VAT_PERCENT / 100) * (kijijiPricePLN + DEFAULT_SHIPPING + customs + excise);

        const totalCosts = kijijiPricePLN + DEFAULT_SHIPPING + customs + excise + vat;
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
      .filter((car) => (minMarginPct !== null ? car.profitPercentage >= minMarginPct : true))
      .filter((car) => (minMatches !== null ? car.polishMatches >= minMatches : true))
      .sort((a, b) => {
        let valA: number, valB: number;
        switch (sortField) {
          case "price":
            valA = a.price;
            valB = b.price;
            break;
          case "matches":
            valA = a.polishMatches;
            valB = b.polishMatches;
            break;
          case "margin":
          default:
            valA = a.profitPercentage;
            valB = b.profitPercentage;
        }
        return sortOrder === "asc" ? valA - valB : valB - valA;
      });
  }, [
    cars,
    getPolishMatches,
    hideZeroMatches,
    sortField,
    sortOrder,
    filterMake,
    filterModel,
    minPrice,
    maxPrice,
    minMarginPct,
    minMatches,
  ]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium">Canadian Kijiji Listings</CardTitle>
          <div className="flex items-center gap-2 text-xs">
            <Checkbox
              id="hide-zero"
              checked={hideZeroMatches}
              onCheckedChange={(checked) => setHideZeroMatches(!!checked)}
            />
            <label htmlFor="hide-zero" className="cursor-pointer">Hide 0 matches</label>
          </div>
        </div>

        {/* Sorting */}
        <div className="flex gap-3 items-center text-sm">
          <Label className="text-xs">Sort by</Label>
          <Select value={sortField} onValueChange={(v: "price" | "margin" | "matches") => setSortField(v)}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="margin">Margin %</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="matches">Matches</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(v: "asc" | "desc") => setSortOrder(v)}>
            <SelectTrigger className="w-20 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Asc</SelectItem>
              <SelectItem value="desc">Desc</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
          <Input className="h-8 text-xs" placeholder="Make" value={filterMake} onChange={(e) => setFilterMake(e.target.value)} />
          <Input className="h-8 text-xs" placeholder="Model" value={filterModel} onChange={(e) => setFilterModel(e.target.value)} />
          <Input className="h-8 text-xs" type="number" placeholder="Min $" onChange={(e) => setMinPrice(Number(e.target.value) || null)} />
          <Input className="h-8 text-xs" type="number" placeholder="Max $" onChange={(e) => setMaxPrice(Number(e.target.value) || null)} />
          <Input className="h-8 text-xs" type="number" placeholder="Min Margin %" onChange={(e) => setMinMarginPct(Number(e.target.value) || null)} />
          <Input className="h-8 text-xs" type="number" placeholder="Min Matches" onChange={(e) => setMinMatches(Number(e.target.value) || null)} />
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="divide-y divide-border h-full overflow-y-auto">
          {processedCars.map((car) => {
            const isSelected = selectedCar?.id === car.id;
            return (
              <div
                key={car.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${isSelected ? "bg-muted border-l-2 border-primary" : ""}`}
                onClick={() => onCarSelect(car)}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-sm">{car.make} {car.model}</div>
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="text-xs">{car.polishMatches} matches</Badge>
                    <Badge className={`text-xs ${car.profit > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {car.profit > 0 ? "+" : ""}{car.profit.toLocaleString()} PLN
                    </Badge>
                    <Badge variant="outline" className="text-xs">{car.profitPercentage.toFixed(1)}%</Badge>
                    {car.link && (
                      <Button asChild size="icon" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                        <a href={car.link} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Year: {car.year}</div>
                  <div>Price: ${car.price.toLocaleString()} CAD</div>
                  <div>Mileage: {car.mileage.toLocaleString()} km</div>
                  <div>{car.location}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
