import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Zap, RefreshCw, Clock, Users, Gauge, AlertTriangle,
  TrendingUp, BarChart3, GitBranch, Layers, ArrowRight, Sliders, RotateCcw
} from 'lucide-react';

import MarkovVisualization from '../components/MarkovVisualization';
import { LOSDistributionChart, QueueLengthChart, ResourceUtilizationChart, SensitivityChart, HeatmapChart } from '../components/Charts';
import ComparisonSection from '../components/ComparisonSection';
import ExportButtons from '../components/ExportButtons';
import VisualsSection from '../components/VisualsSection';
import { simulationApi, markovApi, analysisApi } from '../utils/api';
import logoSp from '../assets/logo-sp.png';

// Consistent color palette
const COLORS = {
  bgLight: '#caf0f8',
  primary: '#0077b6',
  secondary: '#00b4d8',
  accent: '#f0f3bd',
  white: '#ffffff',
  textDark: '#1a365d',
  textMuted: '#4a5568',
};

// Slider configuration
const SLIDERS = [
  { key: 'arrival_rate', label: 'Arrival Rate (λ)', min: 1, max: 20, step: 0.5, unit: '/hr' },
  { key: 'num_doctors', label: 'Doctors', min: 1, max: 10, step: 1, unit: '' },
  { key: 'num_nurses', label: 'Nurses', min: 1, max: 15, step: 1, unit: '' },
  { key: 'num_xray_machines', label: 'X-Ray Machines', min: 1, max: 5, step: 1, unit: '' },
  { key: 'diagnostic_probability', label: 'Diagnostic Prob.', min: 0, max: 1, step: 0.05, unit: '' },
  { key: 'critical_patient_percentage', label: 'Critical %', min: 0, max: 0.5, step: 0.05, unit: '' },
  { key: 'simulation_duration', label: 'Duration', min: 120, max: 1440, step: 60, unit: 'min' },
  { key: 'num_replications', label: 'Replications', min: 50, max: 1000, step: 50, unit: '' },
];

// Section header component for consistency
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-6">
    <div 
      className="p-2.5 rounded-xl"
      style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
    >
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <h2 className="text-xl font-bold" style={{ color: COLORS.textDark }}>{title}</h2>
      {subtitle && <p className="text-sm" style={{ color: COLORS.textMuted }}>{subtitle}</p>}
    </div>
  </div>
);

// Custom stat card with consistent styling
const StatCardCustom = ({ icon: Icon, title, value, subtitle, delay = 0, accentColor = COLORS.primary }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0, 119, 182, 0.25)' }}
    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden"
  >
    <div 
      className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
      style={{ background: `linear-gradient(90deg, ${accentColor}, ${COLORS.secondary})` }}
    />
    <div className="flex items-start gap-4">
      <div 
        className="p-3 rounded-xl flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}40)` }}
      >
        <Icon className="w-5 h-5" style={{ color: accentColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium mb-1" style={{ color: COLORS.textMuted }}>{title}</p>
        <p className="text-2xl font-bold" style={{ color: COLORS.textDark }}>
          {typeof value === 'number' ? value.toFixed(2) : value || '—'}
        </p>
        {subtitle && (
          <p className="text-xs font-medium mt-1" style={{ color: COLORS.secondary }}>{subtitle}</p>
        )}
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [params, setParams] = useState({
    arrival_rate: 8.0,
    num_doctors: 3,
    num_nurses: 5,
    num_xray_machines: 2,
    diagnostic_probability: 0.4,
    critical_patient_percentage: 0.15,
    simulation_duration: 480,
    num_replications: 100,
    warm_up_period: 60,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [markovData, setMarkovData] = useState(null);
  const [sensitivityData, setSensitivityData] = useState(null);
  const [longTermData, setLongTermData] = useState(null);
  const [error, setError] = useState(null);

  // Check if we should show results or form
  const showResults = simulationData && !isLoading;

  const handleSliderChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const resetSimulation = () => {
    setSimulationData(null);
    setMarkovData(null);
    setSensitivityData(null);
    setLongTermData(null);
    setError(null);
  };

  const runSimulation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [simResult, markovResult, longTermResult] = await Promise.all([
        simulationApi.runSimulation(params),
        markovApi.analyze({
          arrival_rate: params.arrival_rate,
          service_rate: 3.0,
          num_servers: params.num_doctors,
          max_system_capacity: 20,
        }),
        analysisApi.getLongTermBehavior(params.arrival_rate, 3.0, params.num_doctors),
      ]);

      setSimulationData(simResult);
      setMarkovData(markovResult);
      setLongTermData(longTermResult);

      const sensitivityResult = await analysisApi.runSensitivity({
        base_arrival_rate: params.arrival_rate,
        arrival_rate_range: [4, 6, 8, 10, 12],
        doctor_range: [2, 3, 4, 5],
        num_replications: 30,
      });
      setSensitivityData(sensitivityResult);

    } catch (err) {
      console.error('Simulation error:', err);
      setError(err.message || 'Failed to run simulation. Make sure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16" style={{ background: `linear-gradient(180deg, ${COLORS.bgLight} 0%, #e0f7fa 100%)` }}>
      <AnimatePresence mode="wait">
        {/* PARAMETERS FORM VIEW - Split Layout */}
        {!showResults && (
          <motion.div
            key="form-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="min-h-[calc(100vh-4rem)] flex"
          >
            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 min-h-[calc(100vh-4rem)] relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }}>
              {/* Decorative circles */}
              <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10 bg-white" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-10 bg-white" />
              <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full opacity-5 bg-white" />

              {/* Hero Content */}
              <div className="relative z-10 flex flex-col justify-center items-start px-12 xl:px-16 py-12">
                {/* Logo */}
                <motion.img
                  src={logoSp}
                  alt="SIM-IT Logo"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="w-24 h-24 mb-6 rounded-2xl shadow-2xl object-contain bg-white p-2"
                />
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight"
                >
                  SIM-IT
                </motion.h1>
                
                <motion.div 
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.3 }}
                  className="w-20 h-1.5 bg-white/50 rounded-full mb-6 origin-left" 
                />
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-white/90 leading-relaxed mb-8 max-w-md"
                >
                  Advanced Monte Carlo simulation for emergency department optimization
                </motion.p>

                {/* Feature Tags */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-3 mb-12"
                >
                  {['Markov Chains', 'Queueing Theory', 'Monte Carlo'].map((tag, i) => (
                    <span
                      key={tag}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white border border-white/30 backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </motion.div>

                {/* Bottom Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-12"
                >
                  {[
                    { label: 'Replications', value: '100+' },
                    { label: 'Parameters', value: '8' },
                    { label: 'Accuracy', value: '99%' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-left">
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                      <p className="text-sm text-white/70">{stat.label}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-8 lg:px-12">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-full max-w-md"
              >
                {/* Mobile Logo (hidden on desktop) */}
                <div className="lg:hidden text-center mb-8">
                  <img 
                    src={logoSp}
                    alt="SIM-IT Logo"
                    className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-xl object-contain bg-white p-2"
                  />
                  <h1 className="text-3xl font-bold" style={{ color: COLORS.textDark }}>SIM-IT</h1>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                  {/* Form Header */}
                  <div 
                    className="px-6 py-4 border-b border-gray-100"
                    style={{ background: `linear-gradient(135deg, ${COLORS.primary}08, ${COLORS.secondary}08)` }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
                      >
                        <Sliders className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold" style={{ color: COLORS.textDark }}>Configure Simulation</h2>
                        <p className="text-xs" style={{ color: COLORS.textMuted }}>Adjust parameters below</p>
                      </div>
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="p-5 space-y-3 max-h-[50vh] overflow-y-auto">
                    {SLIDERS.map(({ key, label, min, max, step, unit }, index) => (
                      <motion.div 
                        key={key} 
                        className="space-y-1.5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                      >
                        <div className="flex justify-between text-sm">
                          <label className="font-medium text-sm" style={{ color: COLORS.textDark }}>{label}</label>
                          <span 
                            className="font-bold tabular-nums px-2 py-0.5 rounded-md text-xs"
                            style={{ background: COLORS.accent, color: COLORS.primary }}
                          >
                            {params[key]}{unit}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step={step}
                          value={params[key]}
                          onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
                          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#0077b6]"
                          style={{ background: `linear-gradient(to right, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mx-5 mb-3 p-3 bg-red-50 border border-red-200 rounded-xl"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <span className="text-red-700 text-sm font-medium">{error}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Run Button */}
                  <div className="p-5 pt-3 border-t border-gray-100">
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 12px 30px -5px rgba(0, 119, 182, 0.4)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={runSimulation}
                      disabled={isLoading}
                      className="w-full py-3.5 text-white text-base rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60"
                      style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          Run Simulation
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* RESULTS VIEW - Full Dashboard */}
        {showResults && (
          <motion.div
            key="results-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="py-8 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                
                {/* Results Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 relative overflow-hidden">
                    <div 
                      className="absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full blur-3xl"
                      style={{ background: `radial-gradient(circle, ${COLORS.secondary}, transparent)` }}
                    />
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
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
                            Simulation Complete
                          </span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: COLORS.textDark }}>
                          SIM-IT Results
                        </h1>
                        <p style={{ color: COLORS.textMuted }} className="text-lg max-w-xl">
                          {params.num_replications} replications completed with λ={params.arrival_rate}/hr and {params.num_doctors} doctors
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <motion.button
                          onClick={resetSimulation}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2 border-2 transition-all"
                          style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                        >
                          <RotateCcw className="w-5 h-5" />
                          New Simulation
                        </motion.button>
                        <ExportButtons simulationData={simulationData} />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* KPI Stats */}
                <section className="mb-8">
                  <SectionHeader icon={TrendingUp} title="Key Performance Indicators" subtitle="Real-time simulation metrics" />
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCardCustom
                      icon={Clock}
                      title="Avg Wait Time"
                      value={simulationData?.metrics?.avg_waiting_time}
                      subtitle="minutes"
                      delay={0.1}
                      accentColor={COLORS.primary}
                    />
                    <StatCardCustom
                      icon={Activity}
                      title="Avg LOS"
                      value={simulationData?.metrics?.avg_los}
                      subtitle="minutes"
                      delay={0.15}
                      accentColor={COLORS.secondary}
                    />
                    <StatCardCustom
                      icon={Users}
                      title="Throughput"
                      value={simulationData?.metrics?.throughput}
                      subtitle="patients/hr"
                      delay={0.2}
                      accentColor={COLORS.primary}
                    />
                    <StatCardCustom
                      icon={Gauge}
                      title="Utilization"
                      value={simulationData?.metrics?.resource_utilization?.doctors}
                      subtitle="doctors %"
                      delay={0.25}
                      accentColor={COLORS.secondary}
                    />
                    <StatCardCustom
                      icon={AlertTriangle}
                      title="Overload Prob"
                      value={simulationData?.metrics?.steady_state_overload_probability}
                      subtitle="steady-state"
                      delay={0.3}
                      accentColor="#e53e3e"
                    />
                  </div>
                </section>

                {/* Markov Chain */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <SectionHeader icon={GitBranch} title="Markov Chain Analysis" subtitle="State transitions and steady-state probabilities" />
                  <MarkovVisualization data={markovData} />
                </motion.section>

                {/* Distribution Charts */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8"
                >
                  <SectionHeader icon={BarChart3} title="Distribution Analysis" subtitle="Length of stay and queue dynamics" />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <LOSDistributionChart data={simulationData?.distributions?.los_values} />
                    <QueueLengthChart data={simulationData?.distributions?.queue_length_over_time} />
                  </div>
                </motion.section>

                {/* Resource & Sensitivity */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8"
                >
                  <SectionHeader icon={Layers} title="Resource & Sensitivity Analysis" subtitle="Utilization patterns and parameter impacts" />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ResourceUtilizationChart data={simulationData?.metrics?.resource_utilization} />
                    <SensitivityChart data={sensitivityData?.arrival_rate_sensitivity} type="arrival_rate" />
                  </div>
                </motion.section>

                {/* Heatmap */}
                {sensitivityData?.heatmap && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8"
                  >
                    <HeatmapChart
                      data={sensitivityData.heatmap.data}
                      xLabels={sensitivityData.heatmap.x_labels}
                      yLabels={sensitivityData.heatmap.y_labels}
                    />
                  </motion.section>
                )}

                {/* Comparison Section */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <ComparisonSection
                    theoreticalData={markovData?.theoretical_mmc}
                    simulatedData={simulationData?.metrics}
                    longTermData={longTermData}
                  />
                </motion.section>
              </div>
            </div>
            
            {/* Visuals Section - Full Width */}
            <div className="pb-12" style={{ background: `linear-gradient(180deg, #e0f7fa 0%, ${COLORS.bgLight} 100%)`, paddingLeft: '3cm', paddingRight: '3cm' }}>
              <VisualsSection 
                simulationData={simulationData}
                sensitivityData={sensitivityData}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
