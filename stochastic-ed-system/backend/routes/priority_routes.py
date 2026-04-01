from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
import simpy
import random
import statistics
import math
from concurrent.futures import ThreadPoolExecutor
import time

router = APIRouter()

class PriorityQueueRequest(BaseModel):
    total_lambda: float  # Total arrival rate (patients/hour)
    mu: float           # Service rate per doctor (patients/hour)
    c: int              # Number of doctors/servers
    distributions: List[float]  # [p1, p2, p3, p4, p5] percentages (should sum to 1.0)
    preemptive: bool    # Whether to use preemptive priority
    simulation_time: float = 480.0  # 8 hours in minutes
    num_replications: int = 100

def calculate_priority_waits(total_lambda, mu, c, distributions, preemptive=False):
    """
    Theoretical M/M/c Priority Model
    distributions: list of floats [p1, p2, p3, p4, p5] totaling 1.0
    """
    # 1. Calculate individual arrival rates for each class
    lambdas = [total_lambda * p for p in distributions]
    
    # 2. Calculate individual utilization (rho) for each class
    # CORRECTED: Total service capacity is c * mu (not just mu)
    total_service_capacity = c * mu
    rhos = [lam / total_service_capacity for lam in lambdas]
    
    # 3. Cumulative utilization (Sigma)
    # This is the 'Secret Sauce' of Priority Queuing math
    sigmas = np.cumsum(rhos)
    
    results = []
    
    # System utilization check
    system_rho = sum(rhos)
    
    # E[R] is the residual service time (Expected time to finish current patient)
    # For M/M/c, this depends on the service rate
    expected_residual = 1 / mu  # Service time per server
    
    # M/M/c correction factor for multiple servers
    # This accounts for the fact that we have c servers, not just 1
    if system_rho < 1.0:
        # Erlang-C formula component for M/M/c systems
        rho_total = total_lambda / total_service_capacity
        
        # Calculate P0 (probability of 0 customers in system)
        sum_term = sum([(c * rho_total)**k / math.factorial(k) for k in range(c)])
        if c * rho_total != c:  # Avoid division by zero
            erlang_c_numerator = (c * rho_total)**c / (math.factorial(c) * (1 - rho_total))
        else:
            erlang_c_numerator = float('inf')
        
        if erlang_c_numerator != float('inf'):
            p0 = 1 / (sum_term + erlang_c_numerator)
            # Probability of waiting (Erlang-C formula)
            prob_wait = erlang_c_numerator * p0
        else:
            prob_wait = 1.0
    else:
        prob_wait = 1.0
    
    for i in range(len(lambdas)):
        sigma_prev = sigmas[i-1] if i > 0 else 0
        sigma_curr = sigmas[i]
        
        if sigma_curr >= 1.0:
            wait_time = float('inf')  # System collapses for this priority level
        else:
            if preemptive:
                # Preemptive Priority Formula for M/M/c
                if sigma_prev < 1.0:
                    wait_time = (prob_wait * expected_residual) / (1 - sigma_prev)
                else:
                    wait_time = float('inf')
            else:
                # Non-Preemptive Priority Formula for M/M/c
                if sigma_prev < 1.0 and sigma_curr < 1.0:
                    wait_time = (prob_wait * expected_residual) / ((1 - sigma_prev) * (1 - sigma_curr))
                else:
                    wait_time = float('inf')
        
        results.append({
            "level": i + 1,
            "arrival_rate": round(lambdas[i], 3),
            "utilization": round(rhos[i], 3),
            "cumulative_utilization": round(sigma_curr, 3),
            "wait_time_mins": round(wait_time * 60, 2) if wait_time != float('inf') else "Infinite",
            "wait_time_hours": round(wait_time, 4) if wait_time != float('inf') else "Infinite"
        })
    
    return {
        "theoretical_results": results,
        "system_utilization": round(system_rho, 3),
        "system_stable": system_rho < 1.0,
        "preemptive_mode": preemptive,
        "total_service_capacity": total_service_capacity,
        "capacity_analysis": {
            "arrival_rate": total_lambda,
            "service_capacity": total_service_capacity,
            "utilization_percent": round(system_rho * 100, 1),
            "recommended_servers": max(c, int(np.ceil(total_lambda / mu)) + 1)
        }
    }

class Patient:
    def __init__(self, patient_id, priority_level, arrival_time):
        self.patient_id = patient_id
        self.priority_level = priority_level
        self.arrival_time = arrival_time
        self.service_start_time = None
        self.departure_time = None
        self.wait_time = None

def patient_process(env, patient, hospital_resource, mu, results_dict):
    """SimPy patient process with priority handling"""
    arrival_time = env.now
    patient.arrival_time = arrival_time
    
    # Priority queue - lower number = higher priority (Level 1 = highest)
    with hospital_resource.request(priority=patient.priority_level) as request:
        yield request
        
        # Record service start time and calculate wait time
        patient.service_start_time = env.now
        patient.wait_time = patient.service_start_time - patient.arrival_time
        
        # Store wait time by priority level
        if patient.priority_level not in results_dict:
            results_dict[patient.priority_level] = []
        results_dict[patient.priority_level].append(patient.wait_time)
        
        # Service phase - exponential service time
        service_time = random.expovariate(mu / 60)  # Convert to minutes
        yield env.timeout(service_time)
        
        patient.departure_time = env.now

def patient_generator(env, hospital_resource, mu, distributions, total_lambda, results_dict):
    """Generate patients according to arrival rates and priorities"""
    patient_id = 0
    
    while True:
        # Calculate next arrival time (Poisson process)
        inter_arrival = random.expovariate(total_lambda / 60)  # Convert to minutes
        yield env.timeout(inter_arrival)
        
        # Determine patient priority based on distribution
        rand = random.random()
        cumulative = 0
        priority_level = 5  # Default to lowest priority
        
        for i, prob in enumerate(distributions):
            cumulative += prob
            if rand <= cumulative:
                priority_level = i + 1
                break
        
        # Create and start patient process
        patient = Patient(patient_id, priority_level, env.now)
        env.process(patient_process(env, patient, hospital_resource, mu, results_dict))
def patient_process_with_warmup(env, patient, hospital_resource, mu, results_dict, warmup_results, warmup_time):
    """SimPy patient process with priority handling and warm-up tracking"""
    arrival_time = env.now
    patient.arrival_time = arrival_time
    
    # Priority queue - lower number = higher priority (Level 1 = highest)
    with hospital_resource.request(priority=patient.priority_level) as request:
        yield request
        
        # Record service start time and calculate wait time
        patient.service_start_time = env.now
        patient.wait_time = patient.service_start_time - patient.arrival_time
        
        # Only collect data after warm-up period
        if env.now >= warmup_time:
            # Store wait time by priority level (post-warmup only)
            if patient.priority_level not in results_dict:
                results_dict[patient.priority_level] = []
            results_dict[patient.priority_level].append(patient.wait_time)
        else:
            # Track warm-up data separately (for monitoring)
            if patient.priority_level not in warmup_results:
                warmup_results[patient.priority_level] = []
            warmup_results[patient.priority_level].append(patient.wait_time)
        
        # Service phase - exponential service time
        service_time = random.expovariate(mu / 60)  # Convert to minutes
        yield env.timeout(service_time)
        
        patient.departure_time = env.now

def patient_generator_with_warmup(env, hospital_resource, mu, distributions, total_lambda, results_dict, warmup_results, warmup_time):
    """Generate patients according to arrival rates and priorities with warm-up tracking"""
    patient_id = 0
    
    while True:
        # Calculate next arrival time (Poisson process)
        inter_arrival = random.expovariate(total_lambda / 60)  # Convert to minutes
        yield env.timeout(inter_arrival)
        
        # Determine patient priority based on distribution
        rand = random.random()
        cumulative = 0
        priority_level = 5  # Default to lowest priority
        
        for i, prob in enumerate(distributions):
            cumulative += prob
            if rand <= cumulative:
                priority_level = i + 1
                break
        
        # Create and start patient process
        patient = Patient(patient_id, priority_level, env.now)
        env.process(patient_process_with_warmup(env, patient, hospital_resource, mu, results_dict, warmup_results, warmup_time))
        patient_id += 1

def run_single_simulation(total_lambda, mu, c, distributions, simulation_time, warmup_time=480):
    """Run a single simulation replication with warm-up period"""
    env = simpy.Environment()
    
    # Create hospital resource with priority queue
    hospital_resource = simpy.PriorityResource(env, capacity=c)
    
    # Results dictionary to store wait times by priority level (post-warmup only)
    results_dict = {}
    warmup_results = {}  # Separate tracking for warm-up period
    
    # Start patient generator
    env.process(patient_generator_with_warmup(env, hospital_resource, mu, distributions, total_lambda, results_dict, warmup_results, warmup_time))
    
    # Run simulation (warmup + actual data collection)
    env.run(until=warmup_time + simulation_time)
    
    # Calculate average wait times for each priority level (only post-warmup data)
    avg_waits = {}
    for priority_level, wait_times in results_dict.items():
        if wait_times:
            avg_waits[priority_level] = statistics.mean(wait_times)
        else:
            avg_waits[priority_level] = 0
    
    return avg_waits

def run_monte_carlo_simulation(total_lambda, mu, c, distributions, simulation_time, num_replications):
    """Run Monte Carlo simulation with multiple replications and warm-up period"""
    all_results = {i: [] for i in range(1, 6)}  # Initialize for 5 priority levels
    
    # Enhanced parameters for better accuracy
    warmup_time = 480  # 8 hours warm-up
    actual_simulation_time = max(simulation_time, 1440)  # At least 24 hours
    enhanced_replications = max(num_replications, 500)  # At least 500 replications
    
    # Run multiple replications
    for rep in range(enhanced_replications):
        single_result = run_single_simulation(total_lambda, mu, c, distributions, actual_simulation_time, warmup_time)
        
        # Store results for each priority level
        for level in range(1, 6):
            if level in single_result:
                all_results[level].append(single_result[level])
            else:
                all_results[level].append(0)
    
    # Calculate statistics across replications
    simulation_results = []
    for level in range(1, 6):
        wait_times = all_results[level]
        if wait_times:
            mean_wait = statistics.mean(wait_times)
            std_wait = statistics.stdev(wait_times) if len(wait_times) > 1 else 0
            confidence_interval = 1.96 * std_wait / np.sqrt(len(wait_times))  # 95% CI
            
            simulation_results.append({
                "level": level,
                "mean_wait_mins": round(mean_wait, 2),
                "std_wait_mins": round(std_wait, 2),
                "confidence_interval": round(confidence_interval, 2),
                "min_wait": round(min(wait_times), 2),
                "max_wait": round(max(wait_times), 2),
                "num_samples": len([w for w in wait_times if w > 0]),
                "total_replications": enhanced_replications
            })
        else:
            simulation_results.append({
                "level": level,
                "mean_wait_mins": 0,
                "std_wait_mins": 0,
                "confidence_interval": 0,
                "min_wait": 0,
                "max_wait": 0,
                "num_samples": 0,
                "total_replications": enhanced_replications
            })
    
    return simulation_results
@router.post("/simulate-priority-queue")
async def simulate_priority_queue(request: PriorityQueueRequest):
    """
    Simulate Priority Queue system with both theoretical and simulation results
    """
    try:
        # Validate input
        if abs(sum(request.distributions) - 1.0) > 0.001:
            raise HTTPException(status_code=400, detail="Distributions must sum to 1.0")
        
        if request.total_lambda <= 0 or request.mu <= 0 or request.c <= 0:
            raise HTTPException(status_code=400, detail="Rates and capacity must be positive")
        
        # CRITICAL: Check system stability
        total_service_capacity = request.c * request.mu
        system_utilization = request.total_lambda / total_service_capacity
        
        # Warn about system instability
        stability_warnings = []
        if system_utilization >= 1.0:
            stability_warnings.append(f"CRITICAL: System utilization is {system_utilization:.1%}. Queue will grow infinitely!")
            stability_warnings.append(f"Current capacity: {total_service_capacity} patients/hour")
            stability_warnings.append(f"Arrival rate: {request.total_lambda} patients/hour")
            stability_warnings.append(f"Recommended: Increase to at least {int(np.ceil(request.total_lambda / request.mu)) + 1} doctors")
        elif system_utilization > 0.85:
            stability_warnings.append(f"WARNING: High utilization ({system_utilization:.1%}). System may experience long delays.")
        
        # Calculate theoretical results
        theoretical = calculate_priority_waits(
            request.total_lambda, 
            request.mu, 
            request.c, 
            request.distributions,
            request.preemptive
        )
        
        # Only run simulation if system is reasonably stable
        if system_utilization < 1.0:  # Only run for stable systems
            # Run Monte Carlo simulation with enhanced parameters for accuracy
            start_time = time.time()
            
            # Use enhanced parameters for better accuracy
            enhanced_replications = max(request.num_replications, 500)  # Minimum 500 replications
            enhanced_simulation_time = max(request.simulation_time, 1440)  # Minimum 24 hours
            
            simulation_results = run_monte_carlo_simulation(
                request.total_lambda,
                request.mu,
                request.c,
                request.distributions,
                enhanced_simulation_time,
                enhanced_replications
            )
            simulation_time = time.time() - start_time
            
            # Add simulation quality metrics
            simulation_quality = {
                "replications_used": enhanced_replications,
                "simulation_hours": enhanced_simulation_time / 60,
                "warmup_hours": 8,  # 8 hour warmup
                "total_runtime_seconds": round(simulation_time, 2),
                "accuracy_target": "< 5% error for engineering validation"
            }
        else:
            # Skip simulation for unstable systems
            simulation_results = []
            simulation_time = 0
            simulation_quality = {}
            stability_warnings.append("Simulation skipped due to system instability")
        
        # Calculate comparison metrics
        comparison = []
        if simulation_results:
            for i, (theo, sim) in enumerate(zip(theoretical["theoretical_results"], simulation_results)):
                theo_wait = theo["wait_time_mins"]
                sim_wait = sim["mean_wait_mins"]
                
                if isinstance(theo_wait, str) or theo_wait == 0:
                    error_percent = "N/A"
                else:
                    error_percent = round(abs(theo_wait - sim_wait) / theo_wait * 100, 2)
                
                comparison.append({
                    "level": i + 1,
                    "theoretical_wait": theo_wait,
                    "simulation_wait": sim_wait,
                    "error_percent": error_percent,
                    "confidence_interval": sim["confidence_interval"] if simulation_results else 0
                })
        
        return {
            "success": True,
            "theoretical": theoretical,
            "simulation": {
                "results": simulation_results,
                "execution_time_seconds": round(simulation_time, 2),
                "num_replications": enhanced_replications if system_utilization < 1.0 else 0,
                "simulation_time_mins": enhanced_simulation_time if system_utilization < 1.0 else 0,
                "simulation_run": len(simulation_results) > 0,
                "quality_metrics": simulation_quality
            },
            "comparison": comparison,
            "parameters": {
                "total_arrival_rate": request.total_lambda,
                "service_rate_per_doctor": request.mu,
                "num_doctors": request.c,
                "distributions": request.distributions,
                "preemptive": request.preemptive
            },
            "validation": {
                "system_stable": theoretical["system_stable"],
                "system_utilization": theoretical["system_utilization"],
                "utilization_percent": round(system_utilization * 100, 1),
                "stability_warnings": stability_warnings,
                "accuracy_note": "Simulation provides Monte Carlo validation of theoretical M/M/c priority queue formulas",
                "recommendations": {
                    "min_doctors_needed": int(np.ceil(request.total_lambda / request.mu)) + 1,
                    "current_capacity": total_service_capacity,
                    "capacity_gap": max(0, request.total_lambda - total_service_capacity)
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

@router.get("/priority-queue-info")
async def get_priority_queue_info():
    """
    Get information about the Priority Queue model
    """
    return {
        "model_type": "M/M/c Priority Queue",
        "description": "Multi-server priority queueing system for emergency department triage",
        "features": [
            "5-level triage priority system",
            "Preemptive and non-preemptive disciplines",
            "Theoretical M/M/c calculations",
            "Monte Carlo simulation validation",
            "Confidence interval analysis"
        ],
        "mathematical_notation": {
            "λᵢ": "Arrival rate for priority class i",
            "μ": "Service rate per server",
            "c": "Number of servers (doctors)",
            "ρᵢ": "Traffic intensity for class i (λᵢ/cμ)",
            "Wᵢ": "Expected waiting time for class i",
            "σᵢ": "Cumulative utilization up to class i"
        },
        "formulas": {
            "non_preemptive": "Wᵢ = E[R] / ((1-σᵢ₋₁)(1-σᵢ))",
            "preemptive": "Wᵢ = E[R] / (1-σᵢ₋₁)",
            "utilization": "ρᵢ = λᵢ/(c×μ)",
            "cumulative_utilization": "σᵢ = Σⱼ₌₁ⁱ ρⱼ"
        }
    }