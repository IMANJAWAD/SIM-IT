"""
Markov Chain Implementation for ED System Analysis
Implements continuous-time Markov chain for M/M/c queueing system
"""
import math
import numpy as np
from scipy import linalg
from typing import Tuple, List, Dict, Optional
from dataclasses import dataclass

@dataclass
class MarkovChainResults:
    """Results from Markov chain analysis"""
    transition_matrix: np.ndarray
    steady_state_probs: np.ndarray
    states: List[int]
    rho: float  # Traffic intensity
    is_stable: bool
    expected_queue_length: float
    expected_system_size: float
    expected_waiting_time: float
    expected_system_time: float
    prob_waiting: float
    prob_empty: float
    prob_congestion: float

class MarkovChainAnalyzer:
    """
    Markov Chain Analyzer for M/M/c Queueing System
    
    The ED is modeled as an M/M/c queue where:
    - Arrivals follow Poisson process with rate λ
    - Service times are exponential with rate μ
    - c servers (doctors) available
    - States represent number of patients in system
    """
    
    def __init__(
        self,
        arrival_rate: float,
        service_rate: float,
        num_servers: int,
        max_capacity: int = 50
    ):
        """
        Initialize Markov Chain Analyzer
        
        Args:
            arrival_rate: λ - arrival rate (patients per hour)
            service_rate: μ - service rate per server (patients per hour)
            num_servers: c - number of servers
            max_capacity: N - maximum system capacity (truncation)
        """
        self.lam = arrival_rate
        self.mu = service_rate
        self.c = num_servers
        self.N = max_capacity
        
        # Traffic intensity (utilization)
        self.rho = arrival_rate / (num_servers * service_rate)
        
        # State space S = {0, 1, 2, ..., N}
        self.states = list(range(max_capacity + 1))
    
    def construct_rate_matrix(self) -> np.ndarray:
        """
        Construct the infinitesimal generator matrix Q
        
        For M/M/c queue:
        - q(n, n+1) = λ for arrivals (if n < N)
        - q(n, n-1) = min(n, c) * μ for departures (if n > 0)
        - q(n, n) = -(sum of other transition rates)
        
        Returns:
            Generator matrix Q (N+1 x N+1)
        """
        Q = np.zeros((self.N + 1, self.N + 1))
        
        for n in range(self.N + 1):
            # Arrival rate (upward transition)
            if n < self.N:
                Q[n, n + 1] = self.lam
            
            # Service rate (downward transition)
            if n > 0:
                # min(n, c) servers are busy
                Q[n, n - 1] = min(n, self.c) * self.mu
            
            # Diagonal: negative sum of other rates (row sums to 0)
            Q[n, n] = -np.sum(Q[n, :])
        
        return Q
    
    def construct_transition_matrix(self, delta_t: float = 0.01) -> np.ndarray:
        """
        Construct transition probability matrix P from rate matrix Q
        
        For small δt: P ≈ I + Q*δt
        More accurate: P = exp(Q*δt) using matrix exponential
        
        Args:
            delta_t: Time step for transition
            
        Returns:
            Transition probability matrix P
        """
        Q = self.construct_rate_matrix()
        
        # Use matrix exponential for accurate P
        P = linalg.expm(Q * delta_t)
        
        # Ensure probabilities are valid (numerical stability)
        P = np.clip(P, 0, 1)
        P = P / P.sum(axis=1, keepdims=True)
        
        return P
    
    def solve_steady_state(self) -> np.ndarray:
        """
        Solve for steady-state distribution π
        
        Steady state satisfies:
        - πQ = 0 (or πP = π)
        - Σπ = 1
        
        Returns:
            Steady-state probability vector π
        """
        Q = self.construct_rate_matrix()
        n = len(self.states)
        
        # Method: Solve (Q^T)π = 0 with Σπ = 1
        # Replace last equation with normalization constraint
        A = Q.T.copy()
        A[-1, :] = 1  # Normalization constraint
        
        b = np.zeros(n)
        b[-1] = 1  # Sum of probabilities = 1
        
        try:
            pi = linalg.solve(A, b)
        except linalg.LinAlgError:
            # Use least squares if singular
            pi, _, _, _ = linalg.lstsq(A, b)
        
        # Ensure valid probabilities
        pi = np.clip(pi, 0, 1)
        pi = pi / pi.sum()
        
        return pi
    
    def compute_performance_metrics(self) -> MarkovChainResults:
        """
        Compute all performance metrics using steady-state probabilities
        
        Returns:
            MarkovChainResults with all computed metrics
        """
        pi = self.solve_steady_state()
        P = self.construct_transition_matrix()
        
        # Check stability
        is_stable = self.rho < 1
        
        # Expected number in system: E[N] = Σ n * π(n)
        expected_system_size = sum(n * pi[n] for n in range(len(pi)))
        
        # Expected number in queue: E[Nq] = Σ max(n-c, 0) * π(n)
        expected_queue_length = sum(max(n - self.c, 0) * pi[n] for n in range(len(pi)))
        
        # Little's Law: E[W] = E[Nq] / λ
        expected_waiting_time = expected_queue_length / self.lam if self.lam > 0 else 0
        
        # Expected time in system: E[T] = E[N] / λ
        expected_system_time = expected_system_size / self.lam if self.lam > 0 else 0
        
        # Probability of waiting (all servers busy): P(N >= c)
        prob_waiting = sum(pi[n] for n in range(self.c, len(pi)))
        
        # Probability system is empty: π(0)
        prob_empty = pi[0]
        
        # Probability of congestion (queue > half capacity)
        congestion_threshold = self.N // 2
        prob_congestion = sum(pi[n] for n in range(congestion_threshold, len(pi)))
        
        return MarkovChainResults(
            transition_matrix=P,
            steady_state_probs=pi,
            states=self.states,
            rho=self.rho,
            is_stable=is_stable,
            expected_queue_length=expected_queue_length,
            expected_system_size=expected_system_size,
            expected_waiting_time=expected_waiting_time * 60,  # Convert to minutes
            expected_system_time=expected_system_time * 60,
            prob_waiting=prob_waiting,
            prob_empty=prob_empty,
            prob_congestion=prob_congestion
        )
    
    def get_mmc_theoretical_metrics(self) -> Dict[str, float]:
        """
        Compute theoretical M/M/c metrics using closed-form formulas
        
        Returns:
            Dictionary of theoretical metrics
        """
        lam, mu, c = self.lam, self.mu, self.c
        rho = self.rho
        
        if rho >= 1:
            # System unstable
            return {
                "utilization": rho,
                "is_stable": False,
                "expected_queue_length": float('inf'),
                "expected_waiting_time": float('inf'),
                "probability_of_delay": 1.0
            }
        
        # Erlang C formula for P(wait > 0)
        # First compute P0 (probability of empty system)
        sum_term = sum((c * rho) ** n / math.factorial(n) for n in range(c))
        last_term = ((c * rho) ** c / math.factorial(c)) * (1 / (1 - rho))
        P0 = 1 / (sum_term + last_term)
        
        # Erlang C: P(N >= c)
        erlang_c = ((c * rho) ** c / math.factorial(c)) * (1 / (1 - rho)) * P0
        
        # Expected queue length: Lq = (erlang_c * rho) / (1 - rho)
        Lq = (erlang_c * rho) / (1 - rho)
        
        # Expected waiting time: Wq = Lq / λ
        Wq = Lq / lam * 60  # Convert to minutes
        
        # Expected number in system: L = Lq + λ/μ
        L = Lq + lam / mu
        
        # Expected time in system: W = L / λ
        W = L / lam * 60  # Convert to minutes
        
        return {
            "utilization": rho,
            "is_stable": True,
            "probability_empty": P0,
            "probability_of_delay": erlang_c,
            "expected_queue_length": Lq,
            "expected_system_size": L,
            "expected_waiting_time": Wq,
            "expected_system_time": W
        }


def create_state_transition_diagram_data(
    analyzer: MarkovChainAnalyzer,
    max_states_to_show: int = 10
) -> Dict:
    """
    Create data structure for visualizing state transition diagram
    
    Args:
        analyzer: MarkovChainAnalyzer instance
        max_states_to_show: Maximum number of states to include
        
    Returns:
        Dictionary with nodes and edges for visualization
    """
    P = analyzer.construct_transition_matrix()
    pi = analyzer.solve_steady_state()
    
    n_states = min(max_states_to_show, len(analyzer.states))
    
    nodes = []
    edges = []
    
    for i in range(n_states):
        nodes.append({
            "id": f"state_{i}",
            "label": str(i),
            "probability": float(pi[i]),
            "position": {"x": i * 150, "y": 200}
        })
        
        # Forward transition (arrival)
        if i < n_states - 1:
            edges.append({
                "source": f"state_{i}",
                "target": f"state_{i+1}",
                "probability": float(P[i, i+1]),
                "label": f"λ = {analyzer.lam:.1f}"
            })
        
        # Backward transition (service)
        if i > 0:
            service_rate = min(i, analyzer.c) * analyzer.mu
            edges.append({
                "source": f"state_{i}",
                "target": f"state_{i-1}",
                "probability": float(P[i, i-1]),
                "label": f"{min(i, analyzer.c)}μ = {service_rate:.1f}"
            })
    
    return {
        "nodes": nodes,
        "edges": edges,
        "steady_state": [float(p) for p in pi[:n_states]]
    }
