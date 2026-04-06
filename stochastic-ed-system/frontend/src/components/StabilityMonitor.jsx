import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Info } from 'lucide-react';

// Color palette as specified
const COLORS = {
  bgLight: '#f5f8fb',
  primary: '#C1121F',
  secondary: '#AE1F23',
  accent: '#669BBC',
  white: '#ffffff',
  textDark: '#1a365d',
  textMuted: '#4a5568',
};

/**
 * StabilityMonitor Component
 * 
 * Displays real-time system stability based on queueing theory.
 * ρ = λ / (μ × c)
 * Where:
 *   λ = arrival rate
 *   μ = service rate
 *   c = number of servers (doctors)
 */
export default function StabilityMonitor({ 
  arrivalRate, 
  serviceRate = 3.0, 
  numDoctors 
}) {
  // Calculate load factor (ρ)
  const rho = useMemo(() => {
    if (serviceRate <= 0 || numDoctors <= 0) return 0;
    return arrivalRate / (serviceRate * numDoctors);
  }, [arrivalRate, serviceRate, numDoctors]);

  // Determine status and styling based on ρ
  const statusConfig = useMemo(() => {
    if (rho < 0.85) {
      return {
        status: 'Stable',
        accentColor: COLORS.secondary,
        bgTint: COLORS.bgLight,
        icon: Activity,
        showWarning: false,
      };
    } else if (rho < 1) {
      return {
        status: 'High Load',
        accentColor: COLORS.accent,
        bgTint: `${COLORS.accent}40`,
        icon: Activity,
        showWarning: false,
      };
    } else {
      return {
        status: 'Unstable',
        accentColor: COLORS.primary,
        bgTint: `${COLORS.primary}15`,
        icon: AlertTriangle,
        showWarning: true,
      };
    }
  }, [rho]);

  // Calculate headroom percentage (how much capacity remains before ρ = 1)
  const headroom = useMemo(() => {
    const value = Math.max(0, (1 - rho) * 100);
    return value.toFixed(0);
  }, [rho]);

  // Calculate visual bar width (capped at 120%)
  const barWidth = useMemo(() => {
    return Math.min((rho / 1.2) * 100, 100);
  }, [rho]);

  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      style={{ borderRadius: '14px', padding: '24px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
          >
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold" style={{ color: COLORS.textDark }}>
            System Stability Monitor
          </span>
        </div>
        
        {/* Tooltip */}
        <div className="relative group">
          <Info className="w-4 h-4 cursor-help" style={{ color: COLORS.textMuted }} />
          <div className="absolute right-0 top-6 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            <p className="text-xs" style={{ color: COLORS.textMuted }}>
              System stability is defined as ρ = λ / (μ × c). 
              For long-term stability, ρ must be less than 1.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Display */}
      <div className="space-y-4">
        {/* Load Factor (ρ) */}
        <div 
          className="p-4 rounded-xl"
          style={{ background: statusConfig.bgTint }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: COLORS.textMuted }}>
              Load Factor (ρ)
            </span>
            <div className="flex items-center gap-2">
              {statusConfig.showWarning && (
                <AlertTriangle className="w-4 h-4" style={{ color: statusConfig.accentColor }} />
              )}
              <motion.span
                key={rho.toFixed(2)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="text-2xl font-bold tabular-nums"
                style={{ color: COLORS.textDark }}
              >
                {rho.toFixed(2)}
              </motion.span>
            </div>
          </div>

          {/* Load Bar */}
          <div className="relative h-3 rounded-full overflow-hidden bg-gray-100">
            {/* Zone markers */}
            <div 
              className="absolute h-full w-px bg-gray-300 z-10"
              style={{ left: `${(0.85 / 1.2) * 100}%` }}
            />
            <div 
              className="absolute h-full w-px bg-gray-400 z-10"
              style={{ left: `${(1 / 1.2) * 100}%` }}
            />
            
            {/* Fill bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${barWidth}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="absolute h-full rounded-full"
              style={{ 
                background: rho < 0.85 
                  ? `linear-gradient(90deg, ${COLORS.secondary}, ${COLORS.secondary})`
                  : rho < 1 
                    ? `linear-gradient(90deg, ${COLORS.secondary}, ${COLORS.accent})`
                    : `linear-gradient(90deg, ${COLORS.secondary}, ${COLORS.primary})`
              }}
            />
          </div>

          {/* Zone labels */}
          <div className="flex justify-between mt-1.5 text-xs" style={{ color: COLORS.textMuted }}>
            <span>0</span>
            <span style={{ marginLeft: `${(0.85 / 1.2) * 100 - 10}%` }}>0.85</span>
            <span style={{ marginLeft: '8%' }}>1.0</span>
            <span>1.2</span>
          </div>
        </div>

        {/* Status and Headroom */}
        <div className="grid grid-cols-2 gap-3">
          {/* Status */}
          <div 
            className="p-3 rounded-xl"
            style={{ background: `${statusConfig.accentColor}15` }}
          >
            <span className="text-xs font-medium block mb-1" style={{ color: COLORS.textMuted }}>
              Status
            </span>
            <div className="flex items-center gap-2">
              <StatusIcon className="w-4 h-4" style={{ color: statusConfig.accentColor }} />
              <motion.span
                key={statusConfig.status}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-bold"
                style={{ color: COLORS.textDark }}
              >
                {statusConfig.status}
              </motion.span>
            </div>
          </div>

          {/* Headroom */}
          <div 
            className="p-3 rounded-xl"
            style={{ background: COLORS.bgLight }}
          >
            <span className="text-xs font-medium block mb-1" style={{ color: COLORS.textMuted }}>
              Headroom
            </span>
            <motion.span
              key={headroom}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="text-sm font-bold"
              style={{ color: rho >= 1 ? COLORS.primary : COLORS.textDark }}
            >
              {rho >= 1 ? 'Overcapacity' : `${headroom}%`}
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
