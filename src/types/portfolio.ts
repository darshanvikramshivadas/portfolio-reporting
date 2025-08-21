/**
 * Portfolio Management System Type Definitions
 * 
 * This file defines the core data structures for the wealth management portfolio system.
 * It includes interfaces for securities, trades, cash balances, risk metrics, and futures trading.
 */

/**
 * Security represents a financial instrument held in the portfolio
 * Can be stocks, bonds, ETFs, mutual funds, options, or futures contracts
 * 
 * @property id - Unique identifier for the security
 * @property name - Full company/fund name
 * @property type - Category of financial instrument
 * @property symbol - Trading symbol (e.g., AAPL, MSFT)
 * @property quantity - Number of shares/contracts owned
 * @property buyPrice - Price per share/contract when purchased
 * @property buyValue - Total value at purchase (quantity × buyPrice)
 * @property currentPrice - Current market price per share/contract
 * @property currentValue - Current total value (quantity × currentPrice)
 * @property gainLoss - Unrealized profit/loss in currency units
 * @property gainLossPercent - Unrealized profit/loss as percentage
 * @property buyDate - Date when security was purchased (ISO string)
 * @property holdingPeriod - Number of days since purchase
 * @property sector - Industry sector (e.g., Technology, Financial)
 * @property country - Country of origin (e.g., US, UK)
 * 
 * Futures-specific properties (only for FUTURES type):
 * @property contractSize - Number of underlying units per contract
 * @property marginRequirement - Required margin as percentage of contract value
 * @property marginUsed - Actual margin amount used
 * @property positionType - LONG (bullish) or SHORT (bearish) position
 * @property expirationDate - Contract expiration date
 * @property tickSize - Minimum price movement increment
 * @property tickValue - Dollar value of one tick movement
 */
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

/**
 * Trade represents a buy/sell transaction or futures position entry/exit
 * Records the execution details for audit trail and performance analysis
 * 
 * @property id - Unique trade identifier
 * @property securityId - Reference to the security being traded
 * @property securityName - Name of the security for display purposes
 * @property type - Trade type (BUY/SELL for securities, LONG_FUTURES/SHORT_FUTURES for futures)
 * @property quantity - Number of shares/contracts traded
 * @property price - Execution price per share/contract
 * @property value - Total trade value (quantity × price)
 * @property date - Trade execution date (ISO string)
 * @property commission - Trading fees and commissions
 * @property notes - Optional trade notes or strategy description
 * 
 * Futures-specific properties (only for futures trades):
 * @property contractSize - Number of underlying units per futures contract
 * @property marginRequirement - Required margin percentage for the contract
 * @property marginUsed - Actual margin amount used for the position
 * @property positionType - LONG (bullish) or SHORT (bearish) position
 * @property expirationDate - Futures contract expiration date
 * @property tickSize - Minimum price movement increment for the contract
 * @property tickValue - Dollar value of one tick movement
 */
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

/**
 * CashBalance represents holdings in different currencies
 * Used for multi-currency portfolio management and margin calculations
 * 
 * @property currency - Three-letter currency code (e.g., USD, EUR, GBP)
 * @property amount - Cash amount in the original currency
 * @property usdEquivalent - Converted value in US dollars
 * @property exchangeRate - Exchange rate from original currency to USD
 */
export interface CashBalance {
  currency: string;
  amount: number;
  usdEquivalent: number;
  exchangeRate: number;
}

/**
 * RiskMetrics provides portfolio risk and performance indicators
 * Used for risk management, client reporting, and regulatory compliance
 * 
 * @property delta - Options price sensitivity (1.0 = 1:1 with underlying)
 * @property beta - Portfolio volatility relative to market (1.0 = market average)
 * @property sharpeRatio - Risk-adjusted return measure (higher is better)
 * @property volatility - Annualized standard deviation of returns
 * @property maxDrawdown - Worst historical peak-to-trough decline
 * 
 * Futures-specific risk metrics:
 * @property marginUtilization - Percentage of portfolio value used for margin
 * @property leverageRatio - Total exposure / net capital ratio
 * @property futuresExposure - Percentage of portfolio in futures contracts
 */
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

/**
 * Benchmark represents market indices for performance comparison
 * Used to evaluate portfolio performance against market standards
 * 
 * @property name - Full name of the benchmark index
 * @property symbol - Trading symbol for the benchmark
 * @property performance - Historical performance across different time periods
 *   - 1M: One month return percentage
 *   - 3M: Three month return percentage
 *   - 6M: Six month return percentage
 *   - 1Y: One year return percentage
 *   - YTD: Year-to-date return percentage
 */
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

/**
 * PortfolioSummary provides aggregated portfolio overview metrics
 * Used for dashboard displays, client reporting, and portfolio analysis
 * 
 * @property totalValue - Combined value of all assets (securities + futures + cash)
 * @property totalGainLoss - Total unrealized profit/loss across all positions
 * @property totalGainLossPercent - Total return as percentage of invested capital
 * @property cashValue - Total cash value across all currencies (USD equivalent)
 * @property securitiesValue - Total value of non-futures securities
 * @property lastUpdated - Timestamp of last portfolio calculation
 * 
 * Futures-specific summary metrics:
 * @property futuresValue - Total value of all futures positions
 * @property totalMarginUsed - Total margin amount used for futures trading
 * @property availableMargin - Remaining cash available for additional margin
 * @property marginUtilizationPercent - Percentage of cash used for margin
 * @property unrealizedPnL - Total unrealized profit/loss on futures positions
 */
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

/**
 * FuturesContract defines the specifications for futures trading instruments
 * Contains contract details needed for margin calculations and position sizing
 * 
 * @property id - Unique contract identifier
 * @property symbol - Trading symbol (e.g., ES for E-mini S&P 500)
 * @property name - Full contract description
 * @property contractSize - Number of underlying units per contract
 * @property tickSize - Minimum price movement increment
 * @property tickValue - Dollar value of one tick movement
 * @property marginRequirement - Required margin as percentage of contract value
 * @property expirationDate - Contract expiration date
 * @property currentPrice - Current market price
 * @property lastPrice - Previous closing price
 * @property change - Price change from last close
 * @property changePercent - Percentage price change
 * @property volume - Trading volume (number of contracts)
 * @property openInterest - Number of outstanding contracts
 */
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

/**
 * FuturesPosition represents an active futures trading position
 * Tracks position details, performance, and margin utilization
 * 
 * @property id - Unique position identifier
 * @property contractId - Reference to the futures contract
 * @property symbol - Trading symbol for display purposes
 * @property name - Contract name for display purposes
 * @property positionType - LONG (bullish) or SHORT (bearish) position
 * @property quantity - Number of contracts in the position
 * @property entryPrice - Average entry price for the position
 * @property currentPrice - Current market price for the contract
 * @property markToMarket - Current market value of the position
 * @property unrealizedPnL - Unrealized profit/loss on the position
 * @property marginUsed - Margin amount allocated to this position
 * @property marginRequirement - Required margin for this position
 * @property leverage - Position leverage ratio (exposure / margin)
 * @property entryDate - Date when position was opened
 * @property expirationDate - Contract expiration date
 * @property tickSize - Minimum price movement increment
 * @property tickValue - Dollar value of one tick movement
 */
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
