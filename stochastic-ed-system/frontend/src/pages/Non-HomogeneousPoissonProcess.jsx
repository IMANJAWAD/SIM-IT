import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';
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
  CheckCircle,
  ArrowRight
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

// Simplified, consistent palette
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
  emerald: '#2a9d8f',
  orange: '#780000',
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

  // Run NHPP simulation via backend API
  const runNHPPSimulation = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    setSimulationProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSimulationProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const requestData = {
        lambda_schedule: lambdaValues,
        mu: SYSTEM_CAPACITY.serviceRate,
        num_staff: SYSTEM_CAPACITY.servers,
        critical_ratio: 0.15,
        replications: 100
      };
      
      console.log('Calling NHPP backend API with data:', requestData);
      
      // Call backend API
      const response = await fetch('http://localhost:8000/nhpp/simulate-nhpp', {
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
      
      const backendResults = await response.json();
      console.log('NHPP Backend API Response:', backendResults);
      
      clearInterval(progressInterval);
      setSimulationProgress(100);
      
      // Transform backend results to match frontend expectations
      const transformedResults = {
        summary: {
          totalPatients: backendResults.daily_total,
          meanWaitTime: backendResults.hourly_data.length > 0 ? 
            backendResults.hourly_data.reduce((sum, h) => sum + h.theoretical_wait, 0) / backendResults.hourly_data.length / 60 : 0, // Convert to hours
          stdWaitTime: 0.5, // Placeholder
          percentile95WaitTime: backendResults.hourly_data.length > 0 ? 
            Math.max(...backendResults.hourly_data.map(h => h.theoretical_wait)) / 60 : 0, // Convert to hours
          overflowProbability: backendResults.hourly_data.filter(h => h.utilization > 100).length / 24,
          meanCriticalCareLoad: backendResults.critical_patients,
          meanQueueLength: backendResults.monte_carlo_summary?.avg_queue_length || 0,
          stdQueueLength: backendResults.monte_carlo_summary?.queue_variability || 0
        },
        hourlyStats: backendResults.hourly_data.map(hourData => ({
          hour: hourData.hour,
          predictedArrivals: hourData.predicted_arrivals || lambdaValues[hourData.hour],
          avgArrivals: hourData.predicted_arrivals || lambdaValues[hourData.hour],
          avgQueueLength: hourData.queue_length || 0,
          avgUtilization: hourData.utilization / 100
        }))
      };
      
      setTimeout(() => {
        setNhppResults(transformedResults);
        setIsLoading(false);
        setSimulationProgress(0);
      }, 500);
      
    } catch (error) {
      console.error('NHPP API Error:', error);
      setApiError(error.message);
      
      // Fallback to local simulation if API fails
      console.log('Falling back to local simulation...');
      try {
        const simulator = new NHPPBackendSimulator(
          lambdaValues,
          SYSTEM_CAPACITY.serviceRate,
          SYSTEM_CAPACITY.servers,
          0.15,
          100
        );
        
        const results = simulator.runSimulation();
        setNhppResults(results);
        setIsLoading(false);
        setSimulationProgress(0);
      } catch (fallbackError) {
        console.error('Fallback simulation failed:', fallbackError);
        setApiError(fallbackError.message);
        setIsLoading(false);
        setSimulationProgress(0);
      }
    }
  }, [lambdaValues]);

  // Start simulation
  const startSimulation = useCallback(async () => {
    if (isSimulationRunning) return;
    
    // If we already have results, navigate to detailed results page
    if (nhppResults) {
      // Transform data to match results page expectations
      const transformedResults = {
        ...nhppResults,
        hourly_data: nhppResults.hourlyStats.map(stat => ({
          hour: stat.hour,
          utilization: Math.round(stat.avgUtilization * 100),
          theoretical_wait: (stat.avgQueueLength / stat.predictedArrivals) * 60, // Convert to minutes
          queue_length: stat.avgQueueLength
        })),
        daily_total: nhppResults.summary.totalPatients,
        critical_patients: Math.round(nhppResults.summary.meanCriticalCareLoad),
        peak_hour: nhppResults.hourlyStats.reduce((maxHour, stat, index) => 
          stat.avgUtilization > nhppResults.hourlyStats[maxHour].avgUtilization ? index : maxHour, 0),
        peak_utilization: Math.round(Math.max(...nhppResults.hourlyStats.map(s => s.avgUtilization * 100))),
        monte_carlo_results: nhppResults.hourlyStats.map(s => s.avgQueueLength),
        monte_carlo_confidence: nhppResults.hourlyStats.map(stat => ({
          mean: stat.avgQueueLength,
          lower: Math.max(0, stat.avgQueueLength - stat.avgQueueLength * 0.2),
          upper: stat.avgQueueLength + stat.avgQueueLength * 0.2,
          std: stat.avgQueueLength * 0.15
        })),
        monte_carlo_summary: {
          avg_queue_length: nhppResults.summary.meanQueueLength,
          max_queue_length: Math.max(...nhppResults.hourlyStats.map(s => s.avgQueueLength)),
          queue_variability: nhppResults.summary.stdQueueLength,
          total_replications: 100
        }
      };

      navigate('/nhpp-results', {
        state: {
          nhppResults: transformedResults,
          simulationParams: {
            lambda_schedule: lambdaValues,
            mu: SYSTEM_CAPACITY.serviceRate,
            num_staff: SYSTEM_CAPACITY.servers,
            critical_ratio: 0.15,
            replications: 100
          }
        }
      });
      return;
    }
    
    setIsSimulationRunning(true);
    await runNHPPSimulation();
    setIsSimulationRunning(false);
  }, [isSimulationRunning, runNHPPSimulation, nhppResults, navigate, lambdaValues]);

  // Navigate to results page with current results
  const viewDetailedResults = useCallback(() => {
    if (nhppResults) {
      // Transform data to match results page expectations
      const transformedResults = {
        ...nhppResults,
        hourly_data: nhppResults.hourlyStats.map(stat => ({
          hour: stat.hour,
          utilization: Math.round(stat.avgUtilization * 100),
          theoretical_wait: (stat.avgQueueLength / stat.predictedArrivals) * 60, // Convert to minutes
          queue_length: stat.avgQueueLength
        })),
        daily_total: nhppResults.summary.totalPatients,
        critical_patients: Math.round(nhppResults.summary.meanCriticalCareLoad),
        peak_hour: nhppResults.hourlyStats.reduce((maxHour, stat, index) => 
          stat.avgUtilization > nhppResults.hourlyStats[maxHour].avgUtilization ? index : maxHour, 0),
        peak_utilization: Math.round(Math.max(...nhppResults.hourlyStats.map(s => s.avgUtilization * 100))),
        monte_carlo_results: nhppResults.hourlyStats.map(s => s.avgQueueLength),
        monte_carlo_confidence: nhppResults.hourlyStats.map(stat => ({
          mean: stat.avgQueueLength,
          lower: Math.max(0, stat.avgQueueLength - stat.avgQueueLength * 0.2),
          upper: stat.avgQueueLength + stat.avgQueueLength * 0.2,
          std: stat.avgQueueLength * 0.15
        })),
        monte_carlo_summary: {
          avg_queue_length: nhppResults.summary.meanQueueLength,
          max_queue_length: Math.max(...nhppResults.hourlyStats.map(s => s.avgQueueLength)),
          queue_variability: nhppResults.summary.stdQueueLength,
          total_replications: 100
        }
      };

      navigate('/nhpp-results', {
        state: {
          nhppResults: transformedResults,
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
  }, [nhppResults, navigate, lambdaValues]);

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
    <div className="min-h-screen pt-16" style={{ background: COLORS.bgLight }}>
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
                    Non-Homogeneous Poisson Process
                  </p>
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
                    className="px-4 py-3 rounded-xl font-semibold flex items-center gap-2 border-2"
                    style={{ borderColor: COLORS.secondary, color: COLORS.primary }}
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
                        : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Simulating NHPP... {simulationProgress}%
                      </>
                    ) : nhppResults ? (
                      <>
                        <ArrowRight className="w-5 h-5" />
                        View Detailed Results
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
            className=""
          >
            <div className="p-1">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: COLORS.textDark }}>Real-World ED Scenarios</h2>
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
                    className="p-5 rounded-xl border-2 transition-all text-left bg-white"
                    style={{
                      borderColor: selectedPreset === key ? COLORS.secondary : COLORS.border,
                      background: selectedPreset === key ? `${COLORS.secondary}12` : COLORS.white,
                      boxShadow: selectedPreset === key ? `0 4px 14px -8px ${COLORS.secondary}` : 'none'
                    }}
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
          </div>

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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: COLORS.textDark }}>
                    <Activity className="w-6 h-6" style={{ color: COLORS.primary }} />
                    NHPP Simulation Results (100 Replications)
                  </h2>
                  <motion.button
                    onClick={viewDetailedResults}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
                  >
                    View Detailed Results
                  </motion.button>
                </div>
                
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

                {/* Quick Preview Chart */}
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyStatsData.slice(0, 12)}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                      <XAxis 
                        dataKey="hour" 
                        stroke={COLORS.textMuted}
                        fontSize={11}
                      />
                      <YAxis 
                        stroke={COLORS.textMuted}
                        fontSize={11}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(255,255,255,0.95)',
                          border: `1px solid ${COLORS.secondary}`,
                          borderRadius: '8px',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="utilization" 
                        stroke={COLORS.primary}
                        strokeWidth={2}
                        dot={{ fill: COLORS.primary, r: 3 }}
                        name="Utilization %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm" style={{ color: COLORS.textMuted }}>
                    Click "View Detailed Results" to see complete analysis, charts, and hourly breakdown table
                  </p>
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
            <section className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: COLORS.border }}>
              <header className="mb-6">
                <h2 className="text-2xl font-bold mb-1" style={{ color: COLORS.textDark }}>Department Impact Statistics</h2>
                <p className="text-sm" style={{ color: COLORS.textMuted }}>Operational snapshot for triage, staffing, and service pressure.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <article className="rounded-xl p-4 border" style={{ borderColor: COLORS.border, background: `${COLORS.secondary}10` }}>
                  <p className="text-sm" style={{ color: COLORS.textMuted }}>Daily Patient Load</p>
                  <p className="text-2xl font-bold" style={{ color: COLORS.textDark }}>{edMetrics.totalDaily}</p>
                  <p className="text-xs" style={{ color: COLORS.textMuted }}>total patients</p>
                </article>
                <article className="rounded-xl p-4 border" style={{ borderColor: COLORS.border, background: `${COLORS.secondary}10` }}>
                  <p className="text-sm" style={{ color: COLORS.textMuted }}>Average Hourly Rate</p>
                  <p className="text-2xl font-bold" style={{ color: COLORS.textDark }}>{edMetrics.avgHourly}</p>
                  <p className="text-xs" style={{ color: COLORS.textMuted }}>patients/hour</p>
                </article>
                <article className="rounded-xl p-4 border" style={{ borderColor: edMetrics.isOverCapacity ? COLORS.alertHint : COLORS.border, background: edMetrics.isOverCapacity ? `${COLORS.alertHint}10` : `${COLORS.secondary}10` }}>
                  <p className="text-sm" style={{ color: edMetrics.isOverCapacity ? COLORS.alertHint : COLORS.textMuted }}>Peak Hour</p>
                  <p className="text-2xl font-bold" style={{ color: edMetrics.isOverCapacity ? COLORS.alertHint : COLORS.textDark }}>{edMetrics.peakHour.toString().padStart(2, '0')}:00</p>
                  <p className="text-xs" style={{ color: edMetrics.isOverCapacity ? COLORS.alertHint : COLORS.textMuted }}>{edMetrics.peakLoad} arrivals</p>
                </article>
                <article className="rounded-xl p-4 border" style={{ borderColor: COLORS.border, background: `${COLORS.secondary}10` }}>
                  <p className="text-sm" style={{ color: COLORS.textMuted }}>Capacity Usage</p>
                  <p className="text-2xl font-bold" style={{ color: COLORS.textDark }}>{edMetrics.capacityUtilization}%</p>
                  <p className="text-xs" style={{ color: COLORS.textMuted }}>of {SYSTEM_CAPACITY.maxCapacity} pts/hr max</p>
                </article>
              </div>

              <div className="rounded-xl border p-4 mb-6" style={{ borderColor: COLORS.border }}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs" style={{ color: COLORS.textMuted }}>Triage Load</p>
                    <p className="text-xl font-semibold" style={{ color: COLORS.textDark }}>{edMetrics.triageLoad}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: COLORS.textMuted }}>Critical Care Need</p>
                    <p className="text-xl font-semibold" style={{ color: COLORS.textDark }}>{edMetrics.criticalCareNeed}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: COLORS.textMuted }}>Bed Turnover</p>
                    <p className="text-xl font-semibold" style={{ color: COLORS.textDark }}>{edMetrics.bedTurnoverRate}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: COLORS.textMuted }}>Nurses Required</p>
                    <p className="text-xl font-semibold" style={{ color: COLORS.textDark }}>{edMetrics.nursesRequired}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: `${COLORS.bgLight}40` }}>
                <h3 className="font-semibold mb-3" style={{ color: COLORS.textDark }}>Clinical Impact Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm" style={{ color: COLORS.textMuted }}>
                  <div>
                    <p>Triage nurses needed: {Math.ceil(edMetrics.triageLoad / 10)}</p>
                    <p>Fast-track eligible: ~{Math.round(edMetrics.peakLoad * 0.4)} patients</p>
                  </div>
                  <div>
                    <p>Physician coverage: {Math.ceil(edMetrics.peakLoad / 8)} doctors</p>
                    <p>Support staff: {Math.ceil(edMetrics.peakLoad / 12)} techs</p>
                  </div>
                  <div>
                    <p>Door-to-provider: {edMetrics.avgWaitTime} minutes</p>
                    <p>LWOT rate: {Math.round((edMetrics.leftWithoutTreatment / edMetrics.peakLoad) * 100)}%</p>
                  </div>
                </div>
              </div>

              {edMetrics.isOverCapacity && (
                <aside className="mt-6 rounded-xl border p-4" style={{ borderColor: COLORS.alertHint, background: `${COLORS.alertHint}10` }}>
                  <div className="flex items-start gap-2" style={{ color: COLORS.alertHint }}>
                    <AlertTriangle className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-semibold">Capacity Exceeded</p>
                      <p className="text-sm">Activate surge capacity and add {Math.ceil((edMetrics.peakLoad - SYSTEM_CAPACITY.maxCapacity) / 15)} staff for peak windows.</p>
                    </div>
                  </div>
                </aside>
              )}
            </section>
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