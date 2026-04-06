import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  ArrowLeft,
  Users,
  Zap,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Area,
  AreaChart
} from 'recharts';

// Color palette
const COLORS = {
  primary: '#003049',
  secondary: '#669BBC',
  alertHint: '#780000',
  accent: '#669BBC',
  light: '#f5f8fb',
  success: '#2a9d8f',
  warning: '#669BBC',
  danger: '#780000',
  purple: '#003049',
  pink: '#669BBC',
  indigo: '#003049',
  emerald: '#2a9d8f',
  orange: '#780000',
  textDark: '#003049',
  textMuted: '#557283',
  border: '#c7dceb',
  white: '#ffffff',
};

export default function NHPPResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [nhppResults, setNhppResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Get simulation parameters from location state
  const simulationParams = location.state?.simulationParams;

  useEffect(() => {
    // If we have results passed from the previous page, use them
    if (location.state?.nhppResults) {
      setNhppResults(location.state.nhppResults);
      setIsLoading(false);
    } else if (simulationParams) {
      // Otherwise, run the simulation with the passed parameters
      runNHPPSimulation();
    } else {
      // No parameters, redirect back
      navigate('/poisson-process');
    }
  }, [location.state, simulationParams, navigate]);

  const runNHPPSimulation = async () => {
    if (!simulationParams) return;

    setIsLoading(true);
    setApiError(null);
    
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
      setNhppResults(data);
      console.log('NHPP API Response:', data);
    } catch (error) {
      console.error('NHPP API Error:', error);
      setApiError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data with confidence intervals
  const hourlyChartData = nhppResults?.hourly_data?.map((item, index) => {
    const confidenceData = nhppResults.monte_carlo_confidence?.[index];
    const meanQueue = confidenceData?.mean ?? nhppResults.monte_carlo_results?.[index] ?? 0;
    return {
      hour: `${item.hour.toString().padStart(2, '0')}:00`,
      utilization: item.utilization,
      wait_time: item.theoretical_wait,
      queue_length: meanQueue,
      queue_lower: confidenceData?.lower ?? meanQueue * 0.8,
      queue_upper: confidenceData?.upper ?? meanQueue * 1.2,
      queue_std: confidenceData?.std ?? 0
    };
  }) || [];

  const utilizationData = [
    { name: 'Normal (< 80%)', value: nhppResults?.hourly_data?.filter(h => h.utilization < 80).length || 0, color: COLORS.success },
    { name: 'Warning (80-100%)', value: nhppResults?.hourly_data?.filter(h => h.utilization >= 80 && h.utilization < 100).length || 0, color: COLORS.warning },
    { name: 'Critical (> 100%)', value: nhppResults?.hourly_data?.filter(h => h.utilization >= 100).length || 0, color: COLORS.danger }
  ];

  const maxWaitTime = Math.max(...(nhppResults?.hourly_data?.map(h => h.theoretical_wait) || [0]));
  const hasUnrealisticResults = maxWaitTime > 240 || nhppResults?.peak_utilization > 150;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-blue-800 font-semibold text-xl">Running NHPP Analysis...</div>
          <div className="text-blue-600 text-sm">Monte Carlo simulation with 100 replications</div>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-red-800 font-semibold text-xl mb-2">Simulation Error</div>
          <div className="text-red-600 text-sm mb-4">{apiError}</div>
          <button
            onClick={() => navigate('/poisson-process')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Configuration
          </button>
        </div>
      </div>
    );
  }

  if (!nhppResults) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">No simulation results available</div>
          <button
            onClick={() => navigate('/poisson-process')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Configuration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16" style={{ background: COLORS.light }}>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 bg-white rounded-2xl border shadow-sm p-6 space-y-5" style={{ borderColor: COLORS.border }}>
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className=""
          >
            <div className="p-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => navigate('/poisson-process')}
                      className="p-2 rounded-xl transition-colors"
                      style={{ background: `${COLORS.secondary}20` }}
                    >
                      <ArrowLeft className="w-5 h-5" style={{ color: COLORS.textMuted }} />
                    </button>
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.textMuted }}>
                      NHPP Simulation Results
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: COLORS.textDark }}>
                    Emergency Department Analysis Results
                  </h1>
                  <p className="text-lg max-w-xl" style={{ color: COLORS.textMuted }}>
                    Comprehensive NHPP simulation results with theoretical analysis and Monte Carlo validation
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm" style={{ color: COLORS.textMuted }}>Peak Hour</div>
                    <div className="text-2xl font-bold" style={{ color: COLORS.primary }}>{nhppResults.peak_hour}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm" style={{ color: COLORS.textMuted }}>Peak Utilization</div>
                    <div className="text-2xl font-bold" style={{ color: nhppResults.peak_utilization > 100 ? COLORS.alertHint : nhppResults.peak_utilization > 80 ? COLORS.secondary : COLORS.success }}>
                      {nhppResults.peak_utilization}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Unrealistic Results Warning */}
          {hasUnrealisticResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-yellow-800 text-lg mb-2">
                      ⚠️ Results May Be Unrealistic
                    </div>
                    <div className="text-yellow-700 text-sm space-y-1">
                      {maxWaitTime > 240 && (
                        <p>• Wait times exceed 4 hours ({maxWaitTime.toFixed(1)} min max) - check your arrival rates vs capacity</p>
                      )}
                      {nhppResults?.peak_utilization > 150 && (
                        <p>• Utilization exceeds 150% - system is severely overloaded</p>
                      )}
                      <p>• Consider adjusting staff levels or arrival patterns for more realistic scenarios</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className=""
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-xl p-5 border" style={{ borderColor: COLORS.border, background: `${COLORS.secondary}10` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl" style={{ background: `${COLORS.secondary}22` }}>
                    <Users className="w-6 h-6" style={{ color: COLORS.primary }} />
                  </div>
                  <div>
                    <div className="text-sm" style={{ color: COLORS.textMuted }}>Daily Patient Load</div>
                    <div className="text-2xl font-bold" style={{ color: COLORS.textDark }}>{nhppResults.daily_total}</div>
                  </div>
                </div>
                <div className="text-xs" style={{ color: COLORS.textMuted }}>Total patients expected</div>
              </div>

              <div className="rounded-xl p-5 border" style={{ borderColor: COLORS.border, background: `${COLORS.secondary}10` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl" style={{ background: `${COLORS.alertHint}15` }}>
                    <AlertTriangle className="w-6 h-6" style={{ color: COLORS.alertHint }} />
                  </div>
                  <div>
                    <div className="text-sm" style={{ color: COLORS.textMuted }}>Critical Patients</div>
                    <div className="text-2xl font-bold" style={{ color: COLORS.textDark }}>{nhppResults.critical_patients}</div>
                  </div>
                </div>
                <div className="text-xs" style={{ color: COLORS.textMuted }}>During peak hour</div>
              </div>

              <div className="rounded-xl p-5 border" style={{ borderColor: COLORS.border, background: `${COLORS.secondary}10` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl" style={{ background: `${COLORS.secondary}22` }}>
                    <Clock className="w-6 h-6" style={{ color: COLORS.primary }} />
                  </div>
                  <div>
                    <div className="text-sm" style={{ color: COLORS.textMuted }}>Max Wait Time</div>
                    <div className="text-2xl font-bold" style={{ color: COLORS.textDark }}>
                      {Math.max(...(nhppResults.hourly_data?.map(h => h.theoretical_wait) || [0])).toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="text-xs" style={{ color: COLORS.textMuted }}>Minutes during peak</div>
              </div>

              <div className="rounded-xl p-5 border" style={{ borderColor: COLORS.border, background: `${COLORS.secondary}10` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl" style={{ background: `${COLORS.success}15` }}>
                    <Target className="w-6 h-6" style={{ color: COLORS.success }} />
                  </div>
                  <div>
                    <div className="text-sm" style={{ color: COLORS.textMuted }}>System Status</div>
                    <div className="text-2xl font-bold" style={{ color: nhppResults.peak_utilization > 100 ? COLORS.alertHint : nhppResults.peak_utilization > 80 ? COLORS.secondary : COLORS.success }}>
                      {nhppResults.peak_utilization > 100 ? 'Critical' : 
                       nhppResults.peak_utilization > 80 ? 'Warning' : 'Normal'}
                    </div>
                  </div>
                </div>
                <div className="text-xs" style={{ color: COLORS.textMuted }}>Overall assessment</div>
              </div>
            </div>
          </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Hourly Utilization Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Hourly Utilization Pattern
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyChartData}>
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
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="utilization"
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: COLORS.primary, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Wait Time Analysis */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Clock className="w-6 h-6 text-orange-600" />
                Wait Time Analysis
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyChartData}>
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
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="wait_time" 
                      fill={COLORS.orange}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* System Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <PieChart className="w-6 h-6 text-purple-600" />
                System Status Distribution (24 Hours)
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Tooltip />
                      <Pie
                        data={utilizationData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {utilizationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex flex-col justify-center space-y-3">
                  {utilizationData.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-sm">{item.name}</div>
                        <div className="text-xs text-gray-600">{item.value} hours</div>
                      </div>
                      <div className="text-xl font-bold flex-shrink-0" style={{ color: item.color }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Monte Carlo Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
                Monte Carlo Queue Length Simulation with 95% Confidence Intervals
              </h3>
              
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyChartData}>
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
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name, props) => {
                        if (name === 'queue_length') {
                          const { queue_lower, queue_upper, queue_std } = props.payload;
                          return [
                            <div key="tooltip" className="text-sm">
                              <div className="font-semibold text-indigo-800">
                                Expected Queue: {value} patients
                              </div>
                              <div className="text-indigo-600">
                                95% Confidence: {queue_lower} - {queue_upper} patients
                              </div>
                              <div className="text-gray-600">
                                Standard Deviation: ±{queue_std}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Based on 100 Monte Carlo replications
                              </div>
                            </div>,
                            'Queue Analysis'
                          ];
                        }
                        return [value, name];
                      }}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    
                    {/* Confidence interval area (shadow) */}
                    <Area
                      type="monotone"
                      dataKey="queue_upper"
                      stroke="none"
                      fill={COLORS.indigo}
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="queue_lower"
                      stroke="none"
                      fill="white"
                      fillOpacity={1}
                    />
                    
                    {/* Main queue length line */}
                    <Line
                      type="monotone"
                      dataKey="queue_length"
                      stroke={COLORS.indigo}
                      strokeWidth={3}
                      dot={{ fill: COLORS.indigo, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: COLORS.indigo, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Enhanced Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="text-sm text-indigo-600 mb-1">Average Queue Length</div>
                  <div className="text-2xl font-bold text-indigo-800">
                    {nhppResults.monte_carlo_summary?.avg_queue_length || 
                     (nhppResults.monte_carlo_results?.reduce((a, b) => a + b, 0) / nhppResults.monte_carlo_results?.length || 0).toFixed(1)}
                  </div>
                  <div className="text-xs text-indigo-600">patients</div>
                </div>
                
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="text-sm text-red-600 mb-1">Maximum Queue Length</div>
                  <div className="text-2xl font-bold text-red-800">
                    {nhppResults.monte_carlo_summary?.max_queue_length || 
                     Math.max(...(nhppResults.monte_carlo_results || [0])).toFixed(1)}
                  </div>
                  <div className="text-xs text-red-600">patients</div>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="text-sm text-orange-600 mb-1">Queue Variability</div>
                  <div className="text-2xl font-bold text-orange-800">
                    {nhppResults.monte_carlo_summary?.queue_variability || 'N/A'}
                  </div>
                  <div className="text-xs text-orange-600">avg std deviation</div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-sm text-green-600 mb-1">Simulation Accuracy</div>
                  <div className="text-2xl font-bold text-green-800">
                    {nhppResults.monte_carlo_summary?.total_replications || 100}
                  </div>
                  <div className="text-xs text-green-600">replications</div>
                </div>
              </div>

              {/* Confidence Interval Explanation */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  📊 Understanding the Results & Validation
                </h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <p>
                    <strong>The Shadow Area:</strong> Represents the 95% confidence interval from {nhppResults.monte_carlo_summary?.total_replications || 100} Monte Carlo simulations.
                  </p>
                  <p>
                    <strong>Interpretation:</strong> We are 95% confident that the actual queue length will fall within the shaded area.
                  </p>
                  <p>
                    <strong>Validation Checks:</strong> 
                    • Wait times are capped at 4 hours (240 min) for realism
                    • Utilization over 100% indicates system overload
                    • Queue lengths reflect realistic ED operations
                  </p>
                  <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                    <div className="font-semibold text-blue-800 mb-1">Quick Sanity Check:</div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-blue-600">Peak Utilization:</span>
                        <span className={`ml-2 font-bold ${
                          nhppResults.peak_utilization > 100 ? 'text-red-600' : 
                          nhppResults.peak_utilization > 85 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {nhppResults.peak_utilization}% {nhppResults.peak_utilization > 100 ? '(OVERLOADED)' : '(OK)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-600">Max Wait:</span>
                        <span className={`ml-2 font-bold ${
                          Math.max(...(nhppResults.hourly_data?.map(h => h.theoretical_wait) || [0])) > 60 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {Math.max(...(nhppResults.hourly_data?.map(h => h.theoretical_wait) || [0])).toFixed(1)} min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center gap-4"
          >
            <button
              onClick={() => navigate('/poisson-process')}
              className="px-8 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-lg"
            >
              Back to Configuration
            </button>
            <button
              onClick={() => runNHPPSimulation()}
              className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg"
            >
              Run New Simulation
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}