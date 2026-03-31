"""
Quantitative Portfolio Calculator - Python Backend
=====================================================

This is the main calculator class that integrates all calculation modules.
Use this as the primary interface for running portfolio calculations.
"""

from typing import Dict, List, Optional
import json

from .portfolio_metrics import PortfolioMetrics, PortfolioInput, calculate_portfolio_metrics
from .risk_models import RiskModels, calculate_all_risk_models
from .monte_carlo import MonteCarloSimulator, run_monte_carlo_analysis
from .stress_testing import StressTester, run_stress_tests
from .hedge_fund_metrics import HedgeFundMetrics, calculate_hedge_fund_metrics
from .factor_analysis import FactorAnalyzer, run_factor_analysis


class PortfolioCalculator:
    """
    Main portfolio calculator integrating all quantitative models.
    
    Usage:
        calc = PortfolioCalculator()
        results = calc.calculate_all_metrics(
            allocation={'equity': 60, 'bonds': 40},
            total_investment=100000,
            investment_horizon=10
        )
    """
    
    def __init__(self, market_return: float = 10.0, market_volatility: float = 15.0):
        self.market_return = market_return
        self.market_volatility = market_volatility
        
        # Initialize all calculators
        self.metrics_calc = PortfolioMetrics(market_return, market_volatility)
        self.risk_calc = RiskModels(market_return, market_volatility)
        self.mc_calc = MonteCarloSimulator(seed=42)
        self.stress_calc = StressTester()
        self.hf_calc = HedgeFundMetrics()
        self.factor_calc = FactorAnalyzer()
    
    def calculate_all_metrics(self,
                              allocation: Dict[str, float],
                              total_investment: float = 100000,
                              monthly_contribution: float = 0,
                              investment_horizon: int = 10,
                              target_return: Optional[float] = None,
                              risk_free_rate: float = 4.5,
                              monte_carlo_sims: int = 10000) -> Dict:
        """
        Run complete portfolio analysis with all models
        
        Returns comprehensive results including:
        - Core metrics (returns, volatility, Sharpe, etc.)
        - Risk models (VaR, Black-Scholes, CAPM)
        - Monte Carlo simulation results
        - Stress test scenarios
        - Hedge fund metrics
        - Factor analysis
        """
        
        # 1. Calculate core portfolio metrics
        core_metrics = calculate_portfolio_metrics(
            allocation=allocation,
            total_investment=total_investment,
            monthly_contribution=monthly_contribution,
            investment_horizon=investment_horizon,
            risk_free_rate=risk_free_rate
        )
        
        portfolio_value = core_metrics['portfolio_value']
        volatility = core_metrics['volatility']
        annual_return = core_metrics['annualized_return']
        portfolio_beta = core_metrics['beta']
        max_drawdown = core_metrics['max_drawdown']
        
        # 2. Calculate risk models
        risk_models = calculate_all_risk_models(
            portfolio_value=portfolio_value,
            volatility=volatility,
            portfolio_beta=portfolio_beta,
            portfolio_return=annual_return,
            allocation=allocation,
            risk_free_rate=risk_free_rate
        )
        
        # 3. Run Monte Carlo simulation
        mc_results = run_monte_carlo_analysis(
            initial_value=total_investment,
            monthly_contribution=monthly_contribution,
            annual_return=annual_return,
            volatility=volatility,
            years=investment_horizon,
            target_return_pct=target_return if target_return else 50.0,
            n_simulations=monte_carlo_sims
        )
        
        # 4. Run stress tests
        stress_results = run_stress_tests(portfolio_value, allocation)
        
        # 5. Calculate hedge fund metrics
        hf_metrics = calculate_hedge_fund_metrics(
            annual_return=annual_return,
            volatility=volatility,
            max_drawdown=max_drawdown,
            portfolio_value=total_investment,
            years=investment_horizon
        )
        
        # 6. Run factor analysis
        factor_results = run_factor_analysis(allocation, annual_return)
        
        # Compile all results
        results = {
            'core_metrics': core_metrics,
            'risk_models': risk_models,
            'monte_carlo': mc_results,
            'stress_test': stress_results,
            'hedge_fund_metrics': hf_metrics,
            'factor_analysis': factor_results['exposures'],
            'factor_attribution': factor_results['attribution'],
            'factor_interpretations': factor_results['interpretations'],
        }
        
        return results
    
    def calculate_quick_metrics(self,
                              allocation: Dict[str, float],
                              total_investment: float = 100000) -> Dict:
        """
        Quick calculation of essential metrics only
        (faster than full analysis)
        """
        return calculate_portfolio_metrics(
            allocation=allocation,
            total_investment=total_investment
        )
    
    def validate_allocation(self, allocation: Dict[str, float]) -> Dict:
        """
        Validate portfolio allocation
        """
        errors = []
        warnings = []
        
        total = sum(allocation.values())
        
        # Check total is 100%
        if abs(total - 100) > 0.01:
            errors.append(f"Allocation totals {total:.1f}%, should be 100%")
        
        # Check for negative allocations
        for asset, weight in allocation.items():
            if weight < 0:
                errors.append(f"Negative allocation for {asset}: {weight}%")
        
        # Check for concentration risk
        max_weight = max(allocation.values()) if allocation else 0
        if max_weight > 70:
            warnings.append(f"High concentration: {max_weight:.1f}% in single asset")
        
        # Check for diversification
        num_assets = sum(1 for w in allocation.values() if w > 0)
        if num_assets < 3:
            warnings.append(f"Low diversification: only {num_assets} assets")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
            'total': total
        }


def run_full_calculation(allocation: Dict[str, float],
                        total_investment: float = 100000,
                        monthly_contribution: float = 0,
                        investment_horizon: int = 10,
                        risk_free_rate: float = 4.5) -> Dict:
    """
    Standalone function to run complete calculation
    """
    calculator = PortfolioCalculator()
    return calculator.calculate_all_metrics(
        allocation=allocation,
        total_investment=total_investment,
        monthly_contribution=monthly_contribution,
        investment_horizon=investment_horizon,
        risk_free_rate=risk_free_rate
    )


def main():
    """
    Example usage and CLI interface
    """
    import sys
    
    # Default test allocation
    test_allocation = {
        'equity': 50,
        'bonds': 30,
        'gold': 10,
        'cash': 10,
    }
    
    if len(sys.argv) > 1 and sys.argv[1] == '--test':
        print("Running test calculation...")
        results = run_full_calculation(
            allocation=test_allocation,
            total_investment=100000,
            monthly_contribution=1000,
            investment_horizon=10
        )
        
        print("\n=== Core Metrics ===")
        print(f"Portfolio Value: ${results['core_metrics']['portfolio_value']:,.2f}")
        print(f"Annualized Return: {results['core_metrics']['annualized_return']:.2f}%")
        print(f"Volatility: {results['core_metrics']['volatility']:.2f}%")
        print(f"Sharpe Ratio: {results['core_metrics']['sharpe_ratio']:.2f}")
        print(f"Safety Rating: {results['core_metrics']['safety_rating']}")
        
        print("\n=== Risk Models ===")
        print(f"VaR (95%): ${abs(results['risk_models']['var_advanced']['historical_var']):,.2f}")
        print(f"CVaR: ${abs(results['risk_models']['var_advanced']['conditional_var']):,.2f}")
        print(f"Alpha: {results['risk_models']['capm']['alpha']:.2f}%")
        
        print("\n=== Monte Carlo ===")
        print(f"Probability of Profit: {results['monte_carlo']['probability_of_profit']:.1f}%")
        print(f"Expected Value: ${results['monte_carlo']['expected_value']:,.2f}")
        
        print("\n=== Stress Test ===")
        print(f"Market Crash: ${results['stress_test']['scenarios']['market_crash']['value']:,.2f}")
        print(f"Worst Case: ${results['stress_test']['scenarios']['worst_case']['value']:,.2f}")
        
        print("\nTest completed successfully!")
        
    else:
        print("Portfolio Calculator Python Backend")
        print("\nUsage:")
        print("  python -m calculations --test    Run test calculation")
        print("\nOr import in your code:")
        print("  from calculations import PortfolioCalculator")
        print("  calc = PortfolioCalculator()")
        print("  results = calc.calculate_all_metrics(allocation)")


if __name__ == '__main__':
    main()
