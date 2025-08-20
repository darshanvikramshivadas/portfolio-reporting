export interface Security {
  id: string;
  name: string;
  type: 'STOCK' | 'BOND' | 'ETF' | 'MUTUAL_FUND' | 'OPTION';
  symbol: string;
  quantity: number;
  buyPrice: number;
  buyValue: number;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  buyDate: string;
  holdingPeriod: number; // in days
  sector?: string;
  country?: string;
}

export interface Trade {
  id: string;
  securityId: string;
  securityName: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  value: number;
  date: string;
  commission: number;
  notes?: string;
}

export interface CashBalance {
  currency: string;
  amount: number;
  usdEquivalent: number;
  exchangeRate: number;
}

export interface RiskMetrics {
  delta: number;
  beta: number;
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
}

export interface Benchmark {
  name: string;
  symbol: string;
  performance: {
    '1M': number;
    '3M': number;
    '6M': number;
    '1Y': number;
    'YTD': number;
  };
}

export interface PortfolioSummary {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  cashValue: number;
  securitiesValue: number;
  lastUpdated: string;
}
