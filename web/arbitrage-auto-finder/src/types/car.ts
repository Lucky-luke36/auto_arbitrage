export interface KijijiCar {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  location: string;
  link: string;
}

export interface PolishCar {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number; // in PLN
  mileage: number;
  location: string;
}

export interface ProfitCalculation {
  kijijiPricePLN: number;
  avgPolishPrice: number;
  shipping: number;
  vat: number;
  customs: number;
  totalCosts: number;
  profit: number;
}