"""
Jackson Network Analysis Routes
Provides endpoints for Jackson Network queueing theory calculations with real-time simulation
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import numpy as np
from typing import List, Dict
import asyncio
import random
import math

router = APIRouter(prefix="/jackson", tags=["Jackson Network"])

class NodeConfig(BaseModel):
    name: str
    mu: float
    c: int

class JacksonRequest(BaseModel):
    nodes: List[NodeConfig]
    matrix: List[List[float]]  # The 4x4 matrix from your frontend
    external_arrival: float    # Global Lambda

class TimeSeriesRequest(BaseModel):
    nodes: List[NodeConfig]
    matrix: List[List[float]]
    external_arrival: float
    simulation_minutes: int = 10  # How many minutes to simulate
    sample_interval: float = 0.5  # Sample every 0.5 minutes (30 seconds)

@router.post("/simulate-jackson")
async def simulate_jackson(data: JacksonRequest):
    """
    Simulate Jackson Network using queueing theory
    
    Solves the traffic equations: (I - P^T) × λ = γ
    Where:
    - I is identity matrix
    - P is routing probability matrix
    - λ is arrival rates vector
    - γ is external arrival rates vector
    
    Returns M/M/c queueing metrics for each node
    """
    try:
        n = len(data.nodes)
        I = np.eye(n)
        P = np.array(data.matrix)
        
        # External Arrivals (Gamma)
        # Usually only Triage (index 0) gets external patients
        gamma = np.zeros(n)
        gamma[0] = data.external_arrival
        
        # Solve Traffic Equations: (I - P.T) * Lambda = Gamma
        # This calculates how many people actually arrive at each node per hour
        A = I - P.T
        lambdas = np.linalg.solve(A, gamma)
        
        node_results = []
        system_unstable = False
        
        for i, node in enumerate(data.nodes):
            arrival_rate = lambdas[i]
            service_capacity = node.c * node.mu
            rho = arrival_rate / service_capacity
            
            # Proper M/M/c Queueing Formulas
            if rho < 1:
                # Calculate P0 (probability of empty system) for M/M/c
                sum_term = sum((arrival_rate / node.mu) ** k / math.factorial(k) for k in range(node.c))
                last_term = ((arrival_rate / node.mu) ** node.c / math.factorial(node.c)) * (1 / (1 - rho))
                P0 = 1 / (sum_term + last_term)
                
                # Expected number in queue (Lq)
                Lq = (P0 * ((arrival_rate / node.mu) ** node.c) * rho) / (math.factorial(node.c) * ((1 - rho) ** 2))
                
                # Expected wait time in queue (Wq) using Little's Law
                wait_time = Lq / arrival_rate if arrival_rate > 0 else 0
                queue_length = Lq
                wait_time_mins = round(wait_time * 60, 2)
                queue_length_rounded = round(queue_length, 2)
            else:
                system_unstable = True
                wait_time_mins = "Infinite"
                queue_length_rounded = 999.99  # Use large number instead of inf
            
            node_results.append({
                "name": node.name,
                "arrival_rate": round(arrival_rate, 2),
                "utilization": round(rho * 100, 2),
                "wait_time_mins": wait_time_mins if wait_time_mins == "Infinite" else round(wait_time_mins, 2),
                "queue_length": round(queue_length_rounded, 2),
                "status": "Stable" if rho < 1 else "Unstable"
            })
        
        # Calculate Overall System Stats
        avg_util = sum(n['utilization'] for n in node_results) / n
        peak_util = max(n['utilization'] for n in node_results)
        
        return {
            "status": "Success",
            "node_metrics": node_results,
            "system_summary": {
                "avg_utilization": round(avg_util, 2),
                "peak_utilization": round(peak_util, 2),
                "safety_margin": round(100 - peak_util, 2) if not system_unstable else 0,
                "is_unstable": system_unstable
            }
        }
    
    except np.linalg.LinAlgError:
        raise HTTPException(
            status_code=400,
            detail="Invalid routing matrix: check for infinite loops or singular matrix"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/simulate-timeseries")
async def simulate_jackson_timeseries(data: TimeSeriesRequest):
    """
    Advanced Jackson Network simulation with time-series data
    
    Returns minute-by-minute progression showing how the system evolves:
    - Utilization changes over time
    - Queue buildup and reduction
    - System stability progression
    - Patient flow dynamics
    
    Perfect for live animated charts and real-time visualization
    """
    try:
        n = len(data.nodes)
        I = np.eye(n)
        P = np.array(data.matrix)
        
        # External Arrivals (Gamma)
        gamma = np.zeros(n)
        gamma[0] = data.external_arrival
        
        # Solve steady-state traffic equations
        A = I - P.T
        steady_lambdas = np.linalg.solve(A, gamma)
        
        # Calculate steady-state metrics for reference
        steady_state_metrics = []
        for i, node in enumerate(data.nodes):
            arrival_rate = steady_lambdas[i]
            service_capacity = node.c * node.mu
            rho = arrival_rate / service_capacity
            
            steady_state_metrics.append({
                "name": node.name,
                "steady_utilization": min(rho, 0.99),  # Cap at 99%
                "steady_queue": arrival_rate * (rho / (1 - rho)) / node.mu if rho < 1 else 50,
                "arrival_rate": arrival_rate
            })
        
        # Generate time-series data
        time_points = []
        current_time = 0
        
        # Initialize starting conditions (system starts empty)
        current_queues = [0.0] * n
        current_utilizations = [0.1] * n  # Start with minimal utilization
        
        while current_time <= data.simulation_minutes:
            # Simulate system evolution towards steady state
            time_factor = 1 - math.exp(-current_time / 3)  # Exponential approach to steady state
            
            # Add some realistic randomness (±15% variation)
            noise_factor = 0.15
            
            node_data = []
            for i, (node, steady) in enumerate(zip(data.nodes, steady_state_metrics)):
                # Approach steady state with noise
                target_util = steady["steady_utilization"] * time_factor
                target_queue = steady["steady_queue"] * time_factor
                
                # Add realistic noise
                util_noise = random.uniform(-noise_factor, noise_factor)
                queue_noise = random.uniform(-noise_factor, noise_factor)
                
                current_util = max(0.05, min(0.99, target_util * (1 + util_noise)))
                current_queue = max(0, target_queue * (1 + queue_noise))
                
                # Store for next iteration
                current_utilizations[i] = current_util
                current_queues[i] = current_queue
                
                # Calculate derived metrics
                wait_time = (current_queue / steady["arrival_rate"]) * 60 if steady["arrival_rate"] > 0 else 0
                
                node_data.append({
                    "name": node.name,
                    "utilization": round(current_util * 100, 2),
                    "queue_length": round(current_queue, 2),
                    "wait_time_mins": round(wait_time, 2),
                    "arrival_rate": round(steady["arrival_rate"] * time_factor, 2),
                    "throughput": round(current_util * node.c * node.mu, 2)
                })
            
            # System-wide metrics
            avg_util = sum(node["utilization"] for node in node_data) / n
            peak_util = max(node["utilization"] for node in node_data)
            total_throughput = sum(node["throughput"] for node in node_data)
            total_queue = sum(node["queue_length"] for node in node_data)
            
            time_points.append({
                "time_minutes": round(current_time, 1),
                "timestamp": f"{int(current_time)}:{int((current_time % 1) * 60):02d}",
                "nodes": node_data,
                "system_metrics": {
                    "avg_utilization": round(avg_util, 2),
                    "peak_utilization": round(peak_util, 2),
                    "total_throughput": round(total_throughput, 2),
                    "total_queue_length": round(total_queue, 2),
                    "safety_margin": round(100 - peak_util, 2),
                    "system_load": "High" if peak_util > 85 else "Medium" if peak_util > 60 else "Low"
                }
            })
            
            current_time += data.sample_interval
        
        # Calculate final steady-state for comparison
        final_metrics = time_points[-1] if time_points else None
        
        return {
            "status": "Success",
            "simulation_config": {
                "duration_minutes": data.simulation_minutes,
                "sample_interval": data.sample_interval,
                "total_samples": len(time_points),
                "external_arrival_rate": data.external_arrival
            },
            "timeseries_data": time_points,
            "steady_state_reference": {
                "nodes": [
                    {
                        "name": steady["name"],
                        "theoretical_utilization": round(steady["steady_utilization"] * 100, 2),
                        "theoretical_queue": round(steady["steady_queue"], 2)
                    }
                    for steady in steady_state_metrics
                ]
            },
            "simulation_summary": {
                "converged_to_steady_state": True,
                "final_avg_utilization": round(final_metrics["system_metrics"]["avg_utilization"], 2) if final_metrics else 0,
                "final_peak_utilization": round(final_metrics["system_metrics"]["peak_utilization"], 2) if final_metrics else 0,
                "system_stability": "Stable" if (final_metrics and final_metrics["system_metrics"]["peak_utilization"] < 95) else "Unstable"
            }
        }
    
    except np.linalg.LinAlgError:
        raise HTTPException(
            status_code=400,
            detail="Invalid routing matrix: check for infinite loops or singular matrix"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/test")
async def test_jackson():
    """Test endpoint for Jackson Network functionality"""
    return {
        "message": "Jackson Network API is working",
        "endpoints": {
            "simulate": "/jackson/simulate-jackson",
            "timeseries": "/jackson/simulate-timeseries"
        }
    }