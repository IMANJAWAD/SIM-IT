import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

const COLORS = {
  primary: '#C1121F',
  secondary: '#AE1F23',
  accent: '#669BBC',
  textDark: '#1a365d',
};

export default function ControlPanel({ params, setParams, onRunSimulation, isLoading }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSliderChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const sliders = [
    { key: 'arrival_rate', label: 'Arrival Rate (λ)', min: 1, max: 20, step: 0.5, unit: '/hr' },
    { key: 'num_doctors', label: 'Doctors', min: 1, max: 10, step: 1, unit: '' },
    { key: 'num_nurses', label: 'Nurses', min: 1, max: 15, step: 1, unit: '' },
    { key: 'num_xray_machines', label: 'X-Ray Machines', min: 1, max: 5, step: 1, unit: '' },
    { key: 'diagnostic_probability', label: 'Diagnostic Prob.', min: 0, max: 1, step: 0.05, unit: '' },
    { key: 'critical_patient_percentage', label: 'Critical %', min: 0, max: 0.5, step: 0.05, unit: '' },
    { key: 'simulation_duration', label: 'Duration', min: 120, max: 1440, step: 60, unit: 'min' },
    { key: 'num_replications', label: 'Replications', min: 50, max: 1000, step: 50, unit: '' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-white to-gray-50 border-b border-gray-100 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
          >
            <Sliders className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold" style={{ color: COLORS.textDark }}>Parameters</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Sliders */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {sliders.map(({ key, label, min, max, step, unit }) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="font-medium" style={{ color: COLORS.textDark }}>{label}</label>
                <span 
                  className="font-bold tabular-nums px-2 py-0.5 rounded-md"
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
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#C1121F]"
                style={{ background: `linear-gradient(to right, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }}
              />
            </div>
          ))}
        </div>

        {/* Run Button */}
        <div className="p-5 pt-3 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 8px 20px -5px rgba(0, 119, 182, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onRunSimulation}
            disabled={isLoading}
            className="w-full py-3 text-white text-sm rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Simulation
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
