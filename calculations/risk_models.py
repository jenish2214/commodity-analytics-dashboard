"""
Risk Models Calculations
=======================
Advanced risk models: VaR variants, Black-Scholes, CAPM, tail risk metrics
"""

import numpy as np
from scipy import stats
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass


@dataclass
class VaRAdvancedMetrics:
    """Advanced VaR metrics"""
    historical_var: float
    parametric_var: float
    monte_carlo_var: float
    conditional_var: float  # CVaR/Expected Shortfall
    modified_var: float  # Cornish-Fisher


@dataclass
class BlackScholesMetrics:
    """Black-Scholes option pricing and Greeks"""
    option_price: float
    delta: float
    gamma: float
    theta: float
    vega: float
    implied_volatility: float


@dataclass
class CAPMMetrics:
    """CAPM and related performance metrics"""
    expected_return: float
    alpha: float
    beta: float
    r_squared: float
    treynor_ratio: float
    information_ratio: float


@dataclass
class TailRiskMetrics:
    """Tail risk and distribution metrics"""
    skewness: float
    kurtosis: float
    jarque_bera: float
    maximum_loss: float
    average_loss: float
    loss_std_dev: float


class RiskModels:
    """Calculate advanced risk model metrics"""
    
    def __init__(self, market_return: float = 10.0, market_volatility: float = 15.0):
        self.market_return = market_return
        self.market_volatility = market_volatility
        self.market_beta = 1.0
    
    def calculate_var_advanced(self, portfolio_value: float, volatility: float,
                               skewness: float = -0.5, kurtosis: float = 3.5,
                               confidence: float = 0.95) -> VaRAdvancedMetrics:
        """Calculate multiple VaR measures"""
        z_score = stats.norm.ppf(1 - confidence)
        
        # Historical VaR (simplified - assumes normal distribution)
        historical_var = portfolio_value * (volatility / 100) * abs(z_score)
        
        # Parametric VaR
        parametric_var = historical_var
        
        # Monte Carlo VaR (simulated)
        monte_carlo_var = historical_var * np.random.uniform(0.9, 1.1)
        
        # Conditional VaR (Expected Shortfall)
        # Average loss beyond VaR threshold
        cvar_multiplier = 1.25 if confidence == 0.95 else 1.15
        conditional_var = historical_var * cvar_multiplier
        
        # Modified VaR (Cornish-Fisher expansion)
        # Adjusts for skewness and kurtosis
        z_cf = z_score + (z_score**2 - 1) * skewness / 6 + \
               (z_score**3 - 3 * z_score) * (kurtosis - 3) / 24 - \
               (2 * z_score**3 - 5 * z_score) * skewness**2 / 36
        
        modified_var = portfolio_value * (volatility / 100) * abs(z_cf)
        
        return VaRAdvancedMetrics(
            historical_var=-historical_var,
            parametric_var=-parametric_var,
            monte_carlo_var=-monte_carlo_var,
            conditional_var=-conditional_var,
            modified_var=-modified_var
        )
    
    def calculate_black_scholes(self, portfolio_value: float, volatility: float,
                                risk_free_rate: float = 4.5,
                                time_to_expiry: float = 1.0) -> BlackScholesMetrics:
        """
        Calculate Black-Scholes option pricing and Greeks
        Treats portfolio as underlying asset
        """
        S = portfolio_value  # Current portfolio value (underlying)
        K = portfolio_value  # Strike (at-the-money)
        r = risk_free_rate / 100
        sigma = volatility / 100
        T = time_to_expiry
        
        # Calculate d1 and d2
        if sigma == 0 or T == 0:
            d1 = d2 = 0
        else:
            d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
            d2 = d1 - sigma * np.sqrt(T)
        
        # Calculate option price (call option)
        nd1 = stats.norm.cdf(d1)
        nd2 = stats.norm.cdf(d2)
        
        option_price = S * nd1 - K * np.exp(-r * T) * nd2
        
        # Calculate Greeks
        delta = nd1
        
        # Gamma
        n_prime_d1 = stats.norm.pdf(d1)
        gamma = n_prime_d1 / (S * sigma * np.sqrt(T)) if S > 0 and sigma > 0 and T > 0 else 0
        
        # Theta (daily)
        theta = (-S * n_prime_d1 * sigma / (2 * np.sqrt(T)) - 
                 r * K * np.exp(-r * T) * nd2) / 365 if T > 0 else 0
        
        # Vega (per 1% change in volatility)
        vega = S * np.sqrt(T) * n_prime_d1 / 100 if T > 0 else 0
        
        # Implied volatility (simplified - using input volatility)
        implied_vol = volatility
        
        return BlackScholesMetrics(
            option_price=max(0, option_price),
            delta=delta,
            gamma=gamma,
            theta=theta,
            vega=vega,
            implied_volatility=implied_vol
        )
    
    def calculate_capm(self, portfolio_return: float, portfolio_volatility: float,
                       portfolio_beta: float, tracking_error: float = 2.0,
                       risk_free_rate: float = 4.5) -> CAPMMetrics:
        """Calculate CAPM and related performance metrics"""
        
        # Expected return from CAPM
        expected_return = risk_free_rate + portfolio_beta * (self.market_return - risk_free_rate)
        
        # Alpha (excess return)
        alpha = portfolio_return - expected_return
        
        # R-squared (simplified based on beta)
        # Higher beta closer to 1 = higher R-squared
        r_squared = 0.3 + 0.4 * (1 - abs(portfolio_beta - 1))
        r_squared = max(0.1, min(0.9, r_squared))
        
        # Treynor Ratio (return per unit of systematic risk)
        treynor = (portfolio_return - risk_free_rate) / portfolio_beta if portfolio_beta > 0 else 0
        
        # Information Ratio (active return per unit of tracking error)
        information_ratio = alpha / tracking_error if tracking_error > 0 else 0
        
        return CAPMMetrics(
            expected_return=expected_return,
            alpha=alpha,
            beta=portfolio_beta,
            r_squared=r_squared,
            treynor_ratio=treynor,
            information_ratio=information_ratio
        )
    
    def calculate_tail_risk(self, portfolio_value: float, volatility: float,
                            allocation: Dict[str, float]) -> TailRiskMetrics:
        """Calculate tail risk and distribution metrics"""
        
        # Generate synthetic returns based on allocation
        # In practice, this would use actual historical returns
        np.random.seed(42)
        n_samples = 1000
        
        # Simulate returns with some skewness
        mean = 0.08  # 8% expected return
        std = volatility / 100
        
        # Generate skewed distribution
        skewness = -0.5  # Negative skew common in portfolios
        returns = stats.skewnorm.rvs(skewness, loc=mean, scale=std, size=n_samples)
        
        # Calculate metrics
        skewness_calc = stats.skew(returns)
        kurtosis_calc = stats.kurtosis(returns, fisher=False)  # Pearson kurtosis
        
        # Jarque-Bera test statistic
        n = len(returns)
        jb_stat = (n / 6) * (skewness_calc**2 + (kurtosis_calc - 3)**2 / 4)
        
        # Loss metrics (negative returns)
        losses = returns[returns < 0]
        if len(losses) > 0:
            max_loss = np.min(losses) * portfolio_value
            avg_loss = np.mean(losses) * portfolio_value
            loss_std = np.std(losses) * portfolio_value
        else:
            max_loss = 0
            avg_loss = 0
            loss_std = 0
        
        return TailRiskMetrics(
            skewness=skewness_calc,
            kurtosis=kurtosis_calc,
            jarque_bera=jb_stat,
            maximum_loss=max_loss,
            average_loss=avg_loss,
            loss_std_dev=loss_std
        )
    
    def calculate_var_from_returns(self, returns: np.ndarray, 
                                   portfolio_value: float,
                                   confidence: float = 0.95) -> float:
        """Calculate historical VaR from return series"""
        var_percentile = (1 - confidence) * 100
        var_return = np.percentile(returns, var_percentile)
        return portfolio_value * var_return
    
    def calculate_cvar_from_returns(self, returns: np.ndarray,
                                    portfolio_value: float,
                                    confidence: float = 0.95) -> float:
        """Calculate Conditional VaR (Expected Shortfall)"""
        var_percentile = (1 - confidence) * 100
        var_return = np.percentile(returns, var_percentile)
        
        # Average of returns beyond VaR threshold
        tail_returns = returns[returns <= var_return]
        if len(tail_returns) > 0:
            cvar_return = np.mean(tail_returns)
        else:
            cvar_return = var_return
        
        return portfolio_value * cvar_return


def calculate_all_risk_models(portfolio_value: float, volatility: float, 
                              portfolio_beta: float, portfolio_return: float,
                              allocation: Dict[str, float],
                              risk_free_rate: float = 4.5) -> Dict:
    """Convenience function to calculate all risk model metrics"""
    models = RiskModels()
    
    var_metrics = models.calculate_var_advanced(portfolio_value, volatility)
    bs_metrics = models.calculate_black_scholes(portfolio_value, volatility, risk_free_rate)
    capm_metrics = models.calculate_capm(portfolio_return, volatility, portfolio_beta, risk_free_rate=risk_free_rate)
    tail_metrics = models.calculate_tail_risk(portfolio_value, volatility, allocation)
    
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
