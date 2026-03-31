"""
Factor Analysis Calculations
===========================
Fama-French multi-factor model analysis
"""

import numpy as np
from typing import Dict, List, Tuple
from dataclasses import dataclass


@dataclass
class FactorExposures:
    """Factor exposure results"""
    market_factor: float  # Market Beta
    size_factor: float    # SMB (Small Minus Big)
    value_factor: float   # HML (High Minus Low)
    momentum_factor: float # UMD (Up Minus Down)
    quality_factor: float  # RMW (Robust Minus Weak)
    low_volatility_factor: float


@dataclass
class FactorAttribution:
    """Return attribution by factor"""
    market_contribution: float
    size_contribution: float
    value_contribution: float
    momentum_contribution: float
    quality_contribution: float
    low_vol_contribution: float
    unexplained_return: float


class FactorAnalyzer:
    """
    Fama-French 5-Factor Model Analysis
    
    Factors:
    - Market (MKT-RF): Market excess return
    - Size (SMB): Small cap premium
    - Value (HML): Value premium
    - Momentum (MOM/UMD): Momentum premium
    - Quality (RMW): Profitability premium
    - Low Volatility: Low beta premium
    """
    
    # Historical factor risk premiums (annualized %)
    FACTOR_PREMIUMS = {
        'market': 5.5,      # Market excess return
        'size': 2.0,        # Small cap premium
        'value': 3.0,       # Value premium
        'momentum': 4.0,    # Momentum premium
        'quality': 2.5,     # Quality/profitability premium
        'low_volatility': 2.0,  # Low volatility anomaly
    }
    
    # Asset factor loadings (based on historical characteristics)
    ASSET_FACTOR_LOADINGS = {
        'equity': {
            'market': 1.0,
            'size': 0.3,
            'value': 0.2,
            'momentum': 0.1,
            'quality': 0.2,
            'low_volatility': -0.1,
        },
        'gold': {
            'market': 0.1,
            'size': 0.0,
            'value': 0.0,
            'momentum': 0.0,
            'quality': 0.0,
            'low_volatility': 0.3,
        },
        'silver': {
            'market': 0.15,
            'size': 0.0,
            'value': 0.0,
            'momentum': 0.1,
            'quality': 0.0,
            'low_volatility': 0.1,
        },
        'crudeOil': {
            'market': 0.2,
            'size': 0.0,
            'value': 0.0,
            'momentum': 0.2,
            'quality': -0.1,
            'low_volatility': -0.2,
        },
        'naturalGas': {
            'market': 0.25,
            'size': 0.0,
            'value': 0.0,
            'momentum': 0.15,
            'quality': -0.1,
            'low_volatility': -0.3,
        },
        'copper': {
            'market': 0.3,
            'size': 0.0,
            'value': 0.0,
            'momentum': 0.1,
            'quality': 0.0,
            'low_volatility': -0.1,
        },
        'bonds': {
            'market': -0.05,
            'size': 0.0,
            'value': 0.0,
            'momentum': 0.0,
            'quality': 0.1,
            'low_volatility': 0.4,
        },
        'crypto': {
            'market': 0.8,
            'size': 0.5,
            'value': 0.0,
            'momentum': 0.5,
            'quality': -0.2,
            'low_volatility': -0.5,
        },
        'cash': {
            'market': 0.0,
            'size': 0.0,
            'value': 0.0,
            'momentum': 0.0,
            'quality': 0.0,
            'low_volatility': 0.5,
        },
        'realEstate': {
            'market': 0.4,
            'size': 0.1,
            'value': 0.3,
            'momentum': 0.1,
            'quality': 0.2,
            'low_volatility': 0.2,
        },
        'commodities': {
            'market': 0.25,
            'size': 0.0,
            'value': 0.0,
            'momentum': 0.15,
            'quality': 0.0,
            'low_volatility': -0.1,
        },
    }
    
    def calculate_factor_exposures(self, allocation: Dict[str, float]) -> FactorExposures:
        """
        Calculate portfolio factor exposures based on allocation
        Returns factor betas (sensitivities to each factor)
        """
        exposures = {
            'market': 0.0,
            'size': 0.0,
            'value': 0.0,
            'momentum': 0.0,
            'quality': 0.0,
            'low_volatility': 0.0,
        }
        
        # Calculate weighted factor exposures
        for asset, weight in allocation.items():
            if weight <= 0:
                continue
            
            loadings = self.ASSET_FACTOR_LOADINGS.get(asset, {})
            w = weight / 100
            
            for factor in exposures.keys():
                exposures[factor] += w * loadings.get(factor, 0.0)
        
        return FactorExposures(
            market_factor=exposures['market'],
            size_factor=exposures['size'],
            value_factor=exposures['value'],
            momentum_factor=exposures['momentum'],
            quality_factor=exposures['quality'],
            low_volatility_factor=exposures['low_volatility'],
        )
    
    def calculate_factor_attribution(self, portfolio_return: float,
                                   factor_exposures: FactorExposures) -> FactorAttribution:
        """
        Attribute portfolio returns to factor exposures
        """
        # Calculate contribution from each factor
        market_contrib = factor_exposures.market_factor * self.FACTOR_PREMIUMS['market']
        size_contrib = factor_exposures.size_factor * self.FACTOR_PREMIUMS['size']
        value_contrib = factor_exposures.value_factor * self.FACTOR_PREMIUMS['value']
        momentum_contrib = factor_exposures.momentum_factor * self.FACTOR_PREMIUMS['momentum']
        quality_contrib = factor_exposures.quality_factor * self.FACTOR_PREMIUMS['quality']
        low_vol_contrib = factor_exposures.low_volatility_factor * self.FACTOR_PREMIUMS['low_volatility']
        
        # Sum of factor contributions
        explained_return = (market_contrib + size_contrib + value_contrib + 
                          momentum_contrib + quality_contrib + low_vol_contrib)
        
        # Unexplained return (alpha + noise)
        unexplained = portfolio_return - explained_return
        
        return FactorAttribution(
            market_contribution=market_contrib,
            size_contribution=size_contrib,
            value_contribution=value_contrib,
            momentum_contribution=momentum_contrib,
            quality_contribution=quality_contrib,
            low_vol_contribution=low_vol_contrib,
            unexplained_return=unexplained,
        )
    
    def calculate_factor_risk_contribution(self, factor_exposures: FactorExposures,
                                         factor_volatilities: Dict[str, float] = None) -> Dict[str, float]:
        """
        Calculate risk contribution from each factor
        """
        if factor_volatilities is None:
            # Default factor volatilities (annualized %)
            factor_volatilities = {
                'market': 15.0,
                'size': 8.0,
                'value': 10.0,
                'momentum': 12.0,
                'quality': 6.0,
                'low_volatility': 5.0,
            }
        
        risk_contrib = {}
        total_risk_squared = 0.0
        
        # Calculate variance contribution from each factor
        for factor, exposure in factor_exposures.__dict__.items():
            factor_name = factor.replace('_factor', '')
            vol = factor_volatilities.get(factor_name, 10.0) / 100
            variance_contrib = (exposure * vol) ** 2
            risk_contrib[factor_name] = variance_contrib
            total_risk_squared += variance_contrib
        
        # Convert to percentage of total risk
        if total_risk_squared > 0:
            for factor in risk_contrib:
                risk_contrib[factor] = (risk_contrib[factor] / total_risk_squared) * 100
        
        return risk_contrib
    
    def get_factor_interpretation(self, factor_exposures: FactorExposures) -> Dict[str, str]:
        """
        Get interpretation of factor exposures
        """
        interpretations = {}
        
        # Market factor
        if factor_exposures.market_factor > 0.8:
            interpretations['market'] = "High market exposure - moves closely with market"
        elif factor_exposures.market_factor < 0.3:
            interpretations['market'] = "Low market correlation - defensive positioning"
        else:
            interpretations['market'] = "Moderate market exposure"
        
        # Size factor
        if factor_exposures.size_factor > 0.3:
            interpretations['size'] = "Tilt toward small-cap assets"
        elif factor_exposures.size_factor < -0.1:
            interpretations['size'] = "Tilt toward large-cap assets"
        else:
            interpretations['size'] = "Neutral size exposure"
        
        # Value factor
        if factor_exposures.value_factor > 0.2:
            interpretations['value'] = "Value-oriented positioning"
        elif factor_exposures.value_factor < -0.1:
            interpretations['value'] = "Growth-oriented positioning"
        else:
            interpretations['value'] = "Blend value/growth exposure"
        
        # Momentum factor
        if factor_exposures.momentum_factor > 0.2:
            interpretations['momentum'] = "Momentum/trend-following exposure"
        elif factor_exposures.momentum_factor < -0.1:
            interpretations['momentum'] = "Contrarian/mean-reversion positioning"
        else:
            interpretations['momentum'] = "Neutral momentum exposure"
        
        # Quality factor
        if factor_exposures.quality_factor > 0.1:
            interpretations['quality'] = "Quality/profitability focus"
        elif factor_exposures.quality_factor < -0.1:
            interpretations['quality'] = "Higher risk/speculative tilt"
        else:
            interpretations['quality'] = "Neutral quality exposure"
        
        # Low volatility
        if factor_exposures.low_volatility_factor > 0.2:
            interpretations['low_volatility'] = "Defensive low-volatility tilt"
        elif factor_exposures.low_volatility_factor < -0.1:
            interpretations['low_volatility'] = "Aggressive high-volatility tilt"
        else:
            interpretations['low_volatility'] = "Neutral volatility exposure"
        
        return interpretations
    
    def analyze_portfolio(self, allocation: Dict[str, float],
                         portfolio_return: float) -> Dict:
        """
        Complete factor analysis of portfolio
        """
        # Calculate exposures
        exposures = self.calculate_factor_exposures(allocation)
        
        # Calculate attribution
        attribution = self.calculate_factor_attribution(portfolio_return, exposures)
        
        # Calculate risk contribution
        risk_contrib = self.calculate_factor_risk_contribution(exposures)
        
        # Get interpretations
        interpretations = self.get_factor_interpretation(exposures)
        
        return {
            'exposures': {
                'market_factor': exposures.market_factor,
                'size_factor': exposures.size_factor,
                'value_factor': exposures.value_factor,
                'momentum_factor': exposures.momentum_factor,
                'quality_factor': exposures.quality_factor,
                'low_volatility_factor': exposures.low_volatility_factor,
            },
            'attribution': {
                'market_contribution': attribution.market_contribution,
                'size_contribution': attribution.size_contribution,
                'value_contribution': attribution.value_contribution,
                'momentum_contribution': attribution.momentum_contribution,
                'quality_contribution': attribution.quality_contribution,
                'low_vol_contribution': attribution.low_vol_contribution,
                'unexplained_return': attribution.unexplained_return,
            },
            'risk_contribution': risk_contrib,
            'interpretations': interpretations,
        }


def run_factor_analysis(allocation: Dict[str, float],
                       portfolio_return: float) -> Dict:
    """Convenience function to run complete factor analysis"""
    analyzer = FactorAnalyzer()
    return analyzer.analyze_portfolio(allocation, portfolio_return)
