"""
Portfolio Core Metrics Calculations
====================================
Basic portfolio calculations: returns, volatility, Sharpe ratio, etc.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass


@dataclass
class PortfolioInput:
    """Portfolio input data structure"""
    total_investment: float
    monthly_contribution: float
    investment_horizon: int  # years
    allocation: Dict[str, float]  # asset -> percentage
    risk_free_rate: float = 4.5
    target_return: Optional[float] = None


@dataclass
class CoreMetrics:
    """Core portfolio metrics results"""
    portfolio_value: float
    total_return: float
    total_return_percentage: float
    annualized_return: float
    volatility: float
    sharpe_ratio: float
    max_drawdown: float
    beta: float
    diversification_score: float
    var_95: float
    var_99: float
    safety_rating: str
    risk_level: str


class PortfolioMetrics:
    """Calculate core portfolio metrics"""
    
    # Asset historical return assumptions (annualized)
    ASSET_RETURNS = {
        'equity': 10.0,
        'gold': 7.5,
        'silver': 8.0,
        'crudeOil': 6.0,
        'naturalGas': 5.0,
        'copper': 7.0,
        'bonds': 5.0,
        'crypto': 25.0,
        'cash': 3.5,
        'realEstate': 8.0,
        'commodities': 6.5,
    }
    
    # Asset volatility assumptions (annualized %)
    ASSET_VOLATILITIES = {
        'equity': 16.0,
        'gold': 15.0,
        'silver': 25.0,
        'crudeOil': 30.0,
        'naturalGas': 35.0,
        'copper': 20.0,
        'bonds': 5.0,
        'crypto': 60.0,
        'cash': 0.5,
        'realEstate': 12.0,
        'commodities': 18.0,
    }
    
    # Asset correlation matrix (simplified)
    CORRELATIONS = {
        ('equity', 'bonds'): -0.2,
        ('equity', 'gold'): 0.1,
        ('equity', 'crypto'): 0.3,
        ('gold', 'crypto'): 0.15,
        ('bonds', 'crypto'): -0.1,
    }
    
    def __init__(self, market_return: float = 10.0, market_volatility: float = 15.0):
        self.market_return = market_return
        self.market_volatility = market_volatility
    
    def calculate_portfolio_return(self, allocation: Dict[str, float]) -> float:
        """Calculate weighted average portfolio return"""
        total_return = 0.0
        for asset, weight in allocation.items():
            if weight > 0 and asset in self.ASSET_RETURNS:
                total_return += (weight / 100) * self.ASSET_RETURNS[asset]
        return total_return
    
    def calculate_portfolio_volatility(self, allocation: Dict[str, float]) -> float:
        """Calculate portfolio volatility using variance-covariance approach"""
        assets = [a for a in allocation.keys() if allocation[a] > 0]
        n = len(assets)
        
        if n == 0:
            return 0.0
        
        if n == 1:
            asset = assets[0]
            weight = allocation[asset] / 100
            return abs(weight * self.ASSET_VOLATILITIES.get(asset, 15.0))
        
        # Calculate portfolio variance with correlations
        portfolio_variance = 0.0
        
        for i, asset_i in enumerate(assets):
            weight_i = allocation[asset_i] / 100
            vol_i = self.ASSET_VOLATILITIES.get(asset_i, 15.0) / 100
            
            for j, asset_j in enumerate(assets):
                weight_j = allocation[asset_j] / 100
                vol_j = self.ASSET_VOLATILITIES.get(asset_j, 15.0) / 100
                
                # Get correlation
                corr_key = (asset_i, asset_j) if (asset_i, asset_j) in self.CORRELATIONS else \
                          (asset_j, asset_i) if (asset_j, asset_i) in self.CORRELATIONS else None
                
                if i == j:
                    correlation = 1.0
                elif corr_key:
                    correlation = self.CORRELATIONS[corr_key]
                else:
                    # Default correlation for unspecified pairs
                    correlation = 0.3 if asset_i != asset_j else 1.0
                
                portfolio_variance += weight_i * weight_j * vol_i * vol_j * correlation
        
        return np.sqrt(portfolio_variance) * 100  # Return as percentage
    
    def calculate_beta(self, allocation: Dict[str, float]) -> float:
        """Calculate portfolio beta relative to market"""
        # Asset betas relative to market
        asset_betas = {
            'equity': 1.0,
            'gold': 0.1,
            'silver': 0.15,
            'crudeOil': 0.2,
            'naturalGas': 0.25,
            'copper': 0.3,
            'bonds': -0.05,
            'crypto': 0.8,
            'cash': 0.0,
            'realEstate': 0.4,
            'commodities': 0.2,
        }
        
        portfolio_beta = 0.0
        for asset, weight in allocation.items():
            if weight > 0:
                beta = asset_betas.get(asset, 0.5)
                portfolio_beta += (weight / 100) * beta
        
        return max(0.0, portfolio_beta)
    
    def calculate_diversification_score(self, allocation: Dict[str, float]) -> float:
        """Calculate diversification score based on Herfindahl index"""
        weights = [w / 100 for w in allocation.values() if w > 0]
        
        if not weights:
            return 0.0
        
        # Herfindahl index (sum of squared weights)
        herfindahl = sum(w ** 2 for w in weights)
        
        # Number of assets
        n = len(weights)
        
        # Diversification ratio (lower Herfindahl = more diversified)
        # Scale to 0-100
        if n == 1:
            return 20.0
        
        max_herfindahl = 1.0  # All in one asset
        min_herfindahl = 1.0 / n  # Equal weight
        
        # Invert and scale
        diversification = (max_herfindahl - herfindahl) / (max_herfindahl - min_herfindahl) * 100
        return max(20.0, min(100.0, diversification))
    
    def calculate_value_at_risk(self, portfolio_value: float, volatility: float, 
                                confidence: float = 0.95) -> float:
        """Calculate parametric VaR"""
        # VaR = Portfolio Value * Z-score * Volatility
        z_scores = {0.95: 1.645, 0.99: 2.326, 0.90: 1.282}
        z_score = z_scores.get(confidence, 1.645)
        
        var = portfolio_value * (volatility / 100) * z_score
        return -var  # Negative for loss
    
    def calculate_sharpe_ratio(self, annualized_return: float, volatility: float, 
                               risk_free_rate: float) -> float:
        """Calculate Sharpe ratio"""
        if volatility == 0:
            return 0.0
        return (annualized_return - risk_free_rate) / volatility
    
    def calculate_max_drawdown(self, allocation: Dict[str, float]) -> float:
        """Estimate maximum drawdown based on portfolio composition"""
        volatility = self.calculate_portfolio_volatility(allocation)
        
        # Simplified: assume max drawdown is ~2.5x annual volatility
        # Based on historical data patterns
        return min(50.0, volatility * 2.5)
    
    def get_safety_rating(self, sharpe_ratio: float, volatility: float, 
                         max_drawdown: float) -> str:
        """Calculate safety rating (A-F)"""
        score = 0
        
        # Sharpe ratio component
        if sharpe_ratio > 1.0:
            score += 40
        elif sharpe_ratio > 0.5:
            score += 30
        elif sharpe_ratio > 0:
            score += 20
        else:
            score += 10
        
        # Volatility component
        if volatility < 10:
            score += 35
        elif volatility < 15:
            score += 25
        elif volatility < 25:
            score += 15
        else:
            score += 5
        
        # Max drawdown component
        if max_drawdown < 15:
            score += 25
        elif max_drawdown < 25:
            score += 15
        elif max_drawdown < 40:
            score += 10
        else:
            score += 5
        
        if score >= 80:
            return "A"
        elif score >= 65:
            return "B"
        elif score >= 50:
            return "C"
        elif score >= 35:
            return "D"
        else:
            return "F"
    
    def get_risk_level(self, volatility: float) -> str:
        """Determine risk level based on volatility"""
        if volatility < 8:
            return "low"
        elif volatility < 15:
            return "medium"
        elif volatility < 25:
            return "high"
        else:
            return "extreme"
    
    def calculate_future_value(self, principal: float, monthly_contribution: float, 
                               annual_return: float, years: int) -> float:
        """Calculate future portfolio value with compound growth"""
        monthly_rate = (annual_return / 100) / 12
        months = years * 12
        
        # Future value of principal
        fv_principal = principal * (1 + annual_return / 100) ** years
        
        # Future value of monthly contributions
        if monthly_rate > 0:
            fv_contributions = monthly_contribution * (((1 + monthly_rate) ** months - 1) / monthly_rate)
        else:
            fv_contributions = monthly_contribution * months
        
        return fv_principal + fv_contributions
    
    def calculate_all_metrics(self, input_data: PortfolioInput) -> CoreMetrics:
        """Calculate all core portfolio metrics"""
        # Calculate expected annual return
        annual_return = self.calculate_portfolio_return(input_data.allocation)
        
        # Calculate portfolio volatility
        volatility = self.calculate_portfolio_volatility(input_data.allocation)
        
        # Calculate beta
        beta = self.calculate_beta(input_data.allocation)
        
        # Calculate diversification score
        diversification = self.calculate_diversification_score(input_data.allocation)
        
        # Calculate future portfolio value
        portfolio_value = self.calculate_future_value(
            input_data.total_investment,
            input_data.monthly_contribution,
            annual_return,
            input_data.investment_horizon
        )
        
        # Calculate total return
        total_contributions = (input_data.total_investment + 
                              input_data.monthly_contribution * input_data.investment_horizon * 12)
        total_return = portfolio_value - input_data.total_investment
        total_return_pct = (total_return / input_data.total_investment) * 100 if input_data.total_investment > 0 else 0
        
        # Annualized return
        annualized = annual_return
        
        # Calculate VaR
        var_95 = self.calculate_value_at_risk(portfolio_value, volatility, 0.95)
        var_99 = self.calculate_value_at_risk(portfolio_value, volatility, 0.99)
        
        # Calculate Sharpe ratio
        sharpe = self.calculate_sharpe_ratio(annualized, volatility, input_data.risk_free_rate)
        
        # Calculate max drawdown
        max_dd = self.calculate_max_drawdown(input_data.allocation)
        
        # Get ratings
        safety = self.get_safety_rating(sharpe, volatility, max_dd)
        risk_level = self.get_risk_level(volatility)
        
        return CoreMetrics(
            portfolio_value=portfolio_value,
            total_return=total_return,
            total_return_percentage=total_return_pct,
            annualized_return=annualized,
            volatility=volatility,
            sharpe_ratio=sharpe,
            max_drawdown=max_dd,
            beta=beta,
            diversification_score=diversification,
            var_95=var_95,
            var_99=var_99,
            safety_rating=safety,
            risk_level=risk_level
        )


# Standalone functions for direct usage
def calculate_portfolio_metrics(allocation: Dict[str, float], 
                                total_investment: float = 100000,
                                monthly_contribution: float = 0,
                                investment_horizon: int = 10,
                                risk_free_rate: float = 4.5) -> Dict:
    """Convenience function to calculate all metrics from allocation"""
    calculator = PortfolioMetrics()
    input_data = PortfolioInput(
        total_investment=total_investment,
        monthly_contribution=monthly_contribution,
        investment_horizon=investment_horizon,
        allocation=allocation,
        risk_free_rate=risk_free_rate
    )
    
    metrics = calculator.calculate_all_metrics(input_data)
    return {
        'portfolio_value': metrics.portfolio_value,
        'total_return': metrics.total_return,
        'total_return_percentage': metrics.total_return_percentage,
        'annualized_return': metrics.annualized_return,
        'volatility': metrics.volatility,
        'sharpe_ratio': metrics.sharpe_ratio,
        'max_drawdown': metrics.max_drawdown,
        'beta': metrics.beta,
        'diversification_score': metrics.diversification_score,
        'var_95': metrics.var_95,
        'var_99': metrics.var_99,
        'safety_rating': metrics.safety_rating,
        'risk_level': metrics.risk_level,
    }
