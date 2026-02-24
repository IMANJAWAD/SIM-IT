"""
Emergency Department Simulation Engine using SimPy
Implements discrete-event simulation for patient flow
"""
import simpy
import numpy as np
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from simulation.poisson_process import PoissonProcess

@dataclass
class Patient:
    """Represents a patient in the ED"""
    id: int
    arrival_time: float
    is_critical: bool
    needs_diagnostics: bool
    triage_time: float = 0.0
    treatment_start_time: float = 0.0
    treatment_end_time: float = 0.0
    departure_time: float = 0.0
    waiting_time: float = 0.0
    length_of_stay: float = 0.0

@dataclass
class SimulationMetrics:
    """Collected metrics from simulation"""
    waiting_times: List[float] = field(default_factory=list)
    los_values: List[float] = field(default_factory=list)
    queue_lengths: List[Tuple[float, int]] = field(default_factory=list)
    throughput: int = 0
    doctor_utilization: float = 0.0
    nurse_utilization: float = 0.0
    xray_utilization: float = 0.0
    patients_served: int = 0
    patients_abandoned: int = 0

class EDSimulation:
    """
    Emergency Department Discrete-Event Simulation
    
    Models patient flow through:
    1. Arrival (Poisson process)
    2. Triage (by nurses)
    3. Treatment (by doctors)
    4. Diagnostics (X-ray if needed)
    5. Discharge
    """
    
    def __init__(
        self,
        arrival_rate: float = 8.0,
        num_doctors: int = 3,
        num_nurses: int = 5,
        num_xray: int = 2,
        diagnostic_prob: float = 0.4,
        critical_pct: float = 0.15,
        simulation_duration: int = 480,
        warm_up: int = 60,
        seed: Optional[int] = None
    ):
        """
        Initialize ED Simulation
        
        Args:
            arrival_rate: Patients per hour
            num_doctors: Number of available doctors
            num_nurses: Number of available nurses
            num_xray: Number of X-ray machines
            diagnostic_prob: Probability patient needs X-ray
            critical_pct: Percentage of critical patients
            simulation_duration: Duration in minutes
            warm_up: Warm-up period in minutes
            seed: Random seed
        """
        self.arrival_rate = arrival_rate
        self.num_doctors = num_doctors
        self.num_nurses = num_nurses
        self.num_xray = num_xray
        self.diagnostic_prob = diagnostic_prob
        self.critical_pct = critical_pct
        self.duration = simulation_duration
        self.warm_up = warm_up
        
        self.rng = np.random.default_rng(seed)
        self.poisson = PoissonProcess(arrival_rate, seed)
        
        # Service time parameters (in minutes)
        self.triage_time_mean = 5
        self.treatment_time_mean = 20
        self.treatment_time_critical = 35
        self.xray_time_mean = 15
        
        self.env: Optional[simpy.Environment] = None
        self.doctors: Optional[simpy.PriorityResource] = None
        self.nurses: Optional[simpy.Resource] = None
        self.xray_machines: Optional[simpy.Resource] = None
        
        self.metrics = SimulationMetrics()
        self.current_queue_length = 0
        self.patients: List[Patient] = []
    
    def generate_service_time(self, mean: float) -> float:
        """Generate exponentially distributed service time"""
        return self.rng.exponential(mean)
    
    def patient_process(self, env: simpy.Environment, patient: Patient):
        """
        Patient flow process through ED
        
        Args:
            env: SimPy environment
            patient: Patient object
        """
        arrival_time = env.now
        self.current_queue_length += 1
        self.metrics.queue_lengths.append((env.now, self.current_queue_length))
        
        # Priority: critical patients get priority 0, others get 1
        priority = 0 if patient.is_critical else 1
        
        # Step 1: Triage by nurse
        with self.nurses.request() as req:
            yield req
            triage_start = env.now
            triage_duration = self.generate_service_time(self.triage_time_mean)
            yield env.timeout(triage_duration)
            patient.triage_time = env.now - triage_start
        
        # Step 2: Wait for doctor (with priority)
        queue_time_start = env.now
        with self.doctors.request(priority=priority) as req:
            yield req
            patient.waiting_time = env.now - arrival_time
            patient.treatment_start_time = env.now
            
            # Treatment time depends on patient type
            if patient.is_critical:
                treatment_time = self.generate_service_time(self.treatment_time_critical)
            else:
                treatment_time = self.generate_service_time(self.treatment_time_mean)
            
            yield env.timeout(treatment_time)
            patient.treatment_end_time = env.now
        
        # Step 3: Diagnostics if needed
        if patient.needs_diagnostics:
            with self.xray_machines.request() as req:
                yield req
                xray_time = self.generate_service_time(self.xray_time_mean)
                yield env.timeout(xray_time)
        
        # Step 4: Discharge
        patient.departure_time = env.now
        patient.length_of_stay = env.now - arrival_time
        
        self.current_queue_length -= 1
        self.metrics.queue_lengths.append((env.now, self.current_queue_length))
        
        # Only record metrics after warm-up period
        if arrival_time >= self.warm_up:
            self.metrics.waiting_times.append(patient.waiting_time)
            self.metrics.los_values.append(patient.length_of_stay)
            self.metrics.patients_served += 1
        
        self.patients.append(patient)
    
    def arrival_process(self, env: simpy.Environment):
        """
        Generate patient arrivals using Poisson process
        """
        patient_id = 0
        
        while True:
            # Generate interarrival time
            interarrival = self.poisson.generate_interarrival_time()
            yield env.timeout(interarrival)
            
            # Create new patient
            is_critical = self.rng.random() < self.critical_pct
            needs_diagnostics = self.rng.random() < self.diagnostic_prob
            
            patient = Patient(
                id=patient_id,
                arrival_time=env.now,
                is_critical=is_critical,
                needs_diagnostics=needs_diagnostics
            )
            
            # Start patient process
            env.process(self.patient_process(env, patient))
            patient_id += 1
    
    def run(self) -> SimulationMetrics:
        """
        Run the simulation
        
        Returns:
            SimulationMetrics with collected data
        """
        self.env = simpy.Environment()
        
        # Create resources
        self.doctors = simpy.PriorityResource(self.env, capacity=self.num_doctors)
        self.nurses = simpy.Resource(self.env, capacity=self.num_nurses)
        self.xray_machines = simpy.Resource(self.env, capacity=self.num_xray)
        
        # Reset metrics
        self.metrics = SimulationMetrics()
        self.current_queue_length = 0
        self.patients = []
        
        # Start arrival process
        self.env.process(self.arrival_process(self.env))
        
        # Run simulation
        self.env.run(until=self.duration)
        
        # Calculate utilization
        self._calculate_utilization()
        
        # Calculate throughput (patients per hour)
        effective_time = (self.duration - self.warm_up) / 60  # hours
        self.metrics.throughput = self.metrics.patients_served / effective_time if effective_time > 0 else 0
        
        return self.metrics
    
    def _calculate_utilization(self):
        """Calculate resource utilization from simulation data"""
        # Approximate utilization based on patients served and service times
        total_time = self.duration - self.warm_up
        
        if total_time <= 0 or self.metrics.patients_served == 0:
            return
        
        # Calculate total service times
        total_treatment_time = sum(
            p.treatment_end_time - p.treatment_start_time 
            for p in self.patients 
            if p.arrival_time >= self.warm_up
        )
        
        # Doctor utilization
        self.metrics.doctor_utilization = min(
            total_treatment_time / (total_time * self.num_doctors), 
            1.0
        )
        
        # Estimate nurse utilization (triage time)
        total_triage_time = sum(
            p.triage_time 
            for p in self.patients 
            if p.arrival_time >= self.warm_up
        )
        self.metrics.nurse_utilization = min(
            total_triage_time / (total_time * self.num_nurses), 
            1.0
        )
        
        # Estimate X-ray utilization
        xray_patients = [p for p in self.patients if p.needs_diagnostics and p.arrival_time >= self.warm_up]
        estimated_xray_time = len(xray_patients) * self.xray_time_mean
        self.metrics.xray_utilization = min(
            estimated_xray_time / (total_time * self.num_xray), 
            1.0
        )


def run_single_simulation(
    arrival_rate: float,
    num_doctors: int,
    num_nurses: int,
    num_xray: int,
    diagnostic_prob: float,
    critical_pct: float,
    duration: int,
    warm_up: int,
    seed: Optional[int] = None
) -> Dict:
    """
    Run a single simulation and return results as dictionary
    """
    sim = EDSimulation(
        arrival_rate=arrival_rate,
        num_doctors=num_doctors,
        num_nurses=num_nurses,
        num_xray=num_xray,
        diagnostic_prob=diagnostic_prob,
        critical_pct=critical_pct,
        simulation_duration=duration,
        warm_up=warm_up,
        seed=seed
    )
    
    metrics = sim.run()
    
    return {
        "avg_waiting_time": np.mean(metrics.waiting_times) if metrics.waiting_times else 0,
        "avg_los": np.mean(metrics.los_values) if metrics.los_values else 0,
        "throughput": metrics.throughput,
        "doctor_utilization": metrics.doctor_utilization,
        "nurse_utilization": metrics.nurse_utilization,
        "xray_utilization": metrics.xray_utilization,
        "patients_served": metrics.patients_served,
        "waiting_times": metrics.waiting_times,
        "los_values": metrics.los_values,
        "queue_lengths": metrics.queue_lengths
    }
