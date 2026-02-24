"""
Sensitivity Analysis Module
Analyzes how system performance varies with parameter changes
"""
import numpy as np
from typing import List, Dict, Tuple
from simulation.ed_simulation import run_single_simulation
from markov.markov_chain import MarkovChainAnalyzer

def run_sensitivity_analysis(
    base_params: Dict,
    arrival_rate_range: List[float],
    doctor_range: List[int],
    num_replications: int = 30
) -> Dict:
    """
    Run sensitivity analysis across parameter ranges
    
    Args:
        base_params: Base simulation parameters
        arrival_rate_range: List of arrival rates to test
        doctor_range: List of doctor counts to test
        num_replications: Replications per configuration
        
    Returns:
        Dictionary with sensitivity results
    """
    results = {
        "arrival_rate_sensitivity": [],
        "doctor_sensitivity": [],
        "heatmap_data": [],
        "heatmap_arrival_rates": arrival_rate_range,
        "heatmap_doctors": doctor_range
    }
    
    # Arrival rate sensitivity (holding other params constant)
    for arr_rate in arrival_rate_range:
        metrics = _run_replications(
            arrival_rate=arr_rate,
            num_doctors=base_params.get("num_doctors", 3),
            num_nurses=base_params.get("num_nurses", 5),
            num_xray=base_params.get("num_xray", 2),
            diagnostic_prob=base_params.get("diagnostic_prob", 0.4),
            critical_pct=base_params.get("critical_pct", 0.15),
            duration=base_params.get("duration", 480),
            warm_up=base_params.get("warm_up", 60),
            num_replications=num_replications
        )
        results["arrival_rate_sensitivity"].append({
            "arrival_rate": arr_rate,
            "avg_waiting_time": metrics["avg_waiting_time"],
            "avg_los": metrics["avg_los"],
            "throughput": metrics["throughput"],
            "utilization": metrics["doctor_utilization"]
        })
    
    # Doctor count sensitivity
    for num_docs in doctor_range:
        metrics = _run_replications(
            arrival_rate=base_params.get("arrival_rate", 8.0),
            num_doctors=num_docs,
            num_nurses=base_params.get("num_nurses", 5),
            num_xray=base_params.get("num_xray", 2),
            diagnostic_prob=base_params.get("diagnostic_prob", 0.4),
            critical_pct=base_params.get("critical_pct", 0.15),
            duration=base_params.get("duration", 480),
            warm_up=base_params.get("warm_up", 60),
            num_replications=num_replications
        )
        results["doctor_sensitivity"].append({
            "num_doctors": num_docs,
            "avg_waiting_time": metrics["avg_waiting_time"],
            "avg_los": metrics["avg_los"],
            "throughput": metrics["throughput"],
            "utilization": metrics["doctor_utilization"]
        })
    
    # Generate heatmap data (waiting time vs arrival rate and doctors)
    heatmap = []
    for arr_rate in arrival_rate_range:
        row = []
        for num_docs in doctor_range:
            metrics = _run_replications(
                arrival_rate=arr_rate,
                num_doctors=num_docs,
                num_nurses=base_params.get("num_nurses", 5),
                num_xray=base_params.get("num_xray", 2),
                diagnostic_prob=base_params.get("diagnostic_prob", 0.4),
                critical_pct=base_params.get("critical_pct", 0.15),
                duration=base_params.get("duration", 480),
                warm_up=base_params.get("warm_up", 60),
                num_replications=min(num_replications, 10)  # Fewer for heatmap
            )
            row.append(metrics["avg_waiting_time"])
        heatmap.append(row)
    
    results["heatmap_data"] = heatmap
    
    return results

def _run_replications(
    arrival_rate: float,
    num_doctors: int,
    num_nurses: int,
    num_xray: int,
    diagnostic_prob: float,
    critical_pct: float,
    duration: int,
    warm_up: int,
    num_replications: int
) -> Dict:
    """Run multiple replications and average results"""
    waiting_times = []
    los_values = []
    throughputs = []
    doctor_utils = []
    
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
            seed=rep * 17
        )
        waiting_times.append(result["avg_waiting_time"])
        los_values.append(result["avg_los"])
        throughputs.append(result["throughput"])
        doctor_utils.append(result["doctor_utilization"])
    
    return {
        "avg_waiting_time": float(np.mean(waiting_times)),
        "avg_los": float(np.mean(los_values)),
        "throughput": float(np.mean(throughputs)),
        "doctor_utilization": float(np.mean(doctor_utils))
    }

def compare_theoretical_vs_simulation(
    arrival_rate: float,
    service_rate: float,
    num_servers: int,
    simulation_results: Dict
) -> Dict:
    """
    Compare theoretical Markov chain results with simulation
    
    Args:
        arrival_rate: Patient arrival rate
        service_rate: Service rate per server
        num_servers: Number of servers
        simulation_results: Results from Monte Carlo simulation
        
    Returns:
        Comparison dictionary
    """
    # Get theoretical values
    analyzer = MarkovChainAnalyzer(
        arrival_rate=arrival_rate,
        service_rate=service_rate,
        num_servers=num_servers
    )
    
    theoretical = analyzer.get_mmc_theoretical_metrics()
    
    # Extract simulation values
    simulated = {
        "expected_waiting_time": simulation_results.get("avg_waiting_time", 0),
        "utilization": simulation_results.get("doctor_utilization", 0),
        "throughput": simulation_results.get("throughput", 0)
    }
    
    # Compute differences
    differences = {}
    for key in ["expected_waiting_time", "utilization"]:
        theo_val = theoretical.get(key, 0)
        sim_val = simulated.get(key, 0)
        if theo_val != 0:
            diff_pct = abs(theo_val - sim_val) / theo_val * 100
        else:
            diff_pct = 0 if sim_val == 0 else 100
        differences[key] = diff_pct
    
    return {
        "theoretical": theoretical,
        "simulated": simulated,
        "difference_percentage": differences
    }
