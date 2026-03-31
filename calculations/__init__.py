"""
Quantitative Portfolio Calculator Python Backend
===============================================

This package contains all mathematical calculations for portfolio analytics:
- Core portfolio metrics (returns, volatility, Sharpe ratio)
- Risk models (VaR, CVaR, Black-Scholes, CAPM)
- Monte Carlo simulations
- Stress testing
- Hedge fund metrics
- Factor analysis

Usage:
    from calculations import PortfolioCalculator
    
    calc = PortfolioCalculator()
    results = calc.calculate_all_metrics(portfolio_data)
"""

from .portfolio_metrics import PortfolioMetrics
from .risk_models import RiskModels
from .monte_carlo import MonteCarloSimulator
from .stress_testing import StressTester
from .hedge_fund_metrics import HedgeFundMetrics
from .factor_analysis import FactorAnalyzer

__all__ = [
    'PortfolioMetrics',
    'RiskModels', 
    'MonteCarloSimulator',
    'StressTester',
    'HedgeFundMetrics',
    'FactorAnalyzer',
]
