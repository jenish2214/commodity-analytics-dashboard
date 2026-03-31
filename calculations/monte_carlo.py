"""
Monte Carlo Simulation Calculations
====================================
Monte Carlo methods for portfolio projection and probability analysis
"""

import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass


@dataclass
class MonteCarloResults:
    """Results from Monte Carlo simulation"""
    probability_of_profit: float
    probability_of_loss: float
    probability_of_target_return: float
    expected_value: float
    percentile_5: float
    percentile_95: float
    median_value: float
    mean_value: float
    std_deviation: float
    all_paths: Optional[np.ndarray] = None


class MonteCarloSimulator:
    """Monte Carlo simulation for portfolio projections"""
    
    def __init__(self, n_simulations: int = 10000, seed: Optional[int] = None):
        self.n_simulations = n_simulations
        if seed is not None:
            np.random.seed(seed)
    
    def simulate_geometric_brownian_motion(self, S0: float, mu: float, sigma: float,
                                          T: int, n_steps: int = 12) -> np.ndarray:
        """
        Simulate Geometric Brownian Motion for portfolio value
        
        Parameters:
        -----------
        S0 : float
            Initial portfolio value
        mu : float
            Expected annual return (decimal)
        sigma : float
            Annual volatility (decimal)
        T : int
            Time horizon in years
        n_steps : int
            Number of steps per year (default 12 for monthly)
        """
        dt = 1.0 / n_steps
        total_steps = T * n_steps
        
        # Initialize paths array
        paths = np.zeros((self.n_simulations, total_steps + 1))
        paths[:, 0] = S0
        
        # Generate random shocks
        Z = np.random.standard_normal((self.n_simulations, total_steps))
        
        # Simulate paths
        for t in range(1, total_steps + 1):
            paths[:, t] = paths[:, t-1] * np.exp(
                (mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * Z[:, t-1]
            )
        
        return paths
    
    def simulate_with_contributions(self, initial_value: float,
                                   annual_contribution: float,
                                   mu: float, sigma: float,
                                   T: int, n_steps: int = 12) -> np.ndarray:
        """
        Simulate portfolio with periodic contributions
        
        Parameters:
        -----------
        initial_value : float
            Initial portfolio value
        annual_contribution : float
            Total annual contribution
        mu : float
            Expected annual return (decimal)
        sigma : float
            Annual volatility (decimal)
        T : int
            Time horizon in years
        """
        dt = 1.0 / n_steps
        total_steps = T * n_steps
        contribution_per_step = annual_contribution / n_steps
        
        # Initialize paths
        paths = np.zeros((self.n_simulations, total_steps + 1))
        paths[:, 0] = initial_value
        
        # Generate random shocks
        Z = np.random.standard_normal((self.n_simulations, total_steps))
        
        # Simulate with contributions
        for t in range(1, total_steps + 1):
            # Portfolio growth
            growth_factor = np.exp(
                (mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * Z[:, t-1]
            )
            
            # Add contribution
            paths[:, t] = paths[:, t-1] * growth_factor + contribution_per_step
        
        return paths
    
    def calculate_statistics(self, paths: np.ndarray, 
                            target_value: Optional[float] = None) -> MonteCarloResults:
        """Calculate statistics from simulated paths"""
        final_values = paths[:, -1]
        initial_value = paths[0, 0]
        
        # Probabilities
        profitable = final_values > initial_value
        probability_of_profit = np.mean(profitable) * 100
        probability_of_loss = 100 - probability_of_profit
        
        # Target return probability
        if target_value is not None:
            hit_target = final_values >= target_value
            prob_target = np.mean(hit_target) * 100
        else:
            # Default: 2x initial value
            hit_target = final_values >= initial_value * 2
            prob_target = np.mean(hit_target) * 100
        
        # Statistics
        expected_value = np.mean(final_values)
        median_value = np.median(final_values)
        percentile_5 = np.percentile(final_values, 5)
        percentile_95 = np.percentile(final_values, 95)
        std_deviation = np.std(final_values)
        
        return MonteCarloResults(
            probability_of_profit=probability_of_profit,
            probability_of_loss=probability_of_loss,
            probability_of_target_return=prob_target,
            expected_value=expected_value,
            percentile_5=percentile_5,
            percentile_95=percentile_95,
            median_value=median_value,
            mean_value=expected_value,
            std_deviation=std_deviation,
            all_paths=paths
        )
    
    def run_portfolio_simulation(self, initial_value: float,
                                monthly_contribution: float,
                                annual_return: float,
                                volatility: float,
                                years: int,
                                target_return_pct: Optional[float] = None) -> MonteCarloResults:
        """
        Run complete Monte Carlo simulation for a portfolio
        
        Parameters:
        -----------
        initial_value : float
            Initial portfolio investment
        monthly_contribution : float
            Monthly contribution amount
        annual_return : float
            Expected annual return (percentage)
        volatility : float
            Annual volatility (percentage)
        years : int
            Investment horizon in years
        target_return_pct : float, optional
            Target return percentage (e.g., 50 for 50% return)
        """
        # Convert percentages to decimals
        mu = annual_return / 100
        sigma = volatility / 100
        
        # Annual contribution
        annual_contribution = monthly_contribution * 12
        
        # Run simulation with contributions
        if annual_contribution > 0:
            paths = self.simulate_with_contributions(
                initial_value, annual_contribution, mu, sigma, years
            )
        else:
            paths = self.simulate_geometric_brownian_motion(
                initial_value, mu, sigma, years
            )
        
        # Calculate target value
        target_value = None
        if target_return_pct is not None:
            target_value = initial_value * (1 + target_return_pct / 100)
        
        # Calculate and return statistics
        return self.calculate_statistics(paths, target_value)
    
    def get_percentile_paths(self, paths: np.ndarray, 
                            percentiles: List[float] = [5, 25, 50, 75, 95]) -> Dict[float, np.ndarray]:
        """Get specific percentile paths over time"""
        result = {}
        for p in percentiles:
            # For each time step, calculate the percentile
            result[p] = np.percentile(paths, p, axis=0)
        return result
    
    def calculate_value_at_risk_mc(self, initial_value: float,
                                  annual_return: float,
                                  volatility: float,
                                  years: int,
                                  confidence: float = 0.95) -> float:
        """Calculate VaR using Monte Carlo simulation"""
        paths = self.simulate_geometric_brownian_motion(
            initial_value, annual_return / 100, volatility / 100, years
        )
        
        final_values = paths[:, -1]
        var_percentile = (1 - confidence) * 100
        var_value = np.percentile(final_values, var_percentile)
        
        return var_value - initial_value  # Negative for loss
    
    def generate_projection_data(self, initial_value: float,
                               monthly_contribution: float,
                               annual_return: float,
                               volatility: float,
                               years: int) -> List[Dict]:
        """
        Generate projection data for charting
        Returns yearly data points with optimistic, expected, and pessimistic scenarios
        """
        paths = self.run_portfolio_simulation(
            initial_value, monthly_contribution, annual_return, volatility, years
        )
        
        if paths.all_paths is None:
            return []
        
        # Get percentile paths
        percentile_paths = self.get_percentile_paths(paths.all_paths)
        
        # Generate yearly data
        data = []
        n_steps = paths.all_paths.shape[1] - 1
        steps_per_year = n_steps // years
        
        for year in range(years + 1):
            step = year * steps_per_year
            if step <= n_steps:
                data.append({
                    'year': year,
                    'expected': float(percentile_paths[50][step]),
                    'optimistic': float(percentile_paths[95][step]),
                    'pessimistic': float(percentile_paths[5][step]),
                    'worst_case': float(percentile_paths[1][step]) if 1 in percentile_paths else float(percentile_paths[5][step]) * 0.9,
                })
        
        return data


def run_monte_carlo_analysis(initial_value: float = 100000,
                            monthly_contribution: float = 1000,
                            annual_return: float = 10.0,
                            volatility: float = 15.0,
                            years: int = 10,
                            target_return_pct: float = 50.0,
                            n_simulations: int = 10000) -> Dict:
    """
    Convenience function to run complete Monte Carlo analysis
    """
    simulator = MonteCarloSimulator(n_simulations=n_simulations, seed=42)
    
    results = simulator.run_portfolio_simulation(
        initial_value=initial_value,
        monthly_contribution=monthly_contribution,
        annual_return=annual_return,
        volatility=volatility,
        years=years,
        target_return_pct=target_return_pct
    )
    
    # Generate projection data for charts
    projection_data = simulator.generate_projection_data(
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
        'projection_data': projection_data
    }
