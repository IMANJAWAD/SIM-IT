import { useMemo } from 'react';
import { motion } from 'framer-motion';

// Color palette - vibrant status colors
const COLORS = {
  comfortable: '#10b981',  // Green
  highLoad: '#f59e0b',     // Bright yellow/amber
  critical: '#f97316',     // Orange
  unstable: '#ef4444',     // Red
  textDark: '#1a365d',
  textMuted: '#4a5568',
};

/**
 * StabilityGauge Component
 * 
 * Premium semi-circular gauge displaying system load factor (ρ)
 * Scale: 0 → 1.2
 * Zones: Comfortable (0-0.7), High Load (0.7-0.9), Critical (0.9-1.0), Unstable (>1)
 */
export default function StabilityGauge({ rho = 0 }) {
  // Clamp rho for display (0 to 1.2)
  const clampedRho = useMemo(() => Math.min(Math.max(rho, 0), 1.2), [rho]);
  
  // Calculate needle rotation (-90deg to 90deg for semi-circle)
  const needleRotation = useMemo(() => {
    // Map 0-1.2 to -90 to 90 degrees
    return -90 + (clampedRho / 1.2) * 180;
  }, [clampedRho]);

  // Determine current zone for styling
  const currentZone = useMemo(() => {
    if (rho < 0.7) return 'comfortable';
    if (rho < 0.9) return 'highLoad';
    if (rho < 1.0) return 'critical';
    return 'unstable';
  }, [rho]);

  const zoneColors = {
    comfortable: COLORS.comfortable,
    highLoad: COLORS.highLoad,
    critical: COLORS.critical,
    unstable: COLORS.unstable,
  };

  // SVG dimensions
  const width = 280;
  const height = 160;
  const cx = width / 2;
  const cy = height - 20;
  const radius = 100;
  const strokeWidth = 16;

  // Calculate arc paths for each zone
  const createArc = (startAngle, endAngle) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  // Zone angles (mapped to semi-circle: -180 to 0 degrees)
  // 0 → -180°, 1.2 → 0°
  const zones = [
    { start: -180, end: -180 + (0.7/1.2) * 180, color: COLORS.comfortable },   // 0-0.7
    { start: -180 + (0.7/1.2) * 180, end: -180 + (0.9/1.2) * 180, color: COLORS.highLoad },  // 0.7-0.9
    { start: -180 + (0.9/1.2) * 180, end: -180 + (1.0/1.2) * 180, color: COLORS.critical },  // 0.9-1.0
    { start: -180 + (1.0/1.2) * 180, end: 0, color: COLORS.unstable },          // 1.0-1.2
  ];

  // Tick marks
  const ticks = [0, 0.3, 0.6, 0.9, 1.2];

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} className="overflow-visible">
        {/* Background track */}
        <path
          d={createArc(-180, 0)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Zone arcs */}
        {zones.map((zone, index) => (
          <path
            key={index}
            d={createArc(zone.start, zone.end)}
            fill="none"
            stroke={zone.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            opacity={0.85}
          />
        ))}

        {/* Tick marks */}
        {ticks.map((tick, index) => {
          const angle = -180 + (tick / 1.2) * 180;
          const rad = (angle * Math.PI) / 180;
          const innerR = radius - strokeWidth / 2 - 8;
          const outerR = radius - strokeWidth / 2 - 2;
          const x1 = cx + innerR * Math.cos(rad);
          const y1 = cy + innerR * Math.sin(rad);
          const x2 = cx + outerR * Math.cos(rad);
          const y2 = cy + outerR * Math.sin(rad);
          
          // Label position
          const labelR = radius - strokeWidth / 2 - 22;
          const labelX = cx + labelR * Math.cos(rad);
          const labelY = cy + labelR * Math.sin(rad);
          
          return (
            <g key={index}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={COLORS.textMuted}
                strokeWidth={1.5}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={COLORS.textMuted}
                fontSize="10"
                fontWeight="500"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Needle */}
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: needleRotation }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          {/* Needle shadow */}
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - radius + strokeWidth + 10}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={4}
            strokeLinecap="round"
          />
          {/* Needle body */}
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - radius + strokeWidth + 10}
            stroke={zoneColors[currentZone]}
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* Needle center dot */}
          <circle
            cx={cx}
            cy={cy}
            r={8}
            fill={zoneColors[currentZone]}
          />
          <circle
            cx={cx}
            cy={cy}
            r={4}
            fill="white"
          />
        </motion.g>
      </svg>

      {/* Current value display */}
      <motion.div
        key={rho.toFixed(2)}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center -mt-2"
      >
        <span 
          className="text-3xl font-bold tabular-nums"
          style={{ color: zoneColors[currentZone] }}
        >
          {rho.toFixed(2)}
        </span>
        <span className="text-sm ml-1" style={{ color: COLORS.textMuted }}>ρ</span>
      </motion.div>

      {/* Zone legend */}
      <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: COLORS.textMuted }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.comfortable }} />
          <span>Comfortable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.highLoad }} />
          <span>High Load</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.critical }} />
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.unstable }} />
          <span>Unstable</span>
        </div>
      </div>
    </div>
  );
}
