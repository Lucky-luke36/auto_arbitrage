import { CAD_TO_PLN_RATE } from '@/data/mockData';

export interface ProfitResult {
  kijijiPricePLN: number;
  vat: number;
  totalCosts: number;
  profit: number;
  profitPercentage: number;
}

export function calculateProfit(
  kijijiPriceCAD: number,
  shipping: number,
  customs: number,
  avgPolishPrice: number
): ProfitResult {
  const kijijiPricePLN = kijijiPriceCAD * CAD_TO_PLN_RATE;
  const vat = Math.round((kijijiPricePLN + shipping) * 0.23); // 23% of value + shipping
  const totalCosts = kijijiPricePLN + shipping + vat + customs;
  const profit = avgPolishPrice - totalCosts;
  const profitPercentage = avgPolishPrice > 0 ? (profit / avgPolishPrice) * 100 : 0;

  return { kijijiPricePLN, vat, totalCosts, profit, profitPercentage };
}
