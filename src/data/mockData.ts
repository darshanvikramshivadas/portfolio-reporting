import { Security, Trade, CashBalance, RiskMetrics, Benchmark, PortfolioSummary, FuturesContract, FuturesPosition } from '@/types/portfolio';

/**
 * Mock Data for Portfolio Management System
 * 
 * This file contains sample data for development, testing, and demonstration purposes.
 * In production, this data would come from real-time market feeds, databases, and APIs.
 * 
 * The mock data represents a diversified portfolio with:
 * - Technology stocks (AAPL, MSFT, TSLA)
 * - Index ETF (VOO)
 * - Financial sector stock (JPM)
 * - Futures contracts (S&P 500, Gold, Oil, NASDAQ)
 * - Multi-currency cash balances
 * - Sample trades and risk metrics
 */

/**
 * Mock Securities Portfolio
 * 
 * Represents a diversified portfolio of stocks, ETFs, and futures contracts.
 * Each security includes current market data, purchase history, and performance metrics.
 * 
 * Portfolio Composition:
 * - Technology: 40% (AAPL, MSFT, TSLA)
 * - ETF: 20% (VOO - S&P 500 tracking)
 * - Financial: 10% (JPM)
 * - Futures: 30% (S&P 500, Gold)
 */
export const mockSecurities: Security[] = [
  {
    id: '1',
    name: 'Apple Inc.',
    type: 'STOCK',
    symbol: 'AAPL',
    quantity: 100,
    buyPrice: 150.00,
    buyValue: 15000.00,
    currentPrice: 175.50,
    currentValue: 17550.00,
    gainLoss: 2550.00,
    gainLossPercent: 17.00,
    buyDate: '2023-06-15',
    holdingPeriod: 180,
    sector: 'Technology',
    country: 'US'
  },
  {
    id: '2',
    name: 'Microsoft Corporation',
    type: 'STOCK',
    symbol: 'MSFT',
    quantity: 75,
    buyPrice: 280.00,
    buyValue: 21000.00,
    currentPrice: 320.00,
    currentValue: 24000.00,
    gainLoss: 3000.00,
    gainLossPercent: 14.29,
    buyDate: '2023-08-20',
    holdingPeriod: 120,
    sector: 'Technology',
    country: 'US'
  },
  {
    id: '3',
    name: 'Vanguard S&P 500 ETF',
    type: 'ETF',
    symbol: 'VOO',
    quantity: 50,
    buyPrice: 380.00,
    buyValue: 19000.00,
    currentPrice: 395.00,
    currentValue: 19750.00,
    gainLoss: 750.00,
    gainLossPercent: 3.95,
    buyDate: '2023-01-10',
    holdingPeriod: 320,
    sector: 'ETF',
    country: 'US'
  },
  {
    id: '4',
    name: 'Tesla Inc.',
    type: 'STOCK',
    symbol: 'TSLA',
    quantity: 25,
    buyPrice: 200.00,
    buyValue: 5000.00,
    currentPrice: 180.00,
    currentValue: 4500.00,
    gainLoss: -500.00,
    gainLossPercent: -10.00,
    buyDate: '2023-09-05',
    holdingPeriod: 90,
    sector: 'Automotive',
    country: 'US'
  },
  {
    id: '5',
    name: 'JPMorgan Chase & Co.',
    type: 'STOCK',
    symbol: 'JPM',
    quantity: 60,
    buyPrice: 140.00,
    buyValue: 8400.00,
    currentPrice: 155.00,
    currentValue: 9300.00,
    gainLoss: 900.00,
    gainLossPercent: 10.71,
    buyDate: '2023-07-12',
    holdingPeriod: 150,
    sector: 'Financial',
    country: 'US'
  },

  // Futures positions - provide leverage and hedging capabilities
  {
    id: '6',
    name: 'E-mini S&P 500 Futures',
    type: 'FUTURES',
    symbol: 'ES',
    quantity: 2,
    buyPrice: 4200.00,
    buyValue: 420000.00,
    currentPrice: 4250.00,
    currentValue: 425000.00,
    gainLoss: 5000.00,
    gainLossPercent: 1.19,
    buyDate: '2023-12-01',
    holdingPeriod: 30,
    sector: 'Futures',
    country: 'US',
    contractSize: 50,
    marginRequirement: 0.05,
    marginUsed: 21000.00,
    positionType: 'LONG',
    expirationDate: '2024-03-15',
    tickSize: 0.25,
    tickValue: 12.50
  },
  {
    id: '7',
    name: 'Gold Futures',
    type: 'FUTURES',
    symbol: 'GC',
    quantity: 1,
    buyPrice: 1950.00,
    buyValue: 195000.00,
    currentPrice: 1920.00,
    currentValue: 192000.00,
    gainLoss: -3000.00,
    gainLossPercent: -1.54,
    buyDate: '2023-11-15',
    holdingPeriod: 45,
    sector: 'Futures',
    country: 'US',
    contractSize: 100,
    marginRequirement: 0.08,
    marginUsed: 15600.00,
    positionType: 'LONG',
    expirationDate: '2024-02-28',
    tickSize: 0.10,
    tickValue: 10.00
  }
];

export const mockTrades: Trade[] = [
  {
    id: '1',
    securityId: '1',
    securityName: 'Apple Inc.',
    type: 'BUY',
    quantity: 100,
    price: 150.00,
    value: 15000.00,
    date: '2023-06-15',
    commission: 9.99,
    notes: 'Initial position'
  },
  {
    id: '2',
    securityId: '2',
    securityName: 'Microsoft Corporation',
    type: 'BUY',
    quantity: 75,
    price: 280.00,
    value: 21000.00,
    date: '2023-08-20',
    commission: 9.99,
    notes: 'Technology sector allocation'
  },
  {
    id: '3',
    securityId: '3',
    securityName: 'Vanguard S&P 500 ETF',
    type: 'BUY',
    quantity: 50,
    price: 380.00,
    value: 19000.00,
    date: '2023-01-10',
    commission: 0.00,
    notes: 'Core portfolio ETF'
  },
  {
    id: '4',
    securityId: '4',
    securityName: 'Tesla Inc.',
    type: 'BUY',
    quantity: 25,
    price: 200.00,
    value: 5000.00,
    date: '2023-09-05',
    commission: 9.99,
    notes: 'Growth opportunity'
  },
  {
    id: '5',
    securityId: '5',
    securityName: 'JPMorgan Chase & Co.',
    type: 'BUY',
    quantity: 60,
    price: 140.00,
    value: 8400.00,
    date: '2023-07-12',
    commission: 9.99,
    notes: 'Financial sector exposure'
  },
  // Futures trades
  {
    id: '6',
    securityId: '6',
    securityName: 'E-mini S&P 500 Futures',
    type: 'LONG_FUTURES',
    quantity: 2,
    price: 4200.00,
    value: 420000.00,
    date: '2023-12-01',
    commission: 4.50,
    notes: 'Long S&P 500 exposure',
    contractSize: 50,
    marginRequirement: 0.05,
    marginUsed: 21000.00,
    positionType: 'LONG',
    expirationDate: '2024-03-15',
    tickSize: 0.25,
    tickValue: 12.50
  },
  {
    id: '7',
    securityId: '7',
    securityName: 'Gold Futures',
    type: 'LONG_FUTURES',
    quantity: 1,
    price: 1950.00,
    value: 195000.00,
    date: '2023-11-15',
    commission: 3.50,
    notes: 'Inflation hedge',
    contractSize: 100,
    marginRequirement: 0.08,
    marginUsed: 15600.00,
    positionType: 'LONG',
    expirationDate: '2024-02-28',
    tickSize: 0.10,
    tickValue: 10.00
  }
];

export const mockCashBalances: CashBalance[] = [
  {
    currency: 'USD',
    amount: 25000.00,
    usdEquivalent: 25000.00,
    exchangeRate: 1.00
  },
  {
    currency: 'EUR',
    amount: 15000.00,
    usdEquivalent: 16200.00,
    exchangeRate: 1.08
  },
  {
    currency: 'GBP',
    amount: 12000.00,
    usdEquivalent: 15000.00,
    exchangeRate: 1.25
  },
  {
    currency: 'JPY',
    amount: 2000000.00,
    usdEquivalent: 13500.00,
    exchangeRate: 0.00675
  }
];

export const mockRiskMetrics: RiskMetrics = {
  delta: 0.85,
  beta: 1.12,
  sharpeRatio: 1.45,
  volatility: 0.18,
  maxDrawdown: -0.08,
  marginUtilization: 0.35,
  leverageRatio: 2.85,
  futuresExposure: 0.42
};

export const mockBenchmarks: Benchmark[] = [
  {
    name: 'NASDAQ Composite',
    symbol: '^IXIC',
    performance: {
      '1M': 2.5,
      '3M': 8.2,
      '6M': 15.8,
      '1Y': 28.5,
      'YTD': 22.3
    }
  },
  {
    name: 'S&P 500',
    symbol: '^GSPC',
    performance: {
      '1M': 1.8,
      '3M': 6.5,
      '6M': 12.3,
      '1Y': 24.1,
      'YTD': 18.7
    }
  },
  {
    name: 'FTSE 100',
    symbol: '^FTSE',
    performance: {
      '1M': 0.9,
      '3M': 4.2,
      '6M': 8.7,
      '1Y': 16.3,
      'YTD': 12.8
    }
  },
  {
    name: 'MSCI World',
    symbol: '^MXWO',
    performance: {
      '1M': 1.2,
      '3M': 5.8,
      '6M': 11.2,
      '1Y': 20.5,
      'YTD': 15.9
    }
  }
];

export const mockPortfolioSummary: PortfolioSummary = {
  totalValue: 100000.00,
  totalGainLoss: 6700.00,
  totalGainLossPercent: 7.18,
  cashValue: 69700.00,
  securitiesValue: 30300.00,
  lastUpdated: '2025-01-20T19:41:50.000Z',
  futuresValue: 617000.00,
  totalMarginUsed: 36600.00,
  availableMargin: 33400.00,
  marginUtilizationPercent: 52.3,
  unrealizedPnL: 2000.00
};

// Mock FX rates for real-time updates
export const mockFXRates = {
  EUR: 1.08,
  GBP: 1.25,
  JPY: 0.00675,
  CHF: 1.12,
  AUD: 0.68,
  CAD: 0.75
};

// Mock closing prices for MTM calculations
export const mockClosingPrices = {
  AAPL: 175.50,
  MSFT: 320.00,
  VOO: 395.00,
  TSLA: 180.00,
  JPM: 155.00,
  ES: 4250.00,
  GC: 1920.00
};

// Mock futures contracts available for trading
export const mockFuturesContracts: FuturesContract[] = [
  {
    id: 'ES1',
    symbol: 'ES',
    name: 'E-mini S&P 500 Futures',
    contractSize: 50,
    tickSize: 0.25,
    tickValue: 12.50,
    marginRequirement: 0.05,
    expirationDate: '2024-03-15',
    currentPrice: 4250.00,
    lastPrice: 4248.50,
    change: 1.50,
    changePercent: 0.04,
    volume: 1250000,
    openInterest: 2500000
  },
  {
    id: 'GC1',
    symbol: 'GC',
    name: 'Gold Futures',
    contractSize: 100,
    tickSize: 0.10,
    tickValue: 10.00,
    marginRequirement: 0.08,
    expirationDate: '2024-02-28',
    currentPrice: 1920.00,
    lastPrice: 1922.50,
    change: -2.50,
    changePercent: -0.13,
    volume: 85000,
    openInterest: 450000
  },
  {
    id: 'CL1',
    symbol: 'CL',
    name: 'Crude Oil Futures',
    contractSize: 1000,
    tickSize: 0.01,
    tickValue: 10.00,
    marginRequirement: 0.10,
    expirationDate: '2024-04-15',
    currentPrice: 75.50,
    lastPrice: 75.25,
    change: 0.25,
    changePercent: 0.33,
    volume: 95000,
    openInterest: 680000
  },
  {
    id: 'NQ1',
    symbol: 'NQ',
    name: 'E-mini NASDAQ-100 Futures',
    contractSize: 20,
    tickSize: 0.25,
    tickValue: 5.00,
    marginRequirement: 0.06,
    expirationDate: '2024-03-15',
    currentPrice: 16850.00,
    lastPrice: 16845.00,
    change: 5.00,
    changePercent: 0.03,
    volume: 450000,
    openInterest: 1200000
  }
];

// Mock futures positions
export const mockFuturesPositions: FuturesPosition[] = [
  {
    id: 'pos1',
    contractId: 'ES1',
    symbol: 'ES',
    name: 'E-mini S&P 500 Futures',
    positionType: 'LONG',
    quantity: 2,
    entryPrice: 4200.00,
    currentPrice: 4250.00,
    markToMarket: 425000.00,
    unrealizedPnL: 5000.00,
    marginUsed: 21000.00,
    marginRequirement: 0.05,
    leverage: 20.0,
    entryDate: '2023-12-01',
    expirationDate: '2024-03-15',
    tickSize: 0.25,
    tickValue: 12.50
  },
  {
    id: 'pos2',
    contractId: 'GC1',
    symbol: 'GC',
    name: 'Gold Futures',
    positionType: 'LONG',
    quantity: 1,
    entryPrice: 1950.00,
    currentPrice: 1920.00,
    markToMarket: 192000.00,
    unrealizedPnL: -3000.00,
    marginUsed: 15600.00,
    marginRequirement: 0.08,
    leverage: 12.5,
    entryDate: '2023-11-15',
    expirationDate: '2024-02-28',
    tickSize: 0.10,
    tickValue: 10.00
  }
];

// --- MOCK DATA CREATOR --- //
export const createMockHistoricalReturns = (days: number, mean: number, stdDev: number): number[] => {
// simple random walk style returns
const returns: number[] = [];
for (let i = 0; i < days; i++) {
const rand = (Math.random() - 0.5) * 2; // uniform [-1, 1]
const r = mean / days + stdDev * rand / Math.sqrt(days);
returns.push(r);
}
return returns;
};

export const getRandomRate = (baseRate: number): number => {
  // random change between -2% and +2%
  const changePercent = (Math.random() * 0.04 - 0.02);
  return +(baseRate * (1 + changePercent)).toFixed(5);
};