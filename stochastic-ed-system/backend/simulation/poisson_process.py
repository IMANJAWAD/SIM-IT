"""
Poisson Process Implementation for Patient Arrivals
Implements both homogeneous and non-homogeneous Poisson processes
"""
import numpy as np
from typing import List, Callable, Optional

class PoissonProcess:
    """
    Poisson Process generator for patient arrivals in ED
    
    The Poisson process is characterized by:
    - Events occurring randomly over time
    - Inter-arrival times following exponential distribution
    - Number of arrivals in interval follows Poisson distribution
    """
    
    def __init__(self, base_rate: float, seed: Optional[int] = None):
        """
        Initialize Poisson Process
        
        Args:
            base_rate: Base arrival rate λ (patients per hour)
            seed: Random seed for reproducibility
        """
        self.base_rate = base_rate
        self.rng = np.random.default_rng(seed)
    
    def generate_interarrival_time(self) -> float:
        """
        Generate a single interarrival time using exponential distribution
        
        For Poisson process with rate λ:
        Inter-arrival times ~ Exp(λ)
        E[T] = 1/λ
        
        Returns:
            Interarrival time in minutes
        """
        # Convert hourly rate to per-minute rate
        rate_per_minute = self.base_rate / 60.0
        return self.rng.exponential(1.0 / rate_per_minute)
    
    def generate_arrivals(self, duration: float) -> List[float]:
        """
        Generate arrival times over a given duration
        
        Args:
            duration: Total simulation duration in minutes
            
        Returns:
            List of arrival times
        """
        arrivals = []
        current_time = 0.0
        
        while current_time < duration:
            interarrival = self.generate_interarrival_time()
            current_time += interarrival
            if current_time < duration:
                arrivals.append(current_time)
        
        return arrivals
    
    def generate_nhpp_arrivals(
        self, 
        duration: float, 
        rate_function: Callable[[float], float],
        max_rate: Optional[float] = None
    ) -> List[float]:
        """
        Generate Non-Homogeneous Poisson Process arrivals using thinning algorithm
        
        This implements time-varying arrival rates (e.g., rush hours)
        
        Args:
            duration: Simulation duration in minutes
            rate_function: Function λ(t) returning rate at time t
            max_rate: Maximum rate for thinning (if None, estimated)
            
        Returns:
            List of arrival times
        """
        if max_rate is None:
            # Estimate max rate by sampling
            times = np.linspace(0, duration, 100)
            max_rate = max(rate_function(t) for t in times) * 1.1
        
        arrivals = []
        current_time = 0.0
        
        # Use thinning algorithm
        while current_time < duration:
            # Generate potential arrival with max rate
            interarrival = self.rng.exponential(60.0 / max_rate)
            current_time += interarrival
            
            if current_time >= duration:
                break
            
            # Accept with probability λ(t)/λ_max
            current_rate = rate_function(current_time)
            acceptance_prob = current_rate / max_rate
            
            if self.rng.random() < acceptance_prob:
                arrivals.append(current_time)
        
        return arrivals
    
    def get_expected_arrivals(self, duration: float) -> float:
        """
        Calculate expected number of arrivals
        
        E[N(t)] = λt
        
        Args:
            duration: Duration in minutes
            
        Returns:
            Expected number of arrivals
        """
        return self.base_rate * (duration / 60.0)
    
    def get_arrival_probability(self, n: int, duration: float) -> float:
        """
        Calculate probability of exactly n arrivals in duration
        
        P(N(t) = n) = (λt)^n * e^(-λt) / n!
        
        Args:
            n: Number of arrivals
            duration: Duration in minutes
            
        Returns:
            Probability
        """
        lambda_t = self.base_rate * (duration / 60.0)
        from scipy.stats import poisson
        return poisson.pmf(n, lambda_t)


def create_time_varying_rate(
    base_rate: float,
    peak_multiplier: float = 2.0,
    peak_start_hour: float = 9.0,
    peak_end_hour: float = 17.0
) -> Callable[[float], float]:
    """
    Create a time-varying arrival rate function
    
    Simulates typical ED patterns with higher arrivals during day
    
    Args:
        base_rate: Base arrival rate
        peak_multiplier: How much higher during peak
        peak_start_hour: Start of peak period (hour of day)
        peak_end_hour: End of peak period
        
    Returns:
        Rate function λ(t)
    """
    def rate_function(t_minutes: float) -> float:
        # Convert to hour of day (assuming simulation starts at midnight)
        hour = (t_minutes / 60.0) % 24
        
        if peak_start_hour <= hour < peak_end_hour:
            # Smooth transition using sine curve
            progress = (hour - peak_start_hour) / (peak_end_hour - peak_start_hour)
            multiplier = 1 + (peak_multiplier - 1) * np.sin(progress * np.pi)
            return base_rate * multiplier
        else:
            return base_rate
    
    return rate_function
