import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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
  Clock,
  ArrowLeft,
  TrendingUp,
  BarChart3,
  LineChart,
  Play,
  Pause
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useNavigate, useLocation } from 'react-router-dom';

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

// Custom Hospital Node Component for Results
function ResultHospitalNode({ data }) {
  const { label, icon: Icon, utilization, servers, patients, type } = data;
  
  const getHeatColor = (util) => {
    if (util < 0.5) return COLORS.success;
    if (util < 0.8) return COLORS.warning;
    return COLORS.danger;
  };

  const getTrafficLightStatus = (util) => {
    if (util < 0.6) return 'green';
    if (util < 0.85) return 'yellow';
    return 'red';
  };

  const heatColor = getHeatColor(utilization);
  const utilizationPercent = Math.min(utilization * 100, 100);
  const trafficStatus = getTrafficLightStatus(utilization);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden"
      style={{ 
        width: '200px', 
        height: '140px',
        borderColor: heatColor,
        boxShadow: `0 8px 25px -5px ${heatColor}40`
      }}
    >
      {/* Heat level indicator strip */}
      <div 
        className="absolute top-0 left-0 right-0 h-2"
        style={{ background: `linear-gradient(90deg, ${heatColor}, ${heatColor}80)` }}
      />
      
      {/* Traffic Light Indicator */}
      <div className="absolute top-3 right-3">
        <div 
          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
          style={{ 
            background: trafficStatus === 'green' ? COLORS.success : 
                       trafficStatus === 'yellow' ? COLORS.warning : COLORS.danger 
          }}
        />
      </div>
      
      {/* Node content */}
      <div className="p-4 h-full flex flex-col">
        {/* Header with icon and title */}
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

        {/* Live metrics */}
        <div className="flex-1 space-y-2">
          {/* Utilization bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-600">Utilization (ρ)</span>
              <span className="text-xs font-bold" style={{ color: heatColor }}>
                {utilizationPercent.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full"
                style={{ background: `linear-gradient(90deg, ${heatColor}, ${heatColor}80)` }}
                initial={{ width: 0 }}
                animate={{ width: `${utilizationPercent}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Stats row */}
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

        {/* Pulsing indicator for high utilization */}
        {utilization > 0.8 && (
          <motion.div
            className="absolute top-2 right-2 w-3 h-3 rounded-full"
            style={{ background: COLORS.danger }}
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* React Flow handles */}
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </motion.div>
  );
}

const nodeTypes = { resultHospitalNode: ResultHospitalNode };

export default function JacksonResult() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from navigation state or localStorage
  const [jacksonResults, setJacksonResults] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(500); // ms between updates
  
  // Chart data
  const [analyticsData, setAnalyticsData] = useState({
    throughputHistory: [],
    queueHistory: []
  });
  
  // Hospital data for nodes
  const [hospitalData, setHospitalData] = useState({
    triage: { utilization: 0.1, servers: 3, patients: 0 },
    er_minor: { utilization: 0.1, servers: 4, patients: 0 },
    trauma: { utilization: 0.1, servers: 2, patients: 0 },
    xray: { utilization: 0.1, servers: 2, patients: 0 }
  });

  // Load data on component mount
  useEffect(() => {
    const data = location.state?.jacksonResults || JSON.parse(localStorage.getItem('jacksonResults') || 'null');
    if (data && data.timeseries_data) {
      setJacksonResults(data);
      setTimeSeriesData(data.timeseries_data);
      console.log('Loaded Jackson results:', data);
    } else {
      // No data available, redirect back
      navigate('/jackson-network');
    }
  }, [location.state, navigate]);

  // Auto-play simulation
  useEffect(() => {
    if (!isPlaying || !timeSeriesData.length) return;

    const interval = setInterval(() => {
      setCurrentTimeIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= timeSeriesData.length) {
          setIsPlaying(false);
          return prev;
        }
        
        // Update hospital data and charts
        const currentTimePoint = timeSeriesData[nextIndex];
        if (currentTimePoint && currentTimePoint.nodes) {
          updateVisualizationData(currentTimePoint);
        }
        
        return nextIndex;
      });
    }, playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, timeSeriesData, playbackSpeed]);

  // Update visualization data
  const updateVisualizationData = useCallback((timePoint) => {
    // Update hospital nodes
    const newHospitalData = {};
    timePoint.nodes.forEach((nodeData, index) => {
      const nodeKey = ['triage', 'er_minor', 'trauma', 'xray'][index];
      newHospitalData[nodeKey] = {
        utilization: (nodeData.utilization || 0) / 100,
        patients: Math.round(nodeData.queue_length || 0),
        servers: nodeData.servers || hospitalData[nodeKey].servers
      };
    });
    setHospitalData(newHospitalData);

    // Update charts
    setAnalyticsData(prev => ({
      throughputHistory: [
        ...prev.throughputHistory,
        {
          time: timePoint.timestamp,
          throughput: timePoint.system_metrics?.total_throughput || 0,
          target: 25,
          avg_utilization: timePoint.system_metrics?.avg_utilization || 0
        }
      ].slice(-20), // Keep last 20 points
      queueHistory: [
        ...prev.queueHistory,
        {
          time: timePoint.timestamp,
          triage: timePoint.nodes[0]?.queue_length || 0,
          er_minor: timePoint.nodes[1]?.queue_length || 0,
          trauma: timePoint.nodes[2]?.queue_length || 0,
          xray: timePoint.nodes[3]?.queue_length || 0
        }
      ].slice(-20)
    }));
  }, [hospitalData]);

  // Jump to specific time point
  const jumpToTimePoint = (index) => {
    setCurrentTimeIndex(index);
    if (timeSeriesData[index]) {
      updateVisualizationData(timeSeriesData[index]);
    }
  };

  // Hospital nodes configuration
  const hospitalNodes = [
    {
      id: 'triage',
      type: 'resultHospitalNode',
      position: { x: 100, y: 200 },
      data: {
        label: 'Triage',
        type: 'Initial Assessment',
        icon: Stethoscope,
        utilization: hospitalData.triage.utilization,
        servers: hospitalData.triage.servers,
        patients: hospitalData.triage.patients
      }
    },
    {
      id: 'er_minor',
      type: 'resultHospitalNode',
      position: { x: 400, y: 100 },
      data: {
        label: 'ER (Minor)',
        type: 'Non-Critical Care',
        icon: Bed,
        utilization: hospitalData.er_minor.utilization,
        servers: hospitalData.er_minor.servers,
        patients: hospitalData.er_minor.patients
      }
    },
    {
      id: 'trauma',
      type: 'resultHospitalNode',
      position: { x: 400, y: 300 },
      data: {
        label: 'Trauma (Major)',
        type: 'Critical Care',
        icon: AlertTriangle,
        utilization: hospitalData.trauma.utilization,
        servers: hospitalData.trauma.servers,
        patients: hospitalData.trauma.patients
      }
    },
    {
      id: 'xray',
      type: 'resultHospitalNode',
      position: { x: 700, y: 200 },
      data: {
        label: 'X-Ray',
        type: 'Diagnostics',
        icon: Zap,
        utilization: hospitalData.xray.utilization,
        servers: hospitalData.xray.servers,
        patients: hospitalData.xray.patients
      }
    }
  ];

  // Generate edges (simplified for results view)
  const hospitalEdges = [
    {
      id: 'triage-er_minor',
      source: 'triage',
      target: 'er_minor',
      type: 'smoothstep',
      animated: true,
      style: { stroke: COLORS.secondary, strokeWidth: 3 },
      markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.secondary }
    },
    {
      id: 'triage-trauma',
      source: 'triage',
      target: 'trauma',
      type: 'smoothstep',
      animated: true,
      style: { stroke: COLORS.danger, strokeWidth: 3 },
      markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.danger }
    },
    {
      id: 'er_minor-xray',
      source: 'er_minor',
      target: 'xray',
      type: 'smoothstep',
      animated: true,
      style: { stroke: COLORS.warning, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.warning }
    },
    {
      id: 'trauma-xray',
      source: 'trauma',
      target: 'xray',
      type: 'smoothstep',
      animated: true,
      style: { stroke: COLORS.warning, strokeWidth: 3 },
      markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.warning }
    }
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(hospitalNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(hospitalEdges);

  // Update nodes when hospital data changes
  useEffect(() => {
    setNodes(hospitalNodes);
  }, [hospitalData, setNodes]);

  if (!jacksonResults) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading Jackson Network results...</p>
        </div>
      </div>
    );
  }

  const currentTimePoint = timeSeriesData[currentTimeIndex];
  const progress = timeSeriesData.length > 0 ? (currentTimeIndex / (timeSeriesData.length - 1)) * 100 : 0;

  return (
    <div className="min-h-screen pt-16" style={{ background: `linear-gradient(180deg, ${COLORS.light} 0%, #e0f7fa 100%)` }}>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={() => navigate('/jackson-network')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                  </motion.button>
                  
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">Jackson Network Results</h1>
                    <p className="text-gray-600">
                      Live simulation with {timeSeriesData.length} time points over {jacksonResults.simulation_config?.duration_minutes || 0} minutes
                    </p>
                  </div>
                </div>
                
                {/* Playback Controls */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Current Time</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {currentTimePoint?.timestamp || '0:00'}
                    </p>
                  </div>
                  
                  <motion.button
                    onClick={() => setIsPlaying(!isPlaying)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 text-white shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </motion.button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Simulation Progress</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 cursor-pointer" 
                     onClick={(e) => {
                       const rect = e.currentTarget.getBoundingClientRect();
                       const x = e.clientX - rect.left;
                       const percentage = x / rect.width;
                       const targetIndex = Math.floor(percentage * (timeSeriesData.length - 1));
                       jumpToTimePoint(targetIndex);
                     }}>
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
          {/* Current System Status */}
          {currentTimePoint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl shadow-lg border border-blue-200 p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Current System Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-xl bg-white shadow-sm">
                  <p className="text-2xl font-bold text-blue-600">
                    {currentTimePoint.system_metrics?.avg_utilization || 0}%
                  </p>
                  <p className="text-sm text-gray-600">Avg Utilization</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-white shadow-sm">
                  <p className="text-2xl font-bold text-orange-600">
                    {currentTimePoint.system_metrics?.peak_utilization || 0}%
                  </p>
                  <p className="text-sm text-gray-600">Peak Utilization</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-white shadow-sm">
                  <p className="text-2xl font-bold text-green-600">
                    {currentTimePoint.system_metrics?.total_throughput || 0}
                  </p>
                  <p className="text-sm text-gray-600">Throughput/hr</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-white shadow-sm">
                  <p className="text-2xl font-bold text-purple-600">
                    {currentTimePoint.system_metrics?.total_queue_length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Total Queue</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Hospital Network Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
            style={{ height: '600px' }}
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Hospital Network Flow</h2>
              <p className="text-gray-600">Real-time patient flow through departments</p>
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

          {/* Analytics Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="p-3 rounded-2xl"
                  style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
                >
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Live Analytics Dashboard</h2>
                  <p className="text-gray-600">System throughput and queue analysis over time</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* System Throughput Chart */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" style={{ color: COLORS.primary }} />
                    <h3 className="text-lg font-semibold text-gray-800">System Throughput</h3>
                  </div>
                  
                  <div className="h-64 w-full">
                    {analyticsData.throughputHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={analyticsData.throughputHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis 
                            dataKey="time" 
                            tick={{ fontSize: 11 }}
                            interval="preserveStartEnd"
                          />
                          <YAxis 
                            tick={{ fontSize: 11 }}
                            label={{ value: 'Patients/Hour', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(255,255,255,0.95)',
                              border: `1px solid ${COLORS.secondary}`,
                              borderRadius: '12px',
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="throughput" 
                            stroke={COLORS.primary}
                            strokeWidth={3}
                            dot={{ fill: COLORS.primary, r: 4 }}
                            name="Current Throughput"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="target" 
                            stroke={COLORS.warning}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ fill: COLORS.warning, r: 3 }}
                            name="Target"
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Click Play to start visualization</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Queue Lengths Chart */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" style={{ color: COLORS.secondary }} />
                    <h3 className="text-lg font-semibold text-gray-800">Queue Lengths by Department</h3>
                  </div>
                  
                  <div className="h-64 w-full">
                    {analyticsData.queueHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.queueHistory.slice(-10)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis 
                            dataKey="time" 
                            tick={{ fontSize: 11 }}
                            interval="preserveStartEnd"
                          />
                          <YAxis 
                            tick={{ fontSize: 11 }}
                            label={{ value: 'Patients Waiting', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(255,255,255,0.95)',
                              border: `1px solid ${COLORS.secondary}`,
                              borderRadius: '12px',
                            }}
                          />
                          <Legend />
                          <Bar 
                            dataKey="triage" 
                            fill={COLORS.success}
                            name="Triage"
                            radius={[2, 2, 0, 0]}
                          />
                          <Bar 
                            dataKey="er_minor" 
                            fill={COLORS.secondary}
                            name="ER Minor"
                            radius={[2, 2, 0, 0]}
                          />
                          <Bar 
                            dataKey="trauma" 
                            fill={COLORS.danger}
                            name="Trauma"
                            radius={[2, 2, 0, 0]}
                          />
                          <Bar 
                            dataKey="xray" 
                            fill={COLORS.warning}
                            name="X-Ray"
                            radius={[2, 2, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Click Play to start visualization</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Simulation Summary */}
          {jacksonResults.simulation_summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Simulation Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-xl bg-gray-50">
                  <p className="text-2xl font-bold text-blue-600">
                    {jacksonResults.simulation_summary.final_avg_utilization}%
                  </p>
                  <p className="text-sm text-gray-600">Final Avg Utilization</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gray-50">
                  <p className="text-2xl font-bold text-orange-600">
                    {jacksonResults.simulation_summary.final_peak_utilization}%
                  </p>
                  <p className="text-sm text-gray-600">Final Peak Utilization</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gray-50">
                  <p className={`text-2xl font-bold ${jacksonResults.simulation_summary.system_stability === 'Stable' ? 'text-green-600' : 'text-red-600'}`}>
                    {jacksonResults.simulation_summary.system_stability}
                  </p>
                  <p className="text-sm text-gray-600">System Status</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}