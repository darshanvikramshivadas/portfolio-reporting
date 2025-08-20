import { Security, CashBalance, RiskMetrics, FuturesPosition, FuturesContract } from '@/types/portfolio';

export const calculateMTM = (securities: Security[], closingPrices: Record<string, number>): Security[] => {
  return securities.map(security => {
    const currentPrice = closingPrices[security.symbol] || security.currentPrice;
    let currentValue: number;
    let gainLoss: number;
    let gainLossPercent: number;

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

    gainLossPercent = (gainLoss / security.buyValue) * 100;

    return {
      ...security,
      currentPrice,
      currentValue,
      gainLoss,
      gainLossPercent
    };
  });
};

export const calculatePortfolioSummary = (securities: Security[], cashBalances: CashBalance[]) => {
  const securitiesValue = securities
    .filter(s => s.type !== 'FUTURES')
    .reduce((sum, security) => sum + security.currentValue, 0);
  
  const futuresValue = securities
    .filter(s => s.type === 'FUTURES')
    .reduce((sum, security) => sum + security.currentValue, 0);
  
  const cashValue = cashBalances.reduce((sum, balance) => sum + balance.usdEquivalent, 0);
  const totalValue = securitiesValue + futuresValue + cashValue;
  
  const totalGainLoss = securities.reduce((sum, security) => sum + security.gainLoss, 0);
  const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

  // Calculate margin metrics
  const totalMarginUsed = securities
    .filter(s => s.type === 'FUTURES')
    .reduce((sum, security) => sum + (security.marginUsed || 0), 0);
  
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
    lastUpdated: new Date().toISOString()
  };
};

export const calculateRiskMetrics = (securities: Security[]): RiskMetrics => {
  // Mock risk calculations - in production these would be calculated from historical data
  const totalValue = securities.reduce((sum, security) => sum + security.currentValue, 0);
  
  // Calculate portfolio beta (weighted average of individual betas)
  const mockBetas: Record<string, number> = {
    'AAPL': 1.2,
    'MSFT': 1.1,
    'VOO': 1.0,
    'TSLA': 1.8,
    'JPM': 0.9,
    'ES': 1.0,  // S&P 500 futures
    'GC': 0.0   // Gold futures (uncorrelated)
  };
  
  const portfolioBeta = securities.reduce((sum, security) => {
    const weight = security.currentValue / totalValue;
    return sum + (mockBetas[security.symbol] || 1.0) * weight;
  }, 0);

  // Mock other risk metrics
  const volatility = 0.18; // 18% annual volatility
  const riskFreeRate = 0.05; // 5% risk-free rate
  const portfolioReturn = 0.12; // 12% portfolio return
  
  const sharpeRatio = (portfolioReturn - riskFreeRate) / volatility;
  const maxDrawdown = -0.08; // 8% maximum drawdown

  // Calculate futures-specific metrics
  const futuresSecurities = securities.filter(s => s.type === 'FUTURES');
  const futuresValue = futuresSecurities.reduce((sum, s) => sum + s.currentValue, 0);
  const totalMarginUsed = futuresSecurities.reduce((sum, s) => sum + (s.marginUsed || 0), 0);
  
  const marginUtilization = totalValue > 0 ? totalMarginUsed / totalValue : 0;
  const leverageRatio = totalValue > 0 ? totalValue / (totalValue - totalMarginUsed) : 1;
  const futuresExposure = totalValue > 0 ? futuresValue / totalValue : 0;

  return {
    delta: 0.85, // Mock delta for options (if any)
    beta: portfolioBeta,
    sharpeRatio,
    volatility,
    maxDrawdown,
    marginUtilization,
    leverageRatio,
    futuresExposure
  };
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
