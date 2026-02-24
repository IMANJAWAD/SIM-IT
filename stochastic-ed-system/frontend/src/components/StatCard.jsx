import { motion } from 'framer-motion';
import { Clock, Users, Activity, Gauge, AlertTriangle } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }),
  hover: {
    y: -2,
    transition: { duration: 0.15 }
  }
};

const icons = {
  waitingTime: Clock,
  los: Activity,
  throughput: Users,
  utilization: Gauge,
  overload: AlertTriangle,
};

// STRICT COLORS ONLY: #caf0f8, #0077b6, #00b4d8, #f0f3bd
const colors = {
  waitingTime: { bg: '#0077b6' },
  los: { bg: '#0077b6' },
  throughput: { bg: '#00b4d8' },
  utilization: { bg: '#00b4d8' },
  overload: { bg: '#0077b6' },
};

export default function StatCard({ type, title, value, subtitle, index = 0, confidenceInterval }) {
  const Icon = icons[type] || Activity;
  const color = colors[type] || colors.waitingTime;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="kpi-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Icon */}
          <div 
            className="inline-flex p-2 rounded-lg mb-3"
            style={{ backgroundColor: color.bg }}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
          
          {/* Title */}
          <h3 className="kpi-label">{title}</h3>
          
          {/* Value */}
          <div className="kpi-value">
            <AnimatedCounter 
              value={value} 
              decimals={type === 'utilization' || type === 'overload' ? 1 : 2} 
              suffix={type === 'utilization' || type === 'overload' ? '%' : ''} 
            />
          </div>
          
          {/* Subtitle / CI */}
          {subtitle && (
            <p className="kpi-unit">{subtitle}</p>
          )}
          {confidenceInterval && (
            <p className="text-xs mt-1" style={{ color: '#0077b6' }}>
              95% CI: [{confidenceInterval[0]?.toFixed(2)}, {confidenceInterval[1]?.toFixed(2)}]
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
