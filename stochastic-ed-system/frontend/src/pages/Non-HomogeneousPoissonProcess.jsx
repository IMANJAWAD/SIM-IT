import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Activity, 
  Zap,
  Users,
  AlertTriangle,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  TrendingUp,
  RotateCcw,
  Play,
  Save,
  Download,
  CloudSun,
  Star
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

// Color palette
const COLORS = {
  primary: '#0077b6',
  secondary: '#00b4d8',
  accent: '#f0f3bd',
  light: '#caf0f8',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  emerald: '#10b981',
  orange: '#f97316',
  white: '#ffffff',
};

// Enhanced Real-World ED Scenarios
const PRESETS = {
  normal: {
    name: "🏥 Normal Day",
    description: "Standard ED operations - bell curve peaking at midday",
    color: COLORS.primary,
    category: "Routine Operations",
    data: [5,4,3,3,4,6,8,12,18,25,30,35,38,35,30,25,20,15,12,10,8,6,5,4],
    clinicalContext: "Typical weekday with regular clinic hours and standard patient flow"
  },
  mci: {
    name: "🚑 Mass Casualty Incident",
    description: "Major accident or disaster - sudden massive spike",
    color: COLORS.danger,
    category: "Emergency Response",
    data: [5,4,3,3,4,6,8,12,15,18,65,58,52,45,38,32,25,20,15,12,10,8,6,5],
    clinicalContext: "Multi-vehicle accident, building collapse, or terrorist incident requiring surge capacity"
  },
  outbreak: {
    name: "🦠 Disease Outbreak",
    description: "Flu season or pandemic - consistently high sustained load",
    color: '#8b5cf6',
    category: "Public Health Crisis",
    data: [12,10,8,8,10,15,25,35,42,45,48,50,52,50,48,45,42,38,32,28,22,18,15,13],
    clinicalContext: "Seasonal flu, COVID-19 surge, or foodborne illness outbreak"
  },
  weekend: {
    name: "🎉 Weekend Surge",
    description: "Friday/Saturday night - alcohol, violence, accidents",
    color: COLORS.purple,
    category: "Social Patterns",
    data: [8,6,4,3,3,4,6,10,12,15,18,20,22,25,28,32,45,52,48,42,35,28,18,12],
    clinicalContext: "Alcohol-related incidents, domestic violence, motor vehicle accidents"
  },
  holiday: {
    name: "🎄 Holiday Rush",
    description: "Christmas/New Year - family gatherings, travel, stress",
    color: '#dc2626',
    category: "Seasonal Variation",
    data: [10,8,6,5,5,8,12,18,25,32,38,42,45,48,45,42,38,35,32,28,22,18,15,12],
    clinicalContext: "Heart attacks, family disputes, travel accidents, delayed care presentations"
  },
  heatwave: {
    name: "🌡️ Heat Wave Emergency",
    description: "Extreme weather - heat exhaustion, dehydration",
    color: '#f97316',
    category: "Environmental Crisis",
    data: [8,6,5,4,6,10,18,28,38,45,52,58,62,60,55,48,42,35,28,22,18,15,12,10],
    clinicalContext: "Heat stroke, dehydration, elderly at risk, power outages affecting medical equipment"
  }
};

export default function NonHomogeneousPoissonProcess() {
  const navigate = useNavigate();
  
  // State for 24-hour lambda values (arrivals per hour)
  const [lambdaValues, setLambdaValues] = useState(PRESETS.normal.data);
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('normal');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [nhppResults, setNhppResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // System capacity parameters
  const SYSTEM_CAPACITY = {
    servers: 3, // c = 3 servers
    serviceRate: 15, // μ = 15 patients/hour per server
    maxCapacity: 3 * 15 // c × μ = 45 patients/hour
  };

  // ED Shift definitions
  const ED_SHIFTS = {
    night: {
      name: 'Night Shift',
      hours: [0, 1, 2, 3, 4, 5, 6, 7],
      timeRange: '00:00 - 08:00',
      color: '#1e3a8a',
      bgColor: '#1e40af20',
      icon: '🌙'
    },
    morning: {
      name: 'Morning Shift', 
      hours: [8, 9, 10, 11, 12, 13, 14, 15],
      timeRange: '08:00 - 16:00',
      color: '#d97706',
      bgColor: '#fbbf2420',
      icon: '☀️'
    },
    evening: {
      name: 'Evening Shift',
      hours: [16, 17, 18, 19, 20, 21, 22, 23],
      timeRange: '16:00 - 00:00', 
      color: '#dc2626',
      bgColor: '#f9731620',
      icon: '🌅'
    }
  };

  // Generate chart data
  const chartData = useMemo(() => {
    return lambdaValues.map((lambda, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      hourNum: hour,
      lambda: lambda,
      timeOfDay: hour < 6 ? 'Night' : hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening'
    }));
  }, [lambdaValues]);

  // Calculate comprehensive ED-specific metrics
  const edMetrics = useMemo(() => {
    const peakHour = lambdaValues.indexOf(Math.max(...lambdaValues));
    const peakLoad = Math.max(...lambdaValues);
    const totalDaily = lambdaValues.reduce((sum, lambda) => sum + lambda, 0);
    const avgHourly = totalDaily / 24;
    
    // ED-Specific Calculations
    const criticalCarePercentage = 0.15; // 15% of patients need critical care
    const triageWaitFactor = 0.8; // Triage processes 80% of arrivals immediately
    const bedTurnoverHours = 4; // Average ED stay is 4 hours
    const nurseToPatientsRatio = 4; // 1 nurse per 4 patients
    
    // Predicted Triage Load (patients waiting in first hour)
    const triageLoad = Math.round(peakLoad * (1 - triageWaitFactor));
    
    // Critical Care Need (15% of peak hour arrivals)
    const criticalCareNeed = Math.round(peakLoad * criticalCarePercentage);
    
    // Bed Turnover Requirement (beds needed to clear per hour during peak)
    const bedTurnoverRate = Math.round(peakLoad / bedTurnoverHours);
    
    // Additional ED Metrics
    const nursesRequired = Math.ceil(peakLoad / nurseToPatientsRatio);
    const ambulanceDiversions = peakLoad > SYSTEM_CAPACITY.maxCapacity ? 
      Math.round((peakLoad - SYSTEM_CAPACITY.maxCapacity) * 0.3) : 0;
    const avgWaitTime = peakLoad > SYSTEM_CAPACITY.maxCapacity ? 
      Math.round(((peakLoad / SYSTEM_CAPACITY.maxCapacity) - 1) * 120 + 30) : 30;
    const leftWithoutTreatment = peakLoad > SYSTEM_CAPACITY.maxCapacity * 1.2 ? 
      Math.round((peakLoad - SYSTEM_CAPACITY.maxCapacity * 1.2) * 0.1) : 0;
    
    return {
      totalDaily,
      avgHourly: Math.round(avgHourly * 10) / 10,
      peakHour,
      peakLoad,
      triageLoad,
      criticalCareNeed,
      bedTurnoverRate,
      nursesRequired,
      ambulanceDiversions,
      avgWaitTime,
      leftWithoutTreatment,
      capacityUtilization: Math.round((peakLoad / SYSTEM_CAPACITY.maxCapacity) * 100),
      isOverCapacity: peakLoad > SYSTEM_CAPACITY.maxCapacity
    };
  }, [lambdaValues]);

  // Check if any hour exceeds capacity
  const hasBottlenecks = useMemo(() => {
    return lambdaValues.some(lambda => lambda > SYSTEM_CAPACITY.maxCapacity);
  }, [lambdaValues]);
  const updateLambda = useCallback((hour, value) => {
    setLambdaValues(prev => {
      const newValues = [...prev];
      newValues[hour] = Math.max(0, Math.min(60, value));
      return newValues;
    });
  }, []);

  // Apply preset
  const applyPreset = useCallback((presetKey) => {
    setLambdaValues(PRESETS[presetKey].data);
    setSelectedPreset(presetKey);
  }, []);

  // Reset to flat profile
  const resetProfile = useCallback(() => {
    setLambdaValues(new Array(24).fill(15));
    setSelectedPreset(null);
    setNhppResults(null);
    setApiError(null);
  }, []);

  // Call NHPP API
  const callNhppAPI = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      const response = await fetch('http://localhost:8000/nhpp/simulate-nhpp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lambda_schedule: lambdaValues,
          mu: SYSTEM_CAPACITY.serviceRate,
          num_staff: SYSTEM_CAPACITY.servers,
          critical_ratio: 0.15,
          replications: 100
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNhppResults(data);
      console.log('NHPP API Response:', data);
    } catch (error) {
      console.error('NHPP API Error:', error);
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [lambdaValues]);

  // Enhanced simulation toggle with API call and navigation
  const toggleSimulation = useCallback(async () => {
    if (!isSimulationRunning) {
      setIsSimulationRunning(true);
      setIsLoading(true);
      
      const simulationParams = {
        lambda_schedule: lambdaValues,
        mu: SYSTEM_CAPACITY.serviceRate,
        num_staff: SYSTEM_CAPACITY.servers,
        critical_ratio: 0.15,
        replications: 100
      };

      try {
        const response = await fetch('http://localhost:8000/nhpp/simulate-nhpp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(simulationParams),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Navigate to results page with the data
        navigate('/nhpp-results', {
          state: {
            nhppResults: data,
            simulationParams: simulationParams
          }
        });
      } catch (error) {
        console.error('NHPP API Error:', error);
        setApiError(error.message);
        setIsLoading(false);
        setIsSimulationRunning(false);
      }
    } else {
      setIsSimulationRunning(false);
    }
  }, [isSimulationRunning, lambdaValues, navigate]);

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
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="p-3 rounded-2xl"
                      style={{ background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.pink})` }}
                    >
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: COLORS.accent, color: COLORS.purple }}
                    >
                      Non-Homogeneous Poisson Process
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-gray-800">
                    Professional ED Arrival Scheduler
                  </h1>
                  <p className="text-gray-600 text-lg max-w-xl">
                    Real-world emergency department simulation scenarios with healthcare-specific analysis
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetProfile}
                    className="px-4 py-3 rounded-xl font-semibold flex items-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 shadow-lg"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleSimulation}
                    disabled={isLoading}
                    className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 text-white shadow-lg"
                    style={{ 
                      background: isSimulationRunning 
                        ? `linear-gradient(135deg, ${COLORS.danger}, ${COLORS.orange})` 
                        : `linear-gradient(135deg, ${COLORS.success}, ${COLORS.emerald})`
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Running NHPP Analysis...
                      </>
                    ) : isSimulationRunning ? (
                      <>
                        <div className="w-5 h-5 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-sm" />
                        </div>
                        Stop Simulation
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Run NHPP Simulation
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Professional ED Scenarios */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-orange-500" />
                    Real-World ED Scenarios
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Professional emergency department simulation scenarios based on actual healthcare patterns
                  </p>
                </div>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {Object.keys(PRESETS).length} Scenarios Available
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => applyPreset(key)}
                    className={`p-5 rounded-xl border-2 transition-all text-left ${
                      selectedPreset === key
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{preset.name.split(' ')[0]}</span>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800">
                          {preset.name.substring(2)}
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
                          {preset.category}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      {preset.description}
                    </div>
                    
                    {/* Mini Chart Preview */}
                    <div className="h-12 rounded-lg overflow-hidden mb-3 bg-gray-50">
                      <div className="h-full flex items-end justify-between px-1">
                        {preset.data.slice(0, 24).map((value, index) => (
                          <div
                            key={index}
                            className="flex-1 mx-px rounded-t transition-all"
                            style={{ 
                              height: `${(value / Math.max(...preset.data)) * 100}%`,
                              backgroundColor: preset.color,
                              opacity: 0.7
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Clinical Context */}
                    <div className="text-xs text-gray-500 italic mb-3">
                      {preset.clinicalContext}
                    </div>
                    
                    {/* Metrics */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Peak Load:</span>
                      <span className={`font-bold px-2 py-1 rounded ${
                        Math.max(...preset.data) > SYSTEM_CAPACITY.maxCapacity
                          ? 'bg-red-100 text-red-700'
                          : Math.max(...preset.data) > SYSTEM_CAPACITY.maxCapacity * 0.8
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {Math.max(...preset.data)} pts/hr
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Chart with Shift Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                λ(t) Visualization with ED Shift Analysis
              </h2>
              
              <div className="h-80 w-full mb-6 relative">
                {/* Shift Background Zones */}
                <div className="absolute inset-0 flex">
                  <div 
                    className="h-full opacity-20"
                    style={{ 
                      width: '33.33%',
                      backgroundColor: ED_SHIFTS.night.color
                    }}
                  />
                  <div 
                    className="h-full opacity-20"
                    style={{ 
                      width: '33.33%',
                      backgroundColor: ED_SHIFTS.morning.color
                    }}
                  />
                  <div 
                    className="h-full opacity-20"
                    style={{ 
                      width: '33.34%',
                      backgroundColor: ED_SHIFTS.evening.color
                    }}
                  />
                </div>

                {/* Shift Labels */}
                <div className="absolute top-2 left-0 right-0 flex">
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg"
                         style={{ backgroundColor: ED_SHIFTS.night.color }}>
                      {ED_SHIFTS.night.icon} {ED_SHIFTS.night.name}
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg"
                         style={{ backgroundColor: ED_SHIFTS.morning.color }}>
                      {ED_SHIFTS.morning.icon} {ED_SHIFTS.morning.name}
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg"
                         style={{ backgroundColor: ED_SHIFTS.evening.color }}>
                      {ED_SHIFTS.evening.icon} {ED_SHIFTS.evening.name}
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#6b7280"
                      fontSize={12}
                      interval={1}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      domain={[0, Math.max(60, Math.max(...lambdaValues) + 10)]}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        if (name === 'Max Capacity') {
                          return [
                            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                              {value} patients/hour (Maximum Staffing Capacity c×μ)
                            </span>, 
                            'Capacity Threshold'
                          ];
                        }
                        const isOver = value > SYSTEM_CAPACITY.maxCapacity;
                        return [
                          <span style={{ color: isOver ? '#ef4444' : '#10b981' }}>
                            {value} {isOver ? '⚠️ EXCEEDS CAPACITY' : 'patients/hour'}
                          </span>, 
                          'Arrival Rate λ(t)'
                        ];
                      }}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    
                    {/* Capacity Line */}
                    <Line
                      type="monotone"
                      dataKey={() => SYSTEM_CAPACITY.maxCapacity}
                      stroke="#ef4444"
                      strokeWidth={3}
                      strokeDasharray="8,4"
                      dot={false}
                      name="Max Capacity"
                    />
                    
                    {/* Main arrival pattern */}
                    <Line
                      type="monotone"
                      dataKey="lambda"
                      stroke={hasBottlenecks ? '#ef4444' : COLORS.emerald}
                      strokeWidth={4}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        const isOver = payload.lambda > SYSTEM_CAPACITY.maxCapacity;
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isOver ? 6 : 4}
                            fill={isOver ? '#dc2626' : COLORS.emerald}
                            stroke={isOver ? '#dc2626' : COLORS.emerald}
                            strokeWidth={2}
                          />
                        );
                      }}
                      activeDot={{ r: 8, stroke: hasBottlenecks ? '#ef4444' : COLORS.emerald, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                
                {/* Capacity Threshold Label */}
                <div className="absolute top-12 right-4 bg-red-50 border-2 border-red-200 rounded-lg p-3 shadow-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-0 border-t-2 border-red-500 border-dashed" />
                    <span className="text-sm font-bold text-red-800">Maximum Staffing Capacity</span>
                  </div>
                  <div className="text-xs text-red-700">
                    <span className="font-semibold">c × μ = {SYSTEM_CAPACITY.servers} × {SYSTEM_CAPACITY.serviceRate} = {SYSTEM_CAPACITY.maxCapacity}</span> patients/hour
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    ⚠️ ED fails if λ(t) crosses this line
                  </div>
                </div>
              </div>

              {/* Scenario Analysis */}
              {selectedPreset && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{PRESETS[selectedPreset].name.split(' ')[0]}</div>
                    <div className="flex-1">
                      <div className="font-bold text-blue-800 mb-1">
                        Active Scenario: {PRESETS[selectedPreset].name.substring(2)}
                      </div>
                      <div className="text-blue-700 text-sm mb-2">
                        {PRESETS[selectedPreset].clinicalContext}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-blue-600">Category:</span>
                          <div className="font-semibold">{PRESETS[selectedPreset].category}</div>
                        </div>
                        <div>
                          <span className="text-blue-600">Peak Load:</span>
                          <div className="font-semibold">{Math.max(...PRESETS[selectedPreset].data)} pts/hr</div>
                        </div>
                        <div>
                          <span className="text-blue-600">Daily Total:</span>
                          <div className="font-semibold">{PRESETS[selectedPreset].data.reduce((a, b) => a + b, 0)} patients</div>
                        </div>
                        <div>
                          <span className="text-blue-600">Capacity Status:</span>
                          <div className={`font-semibold ${
                            Math.max(...PRESETS[selectedPreset].data) > SYSTEM_CAPACITY.maxCapacity
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}>
                            {Math.max(...PRESETS[selectedPreset].data) > SYSTEM_CAPACITY.maxCapacity ? 'EXCEEDED' : 'WITHIN LIMITS'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Department Impact Live Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
                Department Impact Live Statistics
              </h2>
              
              {/* Primary ED Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="text-sm text-blue-600 mb-1">📊 Daily Patient Load</div>
                  <div className="text-2xl font-bold text-blue-800">
                    {edMetrics.totalDaily}
                  </div>
                  <div className="text-xs text-blue-600">total patients</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="text-sm text-green-600 mb-1">⏱️ Average Hourly Rate</div>
                  <div className="text-2xl font-bold text-green-800">
                    {edMetrics.avgHourly}
                  </div>
                  <div className="text-xs text-green-600">patients/hour</div>
                </div>
                
                <div className={`text-center p-4 rounded-xl border-2 ${
                  edMetrics.isOverCapacity 
                    ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' 
                    : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
                }`}>
                  <div className={`text-sm mb-1 ${
                    edMetrics.isOverCapacity ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    🚨 Peak Crisis Hour
                  </div>
                  <div className={`text-2xl font-bold ${
                    edMetrics.isOverCapacity ? 'text-red-800' : 'text-orange-800'
                  }`}>
                    {edMetrics.peakHour.toString().padStart(2, '0')}:00
                  </div>
                  <div className={`text-xs ${
                    edMetrics.isOverCapacity ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {edMetrics.peakLoad} arrivals
                    {edMetrics.isOverCapacity && ' 🚨'}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="text-sm text-purple-600 mb-1">🏥 Capacity Usage</div>
                  <div className="text-2xl font-bold text-purple-800">
                    {edMetrics.capacityUtilization}%
                  </div>
                  <div className="text-xs text-purple-600">
                    of {SYSTEM_CAPACITY.maxCapacity} pts/hr max
                  </div>
                </div>
              </div>

              {/* ED-Specific Impact Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🏃‍♂️</span>
                    <span className="font-semibold text-amber-800">Predicted Triage Load</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-900 mb-1">
                    {edMetrics.triageLoad}
                  </div>
                  <div className="text-sm text-amber-700">
                    patients waiting in first hour
                  </div>
                  <div className="text-xs text-amber-600 mt-2 italic">
                    Based on 80% immediate triage processing rate
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-red-50 to-rose-100 rounded-xl border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🚑</span>
                    <span className="font-semibold text-red-800">Critical Care Need</span>
                  </div>
                  <div className="text-2xl font-bold text-red-900 mb-1">
                    {edMetrics.criticalCareNeed}
                  </div>
                  <div className="text-sm text-red-700">
                    critical patients during peak
                  </div>
                  <div className="text-xs text-red-600 mt-2 italic">
                    15% of peak arrivals require critical care
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🛏️</span>
                    <span className="font-semibold text-indigo-800">Bed Turnover Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-indigo-900 mb-1">
                    {edMetrics.bedTurnoverRate}
                  </div>
                  <div className="text-sm text-indigo-700">
                    beds/hour during peak
                  </div>
                  <div className="text-xs text-indigo-600 mt-2 italic">
                    Required to handle 12:00 peak load
                  </div>
                </div>
              </div>

              {/* Advanced ED Operations Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-100 rounded-xl border border-teal-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">👩‍⚕️</span>
                    <span className="font-semibold text-teal-800">Nurses Required</span>
                  </div>
                  <div className="text-2xl font-bold text-teal-900">
                    {edMetrics.nursesRequired}
                  </div>
                  <div className="text-xs text-teal-700">
                    1:4 nurse-to-patient ratio
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-100 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🚨</span>
                    <span className="font-semibold text-orange-800">Ambulance Diversions</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {edMetrics.ambulanceDiversions}
                  </div>
                  <div className="text-xs text-orange-700">
                    expected during peak
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-100 rounded-xl border border-violet-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⏰</span>
                    <span className="font-semibold text-violet-800">Avg Wait Time</span>
                  </div>
                  <div className="text-2xl font-bold text-violet-900">
                    {edMetrics.avgWaitTime}
                  </div>
                  <div className="text-xs text-violet-700">
                    minutes during peak
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🚪</span>
                    <span className="font-semibold text-gray-800">Left w/o Treatment</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {edMetrics.leftWithoutTreatment}
                  </div>
                  <div className="text-xs text-gray-700">
                    patients (LWOT rate)
                  </div>
                </div>
              </div>

              {/* Clinical Impact Analysis */}
              <div className="mt-6 p-5 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  🏥 Clinical Impact Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-800 mb-2">Triage Operations:</div>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Peak triage load: {edMetrics.triageLoad} patients waiting</li>
                      <li>• Triage nurses needed: {Math.ceil(edMetrics.triageLoad / 10)}</li>
                      <li>• Fast-track eligible: ~{Math.round(edMetrics.peakLoad * 0.4)} patients</li>
                      <li>• ESI Level 1-2: {edMetrics.criticalCareNeed} critical cases</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-2">Resource Management:</div>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Bed turnover: {edMetrics.bedTurnoverRate} beds/hour required</li>
                      <li>• Total nursing staff: {edMetrics.nursesRequired} nurses</li>
                      <li>• Physician coverage: {Math.ceil(edMetrics.peakLoad / 8)} doctors</li>
                      <li>• Support staff: {Math.ceil(edMetrics.peakLoad / 12)} techs</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-2">Quality Indicators:</div>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Door-to-provider: {edMetrics.avgWaitTime} minutes</li>
                      <li>• LWOT rate: {Math.round((edMetrics.leftWithoutTreatment / edMetrics.peakLoad) * 100)}%</li>
                      <li>• Ambulance diversions: {edMetrics.ambulanceDiversions} expected</li>
                      <li>• Patient satisfaction: {edMetrics.isOverCapacity ? 'At Risk' : 'Maintained'}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Real-time Recommendations */}
              {edMetrics.isOverCapacity && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-5 bg-red-50 border-2 border-red-200 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
                    <div>
                      <div className="font-bold text-red-800 text-lg mb-2">
                        🚨 Immediate Action Required - Capacity Exceeded
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-semibold text-red-800 mb-2">Immediate Actions:</div>
                          <ul className="text-red-700 space-y-1">
                            <li>• Activate surge capacity protocols</li>
                            <li>• Call in {Math.ceil((edMetrics.peakLoad - SYSTEM_CAPACITY.maxCapacity) / 15)} additional staff</li>
                            <li>• Open overflow areas/hallway beds</li>
                            <li>• Implement ambulance diversion if needed</li>
                          </ul>
                        </div>
                        <div>
                          <div className="font-semibold text-red-800 mb-2">Quality Mitigation:</div>
                          <ul className="text-red-700 space-y-1">
                            <li>• Expedite discharge planning</li>
                            <li>• Activate rapid assessment unit</li>
                            <li>• Consider external transfers</li>
                            <li>• Enhance communication with patients</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* API Error Display */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Simulation Error</span>
                </div>
                <div className="text-red-700 text-sm mt-1">{apiError}</div>
                <button
                  onClick={() => setApiError(null)}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}