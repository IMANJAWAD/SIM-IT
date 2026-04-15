import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Activity, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Shield,
  Calculator,
  Target,
  Timer,
  Award
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ErrorBar
} from 'recharts';
import { useNavigate } from 'react-router-dom';

// Color palette for triage levels
const TRIAGE_COLORS = {
  level1: '#dc2626', // Red - Resuscitation
  level2: '#ea580c', // Orange - Emergent  
  level3: '#d97706', // Yellow - Urgent
  level4: '#16a34a', // Green - Less Urgent
  level5: '#2563eb', // Blue - Non-Urgent
  background: '#edf4fa',
};

const UI_COLORS = {
  primary: '#003049',
  secondary: '#669BBC',
  alertHint: '#780000',
  textDark: '#003049',
  textMuted: '#557283',
  border: '#c7dceb',
};

const TRIAGE_LEVELS = [
  { id: 1, name: 'P1 - Resuscitation', emoji: '🔴', color: TRIAGE_COLORS.level1 },
  { id: 2, name: 'P2 - Emergent', emoji: '🟠', color: TRIAGE_COLORS.level2 },
  { id: 3, name: 'P3 - Urgent', emoji: '🟡', color: TRIAGE_COLORS.level3 },
  { id: 4, name: 'P4 - Less Urgent', emoji: '🟢', color: TRIAGE_COLORS.level4 },
  { id: 5, name: 'P5 - Non-Urgent', emoji: '🔵', color: TRIAGE_COLORS.level5 }
];

export default function PriorityQueueResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get results from localStorage or make API call
    const storedResults = localStorage.getItem('priorityQueueResults');
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
      } catch {
        setError('Failed to parse stored results');
      }
    } else {
      setError('No simulation results found. Please run a simulation first.');
    }
    setLoading(false);
  }, []);

  const goBack = () => {
    navigate('/priority-queuing');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center" 
           style={{ background: TRIAGE_COLORS.background }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-xl font-semibold text-gray-700">Loading Priority Queue Results...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center" 
           style={{ background: TRIAGE_COLORS.background }}>
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-xl font-semibold text-gray-700 mb-4">{error}</div>
          <button
            onClick={goBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Priority Queue Setup
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const comparisonData = results?.comparison?.map((item, index) => ({
    level: `P${item.level}`,
    theoretical: typeof item.theoretical_wait === 'number' ? item.theoretical_wait : 0,
    simulation: item.simulation_wait,
    error: typeof item.error_percent === 'number' ? item.error_percent : 0,
    color: TRIAGE_LEVELS[index]?.color
  })) || [];

  const confidenceData = results?.simulation?.results?.map((item, index) => ({
    level: `P${item.level}`,
    mean: item.mean_wait_mins,
    lower: Math.max(0, item.mean_wait_mins - item.confidence_interval),
    upper: item.mean_wait_mins + item.confidence_interval,
    color: TRIAGE_LEVELS[index]?.color
  })) || [];

  return (
    <div className="min-h-screen pt-16" 
         style={{ background: TRIAGE_COLORS.background }}>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: UI_COLORS.border }}>
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="p-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={goBack}
                    className="p-3 rounded-xl transition-colors"
                    style={{ background: `${UI_COLORS.secondary}20` }}
                  >
                    <ArrowLeft className="w-6 h-6" style={{ color: UI_COLORS.textMuted }} />
                  </button>
                  <div>
                    <h1 className="text-4xl font-bold" style={{ color: UI_COLORS.textDark }}>
                      Priority Queue Results
                    </h1>
                    <p className="text-lg mt-2" style={{ color: UI_COLORS.textMuted }}>
                      Theoretical vs Simulation Analysis for M/M/c Priority System
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: results?.validation?.system_stable ? '#d9f2ed' : `${UI_COLORS.alertHint}12`, color: results?.validation?.system_stable ? '#1d7f73' : UI_COLORS.alertHint }}>
                    {results?.validation?.system_stable ? (
                      <>
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        System Stable
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                        System Unstable
                      </>
                    )}
                  </span>
                  <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: results?.parameters?.preemptive ? '#d9f2ed' : `${UI_COLORS.secondary}20`, color: results?.parameters?.preemptive ? '#1d7f73' : UI_COLORS.primary }}>
                    {results?.parameters?.preemptive ? (
                      <>
                        <Zap className="w-4 h-4 inline mr-1" />
                        Preemptive
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 inline mr-1" />
                        Non-Preemptive
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
          {/* System Parameters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: UI_COLORS.border }}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: UI_COLORS.textDark }}>
                <Calculator className="w-6 h-6" style={{ color: UI_COLORS.primary }} />
                System Parameters & Configuration
              </h2>
              
              {/* Stability Warnings */}
              {results?.validation?.stability_warnings?.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    System Stability Warnings
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {results.validation.stability_warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-sm text-blue-600 mb-1">Total Arrival Rate</div>
                  <div className="text-2xl font-bold text-blue-800">
                    {results?.parameters?.total_arrival_rate} <span className="text-sm">patients/hour</span>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-sm text-green-600 mb-1">Service Rate per Doctor</div>
                  <div className="text-2xl font-bold text-green-800">
                    {results?.parameters?.service_rate_per_doctor?.toFixed(1)} <span className="text-sm">patients/hour</span>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-sm text-purple-600 mb-1">Number of Doctors</div>
                  <div className="text-2xl font-bold text-purple-800">
                    {results?.parameters?.num_doctors} <span className="text-sm">servers</span>
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl border-2 ${
                  results?.validation?.system_stable 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className={`text-sm mb-1 ${
                    results?.validation?.system_stable ? 'text-green-600' : 'text-red-600'
                  }`}>
                    System Utilization
                  </div>
                  <div className={`text-2xl font-bold ${
                    results?.validation?.system_stable ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {results?.validation?.utilization_percent}%
                  </div>
                </div>
              </div>

              {/* Capacity Analysis */}
              {results?.validation?.recommendations && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <h3 className="font-bold text-yellow-800 mb-2">Capacity Analysis & Recommendations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-yellow-700">
                        <strong>Current Capacity:</strong> {results.validation.recommendations.current_capacity} patients/hour
                      </div>
                    </div>
                    <div>
                      <div className="text-yellow-700">
                        <strong>Minimum Doctors Needed:</strong> {results.validation.recommendations.min_doctors_needed}
                      </div>
                    </div>
                    <div>
                      <div className="text-yellow-700">
                        <strong>Capacity Gap:</strong> {results.validation.recommendations.capacity_gap.toFixed(1)} patients/hour
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Priority Distribution */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Priority Level Distribution</h3>
                <div className="grid grid-cols-5 gap-3">
                  {results?.parameters?.distributions?.map((dist, index) => (
                    <div key={index} className="text-center p-3 rounded-lg border-2" 
                         style={{ borderColor: TRIAGE_LEVELS[index]?.color, backgroundColor: `${TRIAGE_LEVELS[index]?.color}10` }}>
                      <div className="text-lg mb-1">{TRIAGE_LEVELS[index]?.emoji}</div>
                      <div className="font-bold" style={{ color: TRIAGE_LEVELS[index]?.color }}>
                        {(dist * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">P{index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          </div>

          {/* Theoretical vs Simulation Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: UI_COLORS.border }}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: UI_COLORS.textDark }}>
                <BarChart3 className="w-6 h-6" style={{ color: UI_COLORS.primary }} />
                Theoretical vs Simulation Comparison
              </h2>
              
              {/* Simulation Status Notice */}
              {!results?.simulation?.simulation_run && (
                <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                  <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Simulation Status
                  </h3>
                  <p className="text-sm text-orange-700">
                    Simulation was skipped due to system instability (utilization ≥ 120%). 
                    Only theoretical results are shown. For accurate simulation validation, 
                    reduce arrival rate or increase number of doctors.
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Wait Time Comparison Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Wait Times (Minutes)</h3>
                  {comparisonData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="level" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            typeof value === 'number' ? `${value.toFixed(2)} min` : value, 
                            name === 'theoretical' ? 'Theoretical' : 'Simulation'
                          ]}
                        />
                        <Legend />
                        <Bar dataKey="theoretical" fill="#3b82f6" name="Theoretical" />
                        {results?.simulation?.simulation_run && (
                          <Bar dataKey="simulation" fill="#10b981" name="Simulation" />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-300 flex items-center justify-center text-gray-500">
                      No comparison data available
                    </div>
                  )}
                </div>

                {/* Error Analysis or System Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    {results?.simulation?.simulation_run ? 'Accuracy Analysis' : 'System Analysis'}
                  </h3>
                  {results?.simulation?.simulation_run && comparisonData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="level" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, 'Error']} />
                        <Bar dataKey="error" fill="#f59e0b" name="Error %" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-300 flex items-center justify-center">
                      <div className="text-center p-6">
                        <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                        <div className="text-lg font-semibold text-gray-700 mb-2">System Unstable</div>
                        <div className="text-sm text-gray-600">
                          Utilization: {results?.validation?.utilization_percent}%<br/>
                          Simulation accuracy not reliable<br/>
                          for unstable systems
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
          {/* Detailed Results Tables */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Theoretical Results */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: UI_COLORS.border }}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: UI_COLORS.textDark }}>
                  <Calculator className="w-5 h-5" style={{ color: UI_COLORS.primary }} />
                  Theoretical M/M/c Results
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2">Level</th>
                        <th className="text-right py-2">λᵢ</th>
                        <th className="text-right py-2">ρᵢ</th>
                        <th className="text-right py-2">σᵢ</th>
                        <th className="text-right py-2">Wᵢ (min)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results?.theoretical?.theoretical_results?.map((result, index) => (
                        <tr key={result.level} className="border-b border-gray-100">
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              <span>{TRIAGE_LEVELS[index]?.emoji}</span>
                              <span className="font-medium">P{result.level}</span>
                            </div>
                          </td>
                          <td className="text-right py-2">{result.arrival_rate}</td>
                          <td className="text-right py-2">{result.utilization}</td>
                          <td className="text-right py-2">{result.cumulative_utilization}</td>
                          <td className="text-right py-2 font-semibold" 
                              style={{ color: TRIAGE_LEVELS[index]?.color }}>
                            {typeof result.wait_time_mins === 'number' 
                              ? result.wait_time_mins.toFixed(2) 
                              : result.wait_time_mins}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-700">
                    <strong>Formula:</strong> {results?.parameters?.preemptive 
                      ? 'Wᵢ = E[R] / (1-σᵢ₋₁)' 
                      : 'Wᵢ = E[R] / ((1-σᵢ₋₁)(1-σᵢ))'}
                  </div>
                </div>
              </div>

              {/* Simulation Results */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: UI_COLORS.border }}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: UI_COLORS.textDark }}>
                  <Activity className="w-5 h-5" style={{ color: UI_COLORS.primary }} />
                  Monte Carlo Simulation Results
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2">Level</th>
                        <th className="text-right py-2">Mean (min)</th>
                        <th className="text-right py-2">Std Dev</th>
                        <th className="text-right py-2">95% CI</th>
                        <th className="text-right py-2">Samples</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results?.simulation?.results?.map((result, index) => (
                        <tr key={result.level} className="border-b border-gray-100">
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              <span>{TRIAGE_LEVELS[index]?.emoji}</span>
                              <span className="font-medium">P{result.level}</span>
                            </div>
                          </td>
                          <td className="text-right py-2 font-semibold" 
                              style={{ color: TRIAGE_LEVELS[index]?.color }}>
                            {result.mean_wait_mins.toFixed(2)}
                          </td>
                          <td className="text-right py-2">{result.std_wait_mins.toFixed(2)}</td>
                          <td className="text-right py-2">±{result.confidence_interval.toFixed(2)}</td>
                          <td className="text-right py-2">{result.num_samples}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xs text-green-700">
                    <strong>Simulation:</strong> {results?.simulation?.num_replications} replications, 
                    {results?.simulation?.simulation_time_mins} minutes each
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Confidence Intervals Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: UI_COLORS.border }}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: UI_COLORS.textDark }}>
                <Target className="w-6 h-6" style={{ color: UI_COLORS.primary }} />
                Monte Carlo Confidence Intervals (95%)
              </h2>
              
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={confidenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value.toFixed(2)} min`, 
                      name === 'mean' ? 'Mean Wait Time' : name
                    ]}
                  />
                  <Scatter dataKey="mean" fill="#8884d8">
                    <ErrorBar dataKey="upper" width={4} stroke="#8884d8" />
                    <ErrorBar dataKey="lower" width={4} stroke="#8884d8" />
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              
              <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-sm text-orange-700">
                  <strong>Accuracy Note:</strong> {results?.validation?.accuracy_note}
                </div>
              </div>
            </div>
          </motion.div>
          {/* Performance Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: UI_COLORS.border }}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: UI_COLORS.textDark }}>
                <Award className="w-6 h-6 text-gold-600" />
                Performance Summary & Insights
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* System Performance */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    System Performance
                  </h3>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div>• Utilization: {(results?.validation?.system_utilization * 100).toFixed(1)}%</div>
                    <div>• System Status: {results?.validation?.system_stable ? 'Stable' : 'Unstable'}</div>
                    <div>• Queue Discipline: {results?.parameters?.preemptive ? 'Preemptive' : 'Non-Preemptive'}</div>
                    <div>• Total Capacity: {results?.parameters?.num_doctors} doctors</div>
                  </div>
                </div>

                {/* Critical Insights */}
                <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Critical Insights
                  </h3>
                  <div className="space-y-2 text-sm text-red-700">
                    {results?.comparison?.map((comp, index) => {
                      if (index === 0) { // P1 - Critical patients
                        return (
                          <div key={index}>
                            • P1 Wait: {typeof comp.simulation_wait === 'number' ? comp.simulation_wait.toFixed(1) : 'N/A'} min
                          </div>
                        );
                      }
                      return null;
                    })}
                    <div>• Preemption Impact: {results?.parameters?.preemptive ? 'Reduces P1-P2 waits' : 'No interruptions'}</div>
                    <div>• Bottleneck: {results?.validation?.system_utilization > 0.8 ? 'High utilization' : 'Manageable load'}</div>
                  </div>
                </div>

                {/* Simulation Quality */}
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Simulation Quality & Accuracy
                  </h3>
                  <div className="space-y-2 text-sm text-green-700">
                    <div>• Replications: {results?.simulation?.quality_metrics?.replications_used || results?.simulation?.num_replications}</div>
                    <div>• Simulation Time: {results?.simulation?.quality_metrics?.simulation_hours?.toFixed(1) || (results?.simulation?.simulation_time_mins / 60)?.toFixed(1)} hours</div>
                    <div>• Warm-up Period: {results?.simulation?.quality_metrics?.warmup_hours || 8} hours</div>
                    <div>• Runtime: {results?.simulation?.execution_time_seconds}s</div>
                    <div>• Avg Error: {
                      results?.comparison?.reduce((sum, comp) => {
                        return sum + (typeof comp.error_percent === 'number' ? comp.error_percent : 0);
                      }, 0) / (results?.comparison?.length || 1)
                    }%</div>
                    <div className={`font-semibold ${
                      (results?.comparison?.reduce((sum, comp) => {
                        return sum + (typeof comp.error_percent === 'number' ? comp.error_percent : 0);
                      }, 0) / (results?.comparison?.length || 1)) < 5 
                        ? 'text-green-800' 
                        : 'text-orange-800'
                    }`}>
                      • Target: &lt;5% for CEP validation {
                        (results?.comparison?.reduce((sum, comp) => {
                          return sum + (typeof comp.error_percent === 'number' ? comp.error_percent : 0);
                        }, 0) / (results?.comparison?.length || 1)) < 5 ? '✅' : '⚠️'
                      }
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
            className="mb-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: UI_COLORS.border }}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={goBack}
                  className="px-8 py-4 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                  style={{ background: `linear-gradient(135deg, ${UI_COLORS.primary}, ${UI_COLORS.secondary})` }}
                >
                  <div className="flex items-center gap-3">
                    <ArrowLeft className="w-6 h-6" />
                    Run New Simulation
                  </div>
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="px-8 py-4 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                  style={{ background: `linear-gradient(135deg, ${UI_COLORS.primary}, ${UI_COLORS.secondary})` }}
                >
                  <div className="flex items-center gap-3">
                    <Timer className="w-6 h-6" />
                    Export Results
                  </div>
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}