import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Zap, RefreshCw, Clock, Users, Gauge, AlertTriangle,
  TrendingUp, BarChart3, GitBranch, ArrowRight, Sliders, RotateCcw,
  Stethoscope, Shield, ChevronRight
} from 'lucide-react';

import MarkovVisualization from '../components/MarkovVisualization';
import { LOSDistributionChart, QueueLengthChart, ResourceUtilizationChart } from '../components/Charts';
import ComparisonSection from '../components/ComparisonSection';
import ExportButtons from '../components/ExportButtons';
import StabilityIntelligencePanel from '../components/StabilityIntelligencePanel';
import OverloadWarningModal from '../components/OverloadWarningModal';
import { simulationApi, markovApi, analysisApi } from '../utils/api';
import logoSp from '../assets/logo-sp.png';

const SERVICE_RATE = 3.0;

const COLORS = {
  primary: '#003049',
  primaryDark: '#003049',
  secondary: '#669BBC',
  accent: '#669BBC',
  alertHint: '#780000',
  accentDark: '#003049',
  bgLight: '#edf4fa',
  white: '#ffffff',
  textDark: '#003049',
  textMuted: '#4f7791',
  textLight: '#669BBC',
  border: '#c7dceb',
};

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

const EKGLoader = () => (
  <div className="flex items-center gap-3">
    <svg width="60" height="20" viewBox="0 0 60 20" className="overflow-visible">
      <path d="M0,10 L10,10 L12,3 L18,17 L22,10 L30,10 L34,5 L38,15 L44,10 L60,10" 
            stroke={COLORS.primary} fill="none" strokeWidth="2" className="ekg-line"/>
    </svg>
    <span className="text-sm font-medium" style={{ color: COLORS.primary }}>Running simulation...</span>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
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
  const [longTermData, setLongTermData] = useState(null);
  const [sensitivityData, setSensitivityData] = useState(null);
  const [error, setError] = useState(null);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

  const showResults = simulationData && !isLoading;

  const rho = useMemo(() => {
    if (SERVICE_RATE <= 0 || params.num_doctors <= 0) return 0;
    return params.arrival_rate / (SERVICE_RATE * params.num_doctors);
  }, [params.arrival_rate, params.num_doctors]);

  const lambdaMax = useMemo(() => SERVICE_RATE * params.num_doctors, [params.num_doctors]);
  const isOverloaded = params.arrival_rate > lambdaMax;

  const handleSliderChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const resetSimulation = () => {
    setSimulationData(null);
    setMarkovData(null);
    setLongTermData(null);
    setSensitivityData(null);
    setError(null);
  };

  const handleRunClick = () => {
    if (rho >= 1) {
      setIsWarningModalOpen(true);
    } else {
      runSimulation();
    }
  };

  const handleModalConfirm = () => {
    setIsWarningModalOpen(false);
    runSimulation();
  };

  const goToSensitivityAnalysis = () => {
    navigate('/sensitivity-analysis', { state: { sensitivityData, params } });
  };

  const runSimulation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [simResult, markovResult, longTermResult] = await Promise.all([
        simulationApi.runSimulation(params),
        markovApi.analyze({
          arrival_rate: params.arrival_rate,
          service_rate: SERVICE_RATE,
          num_servers: params.num_doctors,
          max_system_capacity: 20,
        }),
        analysisApi.getLongTermBehavior(params.arrival_rate, SERVICE_RATE, params.num_doctors),
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
    <main className="min-h-screen pt-20" style={{ background: COLORS.bgLight }}>
      <AnimatePresence mode="wait">
        {!showResults && (
          <motion.section
            key="form-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-6"
            aria-label="Simulation Configuration"
          >
            <div className="w-full max-w-7xl mx-auto">
              <header className="text-center mb-8 lg:hidden">
                <img 
                  src={logoSp} 
                  alt="PulseFlow Logo" 
                  className="w-16 h-16 mx-auto mb-4 rounded-xl shadow-lg object-contain bg-white p-2" 
                />
                <h1 className="text-2xl font-bold" style={{ color: COLORS.textDark }}>PulseFlow ER</h1>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <section className="lg:col-span-7" aria-label="Configuration Panel">
                  <motion.article
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg border overflow-hidden"
                    style={{ borderColor: COLORS.border }}
                  >
                    <header className="px-6 py-5 border-b" style={{ borderColor: COLORS.border }}>
                      <h2 className="text-lg font-semibold" style={{ color: COLORS.textDark }}>Configure Simulation</h2>
                      <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>Adjust parameters to run Monte Carlo analysis</p>
                    </header>

                    <div className="p-6 space-y-5 max-h-[55vh] overflow-y-auto custom-scroll">
                      {SLIDERS.map(({ key, label, min, max, step, unit }, index) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label htmlFor={`slider-${key}`} className="font-medium text-sm" style={{ color: COLORS.textDark }}>
                              {label}
                            </label>
                            <span className="font-mono text-sm tabular-nums" style={{ color: COLORS.primary }}>
                              {params[key]}{unit}
                            </span>
                          </div>
                          <input
                            id={`slider-${key}`}
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={params[key]}
                            onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                            style={{ background: `linear-gradient(to right, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }}
                            aria-label={`Adjust ${label}`}
                          />
                          {key === 'arrival_rate' && (
                            <AnimatePresence>
                              {isOverloaded ? (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs pt-1" style={{ color: COLORS.alertHint }}>
                                  ⚠️ Warning: Configuration may lead to system overload
                                </motion.p>
                              ) : (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs pt-1" style={{ color: COLORS.textMuted }}>
                                  Max stable rate: {lambdaMax.toFixed(1)} patients/hour
                                </motion.p>
                              )}
                            </AnimatePresence>
                          )}
                        </div>
                      ))}
                    </div>

                    {error && (
                      <aside className="mx-6 mb-3 p-3 rounded-lg" style={{ background: `${COLORS.alertHint}12`, border: `1px solid ${COLORS.alertHint}33` }} role="alert">
                        <p className="text-sm" style={{ color: COLORS.alertHint }}>{error}</p>
                      </aside>
                    )}

                    <footer className="p-6 pt-3 border-t" style={{ borderColor: COLORS.border }}>
                      <button
                        onClick={handleRunClick}
                        disabled={isLoading}
                        className="w-full py-3 text-white text-base rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                        style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
                        aria-label="Run Simulation"
                      >
                        {isLoading ? <EKGLoader /> : <>Run Simulation <ArrowRight className="w-4 h-4" aria-hidden="true" /></>}
                      </button>
                    </footer>
                  </motion.article>
                </section>

                <aside className="lg:col-span-5" aria-label="Stability Intelligence">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <StabilityIntelligencePanel
                      arrivalRate={params.arrival_rate}
                      serviceRate={SERVICE_RATE}
                      numDoctors={params.num_doctors}
                    />
                  </motion.div>
                </aside>
              </div>
            </div>
          </motion.section>
        )}

        {showResults && (
          <motion.main
            key="results-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="pb-8 px-6 lg:px-8"
          >
            <div className="max-w-7xl mx-auto">
              
              <header className="mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: COLORS.border }}>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium px-2 py-0.5 rounded inline-block mb-2" style={{ background: `${COLORS.alertHint}14`, color: COLORS.alertHint }}>
                        SIMULATION COMPLETE
                      </p>
                      <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: COLORS.textDark }}>Simulation Results</h1>
                      <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                        {params.num_replications} replications | λ = {params.arrival_rate}/hr | {params.num_doctors} doctors
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={resetSimulation}
                        className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:bg-gray-50"
                        style={{ border: `1px solid ${COLORS.border}`, color: COLORS.textDark }}
                        aria-label="Start new simulation"
                      >
                        <RotateCcw className="w-4 h-4" aria-hidden="true" />
                        New Simulation
                      </button>
                      <ExportButtons simulationData={simulationData} />
                    </div>
                  </div>
                </div>
              </header>

              <section className="mb-8" aria-label="Key Performance Indicators">
                <header className="mb-6">
                  <h2 className="text-xl font-semibold tracking-tight" style={{ color: COLORS.textDark }}>Key Performance Indicators</h2>
                  <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>Core metrics from the simulation</p>
                  <div className="w-12 h-0.5 mt-3 rounded-full" style={{ background: COLORS.accent }} />
                </header>
                <ul className="grid grid-cols-2 lg:grid-cols-5 gap-4" style={{ listStyle: 'none' }}>
                  <li className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: COLORS.border }}>
                    <p className="text-sm font-medium mb-2" style={{ color: COLORS.textMuted }}>Avg Wait Time</p>
                    <p className="text-2xl font-bold" style={{ color: COLORS.textDark }}>{simulationData?.metrics?.avg_waiting_time?.toFixed(2) || '—'}</p>
                    <p className="text-xs mt-1" style={{ color: COLORS.textLight }}>minutes</p>
                  </li>
                  <li className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: COLORS.border }}>
                    <p className="text-sm font-medium mb-2" style={{ color: COLORS.textMuted }}>Avg Length of Stay</p>
                    <p className="text-2xl font-bold" style={{ color: COLORS.textDark }}>{simulationData?.metrics?.avg_los?.toFixed(2) || '—'}</p>
                    <p className="text-xs mt-1" style={{ color: COLORS.textLight }}>minutes</p>
                  </li>
                  <li className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: COLORS.border }}>
                    <p className="text-sm font-medium mb-2" style={{ color: COLORS.textMuted }}>Throughput</p>
                    <p className="text-2xl font-bold" style={{ color: COLORS.textDark }}>{simulationData?.metrics?.throughput?.toFixed(2) || '—'}</p>
                    <p className="text-xs mt-1" style={{ color: COLORS.textLight }}>patients/hour</p>
                  </li>
                  <li className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: COLORS.border }}>
                    <p className="text-sm font-medium mb-2" style={{ color: COLORS.textMuted }}>Doctor Utilization</p>
                    <p className="text-2xl font-bold" style={{ color: COLORS.textDark }}>{simulationData?.metrics?.resource_utilization?.doctors?.toFixed(2) || '—'}</p>
                    <p className="text-xs mt-1" style={{ color: COLORS.textLight }}>percentage</p>
                  </li>
                  <li className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: COLORS.border }}>
                    <p className="text-sm font-medium mb-2" style={{ color: COLORS.textMuted }}>Overload Probability</p>
                    <p className="text-2xl font-bold" style={{ color: COLORS.textDark }}>{simulationData?.metrics?.steady_state_overload_probability?.toFixed(2) || '—'}</p>
                    <p className="text-xs mt-1" style={{ color: COLORS.textLight }}>steady-state</p>
                  </li>
                </ul>
              </section>

              <section className="mb-8" aria-label="Markov Chain Analysis">
                <header className="mb-6">
                  <h2 className="text-xl font-semibold tracking-tight" style={{ color: COLORS.textDark }}>Markov Chain Analysis</h2>
                  <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>State transitions and steady-state probabilities</p>
                  <div className="w-12 h-0.5 mt-3 rounded-full" style={{ background: COLORS.accent }} />
                </header>
                <article className="bg-white rounded-xl p-6 shadow-sm border" style={{ borderColor: COLORS.border }}>
                  <MarkovVisualization data={markovData} />
                </article>
              </section>

              <section className="mb-8" aria-label="Distribution Analysis">
                <header className="mb-6">
                  <h2 className="text-xl font-semibold tracking-tight" style={{ color: COLORS.textDark }}>Distribution Analysis</h2>
                  <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>Length of stay and queue dynamics</p>
                  <div className="w-12 h-0.5 mt-3 rounded-full" style={{ background: COLORS.accent }} />
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <figure className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: COLORS.border }}>
                    <figcaption className="text-sm font-medium mb-4" style={{ color: COLORS.textMuted }}>Length of Stay Distribution</figcaption>
                    <LOSDistributionChart data={simulationData?.distributions?.los_values} />
                  </figure>
                  <figure className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: COLORS.border }}>
                    <figcaption className="text-sm font-medium mb-4" style={{ color: COLORS.textMuted }}>Queue Length Over Time</figcaption>
                    <QueueLengthChart data={simulationData?.distributions?.queue_length_over_time} />
                  </figure>
                </div>
              </section>

              <section className="mb-8" aria-label="Resource Utilization">
                <header className="mb-6">
                  <h2 className="text-xl font-semibold tracking-tight" style={{ color: COLORS.textDark }}>Resource Utilization</h2>
                  <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>Staff and equipment usage patterns</p>
                  <div className="w-12 h-0.5 mt-3 rounded-full" style={{ background: COLORS.accent }} />
                </header>
                <figure className="bg-white rounded-xl p-6 shadow-sm border" style={{ borderColor: COLORS.border }}>
                  <ResourceUtilizationChart data={simulationData?.metrics?.resource_utilization} />
                </figure>
              </section>

              <section className="mb-8" aria-label="Theoretical Comparison">
                <header className="mb-6">
                  <h2 className="text-xl font-semibold tracking-tight" style={{ color: COLORS.textDark }}>Theoretical Comparison</h2>
                  <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>Simulated vs theoretical values</p>
                  <div className="w-12 h-0.5 mt-3 rounded-full" style={{ background: COLORS.accent }} />
                </header>
                <article className="bg-white rounded-xl p-6 shadow-sm border" style={{ borderColor: COLORS.border }}>
                  <ComparisonSection
                    theoreticalData={markovData?.theoretical_mmc}
                    simulatedData={simulationData?.metrics}
                    longTermData={longTermData}
                  />
                </article>
              </section>

              {sensitivityData && (
                <nav aria-label="Advanced Analysis Navigation">
                  <button
                    onClick={goToSensitivityAnalysis}
                    className="w-full py-4 rounded-xl flex items-center justify-between group transition-all hover:shadow-md"
                    style={{ background: COLORS.white, border: `1px solid ${COLORS.border}` }}
                  >
                    <span className="px-6">
                      <span className="text-sm font-medium block" style={{ color: COLORS.textMuted }}>Advanced Analysis</span>
                      <span className="text-base font-semibold block" style={{ color: COLORS.textDark }}>View Sensitivity & Optimization Results</span>
                    </span>
                    <span className="px-6">
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: COLORS.primary }} aria-hidden="true" />
                    </span>
                  </button>
                </nav>
              )}
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      <OverloadWarningModal isOpen={isWarningModalOpen} onClose={() => setIsWarningModalOpen(false)} onConfirm={handleModalConfirm} rho={rho} />
      
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #669BBC; border-radius: 10px; }
        @keyframes ekg-line { 0% { stroke-dashoffset: 200; } 100% { stroke-dashoffset: 0; } }
        .ekg-line { stroke-dasharray: 200; stroke-dashoffset: 200; animation: ekg-line 1.5s linear infinite; }
      `}</style>
    </main>
  );
};

export default Dashboard;