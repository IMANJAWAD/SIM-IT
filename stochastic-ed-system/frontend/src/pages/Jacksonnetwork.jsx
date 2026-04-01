import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  Clock
} from 'lucide-react';

// Color palette
const COLORS = {
  primary: '#0077b6',
  secondary: '#00b4d8',
  accent: '#f0f3bd',
  light: '#caf0f8',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  white: '#ffffff',
};

// Custom Hospital Node Component (Preview Only)
function HospitalNode({ data }) {
  const { label, icon: Icon, utilization, servers, patients, type, nodeId, onClick } = data;
  
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
      className="relative bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden cursor-pointer transition-all"
      style={{ 
        width: '200px', 
        height: '140px',
        borderColor: heatColor,
        boxShadow: `0 8px 25px -5px ${heatColor}40`
      }}
    >
      <div 
        className="absolute top-0 left-0 right-0 h-2"
        style={{ background: `linear-gradient(90deg, ${heatColor}, ${heatColor}80)` }}
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
            <h3 className="font-bold text-sm text-gray-800">{label}</h3>
            <p className="text-xs text-gray-500">{type}</p>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-600">Preview</span>
              <span className="text-xs font-bold" style={{ color: heatColor }}>
                {utilizationPercent.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
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
              <Users className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600">Servers: </span>
              <span className="font-bold text-gray-800">{servers}</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600">Queue: </span>
              <span className="font-bold text-gray-800">{patients}</span>
            </div>
          </div>
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
export default function JacksonNetwork() {
  const navigate = useNavigate();
  
  // Configuration state
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Side drawer state
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Node configuration state
  const [nodeConfigs, setNodeConfigs] = useState({
    triage: {
      serviceRate: 12.0,
      servers: 3,
      costPerHour: 45.0
    },
    er_minor: {
      serviceRate: 4.0,
      servers: 4,
      costPerHour: 65.0
    },
    trauma: {
      serviceRate: 2.5,
      servers: 2,
      costPerHour: 85.0
    },
    xray: {
      serviceRate: 6.0,
      servers: 2,
      costPerHour: 120.0
    }
  });

  // Routing Matrix State (4x4 matrix)
  const [routingMatrix, setRoutingMatrix] = useState([
    [0.0, 0.6, 0.4, 0.0], // Triage -> [Triage, ER Minor, Trauma, X-Ray]
    [0.0, 0.0, 0.0, 0.3], // ER Minor -> [Triage, ER Minor, Trauma, X-Ray]
    [0.0, 0.0, 0.0, 0.8], // Trauma -> [Triage, ER Minor, Trauma, X-Ray]
    [0.0, 0.2, 0.1, 0.0]  // X-Ray -> [Triage, ER Minor, Trauma, X-Ray]
  ]);

  const departments = ['Triage', 'ER Minor', 'Trauma', 'X-Ray'];
  const departmentIds = ['triage', 'er_minor', 'trauma', 'xray'];

  // Calculate row sums for validation
  const rowSums = useMemo(() => {
    return routingMatrix.map(row => 
      row.reduce((sum, val) => sum + val, 0)
    );
  }, [routingMatrix]);

  // Preview hospital data (static for configuration)
  const hospitalData = {
    triage: { utilization: 0.65, servers: nodeConfigs.triage.servers, patients: 8 },
    er_minor: { utilization: 0.45, servers: nodeConfigs.er_minor.servers, patients: 12 },
    trauma: { utilization: 0.85, servers: nodeConfigs.trauma.servers, patients: 5 },
    xray: { utilization: 0.72, servers: nodeConfigs.xray.servers, patients: 6 }
  };

  // Call Jackson Network Time-Series API
  const callJacksonTimeSeriesAPI = async () => {
    try {
      setApiError(null);
      setIsLoading(true);
      
      const requestData = {
        nodes: [
          { name: "Triage", mu: nodeConfigs.triage.serviceRate, c: nodeConfigs.triage.servers },
          { name: "ER Minor", mu: nodeConfigs.er_minor.serviceRate, c: nodeConfigs.er_minor.servers },
          { name: "Trauma", mu: nodeConfigs.trauma.serviceRate, c: nodeConfigs.trauma.servers },
          { name: "X-Ray", mu: nodeConfigs.xray.serviceRate, c: nodeConfigs.xray.servers }
        ],
        matrix: routingMatrix,
        external_arrival: 15.0,
        simulation_minutes: 10,
        sample_interval: 0.5
      };

      console.log('Calling Jackson Time-Series API with data:', requestData);

      const response = await fetch('http://localhost:8000/jackson/simulate-timeseries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Jackson Time-Series API Results:', result);
      
      setIsLoading(false);
      return result;
      
    } catch (error) {
      console.error('Jackson Time-Series API Error:', error);
      setApiError(error.message);
      setIsLoading(false);
      return null;
    }
  };

  // Start simulation and navigate to results
  const startSimulation = async () => {
    console.log('Starting simulation - calling Jackson Time-Series API...');
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

  // Hospital nodes
  const hospitalNodes = [
    {
      id: 'triage',
      type: 'hospitalNode',
      position: { x: 100, y: 200 },
      data: {
        label: 'Triage',
        type: 'Initial Assessment',
        icon: Stethoscope,
        utilization: hospitalData.triage.utilization,
        servers: hospitalData.triage.servers,
        patients: hospitalData.triage.patients,
        nodeId: 'triage',
        onClick: handleNodeClick
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
        utilization: hospitalData.er_minor.utilization,
        servers: hospitalData.er_minor.servers,
        patients: hospitalData.er_minor.patients,
        nodeId: 'er_minor',
        onClick: handleNodeClick
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
        utilization: hospitalData.trauma.utilization,
        servers: hospitalData.trauma.servers,
        patients: hospitalData.trauma.patients,
        nodeId: 'trauma',
        onClick: handleNodeClick
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
        utilization: hospitalData.xray.utilization,
        servers: hospitalData.xray.servers,
        patients: hospitalData.xray.patients,
        nodeId: 'xray',
        onClick: handleNodeClick
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
              strokeDasharray: `${Math.max(4, 12 - probability * 10)} ${Math.max(2, 8 - probability * 6)}`
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor },
            label: `P=${probability.toFixed(2)}`,
            labelStyle: { 
              fontSize: 12, 
              fontWeight: 'bold',
              fill: strokeColor,
              background: 'white'
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
      [0.0, 0.6, 0.4, 0.0],
      [0.0, 0.0, 0.0, 0.3],
      [0.0, 0.0, 0.0, 0.8],
      [0.0, 0.2, 0.1, 0.0]
    ]);
  };

  // Update edges when routing matrix changes
  useMemo(() => {
    const newEdges = generateEdges();
    setEdges(newEdges);
  }, [routingMatrix, generateEdges, setEdges]);

  // Get selected node configuration
  const selectedConfig = selectedNode ? nodeConfigs[selectedNode] : null;
  const selectedDeptName = selectedNode ? departments[departmentIds.indexOf(selectedNode)] : '';

  return (
    <div className="min-h-screen pt-16" style={{ background: `linear-gradient(180deg, ${COLORS.light} 0%, #e0f7fa 100%)` }}>
      {/* Side Drawer Overlay */}
      {isDrawerOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeDrawer}
        />
      )}

      {/* Side Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isDrawerOpen ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
      >
        {selectedConfig && (
          <div className="p-6">
            {/* Drawer Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div 
                  className="p-3 rounded-2xl"
                  style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
                >
                  {selectedNode === 'triage' && <Stethoscope className="w-6 h-6 text-white" />}
                  {selectedNode === 'er_minor' && <Bed className="w-6 h-6 text-white" />}
                  {selectedNode === 'trauma' && <AlertTriangle className="w-6 h-6 text-white" />}
                  {selectedNode === 'xray' && <Zap className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedDeptName} Configuration</h2>
                  <p className="text-sm text-gray-600">Adjust parameters and costs</p>
                </div>
              </div>
              <motion.button
                onClick={closeDrawer}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
            {/* Configuration Sliders */}
            <div className="space-y-6">
              {/* Service Rate */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700">
                    Service Rate (μ)
                  </label>
                  <span 
                    className="px-3 py-1 rounded-lg text-sm font-bold"
                    style={{ background: COLORS.accent, color: COLORS.primary }}
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
                <p className="text-xs text-gray-500">Patients served per hour per server</p>
              </div>

              {/* Number of Servers */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700">
                    Number of {selectedNode === 'xray' ? 'Machines' : 'Staff'} (c)
                  </label>
                  <span 
                    className="px-3 py-1 rounded-lg text-sm font-bold"
                    style={{ background: COLORS.accent, color: COLORS.primary }}
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
                <p className="text-xs text-gray-500">
                  {selectedNode === 'xray' ? 'X-ray machines available' : 'Medical staff assigned'}
                </p>
              </div>

              {/* Cost per Hour */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700">
                    Cost per Hour ($/hr)
                  </label>
                  <span 
                    className="px-3 py-1 rounded-lg text-sm font-bold"
                    style={{ background: COLORS.accent, color: COLORS.primary }}
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
                  style={{ background: `linear-gradient(to right, ${COLORS.warning}, ${COLORS.danger})` }}
                />
                <p className="text-xs text-gray-500">Operating cost per server per hour</p>
              </div>
            </div>

            {/* Financial Analysis */}
            <div className="mt-8 p-4 rounded-xl" style={{ background: `${COLORS.light}50`, border: `1px solid ${COLORS.secondary}30` }}>
              <h3 className="font-semibold text-gray-800 mb-3">Financial Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Daily Cost</span>
                  <span className="font-bold" style={{ color: COLORS.primary }}>
                    ${(selectedConfig.costPerHour * selectedConfig.servers * 24).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly Cost</span>
                  <span className="font-bold" style={{ color: COLORS.primary }}>
                    ${(selectedConfig.costPerHour * selectedConfig.servers * 24 * 30).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cost per Patient</span>
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
        )}
      </motion.div>

      {/* Main Content */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="p-3 rounded-2xl"
                      style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
                    >
                      <Activity className="w-7 h-7 text-white" />
                    </div>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: COLORS.accent, color: COLORS.primary }}
                    >
                      Jackson Network Configuration
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-gray-800">
                    Hospital Network Setup
                  </h1>
                  <p className="text-gray-600 text-lg max-w-xl">
                    Configure hospital departments, routing probabilities, and service parameters for Jackson Network simulation
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {apiError && (
                    <div className="text-right">
                      <p className="text-sm text-red-600">Connection Error</p>
                      <p className="text-xs text-red-500">Check backend server</p>
                    </div>
                  )}
                  
                  <motion.button
                    onClick={startSimulation}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    disabled={isLoading}
                    className="px-8 py-4 rounded-xl font-semibold flex items-center gap-3 text-white shadow-lg transition-all"
                    style={{ 
                      background: isLoading 
                        ? `linear-gradient(135deg, #6b7280, #9ca3af)` 
                        : `linear-gradient(135deg, ${COLORS.success}, #059669)`,
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Running Simulation...
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

          {/* Preview Network */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
            style={{ height: '600px' }}
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Network Preview</h2>
              <p className="text-gray-600">Click on nodes to configure department parameters</p>
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
                  color="#e5e7eb" 
                  gap={20} 
                  size={1}
                  style={{ backgroundColor: '#f9fafb' }}
                />
                <Controls 
                  className="bg-white rounded-lg shadow-lg border border-gray-200"
                />
              </ReactFlow>
            </div>
          </motion.div>

          {/* Routing Matrix Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-3 rounded-2xl"
                    style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
                  >
                    <Grid3X3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Routing Matrix Editor</h2>
                    <p className="text-gray-600">Configure patient flow probabilities between departments</p>
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
                  Reset
                </motion.button>
              </div>

              {/* Matrix Grid */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-3 text-left font-semibold text-gray-700">Source → Destination</th>
                      {departments.map((dept, index) => (
                        <th key={index} className="p-3 text-center font-semibold" style={{ color: COLORS.primary }}>
                          {dept}
                        </th>
                      ))}
                      <th className="p-3 text-center font-semibold text-gray-700">Row Total</th>
                      <th className="p-3 text-center font-semibold text-gray-700">Status</th>
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
                                    : 'border-gray-200 focus:border-blue-400 focus:outline-none'
                                }`}
                                disabled={sourceIndex === targetIndex}
                                placeholder="0.00"
                              />
                            </td>
                          ))}
                          <td className="p-3 text-center">
                            <span 
                              className={`px-3 py-1 rounded-lg font-bold text-sm ${
                                isInvalid 
                                  ? 'bg-red-100 text-red-700' 
                                  : isComplete 
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {rowSum.toFixed(2)}
                            </span>
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
                                <span className="text-xs font-medium">Incomplete</span>
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
              <div className="mt-6 p-4 rounded-xl" style={{ background: `${COLORS.light}50` }}>
                <h3 className="font-semibold text-gray-800 mb-3">Matrix Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ background: COLORS.success }} />
                    <div>
                      <p className="font-medium text-gray-700">Valid Row (Sum = 1.0)</p>
                      <p className="text-gray-600">All probabilities sum to exactly 1.0</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ background: COLORS.warning }} />
                    <div>
                      <p className="font-medium text-gray-700">Incomplete Row (Sum &lt; 1.0)</p>
                      <p className="text-gray-600">Some patients may exit the system</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ background: COLORS.danger }} />
                    <div>
                      <p className="font-medium text-gray-700">Invalid Row (Sum &gt; 1.0)</p>
                      <p className="text-gray-600">Impossible: probability cannot exceed 100%</p>
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