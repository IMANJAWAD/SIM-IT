#!/usr/bin/env python3
"""
Test script to identify the issue with priority queue simulation
"""

import sys
import traceback

try:
    print("Testing imports...")
    
    from fastapi import APIRouter, HTTPException
    print("✓ FastAPI imports successful")
    
    from pydantic import BaseModel
    print("✓ Pydantic imports successful")
    
    import numpy as np
    print("✓ NumPy imports successful")
    
    import simpy
    print("✓ SimPy imports successful")
    
    import math
    print("✓ Math imports successful")
    
    import random
    import statistics
    import time
    print("✓ All standard library imports successful")
    
    # Test the problematic function
    def test_calculate_priority_waits():
        print("\nTesting calculate_priority_waits function...")
        
        total_lambda = 15.0
        mu = 3.0
        c = 4
        distributions = [0.05, 0.15, 0.30, 0.35, 0.15]
        preemptive = False
        
        # Calculate individual arrival rates for each class
        lambdas = [total_lambda * p for p in distributions]
        print(f"Arrival rates: {lambdas}")
        
        # Calculate individual utilization (rho) for each class
        total_service_capacity = c * mu
        rhos = [lam / total_service_capacity for lam in lambdas]
        print(f"Utilizations: {rhos}")
        
        # Cumulative utilization (Sigma)
        sigmas = np.cumsum(rhos)
        print(f"Cumulative utilizations: {sigmas}")
        
        # System utilization check
        system_rho = sum(rhos)
        print(f"System utilization: {system_rho}")
        
        # Test Erlang-C calculation
        if system_rho < 1.0:
            rho_total = total_lambda / total_service_capacity
            print(f"Total rho: {rho_total}")
            
            # Test factorial calculation
            try:
                sum_term = sum([(c * rho_total)**k / math.factorial(k) for k in range(c)])
                print(f"Sum term: {sum_term}")
                
                if c * rho_total != c:
                    erlang_c_numerator = (c * rho_total)**c / (math.factorial(c) * (1 - rho_total))
                    print(f"Erlang-C numerator: {erlang_c_numerator}")
                else:
                    erlang_c_numerator = float('inf')
                    print("Erlang-C numerator: infinity")
                
                if erlang_c_numerator != float('inf'):
                    p0 = 1 / (sum_term + erlang_c_numerator)
                    prob_wait = erlang_c_numerator * p0
                    print(f"P0: {p0}, Prob wait: {prob_wait}")
                else:
                    prob_wait = 1.0
                    print("Prob wait: 1.0 (infinity case)")
                    
            except Exception as e:
                print(f"Error in Erlang-C calculation: {e}")
                traceback.print_exc()
                return False
        
        print("✓ calculate_priority_waits test successful")
        return True
    
    # Test SimPy basic functionality
    def test_simpy():
        print("\nTesting SimPy basic functionality...")
        
        try:
            env = simpy.Environment()
            resource = simpy.PriorityResource(env, capacity=2)
            print("✓ SimPy environment and resource creation successful")
            return True
        except Exception as e:
            print(f"Error in SimPy test: {e}")
            traceback.print_exc()
            return False
    
    # Run tests
    if test_calculate_priority_waits() and test_simpy():
        print("\n✅ All tests passed! The issue might be elsewhere.")
    else:
        print("\n❌ Tests failed. Check the errors above.")
        
except Exception as e:
    print(f"❌ Import or execution error: {e}")
    traceback.print_exc()