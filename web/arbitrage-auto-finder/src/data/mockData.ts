import { KijijiCar, PolishCar } from '@/types/car';

export const kijijiCars: KijijiCar[] = [
  {
    id: 'k1',
    make: 'BMW',
    model: '320i',
    year: 2018,
    price: 28500,
    mileage: 95000,
    location: 'Toronto, ON'
  },
  {
    id: 'k2',
    make: 'Audi',
    model: 'A4',
    year: 2019,
    price: 32000,
    mileage: 78000,
    location: 'Vancouver, BC'
  },
  {
    id: 'k3',
    make: 'Mercedes-Benz',
    model: 'C300',
    year: 2017,
    price: 30000,
    mileage: 105000,
    location: 'Calgary, AB'
  },
  {
    id: 'k4',
    make: 'BMW',
    model: '320i',
    year: 2018,
    price: 27000,
    mileage: 112000,
    location: 'Montreal, QC'
  },
  {
    id: 'k5',
    make: 'Volkswagen',
    model: 'Golf GTI',
    year: 2020,
    price: 29500,
    mileage: 45000,
    location: 'Ottawa, ON'
  },
  {
    id: 'k6',
    make: 'Audi',
    model: 'A4',
    year: 2019,
    price: 31500,
    mileage: 82000,
    location: 'Edmonton, AB'
  }
];

export const polishCars: PolishCar[] = [
  // BMW 320i 2018
  {
    id: 'p1',
    make: 'BMW',
    model: '320i',
    year: 2018,
    price: 95000,
    mileage: 85000,
    location: 'Warsaw'
  },
  {
    id: 'p2',
    make: 'BMW',
    model: '320i',
    year: 2018,
    price: 88000,
    mileage: 120000,
    location: 'Krakow'
  },
  {
    id: 'p3',
    make: 'BMW',
    model: '320i',
    year: 2018,
    price: 92000,
    mileage: 95000,
    location: 'Gdansk'
  },
  {
    id: 'p4',
    make: 'BMW',
    model: '320i',
    year: 2018,
    price: 89500,
    mileage: 110000,
    location: 'Wroclaw'
  },
  
  // Audi A4 2019
  {
    id: 'p5',
    make: 'Audi',
    model: 'A4',
    year: 2019,
    price: 105000,
    mileage: 70000,
    location: 'Warsaw'
  },
  {
    id: 'p6',
    make: 'Audi',
    model: 'A4',
    year: 2019,
    price: 98000,
    mileage: 95000,
    location: 'Poznan'
  },
  {
    id: 'p7',
    make: 'Audi',
    model: 'A4',
    year: 2019,
    price: 110000,
    mileage: 65000,
    location: 'Krakow'
  },
  
  // Mercedes-Benz C300 2017
  {
    id: 'p8',
    make: 'Mercedes-Benz',
    model: 'C300',
    year: 2017,
    price: 85000,
    mileage: 130000,
    location: 'Warsaw'
  },
  {
    id: 'p9',
    make: 'Mercedes-Benz',
    model: 'C300',
    year: 2017,
    price: 92000,
    mileage: 95000,
    location: 'Gdansk'
  },
  
  // Volkswagen Golf GTI 2020
  {
    id: 'p10',
    make: 'Volkswagen',
    model: 'Golf GTI',
    year: 2020,
    price: 78000,
    mileage: 35000,
    location: 'Warsaw'
  },
  {
    id: 'p11',
    make: 'Volkswagen',
    model: 'Golf GTI',
    year: 2020,
    price: 82000,
    mileage: 45000,
    location: 'Krakow'
  }
];

export const CAD_TO_PLN_RATE = 2.62;