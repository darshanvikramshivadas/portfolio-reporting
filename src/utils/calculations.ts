import { Security, CashBalance, RiskMetrics, FuturesPosition, FuturesContract } from '@/types/portfolio';

/**
 * Calculate Mark-to-Market (MTM) values for a list of securities
 * This function updates current prices, values, and calculates unrealized gains/losses
 * 
 * @param securities - Array of security objects to calculate MTM for
 * @param closingPrices - Record of symbol to current market price mappings
 * @returns Updated securities array with current MTM calculations
 */
export const calculateMTM = (securities: Security[], closingPrices: Record<string, number>): Security[] => {
  return securities.map(security => {
    // Get current market price, fallback to stored price if not available
    const currentPrice = closingPrices[security.symbol] || security.currentPrice;
    
    // Variables to store calculated values
    let currentValue: number;
    let gainLoss: number;
    let gainLossPercent: number;

    if (security.type === 'FUTURES') {
      // For futures contracts, calculate based on contract size and position type
      const contractValue = security.contractSize! * currentPrice;
      
      if (security.positionType === 'SHORT') {
        // Short position: profit when price goes down
        currentValue = security.quantity * contractValue;
        gainLoss = (security.buyPrice - currentPrice) * security.quantity * security.contractSize!;
      } else {
        // Long position: profit when price goes up
        currentValue = security.quantity * contractValue;
        gainLoss = (currentPrice - security.buyPrice) * security.quantity * security.contractSize!;
      }
    } else {
      // For regular securities (stocks, bonds, ETFs)
      currentValue = security.quantity * currentPrice;
      gainLoss = currentValue - security.buyValue;
    }

    // Calculate percentage gain/loss relative to original investment
    gainLossPercent = (gainLoss / security.buyValue) * 100;

    // Return updated security with new MTM calculations
    return {
      ...security,
      currentPrice,
      currentValue,
      gainLoss,
      gainLossPercent
    };
  });
};

/**
 * Calculate comprehensive portfolio summary metrics
 * Aggregates values across all securities, cash, and futures positions
 * 
 * @param securities - Array of all portfolio securities
 * @param cashBalances - Array of cash balances in different currencies
 * @param lastUpdated - Optional timestamp to preserve existing lastUpdated value
 * @returns Portfolio summary with total values, gains/losses, and margin metrics
 */
export const calculatePortfolioSummary = (securities: Security[], cashBalances: CashBalance[], lastUpdated?: string) => {
  // Calculate total value of non-futures securities (stocks, bonds, ETFs)
  const securitiesValue = securities
    .filter(s => s.type !== 'FUTURES')
    .reduce((sum, security) => sum + security.currentValue, 0);
  
  // Calculate total value of futures positions
  const futuresValue = securities
    .filter(s => s.type === 'FUTURES')
    .reduce((sum, security) => sum + security.currentValue, 0);
  
  // Sum up all cash balances converted to USD equivalent
  const cashValue = cashBalances.reduce((sum, balance) => sum + balance.usdEquivalent, 0);
  
  // Total portfolio value across all asset classes
  const totalValue = securitiesValue + futuresValue + cashValue;
  
  // Calculate total unrealized gains/losses across all positions
  const totalGainLoss = securities.reduce((sum, security) => sum + security.gainLoss, 0);
  
  // Calculate percentage gain/loss relative to total portfolio value
  const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

  // Calculate margin utilization metrics for futures trading
  const totalMarginUsed = securities
    .filter(s => s.type === 'FUTURES')
    .reduce((sum, security) => sum + (security.marginUsed || 0), 0);
  
  // Available margin is cash minus used margin
  const availableMargin = cashValue - totalMarginUsed;
  
  // Percentage of cash being used for margin
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
    unrealizedPnL: totalGainLoss, // Alias for totalGainLoss
    lastUpdated: lastUpdated || new Date().toISOString()
  };
};

/**
 * Calculate portfolio risk metrics and performance indicators
 * Uses mock data for demonstration - in production would use historical data
 * 
 * @param securities - Array of portfolio securities
 * @returns Risk metrics including beta, Sharpe ratio, volatility, and futures exposure
 */
export const calculateRiskMetrics = (securities: Security[]): RiskMetrics => {
  // Calculate total portfolio value for weighting calculations
  const totalValue = securities.reduce((sum, security) => sum + security.currentValue, 0);
  
  // Mock beta values for different securities (in production, these would come from market data)
  // Beta measures volatility relative to market (1.0 = market average, >1 = more volatile, <1 = less volatile)
  const mockBetas: Record<string, number> = {
    'AAPL': 1.2,    // Technology stocks typically more volatile
    'MSFT': 1.1,    // Large cap tech, slightly less volatile than AAPL
    'VOO': 1.0,     // S&P 500 ETF, market beta by definition
    'TSLA': 1.8,    // High growth stock, very volatile
    'JPM': 0.9,     // Financial sector, typically less volatile than tech
    'ES': 1.0,      // S&P 500 futures, market beta
    'GC': 0.0       // Gold futures, uncorrelated with market
  };
  
  // Calculate portfolio beta as weighted average of individual security betas
  const portfolioBeta = securities.reduce((sum, security) => {
    const weight = security.currentValue / totalValue;
    return sum + (mockBetas[security.symbol] || 1.0) * weight;
  }, 0);

  // Mock risk metrics for demonstration purposes
  const volatility = 0.18;        // 18% annual volatility (standard deviation)
  const riskFreeRate = 0.05;      // 5% risk-free rate (e.g., Treasury bonds)
  const portfolioReturn = 0.12;   // 12% portfolio return
  
  // Sharpe ratio: risk-adjusted return measure (higher is better)
  const sharpeRatio = (portfolioReturn - riskFreeRate) / volatility;
  
  // Maximum historical drawdown (worst peak-to-trough decline)
  const maxDrawdown = -0.08; // 8% maximum drawdown

  // Calculate futures-specific risk metrics
  const futuresSecurities = securities.filter(s => s.type === 'FUTURES');
  const futuresValue = futuresSecurities.reduce((sum, s) => sum + s.currentValue, 0);
  const totalMarginUsed = futuresSecurities.reduce((sum, s) => sum + (s.marginUsed || 0), 0);
  
  // Margin utilization as percentage of total portfolio value
  const marginUtilization = totalValue > 0 ? totalMarginUsed / totalValue : 0;
  
  // Leverage ratio: total exposure / net capital
  const leverageRatio = totalValue > 0 ? totalValue / (totalValue - totalMarginUsed) : 1;
  
  // Futures exposure as percentage of total portfolio
  const futuresExposure = totalValue > 0 ? futuresValue / totalValue : 0;

  return {
    delta: 0.85, // Mock delta for options (if any) - measures price sensitivity
    beta: portfolioBeta,
    sharpeRatio,
    volatility,
    maxDrawdown,
    marginUtilization,
    leverageRatio,
    futuresExposure
  };
};

/**
 * Calculate P&L for futures positions
 * Handles both long and short positions with proper sign conventions
 * 
 * @param position - Futures position object
 * @param currentPrice - Current market price for the futures contract
 * @returns Unrealized profit/loss in currency units
 */
export const calculateFuturesPnL = (position: FuturesPosition, currentPrice: number): number => {
  if (position.positionType === 'LONG') {
    // Long position: profit when price goes up
    return (currentPrice - position.entryPrice) * position.quantity * position.tickValue / position.tickSize;
  } else {
    // Short position: profit when price goes down
    return (position.entryPrice - currentPrice) * position.quantity * position.tickValue / position.tickSize;
  }
};

/**
 * Calculate margin requirement for futures contracts
 * Margin is the collateral required to hold a futures position
 * 
 * @param contract - Futures contract specifications
 * @param quantity - Number of contracts
 * @param price - Current contract price
 * @returns Required margin amount in currency units
 */
export const calculateMarginRequirement = (contract: FuturesContract, quantity: number, price: number): number => {
  const contractValue = contract.contractSize * price * quantity;
  return contractValue * contract.marginRequirement;
};

/**
 * Calculate leverage ratio for futures positions
 * Leverage = total exposure / margin used
 * 
 * @param contractValue - Total value of futures contracts
 * @param marginUsed - Margin amount actually used
 * @returns Leverage ratio (1.0 = no leverage, higher = more leveraged)
 */
export const calculateLeverage = (contractValue: number, marginUsed: number): number => {
  return marginUsed > 0 ? contractValue / marginUsed : 0;
};

/**
 * Format currency amounts with proper locale and decimal places
 * Uses US locale for consistent formatting across server/client
 * 
 * @param amount - Numeric amount to format
 * @param currency - Currency code (defaults to USD)
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format dates with consistent locale and format
 * Ensures server/client rendering consistency to prevent hydration errors
 * 
 * @param date - Date string or Date object to format
 * @param options - Optional Intl.DateTimeFormat options to override defaults
 * @returns Formatted date string (e.g., "1/20/2025, 7:41:50 PM")
 */
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Default formatting options for consistent display
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  };
  
  // Use en-US locale to ensure consistent formatting between server and client
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
};

/**
 * Format numbers with consistent locale and decimal places
 * Ensures server/client rendering consistency for numeric values
 * 
 * @param value - Numeric value to format
 * @param options - Optional Intl.NumberFormat options to override defaults
 * @returns Formatted number string (e.g., "1,234")
 */
export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
  const defaultOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  };
  
  // Use en-US locale for consistent formatting
  return new Intl.NumberFormat('en-US', { ...defaultOptions, ...options }).format(value);
};

/**
 * Format percentage values with proper sign and decimal places
 * Adds + sign for positive values, no sign for negative
 * 
 * @param value - Percentage value (e.g., 5.25 for 5.25%)
 * @returns Formatted percentage string (e.g., "+5.25%", "-2.10%")
 */
export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

/**
 * Calculate holding period in days for a security
 * Measures time since purchase date
 * 
 * @param buyDate - Purchase date string in ISO format
 * @returns Number of days since purchase
 */
export const calculateHoldingPeriod = (buyDate: string): number => {
  const buy = new Date(buyDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - buy.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get CSS color classes for different security types
 * Provides consistent visual styling across the application
 * 
 * @param type - Security type (STOCK, BOND, ETF, etc.)
 * @returns Tailwind CSS color classes for background and text
 */
export const getSecurityTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'STOCK': 'bg-blue-900 text-blue-300',           // Blue for individual stocks
    'BOND': 'bg-green-900 text-green-300',          // Green for bonds (fixed income)
    'ETF': 'bg-purple-900 text-purple-300',         // Purple for ETFs
    'MUTUAL_FUND': 'bg-orange-900 text-orange-300', // Orange for mutual funds
    'OPTION': 'bg-red-900 text-red-300',            // Red for options (higher risk)
    'FUTURES': 'bg-indigo-900 text-indigo-300'      // Indigo for futures
  };
  return colors[type] || 'bg-gray-700 text-gray-300'; // Default gray for unknown types
};

/**
 * Get CSS color classes for gain/loss values
 * Green for positive, red for negative, gray for neutral
 * 
 * @param value - Numeric value (positive, negative, or zero)
 * @returns Tailwind CSS color class for text
 */
export const getGainLossColor = (value: number): string => {
  if (value > 0) return 'text-green-400';  // Green for gains
  if (value < 0) return 'text-red-400';    // Red for losses
  return 'text-gray-400';                   // Gray for neutral/zero
};

/**
 * Get CSS color classes for futures position types
 * Green for long positions, red for short positions
 * 
 * @param type - Position type (LONG or SHORT)
 * @returns Tailwind CSS color classes for background and text
 */
export const getPositionTypeColor = (type: string): string => {
  if (type === 'LONG') return 'bg-green-900 text-green-300';  // Green for long (bullish)
  if (type === 'SHORT') return 'bg-red-900 text-red-300';     // Red for short (bearish)
  return 'bg-gray-700 text-gray-300';                          // Default gray
};

/**
 * Format contract sizes for display
 * Converts large numbers to K (thousands) format for readability
 * 
 * @param size - Contract size number
 * @returns Formatted string (e.g., "50K" for 50000)
 */
export const formatContractSize = (size: number): string => {
  if (size >= 1000) return `${(size / 1000).toFixed(0)}K`;
  return size.toString();
};

/**
 * Format tick values for futures contracts
 * Tick value represents the dollar value of one price tick movement
 * 
 * @param tickValue - Tick value in currency units
 * @returns Formatted currency string
 */
export const formatTickValue = (tickValue: number): string => {
  return formatCurrency(tickValue);
};
