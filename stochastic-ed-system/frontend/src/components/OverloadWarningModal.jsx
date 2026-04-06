import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Play, Sliders } from 'lucide-react';

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
 * OverloadWarningModal Component
 * 
 * Soft warning modal shown when ρ ≥ 1 and user attempts to run simulation.
 * Does NOT block simulation - only provides educational warning.
 */
export default function OverloadWarningModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  rho 
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 px-4"
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
              style={{ borderRadius: '14px' }}
            >
              {/* Header */}
              <div 
                className="px-6 py-5 border-b border-gray-100 flex items-center justify-between"
                style={{ background: `linear-gradient(135deg, ${COLORS.primary}08, ${COLORS.secondary}08)` }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${COLORS.primary}15` }}
                  >
                    <AlertTriangle className="w-5 h-5" style={{ color: COLORS.primary }} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: COLORS.textDark }}>
                    System Overload Warning
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" style={{ color: COLORS.textMuted }} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-5">
                {/* ρ Display */}
                <div 
                  className="p-4 rounded-xl mb-4 flex items-center justify-between"
                  style={{ background: COLORS.bgLight }}
                >
                  <span className="text-sm font-medium" style={{ color: COLORS.textMuted }}>
                    Current Load Factor (ρ)
                  </span>
                  <span 
                    className="text-xl font-bold tabular-nums"
                    style={{ color: COLORS.primary }}
                  >
                    {rho?.toFixed(2) || '—'}
                  </span>
                </div>

                {/* Message */}
                <p className="text-sm leading-relaxed mb-4" style={{ color: COLORS.textMuted }}>
                  The current configuration results in <strong style={{ color: COLORS.textDark }}>ρ ≥ 1</strong>.
                </p>
                <p className="text-sm leading-relaxed mb-4" style={{ color: COLORS.textMuted }}>
                  This means the system is theoretically <strong style={{ color: COLORS.textDark }}>unstable</strong> and 
                  queues may grow without bound over time.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: COLORS.textMuted }}>
                  You may still run the simulation to observe congestion effects.
                </p>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                {/* Secondary: Adjust Parameters */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-3 px-4 text-sm rounded-xl font-semibold flex items-center justify-center gap-2 border-2 transition-all"
                  style={{ 
                    borderColor: COLORS.primary, 
                    color: COLORS.primary,
                    background: COLORS.white
                  }}
                >
                  <Sliders className="w-4 h-4" />
                  Adjust Parameters
                </motion.button>

                {/* Primary: Run Anyway */}
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 20px -5px rgba(0, 119, 182, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="flex-1 py-3 px-4 text-white text-sm rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
                  style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
                >
                  <Play className="w-4 h-4" />
                  Run Anyway
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
