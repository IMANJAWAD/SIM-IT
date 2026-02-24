"""
Emergency Department Stochastic Optimization System
FastAPI Backend Server

This application provides:
- Poisson Process patient arrival modeling
- Markov Chain queue analysis
- Monte Carlo simulation
- Sensitivity analysis
- Theoretical vs simulation comparison
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.simulation_routes import router as simulation_router
from routes.markov_routes import router as markov_router
from routes.analysis_routes import router as analysis_router

# Create FastAPI application
app = FastAPI(
    title="ED Stochastic Optimization API",
    description="""
    A comprehensive API for Emergency Department simulation and optimization.
    
    ## Features
    
    - **Poisson Process Modeling**: Patient arrivals follow Poisson distribution
    - **Markov Chain Analysis**: M/M/c queueing system theoretical analysis
    - **Monte Carlo Simulation**: 1000+ replications with confidence intervals
    - **Sensitivity Analysis**: Parameter impact evaluation
    
    ## Endpoints
    
    - `/simulation` - Run discrete-event simulations
    - `/markov` - Markov chain analysis and steady-state computations
    - `/analysis` - Sensitivity analysis and comparisons
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(simulation_router)
app.include_router(markov_router)
app.include_router(analysis_router)

@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "name": "Emergency Department Stochastic Optimization System",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "simulation": "/simulation/run",
            "markov_analysis": "/markov/analyze",
            "sensitivity": "/analysis/sensitivity",
            "comparison": "/analysis/compare",
            "long_term": "/analysis/long-term-behavior",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ed-stochastic-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
