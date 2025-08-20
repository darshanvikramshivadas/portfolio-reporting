import { Security, CashBalance, RiskMetrics } from '@/types/portfolio';

export const calculateMTM = (securities: Security[], closingPrices: Record<string, number>): Security[] => {
  return securities.map(security => {
    const currentPrice = closingPrices[security.symbol] || security.currentPrice;
    const currentValue = security.quantity * currentPrice;
    const gainLoss = currentValue - security.buyValue;
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

export const calculatePortfolioSummary = (securities: Security[], cashBalances: CashBalance[]) => {
  const securitiesValue = securities.reduce((sum, security) => sum + security.currentValue, 0);
  const cashValue = cashBalances.reduce((sum, balance) => sum + balance.usdEquivalent, 0);
  const totalValue = securitiesValue + cashValue;
  
  const totalGainLoss = securities.reduce((sum, security) => sum + security.gainLoss, 0);
  const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

  return {
    totalValue,
    totalGainLoss,
    totalGainLossPercent,
    cashValue,
    securitiesValue,
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
    'JPM': 0.9
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

  return {
    delta: 0.85, // Mock delta for options (if any)
    beta: portfolioBeta,
    sharpeRatio,
    volatility,
    maxDrawdown
  };
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
    'OPTION': 'bg-red-900 text-red-300'
  };
  return colors[type] || 'bg-gray-700 text-gray-300';
};

export const getGainLossColor = (value: number): string => {
  if (value > 0) return 'text-green-400';
  if (value < 0) return 'text-red-400';
  return 'text-gray-400';
};
