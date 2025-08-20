'use client';

import { useState, useEffect } from 'react';
import { 
  mockSecurities, 
  mockTrades, 
  mockCashBalances, 
  mockRiskMetrics, 
  mockBenchmarks, 
  mockPortfolioSummary,
  mockClosingPrices
} from '@/data/mockData';
import { 
  calculateMTM, 
  calculatePortfolioSummary, 
  calculateRiskMetrics,
  formatCurrency, 
  formatPercentage, 
  getSecurityTypeColor, 
  getGainLossColor 
} from '@/utils/calculations';
import { Security, Trade, CashBalance } from '@/types/portfolio';
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
  Zap
} from 'lucide-react';

export default function PortfolioDashboard() {
  const [securities, setSecurities] = useState<Security[]>(mockSecurities);
  const [trades, setTrades] = useState<Trade[]>(mockTrades);
  const [cashBalances] = useState<CashBalance[]>(mockCashBalances);
  const [portfolioSummary, setPortfolioSummary] = useState(mockPortfolioSummary);
  const [riskMetrics, setRiskMetrics] = useState(mockRiskMetrics);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [newTrade, setNewTrade] = useState({
    securityName: '',
    type: 'BUY' as 'BUY' | 'SELL',
    quantity: 0,
    price: 0,
    date: new Date().toISOString().split('T')[0],
    commission: 0,
    notes: ''
  });

  useEffect(() => {
    // Update portfolio calculations when data changes
    const updatedSecurities = calculateMTM(securities, mockClosingPrices);
    setSecurities(updatedSecurities);
    
    const summary = calculatePortfolioSummary(updatedSecurities, cashBalances);
    setPortfolioSummary(summary);
    
    const metrics = calculateRiskMetrics(updatedSecurities);
    setRiskMetrics(metrics);
  }, [securities, cashBalances]);

  const handleAddTrade = () => {
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
        notes: newTrade.notes
      };

      setTrades([...trades, trade]);
      
      // Reset form
      setNewTrade({
        securityName: '',
        type: 'BUY',
        quantity: 0,
        price: 0,
        date: new Date().toISOString().split('T')[0],
        commission: 0,
        notes: ''
      });
      setShowTradeForm(false);
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Wealth Management Portfolio</h1>
              <p className="text-gray-600 mt-1">Client Servicing Desk - Portfolio Reporting System</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-sm font-medium">{new Date(portfolioSummary.lastUpdated).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolioSummary.totalValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${getGainLossColor(portfolioSummary.totalGainLoss)}`}>
                  {formatCurrency(portfolioSummary.totalGainLoss)} ({formatPercentage(portfolioSummary.totalGainLossPercent)})
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Securities Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolioSummary.securitiesValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cash Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolioSummary.cashValue)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Holdings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Portfolio Holdings</h2>
                <p className="text-sm text-gray-600">Mark-to-Market calculations based on latest closing prices</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Security</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buy Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holding Period</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {securities.map((security) => (
                      <tr key={security.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{security.name}</div>
                            <div className="text-sm text-gray-500">{security.symbol}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSecurityTypeColor(security.type)}`}>
                            {security.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{security.quantity.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(security.buyValue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(security.currentValue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${getGainLossColor(security.gainLoss)}`}>
                            {formatCurrency(security.gainLoss)}
                          </div>
                          <div className={`text-xs ${getGainLossColor(security.gainLossPercent)}`}>
                            {formatPercentage(security.gainLossPercent)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{security.holdingPeriod} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Risk Metrics</h2>
                <p className="text-sm text-gray-600">Portfolio risk analysis</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Delta</span>
                  <span className="text-sm font-semibold text-gray-900">{riskMetrics.delta}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Beta</span>
                  <span className="text-sm font-semibold text-gray-900">{riskMetrics.beta.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Sharpe Ratio</span>
                  <span className="text-sm font-semibold text-gray-900">{riskMetrics.sharpeRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Volatility</span>
                  <span className="text-sm font-semibold text-gray-900">{(riskMetrics.volatility * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Max Drawdown</span>
                  <span className="text-sm font-semibold text-red-600">{(riskMetrics.maxDrawdown * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Cash Balances */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Cash Balances</h2>
                <p className="text-sm text-gray-600">Multi-currency holdings</p>
              </div>
              <div className="p-6 space-y-3">
                {cashBalances.map((balance) => (
                  <div key={balance.currency} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{balance.currency}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(balance.amount, balance.currency)}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(balance.usdEquivalent)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Benchmark Performance */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Benchmark Performance</h2>
              <p className="text-sm text-gray-600">Portfolio vs. major indices</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Index</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">1M</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">3M</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">6M</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">1Y</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">YTD</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockBenchmarks.map((benchmark) => (
                    <tr key={benchmark.symbol} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{benchmark.name}</div>
                          <div className="text-sm text-gray-500">{benchmark.symbol}</div>
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
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Trade Management</h2>
                <p className="text-sm text-gray-600">Add new trades with back-dated entries</p>
              </div>
              <button
                onClick={() => setShowTradeForm(!showTradeForm)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                {showTradeForm ? 'Cancel' : 'Add Trade'}
              </button>
            </div>

            {showTradeForm && (
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Security Name</label>
                    <input
                      type="text"
                      value={newTrade.securityName}
                      onChange={(e) => setNewTrade({...newTrade, securityName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Apple Inc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={newTrade.type}
                      onChange={(e) => setNewTrade({...newTrade, type: e.target.value as 'BUY' | 'SELL'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="BUY">Buy</option>
                      <option value="SELL">Sell</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={newTrade.quantity}
                      onChange={(e) => setNewTrade({...newTrade, quantity: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTrade.price}
                      onChange={(e) => setNewTrade({...newTrade, price: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="150.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={newTrade.date}
                      onChange={(e) => setNewTrade({...newTrade, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commission</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTrade.commission}
                      onChange={(e) => setNewTrade({...newTrade, commission: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="9.99"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <input
                      type="text"
                      value={newTrade.notes}
                      onChange={(e) => setNewTrade({...newTrade, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Security</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trade.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trade.securityName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          trade.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.type === 'BUY' ? <Plus className="h-3 w-3 mr-1" /> : <Minus className="h-3 w-3 mr-1" />}
                          {trade.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trade.quantity.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(trade.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(trade.value)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(trade.commission)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trade.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Integration Flowchart */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">System Integration Flow</h2>
              <p className="text-sm text-gray-600">Data flow from external sources to portfolio system</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center space-x-8">
                {/* External Data Sources */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                    <Database className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Bloomberg</p>
                  <p className="text-xs text-gray-500">Price Feed</p>
                </div>

                <div className="flex items-center">
                  <div className="w-16 h-0.5 bg-gray-300"></div>
                  <Zap className="h-4 w-4 text-gray-400 mx-2" />
                  <div className="w-16 h-0.5 bg-gray-300"></div>
                </div>

                {/* Data Processing */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Data</p>
                  <p className="text-xs text-gray-500">Processing</p>
                </div>

                <div className="flex items-center">
                  <div className="w-16 h-0.5 bg-gray-300"></div>
                  <Zap className="h-4 w-4 text-gray-400 mx-2" />
                  <div className="w-16 h-0.5 bg-gray-300"></div>
                </div>

                {/* Portfolio System */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                    <PieChart className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Portfolio</p>
                  <p className="text-xs text-gray-500">System</p>
                </div>

                <div className="flex items-center">
                  <div className="w-16 h-0.5 bg-gray-300"></div>
                  <Zap className="h-4 w-4 text-gray-400 mx-2" />
                  <div className="w-16 h-0.5 bg-gray-300"></div>
                </div>

                {/* Client Reports */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Client</p>
                  <p className="text-xs text-gray-500">Reports</p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                  <span className="text-sm text-gray-600">Real-time updates every 15 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
