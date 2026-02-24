"""
Pydantic schemas for API request/response models
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class SimulationParams(BaseModel):
    """Parameters for running ED simulation"""
    arrival_rate: float = Field(default=8.0, ge=0.1, le=30.0, description="Patient arrival rate (λ) per hour")
    num_doctors: int = Field(default=3, ge=1, le=20, description="Number of doctors")
    num_nurses: int = Field(default=5, ge=1, le=30, description="Number of nurses")
    num_xray_machines: int = Field(default=2, ge=1, le=10, description="Number of X-ray machines")
    diagnostic_probability: float = Field(default=0.4, ge=0.0, le=1.0, description="Probability patient needs diagnostics")
    critical_patient_percentage: float = Field(default=0.15, ge=0.0, le=1.0, description="Percentage of critical patients")
    simulation_duration: int = Field(default=480, ge=60, le=2880, description="Simulation duration in minutes")
    num_replications: int = Field(default=100, ge=10, le=2000, description="Number of Monte Carlo replications")
    warm_up_period: int = Field(default=60, ge=0, le=480, description="Warm-up period in minutes")

class PatientMetrics(BaseModel):
    """Metrics for individual patient outcomes"""
    waiting_time: float
    length_of_stay: float
    queue_length_on_arrival: int
    is_critical: bool

class SimulationResults(BaseModel):
    """Results from a single simulation run"""
    avg_waiting_time: float
    avg_los: float
    throughput: float
    resource_utilization: Dict[str, float]
    queue_lengths: List[int]
    waiting_times: List[float]
    los_values: List[float]

class MonteCarloResults(BaseModel):
    """Results from Monte Carlo simulation"""
    avg_waiting_time: float
    avg_waiting_time_ci: List[float]  # 95% CI
    avg_los: float
    avg_los_ci: List[float]
    throughput: float
    throughput_ci: List[float]
    resource_utilization: Dict[str, float]
    utilization_ci: Dict[str, List[float]]
    queue_length_over_time: List[Dict[str, float]]
    los_distribution: List[float]
    waiting_time_distribution: List[float]
    steady_state_overload_probability: float

class MarkovAnalysisParams(BaseModel):
    """Parameters for Markov chain analysis"""
    arrival_rate: float = Field(default=8.0, ge=0.1, le=30.0)
    service_rate: float = Field(default=3.0, ge=0.1, le=20.0)
    num_servers: int = Field(default=3, ge=1, le=20)
    max_system_capacity: int = Field(default=20, ge=5, le=100)

class MarkovResults(BaseModel):
    """Results from Markov chain analysis"""
    transition_matrix: List[List[float]]
    steady_state_probabilities: List[float]
    states: List[int]
    expected_queue_length: float
    expected_waiting_time: float
    probability_of_congestion: float
    probability_of_empty_system: float
    stability_condition: float
    is_stable: bool
    theoretical_utilization: float

class SensitivityParams(BaseModel):
    """Parameters for sensitivity analysis"""
    base_arrival_rate: float = Field(default=8.0)
    arrival_rate_range: List[float] = Field(default=[4.0, 6.0, 8.0, 10.0, 12.0])
    doctor_range: List[int] = Field(default=[2, 3, 4, 5])
    num_replications: int = Field(default=50)

class SensitivityResults(BaseModel):
    """Results from sensitivity analysis"""
    arrival_rate_sensitivity: List[Dict]
    doctor_sensitivity: List[Dict]
    heatmap_data: List[List[float]]
    heatmap_arrival_rates: List[float]
    heatmap_doctors: List[int]

class ComparisonResults(BaseModel):
    """Comparison between theoretical and simulation results"""
    theoretical: Dict[str, float]
    simulated: Dict[str, float]
    difference_percentage: Dict[str, float]
