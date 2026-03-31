# Python Calculations for Portfolio Analytics

This folder contains all mathematical calculations for the portfolio analytics dashboard, implemented in Python using scientific computing libraries.

## Folder Structure

```
calculations/
├── __init__.py              # Package initialization
├── calculator.py            # Main calculator class integrating all modules
├── portfolio_metrics.py     # Core metrics (returns, volatility, Sharpe, etc.)
├── risk_models.py          # VaR, Black-Scholes, CAPM, tail risk
├── monte_carlo.py          # Monte Carlo simulations
├── stress_testing.py       # Stress test scenarios
├── hedge_fund_metrics.py   # Advanced performance ratios
├── factor_analysis.py      # Fama-French factor models
└── requirements.txt        # Python dependencies
```

## Installation

Install the required Python packages:

```bash
cd calculations
pip install -r requirements.txt
```

Or install globally:

```bash
pip install numpy scipy pandas
```

## Usage

### From Python Code

```python
from calculations import PortfolioCalculator

# Initialize calculator
calc = PortfolioCalculator()

# Define portfolio allocation
allocation = {
    'equity': 50,
    'bonds': 30,
    'gold': 10,
    'cash': 10
}

# Run full calculation
results = calc.calculate_all_metrics(
    allocation=allocation,
    total_investment=100000,
    monthly_contribution=1000,
    investment_horizon=10
)

# Access results
print(f"Portfolio Value: ${results['core_metrics']['portfolio_value']:,.2f}")
print(f"Sharpe Ratio: {results['core_metrics']['sharpe_ratio']:.2f}")
```

### From Command Line

Run a test calculation:

```bash
cd calculations
python calculator.py --test
```

### From Next.js Frontend

The calculations are exposed via API endpoints:

```typescript
import { calculateFullPortfolio } from '@/services/pythonCalculationService';

const result = await calculateFullPortfolio({
  allocation: { equity: 50, bonds: 30, gold: 10, cash: 10 },
  totalInvestment: 100000,
  monthlyContribution: 1000,
  investmentHorizon: 10
});
```

## API Endpoints

- `POST /api/calculate/portfolio` - Full calculation with all metrics
- `POST /api/calculate/quick` - Essential metrics only (faster)
- `POST /api/calculate/monte-carlo` - Monte Carlo simulation
- `POST /api/calculate/stress-test` - Stress testing scenarios

## Modules

### portfolio_metrics.py
Core portfolio calculations:
- Portfolio return and volatility
- Sharpe ratio
- Maximum drawdown
- Value at Risk (VaR)
- Beta
- Diversification score
- Safety rating

### risk_models.py
Advanced risk models:
- Historical, Parametric, Monte Carlo VaR
- Conditional VaR (CVaR/Expected Shortfall)
- Modified VaR (Cornish-Fisher)
- Black-Scholes option pricing and Greeks
- CAPM analysis (alpha, beta, R², Treynor ratio)
- Tail risk metrics (skewness, kurtosis, Jarque-Bera)

### monte_carlo.py
Monte Carlo simulation:
- Geometric Brownian Motion paths
- Probability of profit/loss
- Percentile analysis (5th, 50th, 95th)
- Projection data for charts

### stress_testing.py
Stress test scenarios:
- 2008 Financial Crisis
- Inflation spike
- Interest rate shock
- Geopolitical crisis
- Pandemic scenario
- Worst case analysis

### hedge_fund_metrics.py
Hedge fund style metrics:
- Sortino ratio
- Calmar ratio
- Sterling ratio
- Burke ratio
- Pain ratio/index
- Ulcer index
- Up/Down capture ratios
- Batting average

### factor_analysis.py
Fama-French factor model:
- Market factor (beta)
- Size factor (SMB)
- Value factor (HML)
- Momentum factor (UMD)
- Quality factor (RMW)
- Low volatility factor
- Factor attribution analysis

## Configuration

The calculations use default market assumptions that can be overridden:

```python
calc = PortfolioCalculator(
    market_return=10.0,      # Expected market return (%)
    market_volatility=15.0   # Market volatility (%)
)
```

## Testing

Run the built-in test:

```bash
python -m calculations.calculator --test
```

## Dependencies

- **numpy**: Numerical computing
- **scipy**: Scientific computing (statistics, optimization)
- **pandas**: Data manipulation (optional, for future enhancements)

## Integration with Next.js

The Python backend is integrated via:

1. **Python Runner** (`src/lib/pythonRunner.ts`): Executes Python scripts from Node.js
2. **API Routes** (`src/app/api/calculate/*`): RESTful endpoints
3. **Service Layer** (`src/services/pythonCalculationService.ts`): Frontend abstraction

## Notes

- Python 3.8+ required
- Calculations are deterministic (seeded random numbers) for reproducibility
- All monetary values returned as raw numbers (not formatted)
- Percentages returned as numbers (e.g., 10.5 for 10.5%)
