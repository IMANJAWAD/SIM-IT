"""
Markov Chain Analysis Routes
API endpoints for Markov chain analysis and theoretical calculations
"""
import math
from fastapi import APIRouter, HTTPException
from models.schemas import MarkovAnalysisParams
from markov.markov_chain import MarkovChainAnalyzer, create_state_transition_diagram_data

router = APIRouter(prefix="/markov", tags=["Markov Analysis"])

def sanitize_float(value, default=0.0):
    """Replace inf/nan with a safe default value"""
    if math.isnan(value) or math.isinf(value):
        return default
    return value

def safe_round(value, decimals=2, default=0.0):
    """Round a value safely, handling inf/nan"""
    return round(sanitize_float(value, default), decimals)

@router.post("/analyze")
async def analyze_markov_chain(params: MarkovAnalysisParams):
    """
    Perform Markov chain analysis for M/M/c queue
    
    Returns:
    - Transition probability matrix
    - Steady-state probabilities
    - Theoretical performance metrics
    - State transition diagram data
    """
    try:
        analyzer = MarkovChainAnalyzer(
            arrival_rate=params.arrival_rate,
            service_rate=params.service_rate,
            num_servers=params.num_servers,
            max_capacity=params.max_system_capacity
        )
        
        # Get comprehensive results
        results = analyzer.compute_performance_metrics()
        theoretical = analyzer.get_mmc_theoretical_metrics()
        diagram_data = create_state_transition_diagram_data(analyzer, max_states_to_show=12)
        
        # Prepare transition matrix (limited to visible states)
        max_display = min(12, len(results.states))
        transition_matrix = results.transition_matrix[:max_display, :max_display].tolist()
        transition_matrix = [[safe_round(x, 4) for x in row] for row in transition_matrix]
        
        # Steady state probabilities
        steady_state = [safe_round(float(p), 6) for p in results.steady_state_probs[:max_display]]
        
        return {
            "success": True,
            "states": results.states[:max_display],
            "transition_matrix": transition_matrix,
            "steady_state_probabilities": steady_state,
            "metrics": {
                "stability_condition": safe_round(results.rho, 4),
                "is_stable": results.is_stable,
                "expected_queue_length": safe_round(results.expected_queue_length, 2),
                "expected_system_size": safe_round(results.expected_system_size, 2),
                "expected_waiting_time": safe_round(results.expected_waiting_time, 2),
                "expected_system_time": safe_round(results.expected_system_time, 2),
                "probability_of_waiting": safe_round(results.prob_waiting * 100, 2),
                "probability_of_empty_system": safe_round(results.prob_empty * 100, 2),
                "probability_of_congestion": safe_round(results.prob_congestion * 100, 2)
            },
            "theoretical_mmc": {
                "utilization": safe_round(theoretical.get("utilization", 0), 4),
                "is_stable": theoretical.get("is_stable", False),
                "probability_of_delay": safe_round(theoretical.get("probability_of_delay", 0) * 100, 2),
                "expected_queue_length": safe_round(theoretical.get("expected_queue_length", 0), 2),
                "expected_waiting_time": safe_round(theoretical.get("expected_waiting_time", 0), 2)
            },
            "state_diagram": diagram_data,
            "analysis_params": {
                "arrival_rate": params.arrival_rate,
                "service_rate": params.service_rate,
                "num_servers": params.num_servers,
                "max_capacity": params.max_system_capacity
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stability-check")
async def check_stability(arrival_rate: float, service_rate: float, num_servers: int):
    """
    Quick stability check for given parameters
    
    Returns stability condition ρ = λ/(cμ) and whether system is stable
    """
    rho = arrival_rate / (num_servers * service_rate)
    return {
        "arrival_rate": arrival_rate,
        "service_rate": service_rate,
        "num_servers": num_servers,
        "rho": round(rho, 4),
        "is_stable": rho < 1,
        "interpretation": "System is stable (queue will not grow infinitely)" if rho < 1 
                         else "System is UNSTABLE (queue will grow infinitely)"
    }
