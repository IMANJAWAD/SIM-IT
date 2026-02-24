"""
Simulation Routes
API endpoints for running ED simulations
"""
from fastapi import APIRouter, HTTPException
from models.schemas import SimulationParams, MonteCarloResults
from simulation.monte_carlo import run_monte_carlo_simulation
import numpy as np

router = APIRouter(prefix="/simulation", tags=["Simulation"])

@router.post("/run", response_model=dict)
async def run_simulation(params: SimulationParams):
    """
    Run Monte Carlo ED simulation
    
    Returns comprehensive simulation results including:
    - Average waiting time, LOS, throughput
    - Resource utilization metrics
    - Confidence intervals
    - Distribution data for visualizations
    """
    try:
        results = run_monte_carlo_simulation(
            arrival_rate=params.arrival_rate,
            num_doctors=params.num_doctors,
            num_nurses=params.num_nurses,
            num_xray=params.num_xray_machines,
            diagnostic_prob=params.diagnostic_probability,
            critical_pct=params.critical_patient_percentage,
            duration=params.simulation_duration,
            warm_up=params.warm_up_period,
            num_replications=params.num_replications
        )
        
        return {
            "success": True,
            "metrics": {
                "avg_waiting_time": round(results.avg_waiting_time, 2),
                "avg_los": round(results.avg_los, 2),
                "throughput": round(results.throughput, 2),
                "resource_utilization": {
                    "doctors": round(results.doctor_utilization * 100, 1),
                    "nurses": round(results.nurse_utilization * 100, 1),
                    "xray": round(results.xray_utilization * 100, 1)
                },
                "steady_state_overload_probability": round(results.steady_state_overload_prob * 100, 1)
            },
            "confidence_intervals": {
                "waiting_time": [round(x, 2) for x in results.waiting_time_ci],
                "los": [round(x, 2) for x in results.los_ci],
                "throughput": [round(x, 2) for x in results.throughput_ci],
                "doctor_utilization": [round(x * 100, 1) for x in results.doctor_util_ci],
                "nurse_utilization": [round(x * 100, 1) for x in results.nurse_util_ci],
                "xray_utilization": [round(x * 100, 1) for x in results.xray_util_ci]
            },
            "distributions": {
                "waiting_times": [round(x, 2) for x in results.all_waiting_times[:500]],
                "los_values": [round(x, 2) for x in results.all_los_values[:500]],
                "queue_length_over_time": results.queue_length_over_time
            },
            "simulation_params": {
                "arrival_rate": params.arrival_rate,
                "num_doctors": params.num_doctors,
                "num_nurses": params.num_nurses,
                "num_xray_machines": params.num_xray_machines,
                "num_replications": params.num_replications,
                "simulation_duration": params.simulation_duration
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/default-params")
async def get_default_params():
    """Get default simulation parameters"""
    return {
        "arrival_rate": 8.0,
        "num_doctors": 3,
        "num_nurses": 5,
        "num_xray_machines": 2,
        "diagnostic_probability": 0.4,
        "critical_patient_percentage": 0.15,
        "simulation_duration": 480,
        "num_replications": 100,
        "warm_up_period": 60
    }
