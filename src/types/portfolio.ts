export interface Security {
  id: string;
  name: string;
  type: 'STOCK' | 'BOND' | 'ETF' | 'MUTUAL_FUND' | 'OPTION' | 'FUTURES';
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
  historicalReturns?: number[]; // daily/weekly returns
  // Futures specific fields
  contractSize?: number;
  marginRequirement?: number;
  marginUsed?: number;
  positionType?: 'LONG' | 'SHORT';
  expirationDate?: string;
  tickSize?: number;
  tickValue?: number;
}

export interface Trade {
  id: string;
  securityId: string;
  securityName: string;
  type: 'BUY' | 'SELL' | 'LONG_FUTURES' | 'SHORT_FUTURES' | 'CLOSE_LONG' | 'CLOSE_SHORT';
  quantity: number;
  price: number;
  value: number;
  date: string;
  commission: number;
  notes?: string;
  // Futures specific fields
  contractSize?: number;
  marginRequirement?: number;
  marginUsed?: number;
  positionType?: 'LONG' | 'SHORT';
  expirationDate?: string;
  tickSize?: number;
  tickValue?: number;
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
  // Futures specific metrics
  marginUtilization: number;
  leverageRatio: number;
  futuresExposure: number;
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
  // Futures specific summary
  futuresValue: number;
  totalMarginUsed: number;
  availableMargin: number;
  marginUtilizationPercent: number;
  unrealizedPnL: number;
}

export interface FuturesContract {
  id: string;
  symbol: string;
  name: string;
  contractSize: number;
  tickSize: number;
  tickValue: number;
  marginRequirement: number;
  expirationDate: string;
  currentPrice: number;
  lastPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
}

export interface FuturesPosition {
  id: string;
  contractId: string;
  symbol: string;
  name: string;
  positionType: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  markToMarket: number;
  unrealizedPnL: number;
  marginUsed: number;
  marginRequirement: number;
  leverage: number;
  entryDate: string;
  expirationDate: string;
  tickSize: number;
  tickValue: number;
}
