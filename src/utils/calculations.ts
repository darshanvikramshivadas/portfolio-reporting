import { Security, CashBalance, RiskMetrics, FuturesPosition, FuturesContract } from '@/types/portfolio';
import { createMockHistoricalReturns, getRandomRate } from '@/data/mockData';
export const calculateMTM = (securities: Security[], closingPrices: Record<string, number>): Security[] => {
  return securities.map(security => {
    const currentPrice = closingPrices[security.symbol] || security.currentPrice;
    let currentValue: number;
    let gainLoss: number;
   

    if (security.type === 'FUTURES') {
      // For futures, calculate based on contract size and position type
      const contractValue = security.contractSize! * currentPrice;
      if (security.positionType === 'SHORT') {
        currentValue = security.quantity * contractValue;
        gainLoss = (security.buyPrice - currentPrice) * security.quantity * security.contractSize!;
      } else {
        currentValue = security.quantity * contractValue;
        gainLoss = (currentPrice - security.buyPrice) * security.quantity * security.contractSize!;
      }
    } else {
      // For regular securities
      currentValue = security.quantity * currentPrice;
      gainLoss = currentValue - security.buyValue;
    }

    const gainLossPercent = (gainLoss / security.buyValue) * 100;

    return {
      ...security,
      currentPrice,
      currentValue,
      gainLoss,
      gainLossPercent
    };
  });
};

export const calculatePortfolioSummary = (securities: Security[], futuresContracts: FuturesContract[], cashBalances: CashBalance[], lastUpdated?: string) => {
  const securitiesValue = securities
    .filter(s => s.type !== 'FUTURES')
    .reduce((sum, security) => sum + security.currentValue, 0);
  
  const futuresValue = futuresContracts
    .reduce((sum, security) => sum + (security.lastPrice*security.contractSize), 0);
  
  const cashValue = cashBalances.reduce((sum, balance) => sum + balance.usdEquivalent, 0);
  const totalValue = securitiesValue + futuresValue + cashValue;
  
  const totalGainLoss = securities.reduce((sum, security) => sum + security.gainLoss, 0);
  const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

  // Calculate margin metrics
  const totalMarginUsed = futuresContracts
    .reduce((sum, security) => sum + (security.currentPrice*security.contractSize* security.marginRequirement || 0), 0);
  
  const availableMargin = cashValue - totalMarginUsed;
  const marginUtilizationPercent = cashValue > 0 ? (totalMarginUsed / cashValue) * 100 : 0;

  return {
    totalValue,
    totalGainLoss,
    totalGainLossPercent,
    cashValue,
    securitiesValue,
    futuresValue,
    totalMarginUsed,
    availableMargin,
    marginUtilizationPercent,
    unrealizedPnL: totalGainLoss,
    lastUpdated: lastUpdated || new Date().toISOString()
  };
};


export const updateSecurities = (securities: Security[]): Security[] => {
  return securities.map((security) => {
    // random factor between -0.1 and +0.1
    const randomFactor = 1 + (Math.random() * 0.2 - 0.1);

    // new current price
    const newPrice = +(security.buyPrice * randomFactor).toFixed(2);

    // new current value
    const newValue = +(newPrice * security.quantity).toFixed(2);

    // calculate gain/loss
    const gainLoss = +(newValue - security.buyValue).toFixed(2);
    const gainLossPercent = +((gainLoss / security.buyValue) * 100).toFixed(2);

    return {
      ...security,
      currentPrice: newPrice,
      currentValue: newValue,
      gainLoss,
      gainLossPercent,
    };
  });
};

export const calculateRiskMetrics = (securities: Security[]): RiskMetrics => {
    const mockBetas: Record<string, number> = {
    'AAPL': 1.2,
    'MSFT': 1.1,
    'VOO': 1.0,
    'TSLA': 1.8,
    'JPM': 0.9,
    'ES': 1.0,
    'GC': 0.0
    };

    const totalValue = securities.reduce((sum, s) => sum + s.currentValue, 0);
    if (totalValue === 0) throw new Error("Portfolio has zero value");

    securities.forEach(s => {
      if (!s.historicalReturns) {
        // assign mean return ~8% annually, vol ~20%
        const mean = 0.08;
        const vol = 0.20;
        s.historicalReturns = createMockHistoricalReturns(s.holdingPeriod, mean, vol);
      }
    });


    // Weighted portfolio returns
    const weights = securities.map(s => s.currentValue / totalValue);
    const n = 365;

    // find minimum available history length across securities
    const minLength = Math.min(
      ...securities.map(s => s.historicalReturns?.length || 0)
    );

    const portfolioReturns = Array.from({ length: Math.min(n, minLength) }, (_, i) =>
      securities.reduce((acc, s, j) => {
        const r = s.historicalReturns?.[i] ?? 0; // default 0 if missing
        return acc + r * weights[j];
      }, 0)
    );

    // Volatility (std dev)
    const meanReturn = portfolioReturns.reduce((a, b) => a + b, 0) / n;
    const variance = portfolioReturns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / n;
    const volatility = Math.sqrt(variance * 365); // annualized

    // Sharpe ratio
    const riskFreeRate = 0.05;
    const annualReturn = meanReturn * 252;
    const sharpeRatio = (annualReturn - riskFreeRate) / volatility;


    // Max drawdown (cumulative product of returns)
    let peak = 1;
    let maxDD = 0;
    let value = 1;
    for (const r of portfolioReturns) {
    value *= (1 + r);
    peak = Math.max(peak, value);
    maxDD = Math.min(maxDD, (value - peak) / peak);
    }


    // Portfolio beta (weighted average)
    const portfolioBeta = securities.reduce((sum, s) => {
    const w = s.currentValue / totalValue;
    return sum + (mockBetas[s.symbol] ?? 1.0) * w;
    }, 0);


    // Futures-specific metrics
    const futures = securities.filter(s => s.type === 'FUTURES');
    const futuresValue = futures.reduce((sum, s) => sum + s.currentValue, 0);
    const marginUsed = futures.reduce((sum, s) => sum + (s.marginUsed || 0), 0);


    const marginUtilization = marginUsed / totalValue;
    const leverageRatio = totalValue / (totalValue - marginUsed);
    const futuresExposure = futuresValue / totalValue;


    return {
    delta: 0.85, // placeholder for option greeks
    beta: portfolioBeta,
    sharpeRatio,
    volatility,
    maxDrawdown: maxDD,
    marginUtilization,
    leverageRatio,
    futuresExposure
    };
};


export const updateExchangeRates = (balances: CashBalance[]): CashBalance[] => {
  return balances.map(b => {
    const fluctuation = 1 + (Math.random() - 0.5) * 0.02; // ±1%
    const newRate = b.exchangeRate * fluctuation;
    return {
      ...b,
      exchangeRate: newRate,
      usdEquivalent: b.amount * newRate
    };
  });
};

export const calculateFuturesPnL = (position: FuturesPosition, currentPrice: number): number => {
  if (position.positionType === 'LONG') {
    return (currentPrice - position.entryPrice) * position.quantity * position.tickValue / position.tickSize;
  } else {
    return (position.entryPrice - currentPrice) * position.quantity * position.tickValue / position.tickSize;
  }
};

export const calculateMarginRequirement = (contract: FuturesContract, quantity: number, price: number): number => {
  const contractValue = contract.contractSize * price * quantity;
  return contractValue * contract.marginRequirement;
};

export const calculateLeverage = (contractValue: number, marginUsed: number): number => {
  return marginUsed > 0 ? contractValue / marginUsed : 0;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  };
  
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
};

export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
  const defaultOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  };
  
  return new Intl.NumberFormat('en-US', { ...defaultOptions, ...options }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const calculateHoldingPeriod = (buyDate: string): number => {
  const buy = new Date(buyDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - buy.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getSecurityTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'STOCK': 'bg-blue-900 text-blue-300',
    'BOND': 'bg-green-900 text-green-300',
    'ETF': 'bg-purple-900 text-purple-300',
    'MUTUAL_FUND': 'bg-orange-900 text-orange-300',
    'OPTION': 'bg-red-900 text-red-300',
    'FUTURES': 'bg-indigo-900 text-indigo-300'
  };
  return colors[type] || 'bg-gray-700 text-gray-300';
};

export const getGainLossColor = (value: number): string => {
  if (value > 0) return 'text-green-400';
  if (value < 0) return 'text-red-400';
  return 'text-gray-400';
};

export const getPositionTypeColor = (type: string): string => {
  if (type === 'LONG') return 'bg-green-900 text-green-300';
  if (type === 'SHORT') return 'bg-red-900 text-red-300';
  return 'bg-gray-700 text-gray-300';
};

export const formatContractSize = (size: number): string => {
  if (size >= 1000) return `${(size / 1000).toFixed(0)}K`;
  return size.toString();
};

export const formatTickValue = (tickValue: number): string => {
  return formatCurrency(tickValue);
};
