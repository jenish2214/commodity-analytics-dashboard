"""
Hedge Fund Metrics Calculations
================================
Advanced hedge fund performance and risk ratios
"""

import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class HedgeFundMetricsResult:
    """Hedge fund style metrics"""
    sortino_ratio: float
    calmar_ratio: float
    sterling_ratio: float
    burke_ratio: float
    pain_ratio: float
    ulcer_index: float
    pain_index: float
    up_capture: float
    down_capture: float
    batting_average: float


class HedgeFundMetrics:
    """Calculate hedge fund style performance metrics"""
    
    def __init__(self, risk_free_rate: float = 4.5):
        self.risk_free_rate = risk_free_rate / 100
    
    def calculate_sortino_ratio(self, returns: np.ndarray, 
                              target_return: float = 0.0) -> float:
        """
        Sortino Ratio: Return per unit of downside risk
        Similar to Sharpe but only penalizes downside volatility
        """
        excess_return = np.mean(returns) - self.risk_free_rate
        
        # Calculate downside deviation (only negative returns)
        downside_returns = returns[returns < target_return]
        if len(downside_returns) == 0:
            return np.inf if excess_return > 0 else 0.0
        
        downside_deviation = np.std(downside_returns, ddof=1)
        if downside_deviation == 0:
            return 0.0
        
        return excess_return / downside_deviation
    
    def calculate_calmar_ratio(self, annual_return: float, 
                            max_drawdown: float) -> float:
        """
        Calmar Ratio: Return relative to maximum drawdown
        Higher is better
        """
        if max_drawdown == 0:
            return 0.0
        
        decimal_return = annual_return / 100
        decimal_drawdown = max_drawdown / 100
        
        return decimal_return / abs(decimal_drawdown)
    
    def calculate_sterling_ratio(self, annual_return: float,
                               drawdowns: List[float]) -> float:
        """
        Sterling Ratio: Return relative to average drawdown
        Uses average of significant drawdowns (e.g., top 3)
        """
        if not drawdowns or len(drawdowns) == 0:
            return 0.0
        
        # Use average of all drawdowns
        avg_drawdown = np.mean(drawdowns)
        
        if avg_drawdown == 0:
            return 0.0
        
        decimal_return = annual_return / 100
        return decimal_return / abs(avg_drawdown / 100)
    
    def calculate_burke_ratio(self, annual_return: float,
                            drawdowns: List[float]) -> float:
        """
        Burke Ratio: Return relative to sum of squared drawdowns
        Penalizes large drawdowns more heavily
        """
        if not drawdowns or len(drawdowns) == 0:
            return 0.0
        
        # Sum of squared drawdowns
        squared_drawdowns = [d ** 2 for d in drawdowns]
        sum_squared = np.sqrt(sum(squared_drawdowns))
        
        if sum_squared == 0:
            return 0.0
        
        decimal_return = annual_return / 100
        return decimal_return / (sum_squared / 100)
    
    def calculate_ulcer_index(self, equity_curve: np.ndarray) -> float:
        """
        Ulcer Index: Measures depth and duration of drawdowns
        Square root of average of squared drawdown percentages
        """
        if len(equity_curve) == 0:
            return 0.0
        
        # Calculate running maximum
        running_max = np.maximum.accumulate(equity_curve)
        
        # Calculate drawdowns (as percentages)
        drawdowns = ((equity_curve - running_max) / running_max) * 100
        squared_drawdowns = drawdowns ** 2
        
        # Ulcer Index is square root of average of squared drawdowns
        if len(squared_drawdowns) == 0:
            return 0.0
        
        return np.sqrt(np.mean(squared_drawdowns[squared_drawdowns > 0]))
    
    def calculate_pain_index(self, equity_curve: np.ndarray) -> float:
        """
        Pain Index: Average of drawdown percentages
        Simpler alternative to Ulcer Index
        """
        if len(equity_curve) == 0:
            return 0.0
        
        running_max = np.maximum.accumulate(equity_curve)
        drawdowns = ((equity_curve - running_max) / running_max) * 100
        
        # Only positive drawdowns (losses)
        positive_dd = drawdowns[drawdowns < 0]
        
        if len(positive_dd) == 0:
            return 0.0
        
        return abs(np.mean(positive_dd))
    
    def calculate_pain_ratio(self, annual_return: float, 
                           pain_index: float) -> float:
        """
        Pain Ratio: Return relative to Pain Index
        """
        if pain_index == 0:
            return 0.0
        
        decimal_return = annual_return / 100
        return decimal_return / (pain_index / 100)
    
    def calculate_capture_ratios(self, portfolio_returns: np.ndarray,
                               benchmark_returns: np.ndarray) -> Tuple[float, float]:
        """
        Calculate up-capture and down-capture ratios
        
        Up-capture: Average portfolio return in up months / Average benchmark return in up months
        Down-capture: Average portfolio return in down months / Average benchmark return in down months
        
        Lower down-capture is better (lose less in down markets)
        Higher up-capture is better (gain more in up markets)
        """
        if len(portfolio_returns) == 0 or len(benchmark_returns) == 0:
            return 0.0, 0.0
        
        # Up months (benchmark positive)
        up_months = benchmark_returns > 0
        if np.any(up_months):
            up_capture = (np.mean(portfolio_returns[up_months]) / 
                         np.mean(benchmark_returns[up_months]))
        else:
            up_capture = 0.0
        
        # Down months (benchmark negative)
        down_months = benchmark_returns < 0
        if np.any(down_months):
            down_capture = (np.mean(portfolio_returns[down_months]) / 
                           np.mean(benchmark_returns[down_months]))
        else:
            down_capture = 0.0
        
        return up_capture, down_capture
    
    def calculate_batting_average(self, portfolio_returns: np.ndarray,
                                 benchmark_returns: np.ndarray) -> float:
        """
        Batting Average: Percentage of periods outperforming benchmark
        """
        if len(portfolio_returns) == 0:
            return 0.0
        
        outperform = portfolio_returns > benchmark_returns
        return np.mean(outperform) * 100
    
    def simulate_equity_curve(self, initial_value: float, 
                             annual_return: float,
                             volatility: float,
                             years: int = 5,
                             n_months: int = 12) -> np.ndarray:
        """
        Simulate equity curve for calculating drawdown metrics
        """
        np.random.seed(42)
        months = years * n_months
        
        monthly_return = (annual_return / 100) / n_months
        monthly_vol = (volatility / 100) / np.sqrt(n_months)
        
        # Generate random returns
        returns = np.random.normal(monthly_return, monthly_vol, months)
        
        # Calculate equity curve
        equity_curve = [initial_value]
        for ret in returns:
            equity_curve.append(equity_curve[-1] * (1 + ret))
        
        return np.array(equity_curve)
    
    def calculate_drawdowns(self, equity_curve: np.ndarray) -> List[float]:
        """Extract all significant drawdowns from equity curve"""
        drawdowns = []
        peak = equity_curve[0]
        
        for value in equity_curve:
            if value > peak:
                peak = value
            else:
                dd = ((peak - value) / peak) * 100
                if dd > 5:  # Only significant drawdowns > 5%
                    drawdowns.append(dd)
        
        return drawdowns if drawdowns else [0.0]
    
    def calculate_all_metrics(self, annual_return: float, 
                            volatility: float,
                            max_drawdown: float,
                            portfolio_value: float = 100000,
                            years: int = 5) -> HedgeFundMetricsResult:
        """Calculate all hedge fund metrics"""
        
        # Simulate equity curve and returns
        equity_curve = self.simulate_equity_curve(portfolio_value, annual_return, volatility, years)
        
        # Extract monthly returns
        returns = np.diff(equity_curve) / equity_curve[:-1]
        
        # Calculate drawdowns
        drawdowns = self.calculate_drawdowns(equity_curve)
        
        # Benchmark returns (assume market returns)
        benchmark_returns = np.random.normal(0.008, 0.04, len(returns))  # ~10% annual, 15% vol
        
        # Calculate metrics
        sortino = self.calculate_sortino_ratio(returns)
        calmar = self.calculate_calmar_ratio(annual_return, max_drawdown)
        sterling = self.calculate_sterling_ratio(annual_return, drawdowns)
        burke = self.calculate_burke_ratio(annual_return, drawdowns)
        ulcer = self.calculate_ulcer_index(equity_curve)
        pain_idx = self.calculate_pain_index(equity_curve)
        pain_ratio = self.calculate_pain_ratio(annual_return, pain_idx)
        up_capture, down_capture = self.calculate_capture_ratios(returns, benchmark_returns)
        batting = self.calculate_batting_average(returns, benchmark_returns)
        
        return HedgeFundMetricsResult(
            sortino_ratio=sortino,
            calmar_ratio=calmar,
            sterling_ratio=sterling,
            burke_ratio=burke,
            pain_ratio=pain_ratio,
            ulcer_index=ulcer,
            pain_index=pain_idx,
            up_capture=up_capture,
            down_capture=down_capture,
            batting_average=batting
        )


def calculate_hedge_fund_metrics(annual_return: float,
                                volatility: float,
                                max_drawdown: float,
                                portfolio_value: float = 100000,
                                years: int = 5) -> Dict:
    """Convenience function to calculate all hedge fund metrics"""
    calculator = HedgeFundMetrics()
    
    metrics = calculator.calculate_all_metrics(
        annual_return=annual_return,
        volatility=volatility,
        max_drawdown=max_drawdown,
        portfolio_value=portfolio_value,
        years=years
    )
    
    return {
        'sortino_ratio': metrics.sortino_ratio,
        'calmar_ratio': metrics.calmar_ratio,
        'sterling_ratio': metrics.sterling_ratio,
        'burke_ratio': metrics.burke_ratio,
        'pain_ratio': metrics.pain_ratio,
        'ulcer_index': metrics.ulcer_index,
        'pain_index': metrics.pain_index,
        'up_capture': metrics.up_capture,
        'down_capture': metrics.down_capture,
        'batting_average': metrics.batting_average,
    }
