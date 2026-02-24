"""
Monte Carlo Simulation Engine
Runs multiple simulation replications and computes statistics with confidence intervals
"""
import numpy as np
from typing import List, Dict, Tuple, Optional
from concurrent.futures import ProcessPoolExecutor, as_completed
from dataclasses import dataclass
import multiprocessing
from simulation.ed_simulation import run_single_simulation

@dataclass
class MonteCarloResults:
    """Results from Monte Carlo simulation"""
    # Mean values
    avg_waiting_time: float
    avg_los: float
    throughput: float
    doctor_utilization: float
    nurse_utilization: float
    xray_utilization: float
    
    # Confidence intervals (95%)
    waiting_time_ci: Tuple[float, float]
    los_ci: Tuple[float, float]
    throughput_ci: Tuple[float, float]
    doctor_util_ci: Tuple[float, float]
    nurse_util_ci: Tuple[float, float]
    xray_util_ci: Tuple[float, float]
    
    # Distributions
    all_waiting_times: List[float]
    all_los_values: List[float]
    queue_length_over_time: List[Dict]
    
    # Additional metrics
    steady_state_overload_prob: float
    replication_results: List[Dict]

def compute_confidence_interval(
    data: List[float], 
    confidence: float = 0.95
) -> Tuple[float, float]:
    """
    Compute confidence interval for sample mean
    
    Uses t-distribution for small samples, normal for large
    
    Args:
        data: Sample data
        confidence: Confidence level (default 95%)
        
    Returns:
        Tuple of (lower_bound, upper_bound)
    """
    if len(data) < 2:
        mean = np.mean(data) if data else 0
        return (mean, mean)
    
    from scipy import stats
    
    n = len(data)
    mean = np.mean(data)
    se = stats.sem(data)  # Standard error
    
    # Use t-distribution
    alpha = 1 - confidence
    t_crit = stats.t.ppf(1 - alpha/2, df=n-1)
    
    margin = t_crit * se
    return (mean - margin, mean + margin)

def run_monte_carlo_simulation(
    arrival_rate: float,
    num_doctors: int,
    num_nurses: int,
    num_xray: int,
    diagnostic_prob: float,
    critical_pct: float,
    duration: int,
    warm_up: int,
    num_replications: int = 100,
    use_parallel: bool = False
) -> MonteCarloResults:
    """
    Run Monte Carlo simulation with multiple replications
    
    Args:
        arrival_rate: Patient arrival rate
        num_doctors: Number of doctors
        num_nurses: Number of nurses
        num_xray: Number of X-ray machines
        diagnostic_prob: Probability of needing diagnostics
        critical_pct: Percentage of critical patients
        duration: Simulation duration (minutes)
        warm_up: Warm-up period (minutes)
        num_replications: Number of simulation runs
        use_parallel: Whether to use parallel processing
        
    Returns:
        MonteCarloResults with aggregated statistics
    """
    replication_results = []
    
    # Run replications
    for rep in range(num_replications):
        result = run_single_simulation(
            arrival_rate=arrival_rate,
            num_doctors=num_doctors,
            num_nurses=num_nurses,
            num_xray=num_xray,
            diagnostic_prob=diagnostic_prob,
            critical_pct=critical_pct,
            duration=duration,
            warm_up=warm_up,
            seed=rep * 42  # Different seed for each replication
        )
        replication_results.append(result)
    
    # Extract metrics from all replications
    waiting_times = [r["avg_waiting_time"] for r in replication_results]
    los_values = [r["avg_los"] for r in replication_results]
    throughputs = [r["throughput"] for r in replication_results]
    doctor_utils = [r["doctor_utilization"] for r in replication_results]
    nurse_utils = [r["nurse_utilization"] for r in replication_results]
    xray_utils = [r["xray_utilization"] for r in replication_results]
    
    # Aggregate all individual waiting times and LOS values
    all_waiting_times = []
    all_los_values = []
    for r in replication_results:
        all_waiting_times.extend(r["waiting_times"])
        all_los_values.extend(r["los_values"])
    
    # Compute queue length over time (averaged)
    queue_length_over_time = compute_average_queue_length(replication_results, duration)
    
    # Compute steady-state overload probability
    # (proportion of time queue > threshold)
    overload_threshold = 10
    overload_counts = []
    for r in replication_results:
        if r["queue_lengths"]:
            queue_vals = [q[1] for q in r["queue_lengths"]]
            overload_pct = sum(1 for q in queue_vals if q > overload_threshold) / len(queue_vals)
            overload_counts.append(overload_pct)
    steady_state_overload = np.mean(overload_counts) if overload_counts else 0
    
    return MonteCarloResults(
        avg_waiting_time=np.mean(waiting_times),
        avg_los=np.mean(los_values),
        throughput=np.mean(throughputs),
        doctor_utilization=np.mean(doctor_utils),
        nurse_utilization=np.mean(nurse_utils),
        xray_utilization=np.mean(xray_utils),
        waiting_time_ci=compute_confidence_interval(waiting_times),
        los_ci=compute_confidence_interval(los_values),
        throughput_ci=compute_confidence_interval(throughputs),
        doctor_util_ci=compute_confidence_interval(doctor_utils),
        nurse_util_ci=compute_confidence_interval(nurse_utils),
        xray_util_ci=compute_confidence_interval(xray_utils),
        all_waiting_times=all_waiting_times[:1000],  # Limit for API response
        all_los_values=all_los_values[:1000],
        queue_length_over_time=queue_length_over_time,
        steady_state_overload_prob=steady_state_overload,
        replication_results=replication_results
    )

def compute_average_queue_length(
    results: List[Dict], 
    duration: int,
    num_points: int = 100
) -> List[Dict]:
    """
    Compute time-averaged queue length across replications
    """
    time_points = np.linspace(0, duration, num_points)
    avg_queue = []
    
    for t in time_points:
        queue_at_t = []
        for r in results:
            # Find queue length at time t
            queue_lengths = r["queue_lengths"]
            if not queue_lengths:
                continue
            
            # Find last recorded queue length before time t
            prev_queue = 0
            for time, q in queue_lengths:
                if time <= t:
                    prev_queue = q
                else:
                    break
            queue_at_t.append(prev_queue)
        
        if queue_at_t:
            avg_queue.append({
                "time": float(t),
                "avg_queue": float(np.mean(queue_at_t)),
                "min_queue": float(np.min(queue_at_t)),
                "max_queue": float(np.max(queue_at_t))
            })
    
    return avg_queue
