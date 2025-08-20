# Wealth Management Portfolio Reporting System

A comprehensive Next.js application for wealth management client servicing desks that provides portfolio reporting, trade management, and risk analysis capabilities.

## Features

### 🎯 Portfolio Statement
- **Security Holdings**: Display of all portfolio securities with detailed information
- **Mark-to-Market (MTM)**: Real-time calculations based on mock closing prices
- **Gain/Loss Tracking**: Individual and portfolio-wide performance metrics
- **Holding Periods**: Automatic calculation of investment duration

### 💰 Multi-Currency Cash Management
- **USD, EUR, GBP, JPY** support with mock exchange rates
- **Real-time FX conversion** to USD equivalent
- **Cash balance tracking** across all currencies

### 📊 Risk Metrics & Analysis
- **Delta**: Options sensitivity measure (placeholder implementation)
- **Beta**: Portfolio volatility vs. market benchmark
- **Sharpe Ratio**: Risk-adjusted return calculation
- **Volatility**: Portfolio risk measurement
- **Maximum Drawdown**: Historical risk assessment

### 📈 Benchmark Performance
- **Major Indices**: NASDAQ, S&P 500, FTSE 100, MSCI World
- **Time Periods**: 1M, 3M, 6M, 1Y, YTD performance
- **Portfolio Comparison**: Benchmark vs. portfolio performance

### 🔄 Trade Management
- **Buy/Sell Orders**: Support for both transaction types
- **Back-dated Entries**: Historical trade recording capability
- **Commission Tracking**: Transaction cost management
- **Notes & Documentation**: Trade rationale and comments

### 🔗 System Integration
- **Data Flow Visualization**: SVG-based integration flowchart
- **External Sources**: Bloomberg price feed integration (mock)
- **Real-time Updates**: 15-minute refresh intervals
- **Data Processing Pipeline**: End-to-end system architecture

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Charts**: Recharts (ready for future enhancements)
- **Date Handling**: date-fns

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main portfolio dashboard
│   └── globals.css         # Global styles
├── types/
│   └── portfolio.ts        # TypeScript interfaces
├── data/
│   └── mockData.ts         # Mock data for demonstration
└── utils/
    └── calculations.ts     # Portfolio calculation utilities
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production
```bash
npm run build
npm start
```

## Mock Data

The application uses comprehensive mock data to demonstrate functionality:

- **5 Sample Securities**: AAPL, MSFT, VOO, TSLA, JPM
- **Historical Trades**: Sample buy transactions with realistic data
- **Multi-currency Cash**: USD, EUR, GBP, JPY balances
- **Risk Metrics**: Calculated portfolio risk measures
- **Benchmark Data**: Major index performance data

## Key Calculations

### Mark-to-Market (MTM)
```typescript
currentValue = quantity × currentPrice
gainLoss = currentValue - buyValue
gainLossPercent = (gainLoss / buyValue) × 100
```

### Portfolio Beta
```typescript
portfolioBeta = Σ(securityWeight × individualBeta)
```

### Sharpe Ratio
```typescript
sharpeRatio = (portfolioReturn - riskFreeRate) / volatility
```

## Customization

### Adding New Securities
1. Update `mockSecurities` array in `src/data/mockData.ts`
2. Add corresponding mock data for prices and risk metrics
3. Update calculation utilities if needed

### Modifying Risk Calculations
1. Edit `calculateRiskMetrics` function in `src/utils/calculations.ts`
2. Implement actual historical data calculations
3. Add new risk measures as required

### Styling Changes
1. Modify TailwindCSS classes in components
2. Update color schemes in utility functions
3. Customize component layouts and spacing

## Production Considerations

### Data Sources
- Replace mock data with real API endpoints
- Implement Bloomberg/Refinitiv data feeds
- Add real-time price updates via WebSocket

### Security
- Implement authentication and authorization
- Add input validation and sanitization
- Secure API endpoints and data transmission

### Performance
- Add data caching and optimization
- Implement virtual scrolling for large datasets
- Add lazy loading for components

### Monitoring
- Add error tracking and logging
- Implement performance monitoring
- Add user analytics and usage tracking

## Future Enhancements

- **Real-time Charts**: Interactive performance charts
- **Portfolio Rebalancing**: Automated rebalancing tools
- **Client Management**: Multi-client portfolio support
- **Reporting**: PDF/Excel export capabilities
- **Alerts**: Price and risk threshold notifications
- **Mobile App**: React Native companion application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please open an issue in the GitHub repository.
