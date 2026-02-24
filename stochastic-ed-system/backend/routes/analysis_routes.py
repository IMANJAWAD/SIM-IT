"""
Sensitivity Analysis Routes
API endpoints for sensitivity analysis and comparisons
"""
import math
from fastapi import APIRouter, HTTPException
from models.schemas import SensitivityParams
from analysis.sensitivity import run_sensitivity_analysis, compare_theoretical_vs_simulation
from simulation.monte_carlo import run_monte_carlo_simulation

router = APIRouter(prefix="/analysis", tags=["Analysis"])

def sanitize_float(value, default=0.0):
    """Replace inf/nan with a safe default value"""
    if math.isnan(value) or math.isinf(value):
        return default
    return value

def safe_round(value, decimals=2, default=0.0):
    """Round a value safely, handling inf/nan"""
    return round(sanitize_float(value, default), decimals)

@router.post("/sensitivity")
async def perform_sensitivity_analysis(params: SensitivityParams):
    """
    Run sensitivity analysis across parameter ranges
    
    Returns:
    - Impact of arrival rate on system metrics
    - Impact of doctor count on system metrics
    - Heatmap data for combined effects
    """
    try:
        base_params = {
            "arrival_rate": params.base_arrival_rate,
            "num_doctors": 3,
            "num_nurses": 5,
            "num_xray": 2,
            "diagnostic_prob": 0.4,
            "critical_pct": 0.15,
            "duration": 480,
            "warm_up": 60
        }
        
        results = run_sensitivity_analysis(
            base_params=base_params,
            arrival_rate_range=params.arrival_rate_range,
            doctor_range=params.doctor_range,
            num_replications=params.num_replications
        )
        
        return {
            "success": True,
            "arrival_rate_sensitivity": results["arrival_rate_sensitivity"],
            "doctor_sensitivity": results["doctor_sensitivity"],
            "heatmap": {
                "data": [[round(x, 2) for x in row] for row in results["heatmap_data"]],
                "x_labels": [f"{d} docs" for d in results["heatmap_doctors"]],
                "y_labels": [f"λ={r}" for r in results["heatmap_arrival_rates"]],
                "arrival_rates": results["heatmap_arrival_rates"],
                "doctors": results["heatmap_doctors"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compare")
async def compare_theoretical_simulation(
    arrival_rate: float = 8.0,
    service_rate: float = 3.0,
    num_servers: int = 3,
    num_replications: int = 50
):
    """
    Compare theoretical (Markov) vs simulation results
    
    Demonstrates the convergence of simulation to theoretical values
    """
    try:
        # Run simulation
        sim_results = run_monte_carlo_simulation(
            arrival_rate=arrival_rate,
            num_doctors=num_servers,
            num_nurses=5,
            num_xray=2,
            diagnostic_prob=0.4,
            critical_pct=0.15,
            duration=480,
            warm_up=60,
            num_replications=num_replications
        )
        
        # Compare with theoretical
        comparison = compare_theoretical_vs_simulation(
            arrival_rate=arrival_rate,
            service_rate=service_rate,
            num_servers=num_servers,
            simulation_results={
                "avg_waiting_time": sim_results.avg_waiting_time,
                "doctor_utilization": sim_results.doctor_utilization,
                "throughput": sim_results.throughput
            }
        )
        
        return {
            "success": True,
            "theoretical": {
                "expected_waiting_time": round(comparison["theoretical"].get("expected_waiting_time", 0), 2),
                "utilization": round(comparison["theoretical"].get("utilization", 0) * 100, 1),
                "probability_of_delay": round(comparison["theoretical"].get("probability_of_delay", 0) * 100, 1),
                "expected_queue_length": round(comparison["theoretical"].get("expected_queue_length", 0), 2)
            },
            "simulated": {
                "expected_waiting_time": round(sim_results.avg_waiting_time, 2),
                "utilization": round(sim_results.doctor_utilization * 100, 1),
                "throughput": round(sim_results.throughput, 2),
                "avg_los": round(sim_results.avg_los, 2)
            },
            "confidence_intervals": {
                "waiting_time": [round(x, 2) for x in sim_results.waiting_time_ci],
                "utilization": [round(x * 100, 1) for x in sim_results.doctor_util_ci]
            },
            "difference_percentage": {
                k: round(v, 1) for k, v in comparison["difference_percentage"].items()
            },
            "parameters": {
                "arrival_rate": arrival_rate,
                "service_rate": service_rate,
                "num_servers": num_servers,
                "num_replications": num_replications
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/long-term-behavior")
async def analyze_long_term_behavior(
    arrival_rate: float = 8.0,
    service_rate: float = 3.0,
    num_servers: int = 3
):
    """
    Analyze long-term steady-state behavior of the system
    
    Returns theoretical steady-state metrics from Markov chain analysis
    """
    from markov.markov_chain import MarkovChainAnalyzer
    
    try:
        analyzer = MarkovChainAnalyzer(
            arrival_rate=arrival_rate,
            service_rate=service_rate,
            num_servers=num_servers,
            max_capacity=30
        )
        
        results = analyzer.compute_performance_metrics()
        theoretical = analyzer.get_mmc_theoretical_metrics()
        
        # Find most probable state
        steady_state = results.steady_state_probs
        most_probable_state = int(steady_state.argmax())
        
        return {
            "stability_analysis": {
                "traffic_intensity": safe_round(results.rho, 4),
                "is_stable": results.is_stable,
                "stability_formula": f"ρ = λ/(cμ) = {arrival_rate}/({num_servers}×{service_rate}) = {safe_round(results.rho, 4)}",
                "interpretation": "System reaches steady state" if results.is_stable else "Queue grows without bound"
            },
            "steady_state_probabilities": {
                "empty_system": safe_round(results.prob_empty * 100, 2),
                "waiting_required": safe_round(results.prob_waiting * 100, 2),
                "congestion": safe_round(results.prob_congestion * 100, 2),
                "most_probable_state": most_probable_state,
                "most_probable_state_prob": safe_round(float(steady_state[most_probable_state]) * 100, 2)
            },
            "long_term_metrics": {
                "expected_queue_length": safe_round(results.expected_queue_length, 2),
                "expected_waiting_time_minutes": safe_round(results.expected_waiting_time, 2),
                "expected_system_time_minutes": safe_round(results.expected_system_time, 2),
                "expected_patients_in_system": safe_round(results.expected_system_size, 2)
            },
            "erlang_c_metrics": {
                "probability_of_delay": safe_round(theoretical.get("probability_of_delay", 0) * 100, 2),
                "expected_waiting_time": safe_round(theoretical.get("expected_waiting_time", 0), 2)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
