"""
Non-Homogeneous Poisson Process (NHPP) Analysis Routes
Provides endpoints for time-varying arrival rate simulation with theoretical and Monte Carlo analysis
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import numpy as np
import random
from typing import List, Dict
import asyncio
import math

router = APIRouter(prefix="/nhpp", tags=["Non-Homogeneous Poisson Process"])

class NHPPRequest(BaseModel):
    lambda_schedule: List[float]  # The 24 values from your graph
    mu: float                     # Service rate per staff member
    num_staff: int                # Total staff (c)
    critical_ratio: float = 0.15  # From your frontend slider
    replications: int = 100       # For Monte Carlo accuracy

class NHPPTimeSeriesRequest(BaseModel):
    lambda_schedule: List[float]
    mu: float
    num_staff: int
    critical_ratio: float = 0.15
    simulation_hours: int = 24
    time_intervals: int = 60      # Minutes per interval

@router.post("/simulate-nhpp")
async def simulate_nhpp(data: NHPPRequest):
    """
    Proper NHPP simulation - Non-Homogeneous Poisson Process
    Key: Time-varying arrival rates require transient analysis, not steady-state
    """
    try:
        # System parameters
        capacity = data.num_staff * data.mu
        
        # 1. NHPP Theoretical Analysis (Time-Varying)
        hourly_results = []
        for hour, lam in enumerate(data.lambda_schedule):
            # For NHPP, we analyze instantaneous rates, not steady-state
            rho = lam / capacity if capacity > 0 else 0
            
            # Proper M/M/c queueing formulas for wait time
            if rho < 1.0:  # System is stable
                # For M/M/c queue: Expected wait time in queue (Wq)
                # First calculate P0 (probability of empty system)
                if data.num_staff == 1:
                    # M/M/1 case
                    wq = (rho / (1 - rho)) / data.mu if rho > 0 else 0
                else:
                    # M/M/c case - simplified approximation
                    # Wq ≈ (ρ^c / (c! * (1-ρ)^2)) * (1/μ) for ρ < 1
                    if rho > 0:
                        rho_c = rho ** data.num_staff
                        factorial_c = math.factorial(data.num_staff)
                        wq = (rho_c / (factorial_c * (1 - rho) ** 2)) * (1 / data.mu)
                    else:
                        wq = 0
                
                wait_time_hours = wq
                wait_time_minutes = wq * 60
                
                # Expected queue length using Little's Law: Lq = λ * Wq
                expected_queue = lam * wq
            else:
                # System is unstable (ρ ≥ 1)
                wait_time_minutes = min(240, (rho / (1.01 - min(rho, 0.99))) * 60)  # Cap at 4 hours
                expected_queue = lam * (wait_time_minutes / 60)
            
            hourly_results.append({
                "hour": hour,
                "utilization": round(rho * 100, 2),
                "theoretical_wait": round(min(wait_time_minutes, 240), 2),  # Cap at 4 hours
                "queue_length": round(expected_queue, 2),
                "predicted_arrivals": lam
            })
        
        # 2. Peak Impact Analytics
        peak_rate = max(data.lambda_schedule)
        peak_hour = data.lambda_schedule.index(peak_rate)
        
        # 3. NHPP Monte Carlo Simulation
        monte_carlo_results = run_monte_carlo_nhpp(
            data.lambda_schedule, data.mu, data.num_staff, data.replications
        )
        
        return {
            "daily_total": sum(data.lambda_schedule),
            "peak_hour": f"{peak_hour:02d}:00",
            "peak_utilization": round((peak_rate / capacity) * 100, 2),
            "critical_patients": round(peak_rate * data.critical_ratio, 0),
            "hourly_data": hourly_results,
            "monte_carlo_results": monte_carlo_results["mean_queue"],
            "monte_carlo_confidence": monte_carlo_results["confidence_intervals"],
            "monte_carlo_summary": monte_carlo_results["summary"]
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"NHPP simulation error: {str(e)}"
        )

def run_monte_carlo_nhpp(lambda_schedule, mu, c, replications):
    """
    Proper NHPP Monte Carlo: Simulates time-varying arrival process
    """
    all_runs = []
    
    for rep in range(replications):
        # Start with empty system
        queue_length = 0
        hourly_queues = []
        
        for hour_idx, lambda_rate in enumerate(lambda_schedule):
            # For NHPP: Simulate arrivals during this hour with rate lambda_rate
            # Break hour into smaller intervals for more accuracy
            intervals_per_hour = 12  # 5-minute intervals
            interval_length = 1.0 / intervals_per_hour  # fraction of hour
            
            for interval in range(intervals_per_hour):
                # Arrivals in this 5-minute interval
                interval_lambda = lambda_rate * interval_length
                arrivals = np.random.poisson(interval_lambda)
                
                # Service completions in this interval
                # Each server can serve mu customers per hour
                service_rate_per_interval = c * mu * interval_length
                
                # Actual services (limited by queue size)
                potential_services = np.random.poisson(service_rate_per_interval)
                actual_services = min(potential_services, queue_length + arrivals)
                
                # Update queue
                queue_length = max(0, queue_length + arrivals - actual_services)
            
            # Record queue length at end of hour
            hourly_queues.append(queue_length)
        
        all_runs.append(hourly_queues)
    
    # Calculate statistics
    all_runs_array = np.array(all_runs)
    mean_results = np.mean(all_runs_array, axis=0)
    std_results = np.std(all_runs_array, axis=0)
    
    # 95% Confidence intervals
    confidence_intervals = []
    for hour in range(len(lambda_schedule)):
        hour_data = all_runs_array[:, hour]
        ci_lower = np.percentile(hour_data, 2.5)
        ci_upper = np.percentile(hour_data, 97.5)
        confidence_intervals.append({
            "hour": hour,
            "mean": round(mean_results[hour], 2),
            "lower": round(ci_lower, 2),
            "upper": round(ci_upper, 2),
            "std": round(std_results[hour], 2)
        })
    
    return {
        "mean_queue": [round(q, 2) for q in mean_results.tolist()],
        "confidence_intervals": confidence_intervals,
        "std_deviation": [round(s, 2) for s in std_results.tolist()],
        "summary": {
            "total_replications": replications,
            "avg_queue_length": round(np.mean(mean_results), 2),
            "max_queue_length": round(np.max(mean_results), 2),
            "queue_variability": round(np.mean(std_results), 2)
        }
    }

def generate_recommendations(peak_utilization: float, overload_hours: int, additional_staff: int) -> Dict:
    """
    Generate ED-specific recommendations based on simulation results
    """
    recommendations = {
        "priority": "Low",
        "actions": [],
        "staffing": [],
        "operational": []
    }
    
    if peak_utilization > 120:
        recommendations["priority"] = "Critical"
        recommendations["actions"] = [
            "Immediate activation of surge capacity protocols",
            "Consider ambulance diversion during peak hours",
            "Activate disaster response team if available"
        ]
        recommendations["staffing"] = [
            f"Add {additional_staff} additional staff members immediately",
            "Call in off-duty personnel",
            "Consider temporary staffing agency support"
        ]
        recommendations["operational"] = [
            "Open all available overflow areas",
            "Implement rapid discharge protocols",
            "Activate external transfer agreements"
        ]
    elif peak_utilization > 100:
        recommendations["priority"] = "High"
        recommendations["actions"] = [
            "Prepare surge capacity protocols",
            "Monitor queue lengths closely",
            "Consider peak hour staffing adjustments"
        ]
        recommendations["staffing"] = [
            f"Add {additional_staff} staff during peak hours",
            "Implement staggered shift changes",
            "Cross-train additional personnel"
        ]
        recommendations["operational"] = [
            "Expedite non-critical discharges",
            "Optimize bed turnover processes",
            "Enhance triage efficiency"
        ]
    elif peak_utilization > 80:
        recommendations["priority"] = "Medium"
        recommendations["actions"] = [
            "Monitor capacity closely",
            "Prepare contingency plans",
            "Review staffing patterns"
        ]
        recommendations["staffing"] = [
            "Consider flexible staffing during peaks",
            "Ensure adequate break coverage",
            "Plan for potential overtime"
        ]
        recommendations["operational"] = [
            "Optimize patient flow processes",
            "Review discharge planning efficiency",
            "Maintain equipment readiness"
        ]
    else:
        recommendations["priority"] = "Low"
        recommendations["actions"] = [
            "Maintain current operations",
            "Continue routine monitoring",
            "Focus on quality improvement"
        ]
        recommendations["staffing"] = [
            "Current staffing appears adequate",
            "Consider training opportunities",
            "Plan for future capacity needs"
        ]
        recommendations["operational"] = [
            "Optimize current processes",
            "Focus on patient satisfaction",
            "Implement efficiency improvements"
        ]
    
    return recommendations

@router.post("/simulate-timeseries")
async def simulate_nhpp_timeseries(data: NHPPTimeSeriesRequest):
    """
    Time-series simulation for real-time visualization
    Returns minute-by-minute progression for live charts
    """
    try:
        capacity = data.num_staff * data.mu
        time_points = []
        current_queue = 0
        
        # Simulate minute by minute
        for hour in range(data.simulation_hours):
            lambda_rate = data.lambda_schedule[hour]
            
            for minute in range(0, 60, data.time_intervals):
                # Arrivals in this interval (scaled to interval length)
                interval_lambda = lambda_rate * (data.time_intervals / 60)
                arrivals = np.random.poisson(interval_lambda)
                
                # Service completions in this interval
                service_completions = min(current_queue + arrivals, 
                                        np.random.poisson(capacity * (data.time_intervals / 60)))
                
                # Update queue
                current_queue = max(0, current_queue + arrivals - service_completions)
                
                # Calculate metrics
                utilization = (lambda_rate / capacity) * 100 if capacity > 0 else 0
                wait_time = (current_queue / capacity) * 60 if capacity > 0 else 0
                
                time_points.append({
                    "time": f"{hour:02d}:{minute:02d}",
                    "hour": hour,
                    "minute": minute,
                    "arrivals": arrivals,
                    "queue_length": current_queue,
                    "utilization": round(utilization, 1),
                    "wait_time_minutes": round(wait_time, 1),
                    "lambda_rate": lambda_rate,
                    "critical_patients": round(lambda_rate * data.critical_ratio, 1)
                })
        
        return {
            "status": "Success",
            "simulation_config": {
                "hours": data.simulation_hours,
                "interval_minutes": data.time_intervals,
                "total_points": len(time_points)
            },
            "timeseries_data": time_points,
            "summary": {
                "max_queue": max(point["queue_length"] for point in time_points),
                "avg_utilization": round(np.mean([point["utilization"] for point in time_points]), 2),
                "peak_wait_time": max(point["wait_time_minutes"] for point in time_points)
            }
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"NHPP timeseries simulation error: {str(e)}"
        )

@router.get("/test")
async def test_nhpp():
    """Test endpoint for NHPP functionality"""
    return {
        "message": "NHPP API is working",
        "endpoints": {
            "simulate": "/nhpp/simulate-nhpp",
            "timeseries": "/nhpp/simulate-timeseries"
        },
        "sample_request": {
            "lambda_schedule": [5, 4, 3, 3, 4, 6, 8, 12, 18, 25, 30, 35, 38, 35, 30, 25, 20, 15, 12, 10, 8, 6, 5, 4],
            "mu": 15,
            "num_staff": 3,
            "critical_ratio": 0.15,
            "replications": 100
        }
    }