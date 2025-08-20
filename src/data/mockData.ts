import { Security, Trade, CashBalance, RiskMetrics, Benchmark, PortfolioSummary } from '@/types/portfolio';

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
  maxDrawdown: -0.08
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
  lastUpdated: new Date().toISOString()
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
  JPM: 155.00
};
