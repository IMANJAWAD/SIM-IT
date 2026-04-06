import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, TrendingUp, Users, Info } from 'lucide-react';
import StabilityGauge from './StabilityGauge';

// Color palette - vibrant status colors
const COLORS = {
  bgLight: '#f5f8fb',
  primary: '#C1121F',
  secondary: '#AE1F23',
  accent: '#669BBC',
  white: '#ffffff',
  textDark: '#1a365d',
  textMuted: '#4a5568',
  // Vibrant status colors
  stable: '#10b981',      // Green
  warning: '#f59e0b',     // Bright yellow/amber
  danger: '#ef4444',      // Red
};

/**
 * StabilityIntelligencePanel Component
 * 
 * Live intelligence panel showing system stability metrics.
 * Displays: Status card, semi-circular gauge, and recommendations.
 */
export default function StabilityIntelligencePanel({ 
  arrivalRate, 
  serviceRate = 3.0, 
  numDoctors 
}) {
  // Calculate load factor (ρ = λ / (μ × c))
  const rho = useMemo(() => {
    if (serviceRate <= 0 || numDoctors <= 0) return 0;
    return arrivalRate / (serviceRate * numDoctors);
  }, [arrivalRate, serviceRate, numDoctors]);

  // Calculate maximum stable arrival rate (λ_max = μ × c)
  const lambdaMax = useMemo(() => {
    return serviceRate * numDoctors;
  }, [serviceRate, numDoctors]);

  // Calculate headroom percentage
  const headroom = useMemo(() => {
    const value = (1 - rho) * 100;
    return value;
  }, [rho]);

  // Determine status configuration based on ρ
  const statusConfig = useMemo(() => {
    if (rho < 0.9) {
      return {
        status: 'Stable',
        accentColor: COLORS.stable,
        bgTint: `${COLORS.stable}15`,
        icon: Activity,
        message: 'System operating within safe parameters.',
        showWarning: false,
      };
    } else if (rho < 1) {
      return {
        status: 'High Load',
        accentColor: COLORS.warning,
        bgTint: `${COLORS.warning}15`,
        icon: TrendingUp,
        message: 'Approaching capacity limits. Monitor closely.',
        showWarning: false,
      };
    } else {
      return {
        status: 'Overloaded',
        accentColor: COLORS.danger,
        bgTint: `${COLORS.danger}10`,
        icon: AlertTriangle,
        message: 'Increase doctors or reduce arrival rate.',
        showWarning: true,
      };
    }
  }, [rho]);

  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full"
      style={{ borderRadius: '16px' }}
    >
      {/* Header */}
      <div 
        className="px-6 py-4 border-b border-gray-100"
        style={{ background: `linear-gradient(135deg, ${COLORS.primary}08, ${COLORS.secondary}08)` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: COLORS.textDark }}>
                Live Stability Intelligence
              </h2>
              <p className="text-xs" style={{ color: COLORS.textMuted }}>Real-time system analysis</p>
            </div>
          </div>
          
          {/* Info tooltip */}
          <div className="relative group">
            <Info className="w-4 h-4 cursor-help" style={{ color: COLORS.textMuted }} />
            <div className="absolute right-0 top-6 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              <p className="text-xs" style={{ color: COLORS.textMuted }}>
                ρ = λ / (μ × c) where λ is arrival rate, μ is service rate, and c is number of doctors. 
                For stability, ρ must be less than 1.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Status Card */}
        <div 
          className="relative rounded-xl overflow-hidden"
          style={{ background: statusConfig.bgTint }}
        >
          {/* Left accent strip */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1.5"
            style={{ background: statusConfig.accentColor }}
          />
          
          <div className="p-4 pl-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: COLORS.textMuted }}>
                  System Status
                </p>
                <div className="flex items-center gap-2">
                  <StatusIcon 
                    className="w-5 h-5" 
                    style={{ color: statusConfig.accentColor }} 
                  />
                  <motion.span
                    key={statusConfig.status}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xl font-bold"
                    style={{ color: COLORS.textDark }}
                  >
                    {statusConfig.status}
                  </motion.span>
                </div>
              </div>
              
              {statusConfig.showWarning && (
                <div 
                  className="px-2 py-1 rounded-md text-xs font-medium"
                  style={{ background: `${COLORS.primary}20`, color: COLORS.primary }}
                >
                  Action Needed
                </div>
              )}
            </div>

            <p className="text-sm" style={{ color: COLORS.textMuted }}>
              {statusConfig.message}
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Load Factor */}
          <div className="p-3 rounded-xl" style={{ background: COLORS.bgLight }}>
            <p className="text-xs font-medium mb-1" style={{ color: COLORS.textMuted }}>
              Load Factor (ρ)
            </p>
            <motion.p
              key={rho.toFixed(2)}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold tabular-nums"
              style={{ color: COLORS.textDark }}
            >
              {rho.toFixed(2)}
            </motion.p>
          </div>

          {/* Headroom */}
          <div className="p-3 rounded-xl" style={{ background: COLORS.bgLight }}>
            <p className="text-xs font-medium mb-1" style={{ color: COLORS.textMuted }}>
              Headroom
            </p>
            <motion.p
              key={headroom.toFixed(0)}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold tabular-nums"
              style={{ color: rho >= 1 ? COLORS.primary : COLORS.textDark }}
            >
              {rho >= 1 ? 'Overcapacity' : `${Math.max(0, headroom).toFixed(0)}%`}
            </motion.p>
          </div>
        </div>

        {/* Gauge */}
        <div className="pt-2">
          <StabilityGauge rho={rho} />
        </div>

        {/* Capacity Info */}
        <div 
          className="p-4 rounded-xl border"
          style={{ background: `${COLORS.bgLight}50`, borderColor: `${COLORS.secondary}30` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4" style={{ color: COLORS.secondary }} />
            <span className="text-sm font-semibold" style={{ color: COLORS.textDark }}>
              Capacity Analysis
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: COLORS.textMuted }}>Current arrival rate (λ)</span>
              <span className="font-medium tabular-nums" style={{ color: COLORS.textDark }}>
                {arrivalRate} /hr
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.textMuted }}>Max stable rate (λ<sub>max</sub>)</span>
              <motion.span 
                key={lambdaMax}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium tabular-nums"
                style={{ color: COLORS.secondary }}
              >
                {lambdaMax.toFixed(1)} /hr
              </motion.span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.textMuted }}>Active servers (c)</span>
              <span className="font-medium tabular-nums" style={{ color: COLORS.textDark }}>
                {numDoctors} doctors
              </span>
            </div>
          </div>

          {/* Surplus/Deficit indicator */}
          {arrivalRate > lambdaMax && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t"
              style={{ borderColor: `${COLORS.primary}20` }}
            >
              <p className="text-xs" style={{ color: COLORS.primary }}>
                ⚡ Reduce arrival rate by <strong>{(arrivalRate - lambdaMax).toFixed(1)}/hr</strong> or 
                add <strong>{Math.ceil((arrivalRate / serviceRate) - numDoctors)}</strong> more 
                doctor{Math.ceil((arrivalRate / serviceRate) - numDoctors) > 1 ? 's' : ''} for stability.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
