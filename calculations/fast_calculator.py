"""
Fast Cached Calculator
=======================
High-performance calculator with LRU caching for instant results.
"""

import functools
import hashlib
import json
from typing import Dict, Any
from .portfolio_metrics import PortfolioMetrics, PortfolioInput
from .risk_models import RiskModels
from .monte_carlo import MonteCarloSimulator
from .stress_testing import StressTester
from .hedge_fund_metrics import HedgeFundMetrics
from .factor_analysis import FactorAnalyzer


# Cache size - adjust based on memory constraints
MAX_CACHE_SIZE = 128


def make_hashable_key(allocation: Dict[str, float], **kwargs) -> str:
    """Create a hashable cache key from input parameters"""
    # Normalize allocation (sort keys for consistent hashing)
    sorted_alloc = tuple(sorted(allocation.items()))
    
    # Create key components
    key_data = {
        'allocation': sorted_alloc,
        'total_investment': kwargs.get('total_investment', 100000),
        'monthly_contribution': kwargs.get('monthly_contribution', 0),
        'investment_horizon': kwargs.get('investment_horizon', 10),
        'risk_free_rate': round(kwargs.get('risk_free_rate', 4.5), 2),
        'target_return': kwargs.get('target_return'),
    }
    
    # Create MD5 hash for fast lookup
    key_str = json.dumps(key_data, sort_keys=True)
    return hashlib.md5(key_str.encode()).hexdigest()


class FastCalculator:
    """
    High-performance calculator with intelligent caching.
    """
    
    def __init__(self, market_return: float = 10.0, market_volatility: float = 15.0):
        self.market_return = market_return
        self.market_volatility = market_volatility
        
        # Initialize calculators once
        self._metrics_calc = PortfolioMetrics(market_return, market_volatility)
        self._risk_calc = RiskModels(market_return, market_volatility)
        self._stress_calc = StressTester()
        self._hf_calc = HedgeFundMetrics()
        self._factor_calc = FactorAnalyzer()
        
        # Reusable Monte Carlo simulator
        self._mc_calc = None
        
        # Result cache
        self._cache: Dict[str, Dict] = {}
        self._cache_hits = 0
        self._cache_misses = 0
    
    def _get_from_cache(self, key: str) -> tuple[bool, Any]:
        """Check cache and update stats"""
        if key in self._cache:
            self._cache_hits += 1
            return True, self._cache[key]
        self._cache_misses += 1
        return False, None
    
    def _store_in_cache(self, key: str, value: Dict):
        """Store result in cache with LRU eviction"""
        # Simple eviction: clear if too large
        if len(self._cache) >= MAX_CACHE_SIZE:
            # Clear oldest 25% of entries
            keys = list(self._cache.keys())
            for old_key in keys[:MAX_CACHE_SIZE // 4]:
                del self._cache[old_key]
        
        self._cache[key] = value
    
    def calculate_all_metrics_fast(self,
                                    allocation: Dict[str, float],
                                    total_investment: float = 100000,
                                    monthly_contribution: float = 0,
                                    investment_horizon: int = 10,
                                    target_return: float = None,
                                    risk_free_rate: float = 4.5,
                                    monte_carlo_sims: int = 5000) -> Dict:
        """
        Fast calculation with caching and optimized algorithms.
        """
        # Check cache first
        cache_key = make_hashable_key(
            allocation,
            total_investment=total_investment,
            monthly_contribution=monthly_contribution,
            investment_horizon=investment_horizon,
            risk_free_rate=risk_free_rate,
            target_return=target_return
        )
        
        hit, cached = self._get_from_cache(cache_key)
        if hit:
            return cached
        
        # 1. Calculate core metrics (fast - no loops)
        core_metrics = self._calculate_core_fast(
            allocation, total_investment, monthly_contribution,
            investment_horizon, risk_free_rate
        )
        
        portfolio_value = core_metrics['portfolio_value']
        volatility = core_metrics['volatility']
        annual_return = core_metrics['annualized_return']
        portfolio_beta = core_metrics['beta']
        max_drawdown = core_metrics['max_drawdown']
        
        # 2. Calculate risk models (parallel-friendly)
        risk_models = self._calculate_risk_fast(
            portfolio_value, volatility, portfolio_beta,
            annual_return, allocation, risk_free_rate
        )
        
        # 3. Quick Monte Carlo (reduced simulations for speed)
        mc_results = self._calculate_mc_fast(
            total_investment, monthly_contribution, annual_return,
            volatility, investment_horizon, target_return, monte_carlo_sims
        )
        
        # 4. Stress tests (fast lookup-based)
        stress_results = self._stress_calc.generate_stress_report(
            portfolio_value, allocation
        )
        
        # 5. Hedge fund metrics
        hf_metrics = self._hf_calc.calculate_all_metrics(
            annual_return, volatility, max_drawdown,
            total_investment, investment_horizon
        )
        
        # 6. Factor analysis
        factor_results = self._factor_calc.analyze_portfolio(allocation, annual_return)
        
        # Compile results
        result = {
            'core_metrics': core_metrics,
            'risk_models': risk_models,
            'monte_carlo': mc_results,
            'stress_test': stress_results,
            'hedge_fund_metrics': {
                'sortino_ratio': hf_metrics.sortino_ratio,
                'calmar_ratio': hf_metrics.calmar_ratio,
                'sterling_ratio': hf_metrics.sterling_ratio,
                'burke_ratio': hf_metrics.burke_ratio,
                'pain_ratio': hf_metrics.pain_ratio,
                'ulcer_index': hf_metrics.ulcer_index,
                'pain_index': hf_metrics.pain_index,
                'up_capture': hf_metrics.up_capture,
                'down_capture': hf_metrics.down_capture,
                'batting_average': hf_metrics.batting_average,
            },
            'factor_analysis': factor_results['exposures'],
            'factor_attribution': factor_results['attribution'],
            'factor_interpretations': factor_results['interpretations'],
        }
        
        # Store in cache
        self._store_in_cache(cache_key, result)
        
        return result
    
    def _calculate_core_fast(self, allocation: Dict[str, float],
                            total_investment: float,
                            monthly_contribution: float,
                            investment_horizon: int,
                            risk_free_rate: float) -> Dict:
        """Optimized core metrics calculation"""
        calc = self._metrics_calc
        
        # Calculate in batch for cache efficiency
        annual_return = calc.calculate_portfolio_return(allocation)
        volatility = calc.calculate_portfolio_volatility(allocation)
        beta = calc.calculate_beta(allocation)
        diversification = calc.calculate_diversification_score(allocation)
        
        # Future value with compound growth
        portfolio_value = calc.calculate_future_value(
            total_investment, monthly_contribution, annual_return, investment_horizon
        )
        
        # Derived metrics
        total_return = portfolio_value - total_investment
        total_return_pct = (total_return / total_investment * 100) if total_investment > 0 else 0
        
        var_95 = calc.calculate_value_at_risk(portfolio_value, volatility, 0.95)
        var_99 = calc.calculate_value_at_risk(portfolio_value, volatility, 0.99)
        sharpe = calc.calculate_sharpe_ratio(annual_return, volatility, risk_free_rate)
        max_dd = calc.calculate_max_drawdown(allocation)
        safety = calc.get_safety_rating(sharpe, volatility, max_dd)
        risk_level = calc.get_risk_level(volatility)
        
        return {
            'portfolio_value': portfolio_value,
            'total_return': total_return,
            'total_return_percentage': total_return_pct,
            'annualized_return': annual_return,
            'volatility': volatility,
            'sharpe_ratio': sharpe,
            'max_drawdown': max_dd,
            'beta': beta,
            'diversification_score': diversification,
            'var_95': var_95,
            'var_99': var_99,
            'safety_rating': safety,
            'risk_level': risk_level,
        }
    
    def _calculate_risk_fast(self, portfolio_value: float, volatility: float,
                            portfolio_beta: float, portfolio_return: float,
                            allocation: Dict[str, float], risk_free_rate: float) -> Dict:
        """Optimized risk model calculations"""
        calc = self._risk_calc
        
        # VaR models (single calculation pass)
        var_metrics = calc.calculate_var_advanced(portfolio_value, volatility)
        
        # Black-Scholes
        bs_metrics = calc.calculate_black_scholes(portfolio_value, volatility, risk_free_rate)
        
        # CAPM
        capm_metrics = calc.calculate_capm(portfolio_return, volatility, portfolio_beta, risk_free_rate=risk_free_rate)
        
        # Tail risk
        tail_metrics = calc.calculate_tail_risk(portfolio_value, volatility, allocation)
        
        return {
            'var_advanced': {
                'historical_var': var_metrics.historical_var,
                'parametric_var': var_metrics.parametric_var,
                'monte_carlo_var': var_metrics.monte_carlo_var,
                'conditional_var': var_metrics.conditional_var,
                'modified_var': var_metrics.modified_var,
            },
            'black_scholes': {
                'option_price': bs_metrics.option_price,
                'delta': bs_metrics.delta,
                'gamma': bs_metrics.gamma,
                'theta': bs_metrics.theta,
                'vega': bs_metrics.vega,
                'implied_volatility': bs_metrics.implied_volatility,
            },
            'capm': {
                'expected_return': capm_metrics.expected_return,
                'alpha': capm_metrics.alpha,
                'beta': capm_metrics.beta,
                'r_squared': capm_metrics.r_squared,
                'treynor_ratio': capm_metrics.treynor_ratio,
                'information_ratio': capm_metrics.information_ratio,
            },
            'tail_risk': {
                'skewness': tail_metrics.skewness,
                'kurtosis': tail_metrics.kurtosis,
                'jarque_bera': tail_metrics.jarque_bera,
                'maximum_loss': tail_metrics.maximum_loss,
                'average_loss': tail_metrics.average_loss,
                'loss_std_dev': tail_metrics.loss_std_dev,
            }
        }
    
    def _calculate_mc_fast(self, initial_value: float, monthly_contribution: float,
                          annual_return: float, volatility: float,
                          years: int, target_return_pct: float = None,
                          n_simulations: int = 5000) -> Dict:
        """Optimized Monte Carlo with reduced simulations"""
        # Initialize simulator on first use
        if self._mc_calc is None:
            self._mc_calc = MonteCarloSimulator(n_simulations=n_simulations, seed=42)
        else:
            self._mc_calc.n_simulations = n_simulations
        
        results = self._mc_calc.run_portfolio_simulation(
            initial_value, monthly_contribution, annual_return,
            volatility, years, target_return_pct
        )
        
        # Generate projection data only if requested
        projection = self._mc_calc.generate_projection_data(
            initial_value, monthly_contribution, annual_return, volatility, years
        )
        
        return {
            'probability_of_profit': results.probability_of_profit,
            'probability_of_loss': results.probability_of_loss,
            'probability_of_target_return': results.probability_of_target_return,
            'expected_value': results.expected_value,
            'median_value': results.median_value,
            'percentile_5': results.percentile_5,
            'percentile_95': results.percentile_95,
            'std_deviation': results.std_deviation,
            'projection_data': projection
        }
    
    def get_cache_stats(self) -> Dict[str, int]:
        """Get cache performance statistics"""
        total = self._cache_hits + self._cache_misses
        hit_rate = (self._cache_hits / total * 100) if total > 0 else 0
        return {
            'hits': self._cache_hits,
            'misses': self._cache_misses,
            'hit_rate': round(hit_rate, 2),
            'size': len(self._cache)
        }
    
    def clear_cache(self):
        """Clear calculation cache"""
        self._cache.clear()
        self._cache_hits = 0
        self._cache_misses = 0


# Global singleton instance for reuse across requests
_fast_calculator = None


def get_fast_calculator() -> FastCalculator:
    """Get or create global fast calculator instance"""
    global _fast_calculator
    if _fast_calculator is None:
        _fast_calculator = FastCalculator()
    return _fast_calculator


def calculate_fast(allocation: Dict[str, float], **kwargs) -> Dict:
    """Convenience function for fast calculation"""
    calc = get_fast_calculator()
    return calc.calculate_all_metrics_fast(allocation, **kwargs)
