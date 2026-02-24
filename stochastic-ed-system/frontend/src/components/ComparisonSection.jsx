import { motion } from 'framer-motion';
import { Scale, CheckCircle, XCircle, TrendingUp, AlertTriangle } from 'lucide-react';

// STRICT COLORS ONLY: #caf0f8, #0077b6, #00b4d8, #f0f3bd
const COLORS = {
  primary: '#0077b6',
  secondary: '#00b4d8',
  accent: '#f0f3bd',
  light: '#caf0f8',
  textDark: '#1a365d',
};

export default function ComparisonSection({ theoreticalData, simulatedData, longTermData }) {
  if (!theoreticalData && !longTermData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
          <div 
            className="p-2 rounded-xl"
            style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
          >
            <Scale className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-base font-semibold" style={{ color: COLORS.textDark }}>Theoretical vs Simulation Comparison</h2>
        </div>
        <p className="text-gray-400 text-center py-12 font-medium">Run simulation to compare results</p>
      </motion.div>
    );
  }

  const comparisonItems = [
    {
      label: 'Expected Waiting Time',
      theoretical: theoreticalData?.expected_waiting_time,
      simulated: simulatedData?.expected_waiting_time || simulatedData?.avg_waiting_time,
      unit: 'min',
      icon: TrendingUp,
    },
    {
      label: 'Utilization',
      theoretical: theoreticalData?.utilization,
      simulated: simulatedData?.utilization || simulatedData?.doctor_utilization,
      unit: '%',
      icon: Scale,
    },
    {
      label: 'Probability of Delay',
      theoretical: theoreticalData?.probability_of_delay,
      simulated: longTermData?.steady_state_probabilities?.waiting_required,
      unit: '%',
      icon: AlertTriangle,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div 
          className="p-2 rounded-xl"
          style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
        >
          <Scale className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-base font-semibold" style={{ color: COLORS.textDark }}>Theoretical vs Simulation Comparison</h2>
      </div>

      <div className="p-5">
        {/* Stability Status */}
        {longTermData?.stability_analysis && (
          <div 
            className="p-4 rounded-xl mb-6 border"
            style={{ 
              backgroundColor: longTermData.stability_analysis.is_stable ? '#f0fdf4' : '#fef2f2',
              borderColor: longTermData.stability_analysis.is_stable ? '#bbf7d0' : '#fecaca'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              {longTermData.stability_analysis.is_stable ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            <span 
              className="font-semibold"
              style={{ color: longTermData.stability_analysis.is_stable ? COLORS.primary : '#dc2626' }}
            >
              System is {longTermData.stability_analysis.is_stable ? 'STABLE' : 'UNSTABLE'}
            </span>
          </div>
          <p className="text-sm text-gray-600 font-mono">
            {longTermData.stability_analysis.stability_formula}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {longTermData.stability_analysis.interpretation}
          </p>
        </div>
      )}

      {/* Comparison Table */}
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-500 pb-2 border-b border-gray-200">
          <div>Metric</div>
          <div className="text-center">Theoretical (Markov)</div>
          <div className="text-center">Simulated (Monte Carlo)</div>
          <div className="text-center">Difference</div>
        </div>

        {comparisonItems.map((item, index) => {
          const theo = item.theoretical ?? '--';
          const sim = item.simulated ?? '--';
          const diff = (item.theoretical != null && item.simulated != null) 
            ? Math.abs(item.theoretical - item.simulated).toFixed(2)
            : '--';
          const diffPct = (item.theoretical != null && item.simulated != null && item.theoretical !== 0)
            ? ((Math.abs(item.theoretical - item.simulated) / item.theoretical) * 100).toFixed(1)
            : '--';

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="grid grid-cols-4 gap-4 items-center py-3 rounded-lg px-4"
              style={{ backgroundColor: COLORS.light }}
            >
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <item.icon className="w-4 h-4" style={{ color: COLORS.secondary }} />
                {item.label}
              </div>
              <div className="text-center font-semibold" style={{ color: COLORS.primary }}>
                {typeof theo === 'number' ? theo.toFixed(2) : theo} {item.unit}
              </div>
              <div className="text-center font-semibold" style={{ color: COLORS.secondary }}>
                {typeof sim === 'number' ? sim.toFixed(2) : sim} {item.unit}
              </div>
              <div className="text-center">
                {diffPct !== '--' && (
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: parseFloat(diffPct) < 10 ? COLORS.light : COLORS.accent,
                      color: COLORS.primary
                    }}
                  >
                    {diffPct}%
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Long-term Probabilities */}
      {longTermData?.steady_state_probabilities && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold mb-4" style={{ color: COLORS.textDark }}>Long-Term Steady-State Probabilities</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-gray-100" style={{ backgroundColor: COLORS.light }}>
              <p className="text-xs text-gray-500 mb-1">Empty System</p>
              <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                {longTermData.steady_state_probabilities.empty_system}%
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-100" style={{ backgroundColor: COLORS.light }}>
              <p className="text-xs text-gray-500 mb-1">Waiting Required</p>
              <p className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                {longTermData.steady_state_probabilities.waiting_required}%
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-100" style={{ backgroundColor: COLORS.accent }}>
              <p className="text-xs text-gray-500 mb-1">Congestion</p>
              <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                {longTermData.steady_state_probabilities.congestion}%
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-100" style={{ backgroundColor: COLORS.light }}>
              <p className="text-xs text-gray-500 mb-1">Most Probable State</p>
              <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                n = {longTermData.steady_state_probabilities.most_probable_state}
              </p>
              <p className="text-xs text-gray-400">
                ({longTermData.steady_state_probabilities.most_probable_state_prob}%)
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </motion.div>
  );
}
