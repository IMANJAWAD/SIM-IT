import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Activity, 
  Zap,
  Users,
  AlertTriangle,
  TrendingUp,
  RotateCcw,
  Play,
  Save,
  Download,
  CloudSun,
  Star,
  ChevronRight,
  Hospital,
  Stethoscope,
  Bed,
  XCircle,
  CheckCircle
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
  AreaChart,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// Updated color palette to match theme
const COLORS = {
  bgLight: '#caf0f8',
  primary: '#0077b6',
  secondary: '#00b4d8',
  accent: '#f0f3bd',
  white: '#ffffff',
  textDark: '#1a365d',
  textMuted: '#4a5568',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  emerald: '#10b981',
  orange: '#f97316',
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
    color: COLORS.secondary,
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

// NHPP Simulation Engine (Frontend implementation for verification)
class NHPPBackendSimulator {
  constructor(lambdaSchedule, mu, numStaff, criticalRatio = 0.15, replications = 100) {
    this.lambdaSchedule = lambdaSchedule;
    this.mu = mu;
    this.numStaff = numStaff;
    this.criticalRatio = criticalRatio;
    this.replications = replications;
    this.maxCapacity = numStaff * mu;
  }

  // Generate NHPP arrival times using thinning method
  generateNHPPArrivals(hourStart, hourEnd, lambdaMax, lambdaFunction) {
    const arrivals = [];
    let time = hourStart;
    const endTime = hourEnd;
    
    while (time < endTime) {
      // Generate candidate arrival from homogeneous Poisson with rate lambdaMax
      const u = Math.random();
      const interarrival = -Math.log(u) / lambdaMax;
      time += interarrival;
      
      if (time > endTime) break;
      
      // Accept with probability lambda(time)/lambdaMax
      const lambda_t = lambdaFunction(time);
      if (Math.random() < lambda_t / lambdaMax) {
        arrivals.push(time);
      }
    }
    
    return arrivals;
  }

  // Queue simulation for M/M/c system
  simulateMMc(arrivalTimes, serviceRate, numServers) {
    const departureTimes = [];
    const queueLengths = [];
    const waitingTimes = [];
    const serverAvailableTimes = Array(numServers).fill(0);
    
    let currentQueue = 0;
    let lastEventTime = 0;
    
    for (let i = 0; i < arrivalTimes.length; i++) {
      const arrivalTime = arrivalTimes[i];
      
      // Record queue length at arrival
      queueLengths.push({ time: arrivalTime, length: currentQueue });
      
      // Find earliest available server
      const earliestServer = Math.min(...serverAvailableTimes);
      const startService = Math.max(arrivalTime, earliestServer);
      const waitTime = startService - arrivalTime;
      waitingTimes.push(waitTime);
      
      // Find which server becomes available
      const serverIndex = serverAvailableTimes.indexOf(earliestServer);
      const serviceDuration = this.generateExponential(serviceRate);
      const departureTime = startService + serviceDuration;
      departureTimes.push(departureTime);
      serverAvailableTimes[serverIndex] = departureTime;
      
      // Update queue
      if (startService > arrivalTime) {
        currentQueue++;
      }
      
      // Process departures
      serverAvailableTimes.sort((a, b) => a - b);
      while (serverAvailableTimes[0] <= arrivalTime && currentQueue > 0) {
        serverAvailableTimes.shift();
        serverAvailableTimes.push(Infinity);
        currentQueue--;
        serverAvailableTimes.sort((a, b) => a - b);
      }
    }
    
    return {
      arrivalTimes,
      departureTimes,
      waitingTimes,
      queueLengths,
      avgWaitTime: waitingTimes.reduce((a, b) => a + b, 0) / waitingTimes.length,
      maxWaitTime: Math.max(...waitingTimes),
      totalPatients: arrivalTimes.length
    };
  }

  // Generate exponential random variate
  generateExponential(rate) {
    return -Math.log(Math.random()) / rate;
  }

  // Get lambda at specific time (hours)
  getLambdaAtTime(time) {
    const hour = Math.floor(time % 24);
    return this.lambdaSchedule[hour];
  }

  // Find maximum lambda for thinning method
  getMaxLambda() {
    return Math.max(...this.lambdaSchedule);
  }

  // Run full NHPP simulation
  runSimulation() {
    const results = {
      replications: [],
      summary: {
        avgQueueLengths: [],
        avgWaitTimes: [],
        utilizations: [],
        overflowEvents: [],
        criticalCareLoads: []
      }
    };
    
    const maxLambda = this.getMaxLambda();
    
    for (let rep = 0; rep < this.replications; rep++) {
      // Generate arrivals for 24 hours using thinning method
      const lambdaFunction = (t) => this.getLambdaAtTime(t);
      const arrivals = this.generateNHPPArrivals(0, 24, maxLambda, lambdaFunction);
      
      // Simulate M/M/c queue
      const simulation = this.simulateMMc(arrivals, this.mu, this.numStaff);
      
      // Calculate hourly statistics
      const hourlyQueueLengths = Array(24).fill(0);
      const hourlyArrivals = Array(24).fill(0);
      const hourlyUtilization = Array(24).fill(0);
      
      arrivals.forEach(arrival => {
        const hour = Math.floor(arrival);
        if (hour < 24) hourlyArrivals[hour]++;
      });
      
      simulation.queueLengths.forEach(({ time, length }) => {
        const hour = Math.floor(time);
        if (hour < 24) hourlyQueueLengths[hour] += length;
      });
      
      // Calculate utilization per hour
      for (let hour = 0; hour < 24; hour++) {
        if (hourlyArrivals[hour] > 0) {
          hourlyUtilization[hour] = Math.min(1, hourlyArrivals[hour] / this.maxCapacity);
        }
      }
      
      // Critical care load (15% of arrivals need critical care)
      const criticalCareLoad = Math.ceil(arrivals.length * this.criticalRatio);
      
      results.replications.push({
        repId: rep,
        totalArrivals: arrivals.length,
        avgWaitTime: simulation.avgWaitTime,
        maxWaitTime: simulation.maxWaitTime,
        criticalCareLoad,
        hourlyArrivals,
        hourlyQueueLengths,
        hourlyUtilization,
        overflowDetected: simulation.maxWaitTime > 4 // >4 hours wait indicates overflow
      });
      
      // Accumulate for summary
      results.summary.avgWaitTimes.push(simulation.avgWaitTime);
      results.summary.overflowEvents.push(simulation.maxWaitTime > 4 ? 1 : 0);
      results.summary.criticalCareLoads.push(criticalCareLoad);
    }
    
    // Calculate summary statistics
    const summaryStats = {
      meanWaitTime: this.calculateMean(results.summary.avgWaitTimes),
      stdWaitTime: this.calculateStd(results.summary.avgWaitTimes),
      meanCriticalCareLoad: this.calculateMean(results.summary.criticalCareLoads),
      overflowProbability: this.calculateMean(results.summary.overflowEvents),
      percentile95WaitTime: this.calculatePercentile(results.summary.avgWaitTimes, 0.95),
      totalPatients: this.calculateMean(results.replications.map(r => r.totalArrivals))
    };
    
    return {
      replications: results.replications,
      summary: summaryStats,
      hourlyStats: this.calculateHourlyStats(results.replications),
      parameters: {
        mu: this.mu,
        numStaff: this.numStaff,
        maxCapacity: this.maxCapacity,
        criticalRatio: this.criticalRatio,
        replications: this.replications
      }
    };
  }
  
  calculateMean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  
  calculateStd(arr) {
    const mean = this.calculateMean(arr);
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
  }
  
  calculatePercentile(arr, percentile) {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[index];
  }
  
  calculateHourlyStats(replications) {
    const hourlyStats = Array(24).fill().map(() => ({
      arrivals: [],
      queueLengths: [],
      utilizations: []
    }));
    
    replications.forEach(rep => {
      for (let hour = 0; hour < 24; hour++) {
        hourlyStats[hour].arrivals.push(rep.hourlyArrivals[hour]);
        hourlyStats[hour].queueLengths.push(rep.hourlyQueueLengths[hour] / rep.hourlyArrivals[hour] || 0);
        hourlyStats[hour].utilizations.push(rep.hourlyUtilization[hour]);
      }
    });
    
    return hourlyStats.map((stats, hour) => ({
      hour,
      avgArrivals: this.calculateMean(stats.arrivals),
      stdArrivals: this.calculateStd(stats.arrivals),
      avgQueueLength: this.calculateMean(stats.queueLengths),
      avgUtilization: this.calculateMean(stats.utilizations),
      predictedArrivals: this.lambdaSchedule[hour]
    }));
  }
}

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
  const [simulationProgress, setSimulationProgress] = useState(0);

  // System capacity parameters
  const SYSTEM_CAPACITY = {
    servers: 3,
    serviceRate: 15,
    maxCapacity: 3 * 15
  };

  // ED Shift definitions
  const ED_SHIFTS = {
    night: {
      name: 'Night Shift',
      hours: [0, 1, 2, 3, 4, 5, 6, 7],
      timeRange: '00:00 - 08:00',
      color: COLORS.textDark,
      bgColor: `${COLORS.textDark}20`,
      icon: '🌙'
    },
    morning: {
      name: 'Morning Shift', 
      hours: [8, 9, 10, 11, 12, 13, 14, 15],
      timeRange: '08:00 - 16:00',
      color: COLORS.primary,
      bgColor: `${COLORS.primary}20`,
      icon: '☀️'
    },
    evening: {
      name: 'Evening Shift',
      hours: [16, 17, 18, 19, 20, 21, 22, 23],
      timeRange: '16:00 - 00:00', 
      color: COLORS.secondary,
      bgColor: `${COLORS.secondary}20`,
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
    
    const criticalCarePercentage = 0.15;
    const triageWaitFactor = 0.8;
    const bedTurnoverHours = 4;
    const nurseToPatientsRatio = 4;
    
    const triageLoad = Math.round(peakLoad * (1 - triageWaitFactor));
    const criticalCareNeed = Math.round(peakLoad * criticalCarePercentage);
    const bedTurnoverRate = Math.round(peakLoad / bedTurnoverHours);
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

  const applyPreset = useCallback((presetKey) => {
    setLambdaValues(PRESETS[presetKey].data);
    setSelectedPreset(presetKey);
    setNhppResults(null);
    setApiError(null);
  }, []);

  const resetProfile = useCallback(() => {
    setLambdaValues(new Array(24).fill(15));
    setSelectedPreset(null);
    setNhppResults(null);
    setApiError(null);
  }, []);

  // Run local NHPP simulation (validated backend algorithm)
  const runLocalSimulation = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    setSimulationProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSimulationProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      // Run NHPP simulation with 100 replications for statistical significance
      const simulator = new NHPPBackendSimulator(
        lambdaValues,
        SYSTEM_CAPACITY.serviceRate,
        SYSTEM_CAPACITY.servers,
        0.15, // critical care ratio
        100   // replications
      );
      
      const results = simulator.runSimulation();
      
      clearInterval(progressInterval);
      setSimulationProgress(100);
      
      setTimeout(() => {
        setNhppResults(results);
        setIsLoading(false);
        setSimulationProgress(0);
      }, 500);
      
    } catch (error) {
      console.error('NHPP Simulation Error:', error);
      setApiError(error.message);
      setIsLoading(false);
      setSimulationProgress(0);
    }
  }, [lambdaValues]);

  // Start simulation
  const startSimulation = useCallback(async () => {
    if (isSimulationRunning) return;
    
    setIsSimulationRunning(true);
    await runLocalSimulation();
    
    // Navigate to results page after simulation completes
    if (nhppResults) {
      navigate('/nhpp-results', {
        state: {
          nhppResults: nhppResults,
          simulationParams: {
            lambda_schedule: lambdaValues,
            mu: SYSTEM_CAPACITY.serviceRate,
            num_staff: SYSTEM_CAPACITY.servers,
            critical_ratio: 0.15,
            replications: 100
          }
        }
      });
    }
    
    setIsSimulationRunning(false);
  }, [isSimulationRunning, runLocalSimulation, nhppResults, navigate, lambdaValues]);

  // Prepare hourly stats for display
  const hourlyStatsData = useMemo(() => {
    if (!nhppResults) return [];
    return nhppResults.hourlyStats.map(stat => ({
      hour: `${stat.hour.toString().padStart(2, '0')}:00`,
      predictedArrivals: stat.predictedArrivals,
      simulatedArrivals: Math.round(stat.avgArrivals),
      queueLength: stat.avgQueueLength.toFixed(1),
      utilization: Math.round(stat.avgUtilization * 100)
    }));
  }, [nhppResults]);

  return (
    <div className="min-h-screen pt-16" style={{ background: `linear-gradient(180deg, ${COLORS.bgLight} 0%, #e0f7fa 100%)` }}>
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
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: COLORS.accent, color: COLORS.primary }}
                    >
                      Non-Homogeneous Poisson Process
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: COLORS.textDark }}>
                    Professional ED Arrival Scheduler
                  </h1>
                  <p className="text-lg max-w-xl" style={{ color: COLORS.textMuted }}>
                    Real-world emergency department simulation scenarios with healthcare-specific analysis
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetProfile}
                    className="px-4 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg"
                    style={{ background: COLORS.accent, color: COLORS.primary }}
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startSimulation}
                    disabled={isLoading}
                    className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 text-white shadow-lg"
                    style={{ 
                      background: isLoading 
                        ? `linear-gradient(135deg, #6b7280, #9ca3af)` 
                        : `linear-gradient(135deg, ${COLORS.success}, ${COLORS.emerald})`,
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Simulating NHPP... {simulationProgress}%
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
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: COLORS.textDark }}>
                    <Zap className="w-6 h-6" style={{ color: COLORS.orange }} />
                    Real-World ED Scenarios
                  </h2>
                  <p className="mt-1" style={{ color: COLORS.textMuted }}>
                    Professional emergency department simulation scenarios based on actual healthcare patterns
                  </p>
                </div>
                <div className="text-sm px-3 py-1 rounded-full" style={{ background: COLORS.bgLight, color: COLORS.textMuted }}>
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
                        <div className="font-bold" style={{ color: COLORS.textDark }}>
                          {preset.name.substring(2)}
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full inline-block" style={{ background: COLORS.bgLight, color: COLORS.primary }}>
                          {preset.category}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm mb-3" style={{ color: COLORS.textMuted }}>
                      {preset.description}
                    </div>
                    
                    {/* Mini Chart Preview */}
                    <div className="h-12 rounded-lg overflow-hidden mb-3" style={{ background: COLORS.bgLight }}>
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
                    <div className="text-xs italic mb-3" style={{ color: COLORS.textMuted }}>
                      {preset.clinicalContext}
                    </div>
                    
                    {/* Metrics */}
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: COLORS.textMuted }}>Peak Load:</span>
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
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: COLORS.textDark }}>
                <TrendingUp className="w-6 h-6" style={{ color: COLORS.success }} />
                λ(t) Visualization with ED Shift Analysis
              </h2>
              
              <div className="h-80 w-full mb-6 relative">
                {/* Shift Background Zones */}
                <div className="absolute inset-0 flex">
                  <div 
                    className="h-full opacity-10"
                    style={{ 
                      width: '33.33%',
                      backgroundColor: ED_SHIFTS.night.color
                    }}
                  />
                  <div 
                    className="h-full opacity-10"
                    style={{ 
                      width: '33.33%',
                      backgroundColor: ED_SHIFTS.morning.color
                    }}
                  />
                  <div 
                    className="h-full opacity-10"
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
                      stroke={COLORS.textMuted}
                      fontSize={12}
                      interval={3}
                    />
                    <YAxis 
                      stroke={COLORS.textMuted}
                      fontSize={12}
                      domain={[0, Math.max(60, Math.max(...lambdaValues) + 10)]}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: COLORS.white,
                        border: `1px solid ${COLORS.bgLight}`,
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        if (name === 'Max Capacity') {
                          return [
                            <span style={{ color: COLORS.danger, fontWeight: 'bold' }}>
                              {value} patients/hour (Maximum Staffing Capacity c×μ)
                            </span>, 
                            'Capacity Threshold'
                          ];
                        }
                        const isOver = value > SYSTEM_CAPACITY.maxCapacity;
                        return [
                          <span style={{ color: isOver ? COLORS.danger : COLORS.success }}>
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
                      stroke={COLORS.danger}
                      strokeWidth={3}
                      strokeDasharray="8,4"
                      dot={false}
                      name="Max Capacity"
                    />
                    
                    {/* Main arrival pattern */}
                    <Line
                      type="monotone"
                      dataKey="lambda"
                      stroke={hasBottlenecks ? COLORS.danger : COLORS.success}
                      strokeWidth={4}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        const isOver = payload.lambda > SYSTEM_CAPACITY.maxCapacity;
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isOver ? 6 : 4}
                            fill={isOver ? COLORS.danger : COLORS.success}
                            stroke={isOver ? COLORS.danger : COLORS.success}
                            strokeWidth={2}
                          />
                        );
                      }}
                      activeDot={{ r: 8, stroke: hasBottlenecks ? COLORS.danger : COLORS.success, strokeWidth: 2 }}
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
                  className="p-4 rounded-xl border" style={{ background: `${COLORS.bgLight}50`, borderColor: COLORS.primary }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{PRESETS[selectedPreset].name.split(' ')[0]}</div>
                    <div className="flex-1">
                      <div className="font-bold mb-1" style={{ color: COLORS.primary }}>
                        Active Scenario: {PRESETS[selectedPreset].name.substring(2)}
                      </div>
                      <div className="text-sm mb-2" style={{ color: COLORS.textMuted }}>
                        {PRESETS[selectedPreset].clinicalContext}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span style={{ color: COLORS.primary }}>Category:</span>
                          <div className="font-semibold">{PRESETS[selectedPreset].category}</div>
                        </div>
                        <div>
                          <span style={{ color: COLORS.primary }}>Peak Load:</span>
                          <div className="font-semibold">{Math.max(...PRESETS[selectedPreset].data)} pts/hr</div>
                        </div>
                        <div>
                          <span style={{ color: COLORS.primary }}>Daily Total:</span>
                          <div className="font-semibold">{PRESETS[selectedPreset].data.reduce((a, b) => a + b, 0)} patients</div>
                        </div>
                        <div>
                          <span style={{ color: COLORS.primary }}>Capacity Status:</span>
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

          {/* Simulation Results Preview */}
          {nhppResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: COLORS.textDark }}>
                  <Activity className="w-6 h-6" style={{ color: COLORS.primary }} />
                  NHPP Simulation Results (100 Replications)
                </h2>
                
                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl text-center" style={{ background: `${COLORS.bgLight}50` }}>
                    <div className="text-sm mb-1" style={{ color: COLORS.textMuted }}>📊 Mean Wait Time</div>
                    <div className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                      {nhppResults.summary.meanWaitTime.toFixed(2)} hrs
                    </div>
                    <div className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
                      ±{nhppResults.summary.stdWaitTime.toFixed(2)} hrs
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl text-center" style={{ background: `${COLORS.bgLight}50` }}>
                    <div className="text-sm mb-1" style={{ color: COLORS.textMuted }}>⏰ 95th Percentile Wait</div>
                    <div className="text-2xl font-bold" style={{ color: COLORS.warning }}>
                      {nhppResults.summary.percentile95WaitTime.toFixed(2)} hrs
                    </div>
                    <div className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
                      Critical threshold
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl text-center" style={{ background: `${COLORS.bgLight}50` }}>
                    <div className="text-sm mb-1" style={{ color: COLORS.textMuted }}>🚑 Overflow Probability</div>
                    <div className="text-2xl font-bold" style={{ color: nhppResults.summary.overflowProbability > 0.3 ? COLORS.danger : COLORS.success }}>
                      {(nhppResults.summary.overflowProbability * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
                      {nhppResults.summary.overflowProbability > 0.3 ? 'High risk' : 'Manageable risk'}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl text-center" style={{ background: `${COLORS.bgLight}50` }}>
                    <div className="text-sm mb-1" style={{ color: COLORS.textMuted }}>🏥 Critical Care Load</div>
                    <div className="text-2xl font-bold" style={{ color: COLORS.danger }}>
                      {Math.round(nhppResults.summary.meanCriticalCareLoad)} patients
                    </div>
                    <div className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
                      Need ICU/Resuscitation
                    </div>
                  </div>
                </div>

                {/* Hourly Statistics Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: COLORS.bgLight }}>
                        <th className="p-3 text-left font-semibold" style={{ color: COLORS.textDark }}>Hour</th>
                        <th className="p-3 text-left font-semibold" style={{ color: COLORS.textDark }}>Predicted λ(t)</th>
                        <th className="p-3 text-left font-semibold" style={{ color: COLORS.textDark }}>Simulated Arrivals</th>
                        <th className="p-3 text-left font-semibold" style={{ color: COLORS.textDark }}>Avg Queue Length</th>
                        <th className="p-3 text-left font-semibold" style={{ color: COLORS.textDark }}>Utilization</th>
                        <th className="p-3 text-left font-semibold" style={{ color: COLORS.textDark }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hourlyStatsData.map((stat, idx) => {
                        const isOverCapacity = stat.predictedArrivals > SYSTEM_CAPACITY.maxCapacity;
                        return (
                          <tr key={idx} className="border-b" style={{ borderColor: COLORS.bgLight }}>
                            <td className="p-3 font-medium" style={{ color: COLORS.textDark }}>{stat.hour}</td>
                            <td className="p-3">{stat.predictedArrivals}</td>
                            <td className="p-3">{stat.simulatedArrivals}</td>
                            <td className="p-3">{stat.queueLength}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: COLORS.bgLight }}>
                                  <div 
                                    className="h-full rounded-full transition-all"
                                    style={{ 
                                      width: `${stat.utilization}%`,
                                      background: stat.utilization > 80 ? COLORS.danger : stat.utilization > 60 ? COLORS.warning : COLORS.success
                                    }}
                                  />
                                </div>
                                <span className="text-xs">{stat.utilization}%</span>
                              </div>
                            </td>
                            <td className="p-3">
                              {isOverCapacity ? (
                                <div className="flex items-center gap-1 text-red-600">
                                  <XCircle className="w-4 h-4" />
                                  <span className="text-xs">Over Capacity</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-xs">Operational</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Department Impact Live Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: COLORS.textDark }}>
                <Activity className="w-6 h-6" style={{ color: COLORS.primary }} />
                Department Impact Live Statistics
              </h2>
              
              {/* Primary ED Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 rounded-xl border" style={{ background: `${COLORS.bgLight}50`, borderColor: COLORS.primary }}>
                  <div className="text-sm mb-1" style={{ color: COLORS.primary }}>📊 Daily Patient Load</div>
                  <div className="text-2xl font-bold" style={{ color: COLORS.textDark }}>
                    {edMetrics.totalDaily}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.textMuted }}>total patients</div>
                </div>
                
                <div className="text-center p-4 rounded-xl border" style={{ background: `${COLORS.bgLight}50`, borderColor: COLORS.success }}>
                  <div className="text-sm mb-1" style={{ color: COLORS.success }}>⏱️ Average Hourly Rate</div>
                  <div className="text-2xl font-bold" style={{ color: COLORS.textDark }}>
                    {edMetrics.avgHourly}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.textMuted }}>patients/hour</div>
                </div>
                
                <div className={`text-center p-4 rounded-xl border-2 ${
                  edMetrics.isOverCapacity 
                    ? 'border-red-200' 
                    : 'border-orange-200'
                }`} style={{ background: `${edMetrics.isOverCapacity ? '#fee2e2' : '#fff7ed'}50` }}>
                  <div className={`text-sm mb-1 ${edMetrics.isOverCapacity ? 'text-red-600' : 'text-orange-600'}`}>
                    🚨 Peak Crisis Hour
                  </div>
                  <div className={`text-2xl font-bold ${edMetrics.isOverCapacity ? 'text-red-800' : 'text-orange-800'}`}>
                    {edMetrics.peakHour.toString().padStart(2, '0')}:00
                  </div>
                  <div className={`text-xs ${edMetrics.isOverCapacity ? 'text-red-600' : 'text-orange-600'}`}>
                    {edMetrics.peakLoad} arrivals
                    {edMetrics.isOverCapacity && ' 🚨'}
                  </div>
                </div>
                
                <div className="text-center p-4 rounded-xl border" style={{ background: `${COLORS.bgLight}50`, borderColor: COLORS.secondary }}>
                  <div className="text-sm mb-1" style={{ color: COLORS.secondary }}>🏥 Capacity Usage</div>
                  <div className="text-2xl font-bold" style={{ color: COLORS.textDark }}>
                    {edMetrics.capacityUtilization}%
                  </div>
                  <div className="text-xs" style={{ color: COLORS.textMuted }}>
                    of {SYSTEM_CAPACITY.maxCapacity} pts/hr max
                  </div>
                </div>
              </div>

              {/* ED-Specific Impact Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl border" style={{ background: `${COLORS.accent}30`, borderColor: COLORS.warning }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🏃‍♂️</span>
                    <span className="font-semibold" style={{ color: COLORS.textDark }}>Predicted Triage Load</span>
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: COLORS.textDark }}>
                    {edMetrics.triageLoad}
                  </div>
                  <div className="text-sm" style={{ color: COLORS.textMuted }}>
                    patients waiting in first hour
                  </div>
                  <div className="text-xs mt-2 italic" style={{ color: COLORS.textMuted }}>
                    Based on 80% immediate triage processing rate
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border" style={{ background: '#fee2e250', borderColor: COLORS.danger }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🚑</span>
                    <span className="font-semibold" style={{ color: COLORS.textDark }}>Critical Care Need</span>
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: COLORS.textDark }}>
                    {edMetrics.criticalCareNeed}
                  </div>
                  <div className="text-sm" style={{ color: COLORS.textMuted }}>
                    critical patients during peak
                  </div>
                  <div className="text-xs mt-2 italic" style={{ color: COLORS.textMuted }}>
                    15% of peak arrivals require critical care
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border" style={{ background: `${COLORS.bgLight}50`, borderColor: COLORS.primary }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🛏️</span>
                    <span className="font-semibold" style={{ color: COLORS.textDark }}>Bed Turnover Rate</span>
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: COLORS.textDark }}>
                    {edMetrics.bedTurnoverRate}
                  </div>
                  <div className="text-sm" style={{ color: COLORS.textMuted }}>
                    beds/hour during peak
                  </div>
                  <div className="text-xs mt-2 italic" style={{ color: COLORS.textMuted }}>
                    Required to handle peak load
                  </div>
                </div>
              </div>

              {/* Advanced ED Operations Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border" style={{ background: `${COLORS.success}10`, borderColor: COLORS.success }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">👩‍⚕️</span>
                    <span className="font-semibold" style={{ color: COLORS.textDark }}>Nurses Required</span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: COLORS.textDark }}>
                    {edMetrics.nursesRequired}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.textMuted }}>
                    1:4 nurse-to-patient ratio
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border" style={{ background: `${COLORS.warning}10`, borderColor: COLORS.warning }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🚨</span>
                    <span className="font-semibold" style={{ color: COLORS.textDark }}>Ambulance Diversions</span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: COLORS.textDark }}>
                    {edMetrics.ambulanceDiversions}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.textMuted }}>
                    expected during peak
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border" style={{ background: `${COLORS.secondary}10`, borderColor: COLORS.secondary }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⏰</span>
                    <span className="font-semibold" style={{ color: COLORS.textDark }}>Avg Wait Time</span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: COLORS.textDark }}>
                    {edMetrics.avgWaitTime}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.textMuted }}>
                    minutes during peak
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border" style={{ background: `${COLORS.danger}10`, borderColor: COLORS.danger }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🚪</span>
                    <span className="font-semibold" style={{ color: COLORS.textDark }}>Left w/o Treatment</span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: COLORS.textDark }}>
                    {edMetrics.leftWithoutTreatment}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.textMuted }}>
                    patients (LWOT rate)
                  </div>
                </div>
              </div>

              {/* Clinical Impact Analysis */}
              <div className="mt-6 p-5 rounded-xl border" style={{ background: `${COLORS.bgLight}30`, borderColor: COLORS.bgLight }}>
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: COLORS.textDark }}>
                  🏥 Clinical Impact Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-semibold mb-2" style={{ color: COLORS.textDark }}>Triage Operations:</div>
                    <ul className="space-y-1" style={{ color: COLORS.textMuted }}>
                      <li>• Peak triage load: {edMetrics.triageLoad} patients waiting</li>
                      <li>• Triage nurses needed: {Math.ceil(edMetrics.triageLoad / 10)}</li>
                      <li>• Fast-track eligible: ~{Math.round(edMetrics.peakLoad * 0.4)} patients</li>
                      <li>• ESI Level 1-2: {edMetrics.criticalCareNeed} critical cases</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold mb-2" style={{ color: COLORS.textDark }}>Resource Management:</div>
                    <ul className="space-y-1" style={{ color: COLORS.textMuted }}>
                      <li>• Bed turnover: {edMetrics.bedTurnoverRate} beds/hour required</li>
                      <li>• Total nursing staff: {edMetrics.nursesRequired} nurses</li>
                      <li>• Physician coverage: {Math.ceil(edMetrics.peakLoad / 8)} doctors</li>
                      <li>• Support staff: {Math.ceil(edMetrics.peakLoad / 12)} techs</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold mb-2" style={{ color: COLORS.textDark }}>Quality Indicators:</div>
                    <ul className="space-y-1" style={{ color: COLORS.textMuted }}>
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
                  className="mt-6 p-5 rounded-xl border-2" style={{ background: '#fee2e2', borderColor: COLORS.danger }}
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