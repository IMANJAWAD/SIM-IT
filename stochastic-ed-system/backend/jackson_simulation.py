from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from typing import List, Dict

app = FastAPI()

class NodeConfig(BaseModel):
    name: str
    mu: float
    c: int

class JacksonRequest(BaseModel):
    nodes: List[NodeConfig]
    matrix: List[List[float]]  # The 4x4 matrix from your frontend
    external_arrival: float    # Global Lambda

@app.post("/simulate-jackson")
async def simulate_jackson(data: JacksonRequest):
    n = len(data.nodes)
    I = np.eye(n)
    P = np.array(data.matrix)
    
    # External Arrivals (Gamma)
    # Usually only Triage (index 0) gets external patients
    gamma = np.zeros(n)
    gamma[0] = data.external_arrival
    
    try:
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
            
            # Basic M/M/c Queueing Formulas for each node
            if rho < 1:
                # Expected Wait Time in Queue (approx for M/M/c)
                # For a project of 5, adding the full M/M/c formula here is a huge plus!
                wait_time = (rho / (1 - rho)) / node.mu if rho > 0 else 0
                queue_length = arrival_rate * wait_time
            else:
                system_unstable = True
                wait_time = float('inf')
                queue_length = float('inf')
            
            node_results.append({
                "name": node.name,
                "arrival_rate": round(arrival_rate, 2),
                "utilization": round(rho * 100, 2),
                "wait_time_mins": round(wait_time * 60, 2) if rho < 1 else "Infinite",
                "queue_length": round(queue_length, 2),
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
        return {
            "status": "Error", 
            "message": "Invalid routing matrix: check for infinite loops."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)