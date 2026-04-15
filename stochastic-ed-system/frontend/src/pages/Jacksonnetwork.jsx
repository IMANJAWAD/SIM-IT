import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  Handle,
  Position,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Stethoscope, 
  Bed, 
  AlertTriangle, 
  Zap,
  Activity,
  Users,
  Grid3X3,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Server,
  ArrowRightLeft
} from 'lucide-react';
import { showConfirm } from '../components/CustomAlert';

// Landing-aligned palette for consistent look and feel
const COLORS = {
  bgLight: '#f5f8fb',
  primary: '#003049',
  secondary: '#669BBC',
  alertHint: '#780000',
  accent: '#669BBC',
  white: '#ffffff',
  textDark: '#003049',
  textMuted: '#557283',
  border: '#c7dceb',
  success: '#2a9d8f',
  warning: '#669BBC',
  danger: '#780000',
};

// Custom Hospital Node Component
function HospitalNode({ data }) {
  const { label, icon: Icon, utilization, servers, patients, type, nodeId, onClick, isStable } = data;
  
  const getHeatColor = (util) => {
    if (util < 0.5) return COLORS.success;
    if (util < 0.8) return COLORS.warning;
    return COLORS.danger;
  };

  const heatColor = getHeatColor(utilization);
  const utilizationPercent = Math.min(utilization * 100, 100);

  const handleClick = () => {
    if (onClick) {
      onClick(nodeId);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="relative bg-white rounded-2xl shadow-lg border-2 overflow-hidden cursor-pointer transition-all"
      style={{ 
        width: '220px', 
        height: '160px',
        borderColor: isStable === false ? COLORS.danger : heatColor,
        boxShadow: `0 8px 25px -5px ${isStable === false ? COLORS.danger : heatColor}40`
      }}
    >
      <div 
        className="absolute top-0 left-0 right-0 h-2"
        style={{ background: `linear-gradient(90deg, ${isStable === false ? COLORS.danger : heatColor}, ${isStable === false ? COLORS.danger : heatColor}80)` }}
      />
      
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="p-2 rounded-xl"
            style={{ background: `${heatColor}20` }}
          >
            <Icon className="w-5 h-5" style={{ color: heatColor }} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: COLORS.textDark }}>{label}</h3>
            <p className="text-xs" style={{ color: COLORS.textMuted }}>{type}</p>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium" style={{ color: COLORS.textMuted }}>Utilization</span>
              <span className="text-xs font-bold" style={{ color: heatColor }}>
                {utilizationPercent.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${utilizationPercent}%` }}
                transition={{ duration: 0.5 }}
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  background: `linear-gradient(90deg, ${heatColor}, ${heatColor}80)`,
                  width: `${utilizationPercent}%`
                }}
              />
            </div>
          </div>

          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" style={{ color: COLORS.textMuted }} />
              <span style={{ color: COLORS.textMuted }}>Servers: </span>
              <span className="font-bold" style={{ color: COLORS.textDark }}>{servers}</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3" style={{ color: COLORS.textMuted }} />
              <span style={{ color: COLORS.textMuted }}>Queue: </span>
              <span className="font-bold" style={{ color: COLORS.textDark }}>{Math.round(patients)}</span>
            </div>
          </div>
          
          {isStable === false && (
            <div className="flex items-center gap-1 text-xs mt-1" style={{ color: COLORS.alertHint }}>
              <AlertCircle className="w-3 h-3" />
              <span>Unstable! ρ ≥ 1.0</span>
            </div>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </motion.div>
  );
}

const nodeTypes = { hospitalNode: HospitalNode };

// Jackson Network Calculator with Integer Queue Lengths
class JacksonNetworkCalculator {
  constructor(nodes, routingMatrix, externalArrival) {
    this.nodes = nodes;
    this.routingMatrix = routingMatrix;
    this.externalArrival = externalArrival;
    this.numNodes = nodes.length;
  }

  // Solve traffic equations: λ = α + λ * P
  solveTrafficEquations() {
    // Build matrix A = I - P^T
    const A = Array(this.numNodes).fill().map(() => Array(this.numNodes).fill(0));
    
    for (let i = 0; i < this.numNodes; i++) {
      for (let j = 0; j < this.numNodes; j++) {
        if (i === j) {
          A[i][j] = 1 - this.routingMatrix[j][i];
        } else {
          A[i][j] = -this.routingMatrix[j][i];
        }
      }
    }
    
    // Solve using Gaussian elimination
    const externalArrivals = Array(this.numNodes).fill(0);
    externalArrivals[0] = this.externalArrival; // All arrivals enter at triage
    
    const lambda = this.gaussianElimination(A, externalArrivals);
    return lambda;
  }

  gaussianElimination(A, b) {
    const n = this.numNodes;
    // Create augmented matrix
    const aug = A.map((row, i) => [...row, b[i]]);
    
    // Forward elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
          maxRow = k;
        }
      }
      
      // Swap
      [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];
      
      // Make diagonal 1
      const pivot = aug[i][i];
      if (Math.abs(pivot) < 1e-10) continue;
      
      for (let k = i; k <= n; k++) {
        aug[i][k] /= pivot;
      }
      
      // Eliminate below and above
      for (let k = 0; k < n; k++) {
        if (k !== i && Math.abs(aug[k][i]) > 1e-10) {
          const factor = aug[k][i];
          for (let j = i; j <= n; j++) {
            aug[k][j] -= factor * aug[i][j];
          }
        }
      }
    }
    
    // Extract solution
    const x = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      x[i] = aug[i][n];
    }
    return x;
  }

  // Calculate M/M/c queue metrics with integer queue lengths
  calculateMetrics(lambda, mu, c) {
    const rho = lambda / (c * mu);
    
    if (rho >= 1) {
      return {
        rho,
        isStable: false,
        L: Infinity,
        Lq: Infinity,
        W: Infinity,
        Wq: Infinity,
        P0: 0,
        // For unstable systems, use approximation
        expectedQueueLength: Math.floor(lambda * 10), // Rough approximation
        expectedPatientsInSystem: Math.floor(lambda * 10 + c * rho)
      };
    }
    
    // Calculate P0 for M/M/c
    let sum = 0;
    for (let n = 0; n < c; n++) {
      sum += Math.pow(c * rho, n) / this.factorial(n);
    }
    const term = Math.pow(c * rho, c) / (this.factorial(c) * (1 - rho));
    const P0 = 1 / (sum + term);
    
    // Calculate queue metrics (these are expected values)
    const Lq_expected = P0 * Math.pow(c * rho, c) * rho / (this.factorial(c) * Math.pow(1 - rho, 2));
    const L_expected = Lq_expected + c * rho;
    const Wq_expected = Lq_expected / lambda;
    const W_expected = Wq_expected + 1 / mu;
    
    // Convert to integer values for display (using rounding with Poisson-like distribution)
    // The actual queue length is a random variable, we show the expected value rounded
    // But also provide the most likely integer values
    const expectedQueueLength = Math.round(Lq_expected);
    const expectedPatientsInSystem = Math.round(L_expected);
    
    // Calculate probability distribution for queue length
    const queueProbabilities = this.calculateQueueProbabilities(P0, c, rho, lambda, mu);
    
    return {
      rho,
      isStable: true,
      L: L_expected,
      Lq: Lq_expected,
      W: W_expected,
      Wq: Wq_expected,
      P0,
      expectedQueueLength,
      expectedPatientsInSystem,
      queueProbabilities
    };
  }

  // Calculate probability distribution of queue length (for integer values)
  calculateQueueProbabilities(P0, c, rho, lambda, mu) {
    const probabilities = [];
    
    // P(n) for n < c
    for (let n = 0; n < c; n++) {
      const pn = P0 * Math.pow(c * rho, n) / this.factorial(n);
      probabilities.push({ n, probability: pn });
    }
    
    // P(n) for n >= c
    for (let n = c; n <= c + 20; n++) {
      const pn = P0 * Math.pow(c * rho, n) / (this.factorial(c) * Math.pow(c, n - c));
      probabilities.push({ n, probability: pn });
    }
    
    return probabilities;
  }

  factorial(n) {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  // Calculate total cost
  calculateTotalCost(costPerHourPerServer, servers) {
    return costPerHourPerServer * servers;
  }

  // Full network analysis
  analyzeNetwork() {
    const lambda = this.solveTrafficEquations();
    const results = [];
    let totalCost = 0;
    let totalPatients = 0;
    let systemStable = true;
    
    for (let i = 0; i < this.numNodes; i++) {
      const node = this.nodes[i];
      const metrics = this.calculateMetrics(lambda[i], node.mu, node.c);
      const nodeCost = this.calculateTotalCost(node.costPerHour, node.c);
      
      results.push({
        name: node.name,
        lambda: lambda[i],
        mu: node.mu,
        c: node.c,
        ...metrics,
        costPerHour: nodeCost,
        totalPatientsInSystem: metrics.expectedPatientsInSystem
      });
      
      totalCost += nodeCost;
      totalPatients += metrics.expectedPatientsInSystem;
      if (!metrics.isStable) systemStable = false;
    }
    
    return {
      results,
      totalCost,
      totalPatients: Math.round(totalPatients),
      systemStable,
      throughput: lambda[0] // Throughput equals arrival rate at first node
    };
  }

  // Discrete Event Simulation for accurate integer counts
  discreteEventSimulation(durationMinutes, warmupMinutes = 10) {
    const lambda = this.solveTrafficEquations();
    const timePoints = [];
    const queueLengths = Array(this.numNodes).fill().map(() => []);
    const utilizations = Array(this.numNodes).fill().map(() => []);
    
    // Initialize queues as integers
    const currentQueues = Array(this.numNodes).fill(0);
    const currentServersBusy = Array(this.numNodes).fill(0);
    const eventTimes = Array(this.numNodes).fill().map(() => []);
    
    const totalDuration = durationMinutes + warmupMinutes;
    const timeStep = 0.5; // Sample every 0.5 minutes
    
    // Run simulation
    for (let t = 0; t <= totalDuration; t += timeStep) {
      if (t >= warmupMinutes) {
        timePoints.push(t - warmupMinutes);
      }
      
      for (let i = 0; i < this.numNodes; i++) {
        const node = this.nodes[i];
        const arrivalRate = lambda[i];
        const serviceRate = node.mu;
        const numServers = node.c;
        
        // Poisson arrivals (random integer increments)
        const expectedArrivals = arrivalRate * (timeStep / 60);
        let arrivals = Math.floor(expectedArrivals);
        if (Math.random() < expectedArrivals - arrivals) arrivals++;
        
        // Poisson service completions
        const busyServers = Math.min(currentServersBusy[i], numServers);
        const expectedCompletions = busyServers * serviceRate * (timeStep / 60);
        let completions = Math.floor(expectedCompletions);
        if (Math.random() < expectedCompletions - completions) completions++;
        
        // Update queue
        currentQueues[i] = Math.max(0, currentQueues[i] + arrivals - completions);
        currentServersBusy[i] = Math.min(numServers, currentServersBusy[i] + arrivals);
        currentServersBusy[i] = Math.max(0, currentServersBusy[i] - completions);
        
        // Record metrics
        if (t >= warmupMinutes) {
          queueLengths[i].push(currentQueues[i]);
          utilizations[i].push(currentServersBusy[i] / numServers);
        }
      }
    }
    
    return {
      timePoints,
      queueLengths,
      utilizations
    };
  }
}

export default function JacksonNetwork() {
  const navigate = useNavigate();
  
  // Configuration state
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [networkMetrics, setNetworkMetrics] = useState(null);
  
  // Side drawer state
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // External arrival rate (patients per hour)
  const [externalArrival, setExternalArrival] = useState(12.0);

  // Node configuration state
  const [nodeConfigs, setNodeConfigs] = useState({
    triage: {
      serviceRate: 10.0,
      servers: 3,
      costPerHour: 45.0,
      name: "Triage"
    },
    er_minor: {
      serviceRate: 3.5,
      servers: 4,
      costPerHour: 65.0,
      name: "ER Minor"
    },
    trauma: {
      serviceRate: 2.0,
      servers: 3,
      costPerHour: 85.0,
      name: "Trauma"
    },
    xray: {
      serviceRate: 5.0,
      servers: 2,
      costPerHour: 120.0,
      name: "X-Ray"
    }
  });

  // Routing Matrix State (4x4 matrix)
  const [routingMatrix, setRoutingMatrix] = useState([
    [0.0, 0.5, 0.3, 0.0], // Triage -> [Triage, ER Minor, Trauma, X-Ray]
    [0.0, 0.0, 0.0, 0.4], // ER Minor -> [Triage, ER Minor, Trauma, X-Ray]
    [0.0, 0.0, 0.0, 0.7], // Trauma -> [Triage, ER Minor, Trauma, X-Ray]
    [0.0, 0.2, 0.1, 0.0]  // X-Ray -> [Triage, ER Minor, Trauma, X-Ray]
  ]);

  const departments = ['Triage', 'ER Minor', 'Trauma', 'X-Ray'];
  const departmentIds = ['triage', 'er_minor', 'trauma', 'xray'];

  // Calculate network metrics whenever configuration changes
  useEffect(() => {
    const nodes = departmentIds.map(id => ({
      name: nodeConfigs[id].name,
      mu: nodeConfigs[id].serviceRate,
      c: nodeConfigs[id].servers,
      costPerHour: nodeConfigs[id].costPerHour
    }));
    
    const calculator = new JacksonNetworkCalculator(nodes, routingMatrix, externalArrival);
    const metrics = calculator.analyzeNetwork();
    setNetworkMetrics(metrics);
    
    // Log for debugging
    console.log('Network Analysis:', metrics);
  }, [nodeConfigs, routingMatrix, externalArrival]);

  // Calculate row sums for validation
  const rowSums = useMemo(() => {
    return routingMatrix.map(row => 
      row.reduce((sum, val) => sum + val, 0)
    );
  }, [routingMatrix]);

  // Check if any row has invalid sum (> 1.0)
  const hasInvalidRows = useMemo(() => {
    return rowSums.some(sum => sum > 1.0);
  }, [rowSums]);

  // Get current network metrics for display
  const getNodeMetrics = (nodeId) => {
    if (!networkMetrics) return null;
    const index = departmentIds.indexOf(nodeId);
    if (index === -1) return null;
    return networkMetrics.results[index];
  };

  // Prepare hospital data for preview with INTEGER patient counts
  const hospitalData = useMemo(() => {
    const data = {};
    departmentIds.forEach((id, index) => {
      const metrics = getNodeMetrics(id);
      if (metrics) {
        data[id] = {
          utilization: metrics.rho,
          servers: nodeConfigs[id].servers,
          patients: metrics.expectedPatientsInSystem, // Now an integer!
          isStable: metrics.isStable
        };
      } else {
        data[id] = {
          utilization: 0,
          servers: nodeConfigs[id].servers,
          patients: 0,
          isStable: true
        };
      }
    });
    return data;
  }, [networkMetrics, nodeConfigs]);

  // Call Jackson Network Time-Series API
  // Call Jackson Network Time-Series API
  const callJacksonTimeSeriesAPI = async () => {
    try {
      setApiError(null);
      setIsLoading(true);
      
      const nodes = departmentIds.map(id => ({
        name: nodeConfigs[id].name,
        mu: nodeConfigs[id].serviceRate,
        c: nodeConfigs[id].servers
      }));
      
      const requestData = {
        nodes: nodes,
        matrix: routingMatrix,
        external_arrival: externalArrival,
        simulation_minutes: 10,
        sample_interval: 0.5
      };
      
      console.log('Calling backend API with data:', requestData);
      
      // Call backend API
      const response = await fetch('http://localhost:8000/api/jackson/simulate-timeseries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Backend API Response:', result);
      
      // Transform backend response to match frontend expectations
      const transformedResult = {
        status: result.status,
        simulation_config: result.simulation_config,
        timeseries_data: result.timeseries_data,
        simulation_summary: result.simulation_summary,
        steady_state_reference: result.steady_state_reference,
        message: 'Jackson Network simulation from backend API'
      };
      
      setIsLoading(false);
      return transformedResult;
      
    } catch (error) {
      console.error('API Error:', error);
      setApiError(error.message);
      
      // Fallback to local simulation if API fails
      console.log('Falling back to local simulation...');
      try {
        const nodes = departmentIds.map(id => ({
          name: nodeConfigs[id].name,
          mu: nodeConfigs[id].serviceRate,
          c: nodeConfigs[id].servers,
          costPerHour: nodeConfigs[id].costPerHour
        }));
        
        const calculator = new JacksonNetworkCalculator(
          nodes,
          routingMatrix,
          externalArrival
        );
        
        const metrics = calculator.analyzeNetwork();
        const simulation = calculator.discreteEventSimulation(60, 10);
        
        const fallbackResult = {
          status: 'Success',
          simulation_config: {
            duration_minutes: 10,
            sample_interval: 0.5,
            total_samples: simulation.timePoints.length,
            external_arrival_rate: externalArrival
          },
          timeseries_data: simulation.timePoints.map((time, index) => ({
            time_minutes: time,
            timestamp: `${Math.floor(time)}:${Math.floor((time % 1) * 60).toString().padStart(2, '0')}`,
            nodes: departmentIds.map((id, nodeIndex) => ({
              name: nodeConfigs[id].name,
              utilization: (simulation.utilizations[nodeIndex][index] || 0) * 100,
              queue_length: simulation.queueLengths[nodeIndex][index] || 0,
              wait_time_mins: ((simulation.queueLengths[nodeIndex][index] || 0) / (metrics.results[nodeIndex]?.lambda || 1)) * 60,
              arrival_rate: metrics.results[nodeIndex]?.lambda || 0,
              throughput: (simulation.utilizations[nodeIndex][index] || 0) * nodeConfigs[id].servers * nodeConfigs[id].serviceRate
            })),
            system_metrics: {
              avg_utilization: simulation.utilizations.reduce((sum, nodeUtil) => 
                sum + (nodeUtil[index] || 0), 0) / departmentIds.length * 100,
              peak_utilization: Math.max(...simulation.utilizations.map(nodeUtil => 
                (nodeUtil[index] || 0) * 100)),
              total_throughput: simulation.utilizations.reduce((sum, nodeUtil, nodeIndex) => 
                sum + (nodeUtil[index] || 0) * nodeConfigs[departmentIds[nodeIndex]].servers * nodeConfigs[departmentIds[nodeIndex]].serviceRate, 0),
              total_queue_length: simulation.queueLengths.reduce((sum, nodeQueue) => 
                sum + (nodeQueue[index] || 0), 0),
              safety_margin: 100 - Math.max(...simulation.utilizations.map(nodeUtil => 
                (nodeUtil[index] || 0) * 100)),
              system_load: "Medium"
            }
          })),
          simulation_summary: {
            converged_to_steady_state: true,
            final_avg_utilization: metrics.results.reduce((sum, node) => sum + (node.rho * 100), 0) / metrics.results.length,
            final_peak_utilization: Math.max(...metrics.results.map(node => node.rho * 100)),
            system_stability: metrics.systemStable ? "Stable" : "Unstable"
          },
          message: 'Local fallback simulation (API unavailable)'
        };
        
        setIsLoading(false);
        return fallbackResult;
        
      } catch (fallbackError) {
        console.error('Fallback simulation failed:', fallbackError);
        setIsLoading(false);
        return null;
      }
    }
  };

  // Start simulation and navigate to results
  const startSimulation = async () => {
    // Check stability first
    if (networkMetrics && !networkMetrics.systemStable) {
      const unstableNodes = networkMetrics.results
        .filter(r => !r.isStable)
        .map(r => r.name);
      
      const shouldContinue = await showConfirm(
        `The following nodes are unstable (ρ ≥ 1.0):\n${unstableNodes.join(', ')}\n\nSimulation results may show infinite queues. Continue anyway?`,
        {
          title: 'System Stability Warning',
          confirmLabel: 'Continue Anyway',
          cancelLabel: 'Cancel'
        }
      );
      
      if (!shouldContinue) {
        return;
      }
    }
    
    console.log('Starting discrete event simulation...');
    const result = await callJacksonTimeSeriesAPI();
    
    if (result && result.status === 'Success') {
      // Store results and navigate to results page
      localStorage.setItem('jacksonResults', JSON.stringify(result));
      navigate('/jackson-results', { state: { jacksonResults: result } });
    }
  };

  // Handle node click to open side drawer
  const handleNodeClick = (nodeId) => {
    setSelectedNode(nodeId);
    setIsDrawerOpen(true);
  };

  // Close drawer
  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedNode(null);
  };

  // Update node configuration
  const updateNodeConfig = (nodeId, field, value) => {
    setNodeConfigs(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  // Hospital nodes for ReactFlow
  const hospitalNodes = [
    {
      id: 'triage',
      type: 'hospitalNode',
      position: { x: 100, y: 200 },
      data: {
        label: 'Triage',
        type: 'Initial Assessment',
        icon: Stethoscope,
        utilization: hospitalData.triage?.utilization || 0,
        servers: hospitalData.triage?.servers || 3,
        patients: hospitalData.triage?.patients || 0,
        nodeId: 'triage',
        onClick: handleNodeClick,
        isStable: hospitalData.triage?.isStable
      }
    },
    {
      id: 'er_minor',
      type: 'hospitalNode',
      position: { x: 400, y: 100 },
      data: {
        label: 'ER (Minor)',
        type: 'Non-Critical Care',
        icon: Bed,
        utilization: hospitalData.er_minor?.utilization || 0,
        servers: hospitalData.er_minor?.servers || 4,
        patients: hospitalData.er_minor?.patients || 0,
        nodeId: 'er_minor',
        onClick: handleNodeClick,
        isStable: hospitalData.er_minor?.isStable
      }
    },
    {
      id: 'trauma',
      type: 'hospitalNode',
      position: { x: 400, y: 300 },
      data: {
        label: 'Trauma (Major)',
        type: 'Critical Care',
        icon: AlertTriangle,
        utilization: hospitalData.trauma?.utilization || 0,
        servers: hospitalData.trauma?.servers || 3,
        patients: hospitalData.trauma?.patients || 0,
        nodeId: 'trauma',
        onClick: handleNodeClick,
        isStable: hospitalData.trauma?.isStable
      }
    },
    {
      id: 'xray',
      type: 'hospitalNode',
      position: { x: 700, y: 200 },
      data: {
        label: 'X-Ray',
        type: 'Diagnostics',
        icon: Zap,
        utilization: hospitalData.xray?.utilization || 0,
        servers: hospitalData.xray?.servers || 2,
        patients: hospitalData.xray?.patients || 0,
        nodeId: 'xray',
        onClick: handleNodeClick,
        isStable: hospitalData.xray?.isStable
      }
    }
  ];

  // Generate edges based on routing matrix
  const generateEdges = useCallback(() => {
    const edges = [];
    const nodeIds = ['triage', 'er_minor', 'trauma', 'xray'];
    
    routingMatrix.forEach((row, sourceIndex) => {
      row.forEach((probability, targetIndex) => {
        if (probability > 0 && sourceIndex !== targetIndex) {
          const sourceId = nodeIds[sourceIndex];
          const targetId = nodeIds[targetIndex];
          
          let strokeColor = COLORS.secondary;
          let strokeWidth = 2;
          if (probability >= 0.7) {
            strokeColor = COLORS.danger;
            strokeWidth = 4;
          } else if (probability >= 0.4) {
            strokeColor = COLORS.warning;
            strokeWidth = 3;
          }
          
          edges.push({
            id: `${sourceId}-${targetId}`,
            source: sourceId,
            target: targetId,
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: strokeColor, 
              strokeWidth: strokeWidth,
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor },
            label: `${(probability * 100).toFixed(0)}%`,
            labelStyle: { 
              fontSize: 11, 
              fontWeight: 'bold',
              fill: strokeColor,
              background: COLORS.white,
              padding: '2px 4px',
              borderRadius: '4px'
            }
          });
        }
      });
    });
    
    return edges;
  }, [routingMatrix]);

  const [nodes, setNodes, onNodesChange] = useNodesState(hospitalNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(generateEdges());

  // Update routing matrix
  const updateRoutingMatrix = (sourceIndex, targetIndex, value) => {
    const newMatrix = [...routingMatrix];
    newMatrix[sourceIndex][targetIndex] = Math.max(0, Math.min(1, parseFloat(value) || 0));
    setRoutingMatrix(newMatrix);
  };

  // Reset matrix to default values
  const resetMatrix = () => {
    setRoutingMatrix([
      [0.0, 0.5, 0.3, 0.0],
      [0.0, 0.0, 0.0, 0.4],
      [0.0, 0.0, 0.0, 0.7],
      [0.0, 0.2, 0.1, 0.0]
    ]);
  };

  // Reset all configurations
  const resetAllConfigs = () => {
    setNodeConfigs({
      triage: { serviceRate: 10.0, servers: 3, costPerHour: 45.0, name: "Triage" },
      er_minor: { serviceRate: 3.5, servers: 4, costPerHour: 65.0, name: "ER Minor" },
      trauma: { serviceRate: 2.0, servers: 3, costPerHour: 85.0, name: "Trauma" },
      xray: { serviceRate: 5.0, servers: 2, costPerHour: 120.0, name: "X-Ray" }
    });
    setExternalArrival(12.0);
    resetMatrix();
  };

  // Update edges when routing matrix changes
  useEffect(() => {
    const newEdges = generateEdges();
    setEdges(newEdges);
  }, [routingMatrix, generateEdges, setEdges]);

  // Update nodes when hospital data changes
  useEffect(() => {
    const updatedNodes = hospitalNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        utilization: hospitalData[node.id]?.utilization || 0,
        patients: hospitalData[node.id]?.patients || 0,
        servers: hospitalData[node.id]?.servers || node.data.servers,
        isStable: hospitalData[node.id]?.isStable
      }
    }));
    setNodes(updatedNodes);
  }, [hospitalData]);

  // Get selected node configuration
  const selectedConfig = selectedNode ? nodeConfigs[selectedNode] : null;
  const selectedMetrics = selectedNode ? getNodeMetrics(selectedNode) : null;
  const selectedDeptName = selectedNode ? departments[departmentIds.indexOf(selectedNode)] : '';

  return (
    <div className="min-h-screen pt-16" style={{ background: COLORS.bgLight }}>
      {/* Side Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeDrawer}
          />
        )}
      </AnimatePresence>

      {/* Side Drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedConfig && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: COLORS.textDark }}>{selectedDeptName} Configuration</h2>
                    <p className="text-sm" style={{ color: COLORS.textMuted }}>Adjust parameters and costs</p>
                  </div>
                </div>
                <motion.button
                  onClick={closeDrawer}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" style={{ color: COLORS.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              
              {/* Configuration Sliders */}
              <div className="space-y-6">
                {/* Service Rate */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold" style={{ color: COLORS.textDark }}>
                      Service Rate (μ)
                    </label>
                    <span 
                      className="px-3 py-1 rounded-lg text-sm font-bold"
                      style={{ background: `${COLORS.accent}22`, color: COLORS.primary }}
                    >
                      {selectedConfig.serviceRate.toFixed(1)} /hr
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={selectedConfig.serviceRate}
                    onChange={(e) => updateNodeConfig(selectedNode, 'serviceRate', e.target.value)}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.secondary})` }}
                  />
                  <p className="text-xs" style={{ color: COLORS.textMuted }}>Patients served per hour per server</p>
                </div>

                {/* Number of Servers */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold" style={{ color: COLORS.textDark }}>
                      Number of {selectedNode === 'xray' ? 'Machines' : 'Staff'} (c)
                    </label>
                    <span 
                      className="px-3 py-1 rounded-lg text-sm font-bold"
                      style={{ background: `${COLORS.accent}22`, color: COLORS.primary }}
                    >
                      {selectedConfig.servers}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={selectedConfig.servers}
                    onChange={(e) => updateNodeConfig(selectedNode, 'servers', e.target.value)}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.secondary})` }}
                  />
                  <p className="text-xs" style={{ color: COLORS.textMuted }}>
                    {selectedNode === 'xray' ? 'X-ray machines available' : 'Medical staff assigned'}
                  </p>
                </div>

                {/* Cost per Hour */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold" style={{ color: COLORS.textDark }}>
                      Cost per Hour ($/hr)
                    </label>
                    <span 
                      className="px-3 py-1 rounded-lg text-sm font-bold"
                      style={{ background: `${COLORS.accent}22`, color: COLORS.primary }}
                    >
                      ${selectedConfig.costPerHour.toFixed(0)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    step="5"
                    value={selectedConfig.costPerHour}
                    onChange={(e) => updateNodeConfig(selectedNode, 'costPerHour', e.target.value)}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${COLORS.secondary}, ${COLORS.alertHint})` }}
                  />
                  <p className="text-xs" style={{ color: COLORS.textMuted }}>Operating cost per server per hour</p>
                </div>
              </div>

              {/* Performance Metrics */}
              {selectedMetrics && (
                <div className="mt-8 p-4 rounded-xl" style={{ background: `${COLORS.bgLight}50`, border: `1px solid ${COLORS.secondary}30` }}>
                  <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: COLORS.textDark }}>
                    <TrendingUp className="w-4 h-4" />
                    Performance Metrics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: COLORS.textMuted }}>Arrival Rate (λ)</span>
                      <span className="font-bold" style={{ color: COLORS.primary }}>
                        {selectedMetrics.lambda.toFixed(2)} /hr
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: COLORS.textMuted }}>Utilization (ρ)</span>
                      <span className="font-bold" style={{ color: selectedMetrics.rho >= 1 ? COLORS.alertHint : COLORS.primary }}>
                        {selectedMetrics.rho.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: COLORS.textMuted }}>Expected Queue Length</span>
                      <span className="font-bold" style={{ color: COLORS.primary }}>
                        {selectedMetrics.expectedQueueLength} patients
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: COLORS.textMuted }}>Expected Total in System</span>
                      <span className="font-bold" style={{ color: COLORS.primary }}>
                        {selectedMetrics.expectedPatientsInSystem} patients
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: COLORS.textMuted }}>Avg. Wait Time (Wq)</span>
                      <span className="font-bold" style={{ color: COLORS.primary }}>
                        {selectedMetrics.Wq.toFixed(2)} hours
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Analysis */}
              <div className="mt-6 p-4 rounded-xl" style={{ background: `${COLORS.bgLight}50`, border: `1px solid ${COLORS.secondary}30` }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: COLORS.textDark }}>
                  <DollarSign className="w-4 h-4" />
                  Financial Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: COLORS.textMuted }}>Hourly Cost</span>
                    <span className="font-bold" style={{ color: COLORS.primary }}>
                      ${(selectedConfig.costPerHour * selectedConfig.servers).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: COLORS.textMuted }}>Daily Cost (24h)</span>
                    <span className="font-bold" style={{ color: COLORS.primary }}>
                      ${(selectedConfig.costPerHour * selectedConfig.servers * 24).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: COLORS.textMuted }}>Monthly Cost (30d)</span>
                    <span className="font-bold" style={{ color: COLORS.primary }}>
                      ${(selectedConfig.costPerHour * selectedConfig.servers * 24 * 30).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: COLORS.textMuted }}>Cost per Patient</span>
                    <span className="font-bold" style={{ color: COLORS.primary }}>
                      ${(selectedConfig.costPerHour / selectedConfig.serviceRate).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeDrawer}
                  className="flex-1 py-3 rounded-xl font-semibold text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
                >
                  Apply Changes
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 bg-white rounded-2xl border shadow-sm p-6 space-y-6" style={{ borderColor: COLORS.border }}>
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className=""
          >
            <div className="p-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: COLORS.textMuted }}>
                    Jackson Network Configuration
                  </p>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: COLORS.textDark }}>
                    Hospital Network Setup
                  </h1>
                 
                </div>
                
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={resetAllConfigs}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-3 rounded-xl font-semibold flex items-center gap-2 border-2 transition-all"
                    style={{ borderColor: COLORS.secondary, color: COLORS.primary }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset All
                  </motion.button>
                  
                  {apiError && (
                    <div className="text-right">
                      <p className="text-sm" style={{ color: COLORS.alertHint }}>Simulation Note</p>
                      <p className="text-xs" style={{ color: COLORS.alertHint }}>Using local DES</p>
                    </div>
                  )}
                  
                  <motion.button
                    onClick={startSimulation}
                    whileHover={{ scale: (isLoading || hasInvalidRows) ? 1 : 1.02 }}
                    whileTap={{ scale: (isLoading || hasInvalidRows) ? 1 : 0.98 }}
                    disabled={isLoading || hasInvalidRows}
                    className="px-8 py-4 rounded-xl font-semibold flex items-center gap-3 text-white shadow-lg transition-all"
                    style={{ 
                      background: (isLoading || hasInvalidRows)
                        ? `linear-gradient(135deg, #6b7280, #9ca3af)` 
                        : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                      cursor: (isLoading || hasInvalidRows) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Running DES...
                      </>
                    ) : hasInvalidRows ? (
                      <>
                        <AlertCircle className="w-5 h-5" />
                        Fix Matrix Errors
                      </>
                    ) : (
                      <>
                        <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent" />
                        Run Jackson Simulation
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* System Overview Stats */}
          {networkMetrics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className=""
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="rounded-xl p-3" style={{ background: `${COLORS.secondary}10`, border: `1px solid ${COLORS.border}` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: COLORS.textMuted }}>System Status</span>
                  {networkMetrics.systemStable ? (
                    <CheckCircle className="w-5 h-5" style={{ color: COLORS.success }} />
                  ) : (
                    <AlertCircle className="w-5 h-5" style={{ color: COLORS.alertHint }} />
                  )}
                </div>
                <p className="text-2xl font-bold" style={{ color: networkMetrics.systemStable ? COLORS.success : COLORS.alertHint }}>
                  {networkMetrics.systemStable ? 'Stable' : 'Unstable'}
                </p>
              </div>
              
              <div className="rounded-xl p-3" style={{ background: `${COLORS.secondary}10`, border: `1px solid ${COLORS.border}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRightLeft className="w-5 h-5" style={{ color: COLORS.primary }} />
                  <span className="text-sm" style={{ color: COLORS.textMuted }}>Throughput</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: COLORS.textDark }}>
                  {networkMetrics.throughput.toFixed(2)} <span className="text-sm">pts/hr</span>
                </p>
              </div>
              
              <div className="rounded-xl p-3" style={{ background: `${COLORS.secondary}10`, border: `1px solid ${COLORS.border}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5" style={{ color: COLORS.primary }} />
                  <span className="text-sm" style={{ color: COLORS.textMuted }}>Total Patients</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: COLORS.textDark }}>
                  {networkMetrics.totalPatients}
                </p>
              </div>
              
              <div className="rounded-xl p-3" style={{ background: `${COLORS.secondary}10`, border: `1px solid ${COLORS.border}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" style={{ color: COLORS.primary }} />
                  <span className="text-sm" style={{ color: COLORS.textMuted }}>Total Cost/hr</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: COLORS.textDark }}>
                  ${networkMetrics.totalCost.toFixed(0)}
                </p>
              </div>
              </div>
            </motion.div>
          )}

          {/* External Arrival Rate Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-bold" style={{ color: COLORS.textDark }}>External Arrival Rate</h3>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={externalArrival}
                  onChange={(e) => setExternalArrival(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.secondary})` }}
                />
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold" style={{ color: COLORS.primary }}>
                  {externalArrival.toFixed(2)}
                </span>
                <span className="text-sm ml-2" style={{ color: COLORS.textMuted }}>patients/hour</span>
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: COLORS.textMuted }}>All patients arrive at Triage department (Poisson process)</p>
          </motion.div>
          </div>

          {/* Network Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 bg-white rounded-2xl shadow-sm border overflow-hidden"
            style={{ borderColor: COLORS.border, height: '600px' }}
          >
            <div className="p-6 border-b" style={{ borderColor: COLORS.border }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: COLORS.textDark }}>Network Visualization</h2>
                                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS.success }} />
                    <span style={{ color: COLORS.textMuted }}>ρ &lt; 0.5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS.warning }} />
                    <span style={{ color: COLORS.textMuted }}>0.5 ≤ ρ &lt; 0.8</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS.danger }} />
                    <span style={{ color: COLORS.textMuted }}>ρ ≥ 0.8</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
                proOptions={{ hideAttribution: true }}
              >
                <Background 
                  color={COLORS.border}
                  gap={20} 
                  size={1}
                  style={{ backgroundColor: '#f7fbff' }}
                />
                <Controls 
                  className="bg-white rounded-lg shadow-lg border"
                  style={{ borderColor: COLORS.border }}
                />
              </ReactFlow>
            </div>
          </motion.div>

          {/* Routing Matrix Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border overflow-hidden"
            style={{ borderColor: COLORS.border }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: COLORS.textDark }}>Routing Matrix Editor</h2>
                    <p style={{ color: COLORS.textMuted }}>Configure patient flow probabilities between departments</p>
                  </div>
                </div>
                <motion.button
                  onClick={resetMatrix}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 rounded-xl font-semibold flex items-center gap-2 border-2 transition-all"
                  style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Matrix
                </motion.button>
              </div>

              {/* Matrix Grid */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-3 text-left font-semibold" style={{ color: COLORS.textDark }}>Source → Destination</th>
                      {departments.map((dept, index) => (
                        <th key={index} className="p-3 text-center font-semibold" style={{ color: COLORS.primary }}>
                          {dept}
                        </th>
                      ))}
                      <th className="p-3 text-center font-semibold" style={{ color: COLORS.textDark }}>Exit Probability</th>
                      <th className="p-3 text-center font-semibold" style={{ color: COLORS.textDark }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((sourceDept, sourceIndex) => {
                      const rowSum = rowSums[sourceIndex];
                      const isInvalid = rowSum > 1.0;
                      const isComplete = Math.abs(rowSum - 1.0) < 0.01;
                      
                      return (
                        <tr key={sourceIndex} className={`border-t border-gray-100 ${isInvalid ? 'bg-red-50' : isComplete ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <td className="p-3 font-semibold" style={{ color: COLORS.primary }}>
                            {sourceDept}
                          </td>
                          {departments.map((targetDept, targetIndex) => (
                            <td key={targetIndex} className="p-2">
                              <input
                                type="number"
                                min="0"
                                max="1"
                                step="0.01"
                                value={routingMatrix[sourceIndex][targetIndex]}
                                onChange={(e) => updateRoutingMatrix(sourceIndex, targetIndex, e.target.value)}
                                className={`w-full p-2 text-center rounded-lg border-2 font-medium transition-all ${
                                  sourceIndex === targetIndex 
                                    ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' 
                                      : 'border-gray-200 focus:outline-none'
                                }`}
                                  style={sourceIndex === targetIndex ? {} : { outlineColor: COLORS.secondary }}
                                disabled={sourceIndex === targetIndex}
                                placeholder="0.00"
                              />
                            </td>
                          ))}
                          <td className="p-3 text-center">
                            {isInvalid ? (
                              <span className="px-3 py-1 rounded-lg font-bold text-sm bg-red-100 text-red-700">
                                Error: {rowSum.toFixed(2)}
                              </span>
                            ) : (
                              <span 
                                className={`px-3 py-1 rounded-lg font-bold text-sm ${
                                  isComplete 
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {isComplete ? '0.00' : (1 - rowSum).toFixed(2)}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {isInvalid ? (
                              <div className="flex items-center justify-center gap-1 text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">Invalid</span>
                              </div>
                            ) : isComplete ? (
                              <div className="flex items-center justify-center gap-1 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">Valid</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1 text-yellow-600">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs font-medium">Exit Path</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Matrix Rules */}
              <div className="mt-6 p-4 rounded-xl" style={{ background: `${COLORS.bgLight}50` }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: COLORS.textDark }}>
                  <Server className="w-4 h-4" />
                  Jackson Network Rules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ background: COLORS.success }} />
                    <div>
                      <p className="font-medium" style={{ color: COLORS.textDark }}>Valid Row (Sum = 1.0)</p>
                      <p className="text-gray-600">All patients accounted for, Exit Probability: 0.0</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ background: COLORS.warning }} />
                    <div>
                      <p className="font-medium" style={{ color: COLORS.textDark }}>Exit Path (Sum &lt; 1.0)</p>
                      <p className="text-gray-600">Patients can leave the system, Exit Probability shown</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ background: COLORS.danger }} />
                    <div>
                      <p className="font-medium" style={{ color: COLORS.textDark }}>Invalid Row (Sum &gt; 1.0)</p>
                      <p className="text-gray-600">Probability cannot exceed 100% - Simulation disabled</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}