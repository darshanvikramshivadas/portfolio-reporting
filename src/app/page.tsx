'use client';

import { useState, useEffect } from 'react';
import { 
  mockSecurities, 
  mockTrades, 
  mockCashBalances, 
  mockRiskMetrics, 
  mockBenchmarks, 
  mockPortfolioSummary,
  mockClosingPrices,
  mockFuturesContracts,
  mockFuturesPositions
} from '@/data/mockData';
import { 
  updateExchangeRates,
  calculateMTM,
  updateSecurities, 
  calculatePortfolioSummary, 
  calculateRiskMetrics,
  formatCurrency, 
  formatDate,
  formatNumber,
  formatPercentage, 
  getSecurityTypeColor, 
  getGainLossColor,
  getPositionTypeColor,
  formatContractSize,
  formatTickValue
} from '@/utils/calculations';
import { Security, Trade, CashBalance, FuturesContract, FuturesPosition } from '@/types/portfolio';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  Activity,
  Plus,
  Minus,
  Calendar,
  Globe,
  Database,
  Zap,
  TrendingDown,
  Target,
  Gauge,
  AlertTriangle
} from 'lucide-react';

/**
 * Portfolio Dashboard Component
 * 
 * Main application component for the Wealth Management Portfolio System.
 * Provides a comprehensive view of portfolio performance, risk metrics, and trading capabilities.
 * 
 * Features:
 * - Real-time portfolio summary and performance metrics
 * - Securities and futures position management
 * - Trade execution and tracking
 * - Risk analysis and reporting
 * - Multi-currency cash balance tracking
 * - Futures trading with margin management
 * 
 * State Management:
 * - Portfolio data (securities, trades, cash balances)
 * - Risk metrics and performance calculations
 * - Form states for trade execution
 * - UI state for modals and displays
 * 
 * Business Logic:
 * - Portfolio calculations and mark-to-market updates
 * - Trade processing and position updates
 * - Risk metric calculations
 * - Margin utilization tracking
 */
export default function PortfolioDashboard() {
  // Core portfolio data state
  const [securities, setSecurities] = useState<Security[]>(mockSecurities);
  const [trades, setTrades] = useState<Trade[]>(mockTrades);
  const [cashBalances, setCashBalances] = useState<CashBalance[]>(mockCashBalances);
  const [portfolioSummary, setPortfolioSummary] = useState(mockPortfolioSummary);
  const [riskMetrics, setRiskMetrics] = useState(mockRiskMetrics);
  const [futuresContracts] = useState<FuturesContract[]>(mockFuturesContracts);
  const [futuresPositions, setFuturesPositions] = useState<FuturesPosition[]>(mockFuturesPositions);
  
  // UI state management
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [showFuturesForm, setShowFuturesForm] = useState(false);
  const [tradeType, setTradeType] = useState<'STOCK' | 'FUTURES'>('STOCK');
  
  // New trade form state - handles both stock and futures trades
  const [newTrade, setNewTrade] = useState({
    securityName: '',
    type: 'BUY' as 'BUY' | 'SELL' | 'LONG_FUTURES' | 'SHORT_FUTURES' | 'CLOSE_LONG' | 'CLOSE_SHORT',
    quantity: 0,
    price: 0,
    date: new Date().toISOString().split('T')[0],
    commission: 0,
    notes: '',
    // Futures-specific fields
    contractSize: 0,
    marginRequirement: 0,
    marginUsed: 0,
    positionType: 'LONG' as 'LONG' | 'SHORT',
    expirationDate: '',
    tickSize: 0,
    tickValue: 0
  });

  // New futures trade form state
  const [newFuturesTrade, setNewFuturesTrade] = useState({
    instrumentType: 'Index' as 'Index' | 'Stock Futures' | 'Commodity Futures',
    symbol: '',
    positionType: 'LONG' as 'LONG' | 'SHORT',
    orderType: 'Market' as 'Market' | 'Limit' | 'Stop-Loss',
    quantity: 0,
    entryPrice: 0,
    triggerPrice: 0,
    expiryDate: '',
    dateOfEntry: new Date().toISOString().split('T')[0],
    notes: '',
    leverage: 10
  });
  
  // Selected futures contract for trade form
  const [selectedContract, setSelectedContract] = useState<FuturesContract | null>(null);
  
  // Available symbols for futures trading
  const [availableSymbols] = useState([
    'NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICIBANK', 'HINDUNILVR',
    'ITC', 'BHARTIARTL', 'AXISBANK', 'KOTAKBANK', 'ASIANPAINT', 'MARUTI', 'SUNPHARMA'
  ]);
  
  // Current market price for selected symbol
  const [currentMarketPrice, setCurrentMarketPrice] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecurities((prev) => updateSecurities(prev));
      setCashBalances((prev) => updateExchangeRates(prev));
      
      // Update futures positions with real-time prices
      setFuturesPositions((prev) => 
        prev.map(position => {
          // Simulate price updates for futures positions
          const basePrice = position.entryPrice;
          const randomVariation = (Math.random() - 0.5) * 0.01; // ±0.5% variation
          const newPrice = basePrice * (1 + randomVariation);
          const newMarkToMarket = position.quantity * newPrice;
          const newPnL = position.positionType === 'LONG' 
            ? newMarkToMarket - (position.quantity * position.entryPrice)
            : (position.quantity * position.entryPrice) - newMarkToMarket;
          
          return {
            ...position,
            currentPrice: newPrice,
            markToMarket: newMarkToMarket,
            unrealizedPnL: newPnL
          };
        })
      );
    }, 10000); // updates every 10 seconds

    return () => clearInterval(interval); // cleanup
  }, []);

  const recalculatePortfolio = () => {
     const summary = calculatePortfolioSummary(securities, futuresContracts, cashBalances, portfolioSummary.lastUpdated);
      setPortfolioSummary(summary);
      const metrics = calculateRiskMetrics(securities);
      setRiskMetrics(metrics);
  };

  // Initial portfolio calculation on component mount
  useEffect(() => {
    recalculatePortfolio();
  },[securities, cashBalances, portfolioSummary.lastUpdated]); 

  /**
   * Handle adding new trades to the portfolio
   * Supports both stock and futures trading with different logic for each
   * Updates securities state and triggers portfolio recalculation
   */
  const handleAddTrade = () => {
    // Check if all required fields are filled
    console.log(newTrade);

    if (newTrade.securityName && newTrade.quantity > 0 && newTrade.price > 0) {
      const trade: Trade = {
        id: Date.now().toString(),
        securityId: Date.now().toString(),
        securityName: newTrade.securityName,
        type: newTrade.type,
        quantity: newTrade.quantity,
        price: newTrade.price,
        value: newTrade.quantity * newTrade.price,
        date: newTrade.date,
        commission: newTrade.commission,
        notes: newTrade.notes,
        contractSize: newTrade.contractSize,
        marginRequirement: newTrade.marginRequirement,
        marginUsed: newTrade.marginUsed,
        positionType: newTrade.positionType,
        expirationDate: newTrade.expirationDate,
        tickSize: newTrade.tickSize,
        tickValue: newTrade.tickValue
      };

      setTrades([...trades, trade]);
      
      // Update securities if this is a new security
      const existingSecurityIndex = securities.findIndex(s => s.name === trade.securityName);
      if (existingSecurityIndex === -1) {
        // Add new security
        const newSecurity: Security = {
          id: trade.securityId,
          name: trade.securityName,
          type: trade.type === 'LONG_FUTURES' || trade.type === 'SHORT_FUTURES' ? 'FUTURES' : 'STOCK',
          symbol: trade.securityName.split(' ')[0], // Simple symbol generation
          quantity: trade.quantity,
          buyPrice: trade.price,
          buyValue: trade.value,
          currentPrice: trade.price,
          currentValue: trade.value,
          gainLoss: 0,
          gainLossPercent: 0,
          buyDate: trade.date,
          holdingPeriod: 0,
          sector: 'Unknown',
          country: 'US',
          ...(trade.type === 'LONG_FUTURES' || trade.type === 'SHORT_FUTURES' ? {
            contractSize: trade.contractSize,
            marginRequirement: trade.marginRequirement,
            marginUsed: trade.marginUsed,
            positionType: trade.positionType,
            expirationDate: trade.expirationDate,
            tickSize: trade.tickSize,
            tickValue: trade.tickValue
          } : {})
        };
        setSecurities([...securities, newSecurity]);
      } else {
        // Update existing security quantity
        const updatedSecurities = [...securities];
        if (trade.type === 'BUY' || trade.type === 'LONG_FUTURES') {
          updatedSecurities[existingSecurityIndex].quantity += trade.quantity;
        } else if (trade.type === 'SELL' || trade.type === 'SHORT_FUTURES') {
          updatedSecurities[existingSecurityIndex].quantity -= trade.quantity;
        }
        setSecurities(updatedSecurities);
      }
      
      // Recalculate portfolio after updating securities
      setTimeout(() => recalculatePortfolio(), 0);
      
      // Reset form
      setNewTrade({
        securityName: '',
        type: 'BUY',
        quantity: 0,
        price: 0,
        date: new Date().toISOString().split('T')[0],
        commission: 0,
        notes: '',
        contractSize: 0,
        marginRequirement: 0,
        marginUsed: 0,
        positionType: 'LONG',
        expirationDate: '',
        tickSize: 0,
        tickValue: 0
      });
      setShowTradeForm(false);
      setShowFuturesForm(false);
    }
  };

  const handleSell = (id: string) => {
    setSecurities(prev => prev.filter(sec => sec.id !== id));
  };

  const handleContractSelect = (contract: FuturesContract) => {
    setSelectedContract(contract);
    setNewTrade({
      ...newTrade,
      securityName: contract.name,
      contractSize: contract.contractSize,
      marginRequirement: contract.marginRequirement,
      expirationDate: contract.expirationDate,
      tickSize: contract.tickSize,
      tickValue: contract.tickValue,
      price: contract.currentPrice
    });
  };

  // Handle futures trade execution
  const handleFuturesTrade = () => {
    if (newFuturesTrade.symbol && newFuturesTrade.quantity > 0) {
      const executionPrice = newFuturesTrade.orderType === 'Market' ? currentMarketPrice : newFuturesTrade.entryPrice;
      const contractValue = newFuturesTrade.quantity * executionPrice;
      const initialMargin = contractValue / newFuturesTrade.leverage; // Margin = Contract Value / Leverage
      
      // Check if user has enough cash for margin
      if (portfolioSummary.cashValue < initialMargin) {
        alert('Insufficient cash for margin requirement');
        return;
      }

      // Create a new futures trade
      const trade: Trade = {
        id: Date.now().toString(),
        securityId: Date.now().toString(),
        securityName: `${newFuturesTrade.instrumentType} - ${newFuturesTrade.symbol}`,
        type: newFuturesTrade.positionType === 'LONG' ? 'LONG_FUTURES' : 'SHORT_FUTURES',
        quantity: newFuturesTrade.quantity,
        price: executionPrice,
        value: contractValue,
        date: newFuturesTrade.dateOfEntry,
        commission: 0,
        notes: newFuturesTrade.notes,
        contractSize: 0,
        marginRequirement: initialMargin,
        marginUsed: initialMargin,
        positionType: newFuturesTrade.positionType,
        expirationDate: newFuturesTrade.expiryDate,
        tickSize: 0,
        tickValue: 0
      };

      setTrades([...trades, trade]);
      
      // Add to futures positions for Open Futures display
      const newFuturesPosition: FuturesPosition = {
        id: Date.now().toString(),
        contractId: Date.now().toString(),
        name: `${newFuturesTrade.instrumentType} - ${newFuturesTrade.symbol}`,
        symbol: newFuturesTrade.symbol,
        positionType: newFuturesTrade.positionType,
        quantity: newFuturesTrade.quantity,
        entryPrice: executionPrice,
        currentPrice: executionPrice,
        markToMarket: contractValue,
        unrealizedPnL: 0,
        marginUsed: initialMargin,
        marginRequirement: initialMargin,
        leverage: newFuturesTrade.leverage,
        entryDate: newFuturesTrade.dateOfEntry,
        expirationDate: newFuturesTrade.expiryDate,
        tickSize: 0.01,
        tickValue: 0.01
      };
      
      // Update futures positions state
      const updatedFuturesPositions = [...futuresPositions, newFuturesPosition];
      setFuturesPositions(updatedFuturesPositions);
      
      // Update cash balance by deducting margin
      setCashBalances(prev => prev.map(balance => {
        if (balance.currency === 'USD') {
          return {
            ...balance,
            amount: balance.amount - initialMargin,
            usdEquivalent: balance.usdEquivalent - initialMargin
          };
        }
        return balance;
      }));
      
      // Reset form
      setNewFuturesTrade({
        instrumentType: 'Index',
        symbol: '',
        positionType: 'LONG',
        orderType: 'Market',
        quantity: 0,
        entryPrice: 0,
        triggerPrice: 0,
        expiryDate: '',
        dateOfEntry: new Date().toISOString().split('T')[0],
        notes: '',
        leverage: 10
      });
      setCurrentMarketPrice(0);
      setShowFuturesForm(false);
      
      // Update portfolio summary
      setTimeout(() => recalculatePortfolio(), 0);
    }
  };

  // Check if futures trade form is valid
  const isFuturesTradeValid = () => {
    const basicValid = newFuturesTrade.symbol && 
                      newFuturesTrade.quantity > 0;
    
    if (!basicValid) return false;
    
    // Check if user has enough cash for margin
    const requiredMargin = (newFuturesTrade.quantity * currentMarketPrice) / newFuturesTrade.leverage;
    if (portfolioSummary.cashValue < requiredMargin) return false;
    
    if (newFuturesTrade.orderType === 'Limit') {
      return basicValid && newFuturesTrade.entryPrice > 0;
    }
    
    if (newFuturesTrade.orderType === 'Stop-Loss') {
      return basicValid && newFuturesTrade.triggerPrice > 0;
    }
    
    return basicValid;
  };

  // Reset futures trade form when switching tabs
  const resetFuturesForm = () => {
    setNewFuturesTrade({
      instrumentType: 'Index',
      symbol: '',
      positionType: 'LONG',
      orderType: 'Market',
      quantity: 0,
      entryPrice: 0,
      triggerPrice: 0,
      expiryDate: '',
      dateOfEntry: new Date().toISOString().split('T')[0],
      notes: '',
      leverage: 10
    });
    setCurrentMarketPrice(0);
  };

  // Fetch current market price when symbol changes
  const handleSymbolChange = (symbol: string) => {
    setNewFuturesTrade({...newFuturesTrade, symbol});
    
    // Simulate fetching current market price using existing updateSecurities function
    if (symbol) {
      // Generate a realistic price based on symbol (this would normally come from API)
      const basePrice = symbol === 'NIFTY' ? 19500 : 
                       symbol === 'BANKNIFTY' ? 44500 :
                       symbol === 'RELIANCE' ? 2500 :
                       symbol === 'TCS' ? 3800 :
                       symbol === 'INFY' ? 1500 : 1000;
      
      const randomVariation = (Math.random() - 0.5) * 0.02; // ±1% variation
      const currentPrice = basePrice * (1 + randomVariation);
      setCurrentMarketPrice(Math.round(currentPrice));
      
      // Auto-fill entry price for Limit orders
      if (newFuturesTrade.orderType === 'Limit') {
        setNewFuturesTrade(prev => ({...prev, entryPrice: currentPrice}));
      }
    }
  };

  // Handle order type changes
  const handleOrderTypeChange = (orderType: 'Market' | 'Limit' | 'Stop-Loss') => {
    setNewFuturesTrade({...newFuturesTrade, orderType});
    
    // Auto-fill prices based on order type
    if (orderType === 'Limit' && currentMarketPrice > 0) {
      setNewFuturesTrade(prev => ({...prev, entryPrice: currentMarketPrice}));
    } else if (orderType === 'Stop-Loss' && currentMarketPrice > 0) {
      setNewFuturesTrade(prev => ({...prev, triggerPrice: currentMarketPrice}));
    }
  };

  // Close futures position
  const closeFuturesPosition = (positionId: string) => {
    const position = futuresPositions.find(p => p.id === positionId);
    if (position) {
      // Calculate final P&L and margin return
      const finalPnL = position.unrealizedPnL;
      const marginReturn = position.marginUsed + finalPnL; // Return initial margin + P&L
      
      // Create a closing trade
      const closingTrade: Trade = {
        id: Date.now().toString(),
        securityId: position.contractId,
        securityName: position.name,
        type: position.positionType === 'LONG' ? 'CLOSE_LONG' : 'CLOSE_SHORT',
        quantity: position.quantity,
        price: position.currentPrice,
        value: position.quantity * position.currentPrice,
        date: new Date().toISOString().split('T')[0],
        commission: 0,
        notes: 'Position closed',
        contractSize: 0,
        marginRequirement: 0,
        marginUsed: 0,
        positionType: position.positionType,
        expirationDate: position.expirationDate,
        tickSize: 0,
        tickValue: 0
      };
      
      setTrades([...trades, closingTrade]);
      
      // Remove from futures positions
      setFuturesPositions(prev => prev.filter(p => p.id !== positionId));
      
      // Return margin and P&L to cash balance
      setCashBalances(prev => prev.map(balance => {
        if (balance.currency === 'USD') {
          return {
            ...balance,
            amount: balance.amount + marginReturn,
            usdEquivalent: balance.usdEquivalent + marginReturn
          };
        }
        return balance;
      }));
      
      // Update portfolio summary to reflect margin release
      setTimeout(() => recalculatePortfolio(), 0);
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Wealth Management Portfolio</h1>
              <p className="text-gray-300 mt-1">Client Servicing Desk - Portfolio Reporting System</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Last Updated</p>
              <p className="text-sm font-medium text-gray-200">{formatDate(portfolioSummary.lastUpdated)}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(portfolioSummary.totalValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${getGainLossColor(portfolioSummary.totalGainLoss)}`}>
                  {formatCurrency(portfolioSummary.totalGainLoss)} ({formatPercentage(portfolioSummary.totalGainLossPercent)})
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-900 rounded-lg">
                <PieChart className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Securities Value</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(portfolioSummary.securitiesValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-900 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Cash Value</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(portfolioSummary.cashValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Futures Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-900 rounded-lg">
                <Target className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Futures Value</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(portfolioSummary.futuresValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-900 rounded-lg">
                <Gauge className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Initial Margin</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(portfolioSummary.totalMarginUsed)}</p>
                <p className="text-sm text-gray-400">Total margin used</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Remaining Margin</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(portfolioSummary.availableMargin)}</p>
                <p className="text-sm text-gray-400">Available for trading</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Leverage Ratio</p>
                <p className="text-2xl font-bold text-white">{riskMetrics.leverageRatio.toFixed(2)}x</p>
                <p className="text-sm text-gray-400">Portfolio leverage</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Holdings */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-lg font-medium text-white">Portfolio Holdings</h2>
                <p className="text-sm text-gray-300">Mark-to-Market calculations based on latest closing prices</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Security</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Buy Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Current Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Gain/Loss</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Holding Period</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {securities.length > 0 && securities.map((security) => (
                      <tr key={security.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{security.name}</div>
                            <div className="text-sm text-gray-400">{security.symbol}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSecurityTypeColor(security.type)}`}>
                            {security.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatNumber(security.quantity)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatCurrency(security.buyValue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatCurrency(security.currentValue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${getGainLossColor(security.gainLoss)}`}>
                            {formatCurrency(security.gainLoss)}
                          </div>
                          <div className={`text-xs ${getGainLossColor(security.gainLossPercent)}`}>
                            {formatPercentage(security.gainLossPercent)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{security.holdingPeriod} days</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleSell(security.id)}
                            className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                          >
                            Sell
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-lg font-medium text-white">Risk Metrics</h2>
                <p className="text-sm text-gray-300">Portfolio risk analysis</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">Delta</span>
                  <span className="text-sm font-semibold text-white">{riskMetrics.delta}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">Beta</span>
                  <span className="text-sm font-semibold text-white">{riskMetrics.beta.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">Sharpe Ratio</span>
                  <span className="text-sm font-semibold text-white">{riskMetrics.sharpeRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">Volatility</span>
                  <span className="text-sm font-semibold text-white">{(riskMetrics.volatility * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">Max Drawdown</span>
                  <span className="text-sm font-semibold text-red-400">{(riskMetrics.maxDrawdown * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Cash Balances */}
           <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mt-6">
              <div className="px-6 py-4 border-b border-gray-700 flex justify-between">
                <h2 className="text-lg font-medium text-white">Cash Balances</h2>
                <p className="text-sm text-gray-300">Multi-currency holdings</p>
              </div>

              <div className="p-6 space-y-3">
                {/* Table header */}
                <div className="flex justify-between text-xs font-semibold text-gray-400 border-b border-gray-700 pb-2">
                  <span className="w-1/4">Currency</span>
                  <span className="w-1/4 text-right">USD Buy</span>
                  <span className="w-1/4 text-right">Rate</span>
                  <span className="w-1/4 text-right">Equivalent (USD)</span>
                </div>

                {/* Rows */}
                {cashBalances.map((balance) => (
                  <div
                    key={balance.currency}
                    className="flex justify-between items-center py-1 text-sm"
                  >
                    {/* Currency */}
                    <div className="w-1/4 flex items-center">
                      <Globe className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-white font-medium">{balance.currency}</span>
                    </div>

                    {/* USD Buy */}
                    <div className="w-1/4 text-right text-white font-semibold">
                      {formatCurrency(balance.amount, balance.currency)}
                    </div>

                    {/* Rate */}
                    <div className="w-1/4 text-right text-gray-300">
                      {balance.exchangeRate.toFixed(4)}
                    </div>

                    {/* Equivalent in USD */}
                    <div className="w-1/4 text-right text-green-400 font-semibold">
                      {formatCurrency(balance.usdEquivalent, "USD")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

                 {/* Futures Positions */}
         <div className="mt-8">
           <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
             <div className="px-6 py-4 border-b border-gray-700">
               <h2 className="text-lg font-medium text-white">Futures Positions</h2>
               <p className="text-sm text-gray-300">Active futures contracts with margin and P&L tracking</p>
             </div>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-700">
                 <thead className="bg-gray-700">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contract</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Position</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quantity</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Entry Price</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Current Price</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Mark to Market</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Unrealized P&L</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Initial Margin</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Remaining Margin</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Expiration</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                   </tr>
                 </thead>
                 <tbody className="bg-gray-800 divide-y divide-gray-700">
                   {futuresPositions.map((position) => (
                     <tr key={position.id} className="hover:bg-gray-700">
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div>
                           <div className="text-sm font-medium text-white">{position.name}</div>
                           <div className="text-sm text-gray-400">{position.symbol}</div>
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPositionTypeColor(position.positionType)}`}>
                           {position.positionType === 'LONG' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                           {position.positionType}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{position.quantity}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatCurrency(position.entryPrice)}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatCurrency(position.currentPrice)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatCurrency(position.quantity * position.currentPrice)}</td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`text-sm font-medium ${getGainLossColor(position.unrealizedPnL)}`}>
                           {formatCurrency(position.unrealizedPnL)}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatCurrency(position.marginUsed)}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatCurrency(position.marginUsed + position.unrealizedPnL)}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{position.expirationDate}</td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <button
                           onClick={() => closeFuturesPosition(position.id)}
                           className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                         >
                           Close
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
         </div>

        {/* Benchmark Performance */}
        <div className="mt-8">
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-medium text-white">Benchmark Performance</h2>
              <p className="text-sm text-gray-300">Portfolio vs. major indices</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Index</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">1M</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">3M</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">6M</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">1Y</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">YTD</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {mockBenchmarks.map((benchmark) => (
                    <tr key={benchmark.symbol} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{benchmark.name}</div>
                          <div className="text-sm text-gray-400">{benchmark.symbol}</div>
                        </div>
                      </td>
                      {Object.entries(benchmark.performance).map(([period, value]) => (
                        <td key={period} className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getPerformanceColor(value)}`}>
                            {value > 0 ? '+' : ''}{value.toFixed(1)}%
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      
        {/* Trade Management */}
        <div className="mt-8">
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-white">Trade Management</h2>
                <p className="text-sm text-gray-300">Add new trades with back-dated entries</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setTradeType('STOCK');
                    setShowTradeForm(!showTradeForm);
                    setShowFuturesForm(false);
                    if (showFuturesForm) resetFuturesForm();
                  }}
                  className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                    tradeType === 'STOCK' && showTradeForm
                      ? 'border-blue-500 text-blue-400 bg-blue-900'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Stock/ETF
                </button>
                <button
                  onClick={() => {
                    setTradeType('FUTURES');
                    setShowFuturesForm(!showFuturesForm);
                    setShowTradeForm(false);
                    if (!showFuturesForm) resetFuturesForm();
                  }}
                  className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                    tradeType === 'FUTURES' && showFuturesForm
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-900'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Futures
                </button>
              </div>
            </div>

            {showTradeForm && (
              <div className="p-6 border-b border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Security Name</label>
                    <input
                      type="text"
                      value={newTrade.securityName}
                      onChange={(e) => setNewTrade({...newTrade, securityName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400"
                      placeholder="e.g., Apple Inc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                    <select
                      value={newTrade.type}
                      onChange={(e) => setNewTrade({...newTrade, type: e.target.value as 'BUY' | 'SELL'})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    >
                      <option value="BUY">Buy</option>
                      <option value="SELL">Sell</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={newTrade.quantity}
                      onChange={(e) => setNewTrade({...newTrade, quantity: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTrade.price}
                      onChange={(e) => setNewTrade({...newTrade, price: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400"
                      placeholder="150.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={newTrade.date}
                      onChange={(e) => setNewTrade({...newTrade, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Commission</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTrade.commission}
                      onChange={(e) => setNewTrade({...newTrade, commission: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400"
                      placeholder="9.99"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                    <input
                      type="text"
                      value={newTrade.notes}
                      onChange={(e) => setNewTrade({...newTrade, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400"
                      placeholder="Trade notes..."
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleAddTrade}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Add Trade
                  </button>
                </div>
              </div>
            )}

            {/* Futures Trading Form */}
            {showFuturesForm && (
              <div className="p-6 border-b border-gray-700">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Futures Trading</h3>
                  
                  {/* Instrument Section */}
                  <div className="bg-gray-700 rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-medium text-white mb-4">Instrument Section</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Instrument Type</label>
                        <select
                          value={newFuturesTrade.instrumentType}
                          onChange={(e) => setNewFuturesTrade({...newFuturesTrade, instrumentType: e.target.value as 'Index' | 'Stock Futures' | 'Commodity Futures'})}
                          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-white"
                        >
                          <option value="Index">Index</option>
                          <option value="Stock Futures">Stock Futures</option>
                          <option value="Commodity Futures">Commodity Futures</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
                        <select
                          value={newFuturesTrade.symbol}
                          onChange={(e) => handleSymbolChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-white"
                        >
                          <option value="">Select Symbol</option>
                          {availableSymbols.map((symbol) => (
                            <option key={symbol} value={symbol}>{symbol}</option>
                          ))}
                        </select>
                        {currentMarketPrice > 0 && (
                          <p className="text-sm text-green-400 mt-1">
                            Current Market Price: ₹{currentMarketPrice.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Position Details */}
                  <div className="bg-gray-700 rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-medium text-white mb-4">Position Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Position Type</label>
                        <select
                          value={newFuturesTrade.positionType}
                          onChange={(e) => setNewFuturesTrade({...newFuturesTrade, positionType: e.target.value as 'LONG' | 'SHORT'})}
                          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-white"
                        >
                          <option value="LONG">Long</option>
                          <option value="SHORT">Short</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Order Type</label>
                        <select
                          value={newFuturesTrade.orderType}
                          onChange={(e) => handleOrderTypeChange(e.target.value as 'Market' | 'Limit' | 'Stop-Loss')}
                          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-white"
                        >
                          <option value="Market">Market</option>
                          <option value="Limit">Limit</option>
                          <option value="Stop-Loss">Stop-Loss</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Leverage</label>
                        <select
                          value={newFuturesTrade.leverage}
                          onChange={(e) => setNewFuturesTrade({...newFuturesTrade, leverage: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-white"
                        >
                          <option value={5}>5x</option>
                          <option value={10}>10x</option>
                          <option value={20}>20x</option>
                          <option value={50}>50x</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Trade Details */}
                  <div className="bg-gray-700 rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-medium text-white mb-4">Trade Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Quantity (Lots/Contracts)</label>
                        <input
                          type="number"
                          value={newFuturesTrade.quantity}
                          onChange={(e) => setNewFuturesTrade({...newFuturesTrade, quantity: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400"
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Entry Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newFuturesTrade.entryPrice}
                          onChange={(e) => setNewFuturesTrade({...newFuturesTrade, entryPrice: Number(e.target.value)})}
                          className={`w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400 ${
                            newFuturesTrade.orderType !== 'Limit' ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          placeholder="0.00"
                          disabled={newFuturesTrade.orderType !== 'Limit'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Trigger Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newFuturesTrade.triggerPrice}
                          onChange={(e) => setNewFuturesTrade({...newFuturesTrade, triggerPrice: Number(e.target.value)})}
                          className={`w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400 ${
                            newFuturesTrade.orderType !== 'Stop-Loss' ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          placeholder="0.00"
                          disabled={newFuturesTrade.orderType !== 'Stop-Loss'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date</label>
                        <input
                          type="date"
                          value={newFuturesTrade.expiryDate}
                          onChange={(e) => setNewFuturesTrade({...newFuturesTrade, expiryDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gray-700 rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-medium text-white mb-4">Additional Info</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Date of Entry</label>
                        <input
                          type="date"
                          value={newFuturesTrade.dateOfEntry}
                          onChange={(e) => setNewFuturesTrade({...newFuturesTrade, dateOfEntry: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Notes (Optional)</label>
                        <textarea
                          value={newFuturesTrade.notes}
                          onChange={(e) => setNewFuturesTrade({...newFuturesTrade, notes: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400"
                          placeholder="Trade comments..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Margin Calculation Display */}
                {newFuturesTrade.symbol && newFuturesTrade.quantity > 0 && currentMarketPrice > 0 && (
                  <div className="bg-gray-600 rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-medium text-white mb-4">Margin Calculation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-400">Contract Value</div>
                        <div className="text-lg font-semibold text-white">
                          {formatCurrency(newFuturesTrade.quantity * currentMarketPrice)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Leverage</div>
                        <div className="text-lg font-semibold text-white">{newFuturesTrade.leverage}x</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Required Margin</div>
                        <div className="text-lg font-semibold text-yellow-400">
                          {formatCurrency((newFuturesTrade.quantity * currentMarketPrice) / newFuturesTrade.leverage)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-500">
                      <div className="text-sm text-gray-400">Available Cash: {formatCurrency(portfolioSummary.cashValue)}</div>
                      {portfolioSummary.cashValue < (newFuturesTrade.quantity * currentMarketPrice) / newFuturesTrade.leverage && (
                        <div className="text-sm text-red-400 mt-1">⚠️ Insufficient cash for margin requirement</div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <button
                    onClick={handleFuturesTrade}
                    disabled={!isFuturesTradeValid()}
                    className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white ${
                      isFuturesTradeValid() 
                        ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500' 
                        : 'bg-gray-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    Execute Trade
                  </button>
                  {!isFuturesTradeValid() && (
                    <p className="text-sm text-gray-400 mt-2">
                      {!newFuturesTrade.symbol ? 'Please select a symbol' :
                       newFuturesTrade.quantity <= 0 ? 'Please enter a valid quantity' :
                       portfolioSummary.cashValue < (newFuturesTrade.quantity * currentMarketPrice) / newFuturesTrade.leverage ? 'Insufficient cash for margin requirement' :
                       newFuturesTrade.orderType === 'Limit' && newFuturesTrade.entryPrice <= 0 ? 'Please enter entry price for Limit order' :
                       newFuturesTrade.orderType === 'Stop-Loss' && newFuturesTrade.triggerPrice <= 0 ? 'Please enter trigger price for Stop-Loss order' :
                       'Please fill in all required fields to enable trade execution'}
                    </p>
                  )}
                </div>
              </div>
            )}

            

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Security</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Commission</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {trades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{trade.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{trade.securityName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          trade.type === 'BUY' || trade.type === 'LONG_FUTURES' ? 'bg-green-900 text-green-300' : 
                          trade.type === 'SELL' || trade.type === 'SHORT_FUTURES' ? 'bg-red-900 text-red-300' :
                          trade.type === 'CLOSE_LONG' || trade.type === 'CLOSE_SHORT' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {trade.type === 'BUY' || trade.type === 'LONG_FUTURES' ? <Plus className="h-3 w-3 mr-1" /> : 
                           trade.type === 'SELL' || trade.type === 'SHORT_FUTURES' ? <Minus className="h-3 w-3 mr-1" /> :
                           <Target className="h-3 w-3 mr-1" />}
                          {trade.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatNumber(trade.quantity)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatCurrency(trade.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatCurrency(trade.value)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatCurrency(trade.commission)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{trade.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Integration Flowchart */}
        <div className="mt-8">
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-medium text-white">System Integration Flow</h2>
              <p className="text-sm text-gray-300">Data flow from external sources to portfolio system</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center space-x-8">
                {/* External Data Sources */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-900 rounded-lg flex items-center justify-center mb-2">
                    <Database className="h-8 w-8 text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-white">Bloomberg</p>
                  <p className="text-xs text-gray-400">Price Feed</p>
                </div>

                <div className="flex items-center">
                  <div className="w-16 h-0.5 bg-gray-600"></div>
                  <Zap className="h-4 w-4 text-gray-500 mx-2" />
                  <div className="w-16 h-0.5 bg-gray-600"></div>
                </div>

                {/* Data Processing */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-green-900 rounded-lg flex items-center justify-center mb-2">
                    <Activity className="h-8 w-8 text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-white">Data</p>
                  <p className="text-xs text-gray-400">Processing</p>
                </div>

                <div className="flex items-center">
                  <div className="w-16 h-0.5 bg-gray-600"></div>
                  <Zap className="h-4 w-4 text-gray-500 mx-2" />
                  <div className="w-16 h-0.5 bg-gray-600"></div>
                </div>

                {/* Portfolio System */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-purple-900 rounded-lg flex items-center justify-center mb-2">
                    <PieChart className="h-8 w-8 text-purple-400" />
                  </div>
                  <p className="text-sm font-medium text-white">Portfolio</p>
                  <p className="text-xs text-gray-400">System</p>
                </div>

                <div className="flex items-center">
                  <div className="w-16 h-0.5 bg-gray-600"></div>
                  <Zap className="h-4 w-4 text-gray-500 mx-2" />
                  <div className="w-16 h-0.5 bg-gray-600"></div>
                </div>

                {/* Client Reports */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-orange-900 rounded-lg flex items-center justify-center mb-2">
                    <BarChart3 className="h-8 w-8 text-orange-400" />
                  </div>
                  <p className="text-sm font-medium text-white">Client</p>
                  <p className="text-xs text-gray-400">Reports</p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-gray-700 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-400">Real-time updates every 15 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
