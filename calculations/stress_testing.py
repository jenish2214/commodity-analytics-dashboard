"""
Stress Testing Calculations
============================
Portfolio stress testing under various market scenarios
"""

import numpy as np
from typing import Dict, List, Tuple
from dataclasses import dataclass


@dataclass
class StressTestResults:
    """Stress test results for different scenarios"""
    market_crash: float  # 2008-style crisis
    inflation_spike: float
    interest_rate_rise: float
    geopolitical_crisis: float
    pandemic_scenario: float
    worst_case: float


@dataclass
class ScenarioShocks:
    """Define market shocks for different asset classes under scenarios"""
    equity_shock: float
    bond_shock: float
    gold_shock: float
    commodity_shock: float
    real_estate_shock: float
    crypto_shock: float
    cash_shock: float


class StressTester:
    """Perform stress tests on portfolios"""
    
    # Historical scenario definitions
    SCENARIOS = {
        'market_crash': ScenarioShocks(
            equity_shock=-40.0,      # 2008-style crash
            bond_shock=5.0,          # Flight to safety
            gold_shock=15.0,         # Safe haven bid
            commodity_shock=-25.0,   # Demand destruction
            real_estate_shock=-30.0, # Property crash
            crypto_shock=-60.0,      # Risk-off
            cash_shock=0.0
        ),
        'inflation_spike': ScenarioShocks(
            equity_shock=-15.0,      # Earnings compression
            bond_shock=-20.0,        # Rates up, prices down
            gold_shock=20.0,         # Inflation hedge
            commodity_shock=30.0,   # Input costs rise
            real_estate_shock=10.0,  # Nominal appreciation
            crypto_shock=-10.0,      # Real rates rise
            cash_shock=-5.0          # Purchasing power loss
        ),
        'interest_rate_rise': ScenarioShocks(
            equity_shock=-20.0,      # Discount rates rise
            bond_shock=-15.0,        # Duration risk
            gold_shock=-10.0,        # Opportunity cost
            commodity_shock=-5.0,
            real_estate_shock=-15.0, # Mortgage rates up
            crypto_shock=-25.0,      # Risk assets hit
            cash_shock=2.0           # Yield improvement
        ),
        'geopolitical_crisis': ScenarioShocks(
            equity_shock=-25.0,      # Risk-off
            bond_shock=3.0,          # Partial safe haven
            gold_shock=25.0,         # Crisis hedge
            commodity_shock=40.0,    # Supply disruptions (oil)
            real_estate_shock=-10.0,
            crypto_shock=-30.0,
            cash_shock=0.0
        ),
        'pandemic_scenario': ScenarioShocks(
            equity_shock=-35.0,      # Economic shutdown
            bond_shock=5.0,          # Central bank support
            gold_shock=10.0,
            commodity_shock=-20.0,   # Demand collapse
            real_estate_shock=-15.0,
            crypto_shock=-40.0,
            cash_shock=0.0
        ),
    }
    
    def __init__(self):
        self.asset_mapping = {
            'equity': 'equity_shock',
            'gold': 'gold_shock',
            'silver': 'commodity_shock',
            'crudeOil': 'commodity_shock',
            'naturalGas': 'commodity_shock',
            'copper': 'commodity_shock',
            'bonds': 'bond_shock',
            'crypto': 'crypto_shock',
            'cash': 'cash_shock',
            'realEstate': 'real_estate_shock',
            'commodities': 'commodity_shock',
        }
    
    def apply_scenario(self, portfolio_value: float, allocation: Dict[str, float],
                      shocks: ScenarioShocks) -> float:
        """Apply shock scenario to portfolio"""
        total_return = 0.0
        
        for asset, weight in allocation.items():
            if weight <= 0:
                continue
            
            # Get the shock for this asset type
            shock_attr = self.asset_mapping.get(asset, 'equity_shock')
            shock = getattr(shocks, shock_attr, 0.0)
            
            # Apply weight
            weighted_shock = (weight / 100) * shock
            total_return += weighted_shock
        
        # Calculate new portfolio value
        stressed_value = portfolio_value * (1 + total_return / 100)
        return max(0, stressed_value)
    
    def run_all_stress_tests(self, portfolio_value: float, 
                           allocation: Dict[str, float]) -> StressTestResults:
        """Run all stress test scenarios"""
        results = {}
        
        for scenario_name, shocks in self.SCENARIOS.items():
            stressed_value = self.apply_scenario(portfolio_value, allocation, shocks)
            results[scenario_name] = stressed_value
        
        # Worst case is the minimum of all scenarios
        worst_case = min(results.values())
        results['worst_case'] = worst_case
        
        return StressTestResults(
            market_crash=results['market_crash'],
            inflation_spike=results['inflation_spike'],
            interest_rate_rise=results['interest_rate_rise'],
            geopolitical_crisis=results['geopolitical_crisis'],
            pandemic_scenario=results['pandemic_scenario'],
            worst_case=results['worst_case']
        )
    
    def calculate_scenario_decline(self, portfolio_value: float, 
                                 stressed_value: float) -> float:
        """Calculate percentage decline in scenario"""
        if portfolio_value <= 0:
            return 0.0
        return ((portfolio_value - stressed_value) / portfolio_value) * 100
    
    def get_scenario_probabilities(self, scenario_name: str) -> Dict[str, float]:
        """Get estimated probability of scenario occurrence"""
        probabilities = {
            'market_crash': {'probability': 5.0, 'severity': 'High'},  # ~1 in 20 years
            'inflation_spike': {'probability': 15.0, 'severity': 'Medium'},
            'interest_rate_rise': {'probability': 25.0, 'severity': 'Medium'},
            'geopolitical_crisis': {'probability': 10.0, 'severity': 'High'},
            'pandemic_scenario': {'probability': 2.0, 'severity': 'Very High'},
            'worst_case': {'probability': 1.0, 'severity': 'Extreme'},
        }
        return probabilities.get(scenario_name, {'probability': 5.0, 'severity': 'Unknown'})
    
    def calculate_expected_stress_loss(self, portfolio_value: float,
                                    allocation: Dict[str, float]) -> float:
        """Calculate probability-weighted expected stress loss"""
        results = self.run_all_stress_tests(portfolio_value, allocation)
        
        weighted_loss = 0.0
        total_weight = 0.0
        
        for scenario_name in ['market_crash', 'inflation_spike', 
                             'interest_rate_rise', 'geopolitical_crisis',
                             'pandemic_scenario']:
            scenario_value = getattr(results, scenario_name)
            loss = portfolio_value - scenario_value
            prob_info = self.get_scenario_probabilities(scenario_name)
            probability = prob_info['probability'] / 100
            
            weighted_loss += loss * probability
            total_weight += probability
        
        if total_weight > 0:
            return weighted_loss / total_weight
        return 0.0
    
    def generate_stress_report(self, portfolio_value: float,
                             allocation: Dict[str, float]) -> Dict:
        """Generate comprehensive stress test report"""
        results = self.run_all_stress_tests(portfolio_value, allocation)
        
        report = {
            'scenarios': {},
            'summary': {}
        }
        
        # Individual scenarios
        for scenario_name in ['market_crash', 'inflation_spike',
                            'interest_rate_rise', 'geopolitical_crisis',
                            'pandemic_scenario', 'worst_case']:
            stressed_value = getattr(results, scenario_name)
            decline = self.calculate_scenario_decline(portfolio_value, stressed_value)
            prob_info = self.get_scenario_probabilities(scenario_name)
            
            report['scenarios'][scenario_name] = {
                'value': stressed_value,
                'decline_pct': decline,
                'probability': prob_info['probability'],
                'severity': prob_info['severity']
            }
        
        # Summary statistics
        scenario_values = [getattr(results, name) for name in 
                         ['market_crash', 'inflation_spike', 'interest_rate_rise',
                          'geopolitical_crisis', 'pandemic_scenario']]
        
        report['summary'] = {
            'average_stressed_value': np.mean(scenario_values),
            'median_stressed_value': np.median(scenario_values),
            'max_decline': max([portfolio_value - v for v in scenario_values]),
            'expected_stress_loss': self.calculate_expected_stress_loss(portfolio_value, allocation),
            'capital_resilience_score': self._calculate_resilience_score(portfolio_value, results)
        }
        
        return report
    
    def _calculate_resilience_score(self, portfolio_value: float, 
                                  results: StressTestResults) -> float:
        """Calculate portfolio resilience score (0-100)"""
        # Based on worst case scenario
        worst_case = results.worst_case
        
        if worst_case <= 0:
            return 0.0
        
        # Score based on how much capital is preserved in worst case
        preservation_ratio = worst_case / portfolio_value
        score = preservation_ratio * 100
        
        # Bonus for diversification (lower worst case relative to single scenario)
        avg_stressed = np.mean([
            results.market_crash, results.inflation_spike,
            results.interest_rate_rise, results.geopolitical_crisis,
            results.pandemic_scenario
        ])
        
        if avg_stressed > worst_case * 1.5:
            score += 10  # Diversification bonus
        
        return min(100, max(0, score))


def run_stress_tests(portfolio_value: float, allocation: Dict[str, float]) -> Dict:
    """Convenience function to run all stress tests"""
    tester = StressTester()
    return tester.generate_stress_report(portfolio_value, allocation)
