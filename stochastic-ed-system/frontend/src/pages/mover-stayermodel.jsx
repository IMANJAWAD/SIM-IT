import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  Users, 
  Heart,
  Zap,
  Shield,
  TrendingUp,
  BarChart3,
  Clock,
  UserCheck,
  UserX,
  ArrowRightLeft,
  Play,
  RotateCcw,
  Settings,
  Info,
  CheckCircle,
  Target,
  Activity as Pulse,
  Siren,
  Stethoscope,
  Bed,
  User,
  GripVertical,
  Plus,
  Minus,
  Move3D,
  FlaskConical,
  Clipboard,
  Eye,
  Home,
  ArrowRight,
  Layers,
  Sliders,
  Server,
  Rocket,
  PersonStanding,
  Zap as FastHeart,
  Scan,
  Microscope,
  Ambulance,
  Building2,
  Circle,
  ArrowDown,
  ArrowUp,
  ToggleLeft,
  ToggleRight,
  UserCog,
  Crown,
  AlertCircle,
  Timer,
  Zap as Lightning,
  Star,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// White/Blue theme colors
const THEME_COLORS = {
  primary: '#2563eb', // Blue
  secondary: '#3b82f6', // Light Blue
  accent: '#1d4ed8', // Dark Blue
  background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #2563eb 100%)',
  glass: 'rgba(255, 255, 255, 0.2)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  textLight: '#1e40af',
  textMuted: 'rgba(30, 64, 175, 0.8)',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444'
};
// Tab configuration
const TABS = [
  {
    id: 'system-load',
    label: 'System Load',
    icon: TrendingUp,
    description: 'λ values and NHPP intensity functions'
  },
  {
    id: 'patient-dynamics',
    label: 'Patient Dynamics', 
    icon: ArrowRightLeft,
    description: 'Mover-Stayer toggle and routing probabilities'
  },
  {
    id: 'service-priority',
    label: 'Service & Priority',
    icon: UserCog,
    description: 'Priority distribution and resource allocation'
  },
  {
    id: 'node-settings',
    label: 'Node Settings',
    icon: Building2,
    description: 'Interactive ED nodes with flow visualization'
  },
  {
    id: 'resource-constraints',
    label: 'Resource Constraints',
    icon: Server,
    description: 'Number of doctors and service rates μ'
  }
];

// Glassmorphic Card Component
const GlassCard = ({ children, className = '', ...props }) => (
  <motion.div
    className={`backdrop-blur-lg bg-white/30 border border-white/40 rounded-2xl shadow-xl ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

// Animated Slider with Glassmorphic Design
const GlassSlider = ({ label, value, onChange, min = 0, max = 100, unit = '', icon: Icon }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-blue-600" />}
          <label className="text-lg font-semibold text-blue-800">{label}</label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-800 bg-white/40 px-3 py-1 rounded-lg backdrop-blur-sm">
            {value}{unit}
          </span>
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-white/30 backdrop-blur-sm"
          style={{
            background: `linear-gradient(to right, ${THEME_COLORS.primary} 0%, ${THEME_COLORS.primary} ${percentage}%, rgba(255,255,255,0.4) ${percentage}%, rgba(255,255,255,0.4) 100%)`
          }}
        />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            boxShadow: ['0 0 0 0 rgba(37, 99, 235, 0.7)', '0 0 0 10px rgba(37, 99, 235, 0)', '0 0 0 0 rgba(37, 99, 235, 0.7)']
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-blue-500"
          style={{ left: `calc(${percentage}% - 12px)` }}
        />
      </div>
    </div>
  );
};
// Toggle Switch Component
const GlassToggle = ({ label, enabled, onChange, icon: Icon }) => (
  <div className="flex items-center justify-between p-4 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-5 h-5 text-blue-600" />}
      <span className="text-blue-800 font-medium">{label}</span>
    </div>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onChange}
      className={`relative w-16 h-8 rounded-full transition-all ${
        enabled 
          ? 'bg-gradient-to-r from-blue-400 to-blue-600' 
          : 'bg-white/30'
      }`}
    >
      <motion.div
        animate={{ x: enabled ? 32 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
      />
    </motion.button>
  </div>
);

// Service Level & Priority Inputs Component
const ServiceLevelPriorityInputs = ({ moverPercentage, onPriorityChange, onResourceChange }) => {
  // Priority levels with initial percentages
  const [priorityLevels, setPriorityLevels] = useState([
    { 
      id: 'P1', 
      name: 'P1 - Critical', 
      percentage: 15, 
      color: '#dc2626', 
      icon: Crown,
      description: 'Life-threatening emergencies',
      targetTime: '< 2 min'
    },
    { 
      id: 'P2', 
      name: 'P2 - Urgent', 
      percentage: 25, 
      color: '#ea580c', 
      icon: AlertCircle,
      description: 'Serious conditions requiring immediate attention',
      targetTime: '< 10 min'
    },
    { 
      id: 'P3', 
      name: 'P3 - Less Urgent', 
      percentage: 35, 
      color: '#d97706', 
      icon: Timer,
      description: 'Stable but requiring medical attention',
      targetTime: '< 30 min'
    },
    { 
      id: 'P4', 
      name: 'P4 - Standard', 
      percentage: 20, 
      color: '#059669', 
      icon: Lightning,
      description: 'Non-urgent medical issues',
      targetTime: '< 60 min'
    },
    { 
      id: 'P5', 
      name: 'P5 - Non-Urgent', 
      percentage: 5, 
      color: '#0284c7', 
      icon: Star,
      description: 'Minor issues, can wait',
      targetTime: '< 120 min'
    }
  ]);

  // Available doctors/resources
  const [doctors, setDoctors] = useState([
    { id: 1, name: 'Dr. Smith', specialty: 'Emergency', active: true, experience: 'Senior' },
    { id: 2, name: 'Dr. Johnson', specialty: 'Trauma', active: true, experience: 'Senior' },
    { id: 3, name: 'Dr. Williams', specialty: 'Internal', active: false, experience: 'Mid-level' },
    { id: 4, name: 'Dr. Brown', specialty: 'Pediatric', active: true, experience: 'Senior' },
    { id: 5, name: 'Dr. Davis', specialty: 'Emergency', active: false, experience: 'Junior' },
    { id: 6, name: 'Dr. Miller', specialty: 'Trauma', active: false, experience: 'Mid-level' }
  ]);

  const activeDoctors = doctors.filter(doc => doc.active);
  const totalCapacity = activeDoctors.length;

  // Handle priority percentage changes
  const handlePriorityChange = (index, newPercentage) => {
    const newPriorities = [...priorityLevels];
    const oldPercentage = newPriorities[index].percentage;
    const difference = newPercentage - oldPercentage;
    
    newPriorities[index].percentage = newPercentage;
    
    // Redistribute the difference among other priorities
    const otherIndices = priorityLevels.map((_, i) => i).filter(i => i !== index);
    const redistributeAmount = -difference / otherIndices.length;
    
    otherIndices.forEach(i => {
      newPriorities[i].percentage = Math.max(0, Math.min(100, 
        newPriorities[i].percentage + redistributeAmount
      ));
    });
    
    // Normalize to ensure total is 100%
    const total = newPriorities.reduce((sum, p) => sum + p.percentage, 0);
    if (total !== 100) {
      newPriorities.forEach(p => {
        p.percentage = (p.percentage / total) * 100;
      });
    }
    
    setPriorityLevels(newPriorities);
    onPriorityChange?.(newPriorities);
  };

  // Toggle doctor active status
  const toggleDoctor = (doctorId) => {
    const newDoctors = doctors.map(doc => 
      doc.id === doctorId ? { ...doc, active: !doc.active } : doc
    );
    setDoctors(newDoctors);
    onResourceChange?.(newDoctors.filter(doc => doc.active).length);
  };

  // Calculate Mover distribution across priorities
  const getMoverDistribution = () => {
    return priorityLevels.map(priority => ({
      ...priority,
      moverCount: (priority.percentage * moverPercentage / 100).toFixed(1),
      stayerCount: (priority.percentage * (100 - moverPercentage) / 100).toFixed(1)
    }));
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-blue-800 mb-2">Service Level & Priority Configuration</h3>
        <p className="text-blue-700">Draggable priority distribution and interactive resource allocation</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Draggable Priority Stack */}
        <GlassCard className="p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-6 flex items-center gap-2">
            <GripVertical className="w-5 h-5" />
            Priority Distribution Stack
          </h4>
          
          <div className="space-y-4">
            <Reorder.Group 
              axis="y" 
              values={priorityLevels} 
              onReorder={setPriorityLevels}
              className="space-y-3"
            >
              {priorityLevels.map((priority, index) => {
                const IconComponent = priority.icon;
                const distribution = getMoverDistribution()[index];
                
                return (
                  <Reorder.Item 
                    key={priority.id} 
                    value={priority}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileDrag={{ scale: 1.05, rotate: 2 }}
                      className="relative"
                    >
                      <GlassCard 
                        className="p-4 border-l-4 hover:shadow-lg transition-all"
                        style={{ borderLeftColor: priority.color }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-blue-600 opacity-50" />
                            <IconComponent 
                              className="w-5 h-5" 
                              style={{ color: priority.color }}
                            />
                            <div>
                              <div className="font-semibold text-blue-800">{priority.name}</div>
                              <div className="text-xs text-blue-600">{priority.targetTime}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-800">
                              {priority.percentage.toFixed(1)}%
                            </div>
                            <div className="text-xs text-blue-600">
                              M: {distribution.moverCount}% | S: {distribution.stayerCount}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Interactive Percentage Slider */}
                        <div className="mb-3">
                          <input
                            type="range"
                            min="0"
                            max="60"
                            value={priority.percentage}
                            onChange={(e) => handlePriorityChange(index, parseFloat(e.target.value))}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, ${priority.color} 0%, ${priority.color} ${priority.percentage * 100 / 60}%, rgba(255,255,255,0.3) ${priority.percentage * 100 / 60}%, rgba(255,255,255,0.3) 100%)`
                            }}
                          />
                        </div>
                        
                        {/* Priority Description */}
                        <p className="text-xs text-blue-600 italic">{priority.description}</p>
                        
                        {/* Visual Bar */}
                        <div className="mt-3 h-3 bg-white/20 rounded-full overflow-hidden">
                          <div className="flex h-full">
                            <motion.div
                              className="bg-gradient-to-r from-green-400 to-green-600"
                              animate={{ width: `${(distribution.moverCount / priority.percentage) * 100}%` }}
                              transition={{ duration: 0.5 }}
                              title={`Movers: ${distribution.moverCount}%`}
                            />
                            <motion.div
                              className="bg-gradient-to-r from-orange-400 to-red-500"
                              animate={{ width: `${(distribution.stayerCount / priority.percentage) * 100}%` }}
                              transition={{ duration: 0.5 }}
                              title={`Stayers: ${distribution.stayerCount}%`}
                            />
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </div>
          
          {/* Priority Summary */}
          <div className="mt-6 p-4 bg-blue-50/50 rounded-lg">
            <h5 className="font-semibold text-blue-800 mb-2">Distribution Summary</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">High Priority (P1-P2):</span>
                <span className="font-bold text-blue-800 ml-2">
                  {(priorityLevels[0].percentage + priorityLevels[1].percentage).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-blue-700">Low Priority (P4-P5):</span>
                <span className="font-bold text-blue-800 ml-2">
                  {(priorityLevels[3].percentage + priorityLevels[4].percentage).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Interactive Resource Counter */}
        <GlassCard className="p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-6 flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            Resource Allocation (M/M/c Capacity)
          </h4>
          
          {/* Doctor Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {doctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleDoctor(doctor.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  doctor.active 
                    ? 'bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-400 shadow-lg' 
                    : 'bg-white/30 border-2 border-white/40 hover:bg-white/50'
                }`}
              >
                <div className="text-center">
                  <motion.div
                    animate={doctor.active ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ 
                      duration: 2, 
                      repeat: doctor.active ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    <Stethoscope 
                      className={`w-8 h-8 mx-auto mb-2 ${
                        doctor.active ? 'text-green-600' : 'text-blue-400'
                      }`} 
                    />
                  </motion.div>
                  
                  <div className={`font-semibold text-sm ${
                    doctor.active ? 'text-green-800' : 'text-blue-700'
                  }`}>
                    {doctor.name}
                  </div>
                  
                  <div className={`text-xs ${
                    doctor.active ? 'text-green-600' : 'text-blue-500'
                  }`}>
                    {doctor.specialty}
                  </div>
                  
                  <div className={`text-xs font-medium mt-1 ${
                    doctor.active ? 'text-green-700' : 'text-blue-600'
                  }`}>
                    {doctor.experience}
                  </div>
                  
                  {/* Status Indicator */}
                  <div className={`mt-2 px-2 py-1 rounded-full text-xs font-bold ${
                    doctor.active 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {doctor.active ? 'ON DUTY' : 'OFF DUTY'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Capacity Summary */}
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-50/50 rounded-lg">
              <div className="text-3xl font-bold text-blue-800 mb-2">
                c = {totalCapacity}
              </div>
              <div className="text-blue-700">Active Servers (M/M/c)</div>
              <div className="text-sm text-blue-600 mt-1">
                {activeDoctors.length} of {doctors.length} doctors on duty
              </div>
            </div>
            
            {/* Service Rate Calculation */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-white/20 rounded-lg text-center">
                <div className="font-semibold text-blue-800">Service Rate (μ)</div>
                <div className="text-lg font-bold text-blue-700">
                  {(totalCapacity * 4).toFixed(1)}/hr
                </div>
                <div className="text-xs text-blue-600">Per server: 4/hr</div>
              </div>
              
              <div className="p-3 bg-white/20 rounded-lg text-center">
                <div className="font-semibold text-blue-800">System Capacity</div>
                <div className="text-lg font-bold text-blue-700">
                  {(totalCapacity * 4 * 0.8).toFixed(1)}/hr
                </div>
                <div className="text-xs text-blue-600">80% utilization target</div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const newDoctors = doctors.map(doc => ({ ...doc, active: true }));
                  setDoctors(newDoctors);
                  onResourceChange?.(newDoctors.length);
                }}
                className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600 transition-colors"
              >
                All On Duty
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const newDoctors = doctors.map((doc, index) => ({ 
                    ...doc, 
                    active: index < 3 // Keep first 3 active
                  }));
                  setDoctors(newDoctors);
                  onResourceChange?.(3);
                }}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors"
              >
                Standard Shift
              </motion.button>
            </div>
          </div>
        </GlassCard>
      </div>
      
      {/* Combined Analysis */}
      <GlassCard className="p-6">
        <h4 className="text-lg font-semibold text-blue-800 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Priority-Resource Analysis
        </h4>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* System Load Analysis */}
          <div className="text-center">
            <h5 className="font-semibold text-blue-800 mb-3">System Load</h5>
            <div className="text-2xl font-bold text-blue-700 mb-2">
              ρ = {((priorityLevels[0].percentage + priorityLevels[1].percentage) * 0.15 / totalCapacity).toFixed(2)}
            </div>
            <div className="text-sm text-blue-600">
              High priority utilization ratio
            </div>
            <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${
              ((priorityLevels[0].percentage + priorityLevels[1].percentage) * 0.15 / totalCapacity) > 0.8 
                ? 'bg-red-100 text-red-700' 
                : ((priorityLevels[0].percentage + priorityLevels[1].percentage) * 0.15 / totalCapacity) > 0.6
                ? 'bg-amber-100 text-amber-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {((priorityLevels[0].percentage + priorityLevels[1].percentage) * 0.15 / totalCapacity) > 0.8 
                ? 'OVERLOADED' 
                : ((priorityLevels[0].percentage + priorityLevels[1].percentage) * 0.15 / totalCapacity) > 0.6
                ? 'BUSY'
                : 'OPTIMAL'}
            </div>
          </div>
          
          {/* Priority Balance */}
          <div className="text-center">
            <h5 className="font-semibold text-blue-800 mb-3">Priority Balance</h5>
            <div className="text-2xl font-bold text-blue-700 mb-2">
              {((priorityLevels[0].percentage + priorityLevels[1].percentage) / 
                (priorityLevels[3].percentage + priorityLevels[4].percentage)).toFixed(1)}:1
            </div>
            <div className="text-sm text-blue-600">
              High:Low priority ratio
            </div>
          </div>
          
          {/* Mover-Stayer Impact */}
          <div className="text-center">
            <h5 className="font-semibold text-blue-800 mb-3">Flow Efficiency</h5>
            <div className="text-2xl font-bold text-blue-700 mb-2">
              {(moverPercentage * (totalCapacity / 6)).toFixed(0)}%
            </div>
            <div className="text-sm text-blue-600">
              Expected throughput efficiency
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

// Interactive Node Settings Component with Live Cards and Animated Particles
const InteractiveNodeSettings = ({ moverPercentage, stayerPercentage }) => {
  const [nodeSettings, setNodeSettings] = useState({
    triage: { stayerProne: false, utilization: 65 },
    traumaBay: { stayerProne: false, utilization: 80 },
    xray: { stayerProne: true, utilization: 45 },
    lab: { stayerProne: false, utilization: 70 },
    observation: { stayerProne: true, utilization: 90 }
  });

  const [particles, setParticles] = useState([]);

  // ED Node definitions
  const ED_NODES = [
    { 
      id: 'triage', 
      name: 'Triage', 
      icon: Clipboard, 
      position: { x: 20, y: 20 },
      color: '#3b82f6',
      description: 'Initial patient assessment'
    },
    { 
      id: 'traumaBay', 
      name: 'Trauma Bay', 
      icon: Ambulance, 
      position: { x: 80, y: 20 },
      color: '#ef4444',
      description: 'Critical care treatment'
    },
    { 
      id: 'xray', 
      name: 'X-Ray', 
      icon: Scan, 
      position: { x: 20, y: 80 },
      color: '#8b5cf6',
      description: 'Diagnostic imaging'
    },
    { 
      id: 'lab', 
      name: 'Laboratory', 
      icon: Microscope, 
      position: { x: 50, y: 50 },
      color: '#10b981',
      description: 'Blood work & tests'
    },
    { 
      id: 'observation', 
      name: 'Observation', 
      icon: Eye, 
      position: { x: 80, y: 80 },
      color: '#f59e0b',
      description: 'Extended monitoring'
    }
  ];

  // Generate particles for patient flow
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      const particleCount = 15;
      
      for (let i = 0; i < particleCount; i++) {
        const sourceNode = ED_NODES[Math.floor(Math.random() * ED_NODES.length)];
        const targetNode = ED_NODES[Math.floor(Math.random() * ED_NODES.length)];
        
        if (sourceNode.id !== targetNode.id) {
          const isStayerParticle = Math.random() * 100 > moverPercentage;
          const isBlocked = isStayerParticle && (nodeSettings[targetNode.id]?.stayerProne || false);
          
          newParticles.push({
            id: i,
            source: sourceNode,
            target: targetNode,
            progress: Math.random(),
            speed: isBlocked ? 0.001 : (isStayerParticle ? 0.005 : 0.015),
            type: isStayerParticle ? 'stayer' : 'mover',
            blocked: isBlocked,
            delay: Math.random() * 2000
          });
        }
      }
      
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, 5000);
    return () => clearInterval(interval);
  }, [moverPercentage, nodeSettings]);

  // Update particle positions
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        progress: particle.blocked ? 
          Math.min(particle.progress + particle.speed, 0.7) : // Stop at 70% if blocked
          (particle.progress + particle.speed) % 1
      })));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  const toggleStayerProne = (nodeId) => {
    setNodeSettings(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        stayerProne: !prev[nodeId].stayerProne
      }
    }));
  };

  const getParticlePosition = (particle) => {
    const { source, target, progress } = particle;
    const x = source.position.x + (target.position.x - source.position.x) * progress;
    const y = source.position.y + (target.position.y - source.position.y) * progress;
    return { x, y };
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-blue-800 mb-2">Interactive Node Settings</h3>
        <p className="text-blue-700">ED nodes with live patient flow visualization and bed blocking analysis</p>
      </div>

      {/* Node Grid with Animated Particles */}
      <div className="relative">
        <GlassCard className="p-8 min-h-96">
          {/* Background Grid */}
          <div className="absolute inset-4 opacity-20">
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* ED Node Cards */}
          <div className="relative h-96">
            {ED_NODES.map((node) => {
              const IconComponent = node.icon;
              const settings = nodeSettings[node.id];
              const isStayerProne = settings?.stayerProne || false;
              
              return (
                <motion.div
                  key={node.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${node.position.x}%`,
                    top: `${node.position.y}%`
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: `0 0 30px ${node.color}80`
                  }}
                  animate={isStayerProne ? {
                    boxShadow: [
                      `0 0 10px ${node.color}40`,
                      `0 0 25px ${node.color}80`,
                      `0 0 10px ${node.color}40`
                    ]
                  } : {}}
                  transition={{ 
                    duration: 2, 
                    repeat: isStayerProne ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  <GlassCard className={`p-4 w-32 text-center cursor-pointer transition-all ${
                    isStayerProne ? 'bg-amber-100/30 border-amber-300/50' : 'bg-white/30'
                  }`}>
                    <IconComponent 
                      className="w-8 h-8 mx-auto mb-2" 
                      style={{ color: node.color }}
                    />
                    <div className="text-sm font-bold text-blue-800 mb-1">{node.name}</div>
                    <div className="text-xs text-blue-600 mb-3">{node.description}</div>
                    
                    {/* Utilization Bar */}
                    <div className="w-full h-2 bg-white/30 rounded-full mb-3 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ 
                          background: `linear-gradient(to right, ${node.color}60, ${node.color})`,
                          width: `${settings?.utilization || 50}%`
                        }}
                        animate={{ width: `${settings?.utilization || 50}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    
                    {/* Stayer-Prone Toggle */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleStayerProne(node.id)}
                      className={`w-full py-1 px-2 rounded-lg text-xs font-medium transition-all ${
                        isStayerProne 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-white/30 text-blue-700 hover:bg-white/50'
                      }`}
                    >
                      {isStayerProne ? (
                        <div className="flex items-center justify-center gap-1">
                          <ToggleRight className="w-3 h-3" />
                          Stayer-Prone
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <ToggleLeft className="w-3 h-3" />
                          Normal Flow
                        </div>
                      )}
                    </motion.button>
                  </GlassCard>
                </motion.div>
              );
            })}

            {/* Animated Particles */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {particles.map((particle) => {
                const pos = getParticlePosition(particle);
                const particleColor = particle.blocked ? '#f59e0b' : 
                                    particle.type === 'stayer' ? '#ef4444' : '#10b981';
                
                return (
                  <motion.circle
                    key={particle.id}
                    cx={`${pos.x}%`}
                    cy={`${pos.y}%`}
                    r="3"
                    fill={particleColor}
                    animate={particle.blocked ? {
                      opacity: [0.8, 0.3, 0.8],
                      r: [3, 5, 3]
                    } : {
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ 
                      duration: particle.blocked ? 1.5 : 0.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: particle.delay / 1000
                    }}
                  />
                );
              })}
            </svg>
          </div>
        </GlassCard>

        {/* Legend */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <GlassCard className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-blue-800 font-medium">Mover Patients</span>
            </div>
            <p className="text-xs text-blue-600">Fast flow, quick discharge</p>
          </GlassCard>
          
          <GlassCard className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-blue-800 font-medium">Stayer Patients</span>
            </div>
            <p className="text-xs text-blue-600">Extended stay, complex care</p>
          </GlassCard>
          
          <GlassCard className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-blue-800 font-medium">Bed Blocking</span>
            </div>
            <p className="text-xs text-blue-600">Stalled flow in stayer-prone nodes</p>
          </GlassCard>
        </div>
      </div>

      {/* Node Statistics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ED_NODES.map((node) => {
          const settings = nodeSettings[node.id];
          const IconComponent = node.icon;
          const blockingRisk = settings?.stayerProne ? 
            Math.min(90, 30 + (stayerPercentage * 0.8)) : 
            Math.max(10, stayerPercentage * 0.3);
          
          return (
            <GlassCard key={node.id} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <IconComponent className="w-6 h-6" style={{ color: node.color }} />
                <div>
                  <div className="font-semibold text-blue-800">{node.name}</div>
                  <div className="text-xs text-blue-600">{settings?.utilization || 50}% Utilization</div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Blocking Risk:</span>
                  <span className={`font-bold ${blockingRisk > 60 ? 'text-red-600' : blockingRisk > 30 ? 'text-amber-600' : 'text-green-600'}`}>
                    {blockingRisk.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Flow Status:</span>
                  <span className={`font-bold ${settings?.stayerProne ? 'text-amber-600' : 'text-green-600'}`}>
                    {settings?.stayerProne ? 'Stayer-Prone' : 'Normal'}
                  </span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

// Flow-Balance Slider Component for Mover-Stayer Population Split
const FlowBalanceSlider = ({ moverPercentage, onChange }) => {
  const stayerPercentage = 100 - moverPercentage;
  const sliderPosition = moverPercentage;
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
       
        <p className="text-blue-700">Transition Probability Factor (s<sub>i</sub>) - Core Mover-Stayer Input</p>
      </div>
      
      {/* Flow Balance Track */}
      <div className="relative">
        {/* Track Background */}
        <div className="h-16 rounded-2xl overflow-hidden relative bg-gradient-to-r from-blue-100 via-white to-orange-100 border-2 border-white/40 shadow-lg">
          
          {/* Glowing Track Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-orange-400/20 animate-pulse"></div>
          
          {/* Left Side - Movers (Acute/Transient) */}
          <div className="absolute left-0 top-0 h-full flex items-center justify-center px-6" style={{ width: `${moverPercentage}%` }}>
            <div className="flex items-center gap-3 text-blue-800">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <PersonStanding className="w-6 h-6" />
              </motion.div>
              <div className="text-sm font-bold">
                <div>Acute/Transient</div>
                <div className="text-xs opacity-80">{moverPercentage}%</div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Stayers (Chronic/Observation) */}
          <div className="absolute right-0 top-0 h-full flex items-center justify-center px-6" style={{ width: `${stayerPercentage}%` }}>
            <div className="flex items-center gap-3 text-orange-800">
              <motion.div
                animate={{ 
                  y: [0, -2, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Bed className="w-6 h-6" />
              </motion.div>
              <div className="text-sm font-bold">
                <div>Chronic/Observation</div>
                <div className="text-xs opacity-80">{stayerPercentage}%</div>
              </div>
            </div>
          </div>
          
          {/* Divider Line */}
          <motion.div
            className="absolute top-0 h-full w-1 bg-white shadow-lg"
            style={{ left: `${moverPercentage}%` }}
            animate={{ 
              boxShadow: ['0 0 10px rgba(59, 130, 246, 0.5)', '0 0 20px rgba(59, 130, 246, 0.8)', '0 0 10px rgba(59, 130, 246, 0.5)']
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        {/* Interactive Slider Handle */}
        <div className="relative -mt-8">
          <input
            type="range"
            min={10}
            max={90}
            value={moverPercentage}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-8 appearance-none bg-transparent cursor-pointer"
            style={{
              background: 'transparent'
            }}
          />
          
          {/* Custom Handle */}
          <motion.div
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full shadow-2xl border-4 border-blue-500 flex items-center justify-center cursor-pointer"
            style={{ left: `${moverPercentage}%` }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0.7)', '0 0 0 15px rgba(59, 130, 246, 0)', '0 0 0 0 rgba(59, 130, 246, 0.7)']
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <ArrowRightLeft className="w-6 h-6 text-blue-600" />
          </motion.div>
        </div>
      </div>
      
      {/* Routing Probabilities Display */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <GlassCard className="p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <PersonStanding className="w-5 h-5 text-blue-600" />
            Mover Routing (P<sub>ij</sub>)
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-700">Triage → Treatment</span>
              <span className="text-blue-800 font-bold">{(0.8 + (moverPercentage / 100) * 0.15).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-700">Treatment → Discharge</span>
              <span className="text-blue-800 font-bold">{(0.7 + (moverPercentage / 100) * 0.25).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-700">Observation → Discharge</span>
              <span className="text-blue-800 font-bold">{(0.6 + (moverPercentage / 100) * 0.35).toFixed(2)}</span>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6">
          <h4 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
            <Bed className="w-5 h-5 text-orange-600" />
            Stayer Routing (P<sub>ij</sub>)
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-orange-700">Treatment → Observation</span>
              <span className="text-orange-800 font-bold">{(0.3 + (stayerPercentage / 100) * 0.65).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-orange-700">Observation → Stay</span>
              <span className="text-orange-800 font-bold">{(0.4 + (stayerPercentage / 100) * 0.55).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-orange-700">ER Minor → Remain</span>
              <span className="text-orange-800 font-bold">{(0.5 + (stayerPercentage / 100) * 0.45).toFixed(2)}</span>
            </div>
          </div>
        </GlassCard>
      </div>
      
      {/* Mathematical Explanation */}
      <GlassCard className="p-6 mt-6">
        <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Transition Probability Mathematics
        </h4>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h5 className="font-semibold text-blue-700 mb-2">Mover Behavior (s<sub>i</sub> = {(moverPercentage/100).toFixed(2)})</h5>
            <ul className="space-y-1 text-blue-600">
              <li>• High discharge probability from all nodes</li>
              <li>• Minimal observation time requirements</li>
              <li>• Fast throughput through system</li>
              <li>• P<sub>discharge</sub> ∝ s<sub>i</sub></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-orange-700 mb-2">Stayer Behavior (1-s<sub>i</sub> = {(stayerPercentage/100).toFixed(2)})</h5>
            <ul className="space-y-1 text-orange-600">
              <li>• High retention in observation nodes</li>
              <li>• Extended length of stay patterns</li>
              <li>• Bed blocking potential</li>
              <li>• P<sub>stay</sub> ∝ (1-s<sub>i</sub>)</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
const HeartRateLoader = () => (
  <div className="flex flex-col items-center gap-4">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Heart className="w-16 h-16 text-blue-500" fill="currentColor" />
    </motion.div>
    
    <div className="w-64 h-16 relative overflow-hidden bg-slate-800/20 rounded-lg backdrop-blur-sm">
      <svg width="100%" height="100%" viewBox="0 0 256 64" className="absolute inset-0">
        <motion.path
          d="M0,32 L50,32 L55,20 L65,44 L75,32 L100,32 L105,28 L115,36 L125,32 L256,32"
          stroke="#2563eb"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
        animate={{ x: [-100, 300] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    </div>
    
    <div className="text-blue-800 text-lg font-semibold">
      Initializing Mover-Stayer Analysis...
    </div>
  </div>
);
// Scenario definitions with enhanced visual properties
const SCENARIOS = {
  normal: {
    id: 'normal',
    name: 'Normal Operations',
    description: 'Standard ED patient flow with typical arrival patterns',
    icon: Activity,
    color: '#2a9d8f',
    gradient: 'linear-gradient(135deg, #2a9d8f, #20b2aa)',
    animation: 'pulse',
    characteristics: [
      'Steady arrival rate (8-12 patients/hour)',
      'Balanced patient mix across triage levels',
      'Standard resource utilization (60-75%)',
      'Predictable flow patterns'
    ],
    parameters: {
      arrivalRate: 10,
      moverProbability: 0.7,
      stayerProbability: 0.3,
      avgServiceTime: 45
    }
  },
  mci: {
    id: 'mci',
    name: 'Mass Casualty Incident',
    description: 'High-volume emergency with surge capacity activation',
    icon: Siren,
    color: '#C1121F',
    gradient: 'linear-gradient(135deg, #C1121F, #780000)',
    animation: 'flash',
    characteristics: [
      'Surge arrival rate (25-40 patients/hour)',
      'High proportion of critical cases',
      'Resource strain (>90% utilization)',
      'Emergency protocols activated'
    ],
    parameters: {
      arrivalRate: 35,
      moverProbability: 0.4,
      stayerProbability: 0.6,
      avgServiceTime: 60
    }
  },
  analysis: {
    id: 'analysis',
    name: 'Mover-Stayer Analysis',
    description: 'Patient profiling with behavioral pattern analysis',
    icon: ArrowRightLeft,
    color: '#669BBC',
    gradient: 'linear-gradient(135deg, #669BBC, #003049)',
    animation: 'flow',
    characteristics: [
      'Patient behavior classification',
      'Transition probability modeling',
      'Length of stay prediction',
      'Resource allocation optimization'
    ],
    parameters: {
      arrivalRate: 15,
      moverProbability: 0.65,
      stayerProbability: 0.35,
      avgServiceTime: 50
    }
  }
};

// Resource types for allocation
const RESOURCE_TYPES = [
  { id: 'doctors', name: 'Doctors', icon: Stethoscope, max: 8, active: 4 },
  { id: 'nurses', name: 'Nurses', icon: Users, max: 12, active: 6 },
  { id: 'beds', name: 'Trauma Bays', icon: Bed, max: 10, active: 5 }
];
export default function MoverStayerModel() {
  const [selectedScenario, setSelectedScenario] = useState('normal');
  const [patientProfiling, setPatientProfiling] = useState(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [activeTab, setActiveTab] = useState('system-load');
  
  // Interactive component states
  const [arrivalRate, setArrivalRate] = useState(12);
  const [moverPercentage, setMoverPercentage] = useState(70);
  const [priorityDistribution, setPriorityDistribution] = useState(null);
  const [activeResources, setActiveResources] = useState(3);
  const [resources, setResources] = useState(
    RESOURCE_TYPES.reduce((acc, resource) => ({
      ...acc,
      [resource.id]: { ...resource }
    }), {})
  );

  const currentScenario = SCENARIOS[selectedScenario];

  const handleScenarioSelect = useCallback((scenarioId) => {
    setSelectedScenario(scenarioId);
    if (scenarioId === 'analysis') {
      setPatientProfiling(true);
    }
    
    // Update parameters based on scenario
    const scenario = SCENARIOS[scenarioId];
    setArrivalRate(scenario.parameters.arrivalRate);
    setMoverPercentage(scenario.parameters.moverProbability * 100);
  }, []);

  const handleResourceChange = useCallback((newResources) => {
    setResources(newResources);
  }, []);

  const handlePriorityChange = useCallback((priorities) => {
    setPriorityDistribution(priorities);
  }, []);

  const handleActiveResourceChange = useCallback((count) => {
    setActiveResources(count);
  }, []);

  const togglePatientProfiling = useCallback(() => {
    setPatientProfiling(prev => !prev);
  }, []);

  const runSimulation = useCallback(async () => {
    setIsSimulationRunning(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setSimulationResults({
        scenario: selectedScenario,
        moverPercentage: currentScenario.parameters.moverProbability * 100,
        stayerPercentage: currentScenario.parameters.stayerProbability * 100,
        avgWaitTime: Math.random() * 30 + 15,
        throughput: Math.random() * 20 + 40,
        utilization: Math.random() * 30 + 60
      });
      setIsSimulationRunning(false);
    }, 3000);
  }, [selectedScenario, currentScenario]);
  return (
    <div 
      className="min-h-screen pt-16 relative overflow-hidden"
      style={{ background: THEME_COLORS.background }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/30 backdrop-blur-lg rounded-full border border-white/40 mb-8"
            >
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Mover-Stayer Model Analysis</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-blue-800">
              Emergency Department
              
            </h1>
           
          </motion.div>

          {/* Core Flow-Balance Slider - Primary Mover-Stayer Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <GlassCard className="p-8">
              <FlowBalanceSlider
                moverPercentage={moverPercentage}
                onChange={setMoverPercentage}
              />
            </GlassCard>
          </motion.div>

          {/* Glassmorphic Tabbed Configuration Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <GlassCard className="p-8">
              {/* Tab Navigation */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {TABS.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative px-6 py-3 rounded-xl font-semibold transition-all ${
                        isActive 
                          ? 'text-blue-800' 
                          : 'text-blue-600 hover:text-blue-800 hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5" />
                        <div className="text-left">
                          <div className="text-sm font-bold">{tab.label}</div>
                          <div className="text-xs opacity-80">{tab.description}</div>
                        </div>
                      </div>
                      
                      {isActive && (
                        <motion.div
                          layoutId="tab-indicator"
                          className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-xl border border-white/40"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'system-load' && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-blue-800 mb-2">System Load Configuration</h3>
                        <p className="text-blue-700">Configure λ values and NHPP intensity functions</p>
                      </div>
                      
                      <div className="grid lg:grid-cols-2 gap-8">
                        <GlassCard className="p-6">
                          <GlassSlider
                            label="Arrival Rate (λ)"
                            value={arrivalRate}
                            onChange={setArrivalRate}
                            min={5}
                            max={40}
                            unit="/hr"
                            icon={TrendingUp}
                          />
                        </GlassCard>
                        
                        <GlassCard className="p-6">
                          <GlassSlider
                            label="Peak Intensity Factor"
                            value={Math.round(arrivalRate * 1.5)}
                            onChange={(val) => setArrivalRate(Math.round(val / 1.5))}
                            min={8}
                            max={60}
                            unit="x"
                            icon={Zap}
                          />
                        </GlassCard>
                      </div>

                      <GlassCard className="p-6">
                        <div className="text-center">
                          <h4 className="text-lg font-semibold text-slate-800 mb-4">NHPP Intensity Preview</h4>
                          <div className="h-32 bg-white/20 rounded-lg flex items-center justify-center">
                            <motion.div
                              animate={{ 
                                scaleY: [1, 1.5, 0.8, 1.2, 1],
                                scaleX: [1, 0.9, 1.1, 0.95, 1]
                              }}
                              transition={{ 
                                duration: 3, 
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              className="w-full h-16 bg-gradient-to-r from-blue-500/50 to-blue-700/50 rounded"
                            />
                          </div>
                          <p className="text-slate-600 text-sm mt-2">
                            Dynamic intensity function based on arrival rate
                          </p>
                        </div>
                      </GlassCard>
                    </div>
                  )}
                  {activeTab === 'patient-dynamics' && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Patient Dynamics</h3>
                        <p className="text-slate-700">Mover-Stayer toggle and routing probabilities P<sub>ij</sub></p>
                      </div>

                      <div className="grid lg:grid-cols-2 gap-8">
                        <GlassCard className="p-6">
                          <GlassToggle
                            label="Enable Mover-Stayer Analysis"
                            enabled={patientProfiling}
                            onChange={togglePatientProfiling}
                            icon={ArrowRightLeft}
                          />
                          
                          <div className="mt-6">
                            <GlassSlider
                              label="Mover Percentage"
                              value={moverPercentage}
                              onChange={setMoverPercentage}
                              min={10}
                              max={90}
                              unit="%"
                              icon={Users}
                            />
                          </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                          <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Move3D className="w-5 h-5" />
                            Routing Probabilities
                          </h4>
                          
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white/20 rounded-lg">
                              <span className="text-slate-700">Triage → Lab</span>
                              <span className="text-slate-800 font-bold">0.45</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/20 rounded-lg">
                              <span className="text-slate-700">Triage → Treatment</span>
                              <span className="text-slate-800 font-bold">0.55</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/20 rounded-lg">
                              <span className="text-slate-700">Treatment → Observation</span>
                              <span className="text-slate-800 font-bold">{((100 - moverPercentage) / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/20 rounded-lg">
                              <span className="text-slate-700">Treatment → Discharge</span>
                              <span className="text-slate-800 font-bold">{(moverPercentage / 100).toFixed(2)}</span>
                            </div>
                          </div>
                        </GlassCard>
                      </div>
                      {patientProfiling && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="grid md:grid-cols-2 gap-6"
                        >
                          <GlassCard className="p-6">
                            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                              <UserCheck className="w-5 h-5 text-green-600" />
                              Mover Patients ({moverPercentage}%)
                            </h4>
                            <ul className="space-y-2 text-sm text-slate-700">
                              <li>• Quick decision makers</li>
                              <li>• Shorter length of stay</li>
                              <li>• Higher discharge probability</li>
                              <li>• Efficient resource utilization</li>
                            </ul>
                          </GlassCard>
                          
                          <GlassCard className="p-6">
                            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                              <UserX className="w-5 h-5 text-orange-600" />
                              Stayer Patients ({100 - moverPercentage}%)
                            </h4>
                            <ul className="space-y-2 text-sm text-slate-700">
                              <li>• Complex medical conditions</li>
                              <li>• Extended observation periods</li>
                              <li>• Higher admission probability</li>
                              <li>• Intensive resource requirements</li>
                            </ul>
                          </GlassCard>
                        </motion.div>
                      )}
                    </div>
                  )}
                  {activeTab === 'service-priority' && (
                    <ServiceLevelPriorityInputs 
                      moverPercentage={moverPercentage}
                      onPriorityChange={handlePriorityChange}
                      onResourceChange={handleActiveResourceChange}
                    />
                  )}
                  {activeTab === 'node-settings' && (
                    <InteractiveNodeSettings 
                      moverPercentage={moverPercentage}
                      stayerPercentage={100 - moverPercentage}
                    />
                  )}
                  {activeTab === 'resource-constraints' && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Resource Constraints</h3>
                        <p className="text-slate-700">Number of doctors and service rates μ</p>
                      </div>

                      <div className="grid lg:grid-cols-2 gap-8">
                        <GlassCard className="p-6">
                          <h4 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                            <Server className="w-5 h-5" />
                            Resource Allocation
                          </h4>
                          
                          {Object.entries(resources).map(([type, resource]) => {
                            const IconComponent = resource.icon;
                            
                            return (
                              <div key={type} className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="w-5 h-5 text-slate-700" />
                                    <span className="font-medium text-slate-800">{resource.name}</span>
                                  </div>
                                  <span className="text-sm text-slate-600">
                                    {resource.active}/{resource.max} Active
                                  </span>
                                </div>
                                
                                <GlassSlider
                                  label=""
                                  value={resource.active}
                                  onChange={(val) => {
                                    const newResources = { ...resources };
                                    newResources[type].active = Math.round(val);
                                    handleResourceChange(newResources);
                                  }}
                                  min={1}
                                  max={resource.max}
                                  unit=""
                                />
                              </div>
                            );
                          })}
                        </GlassCard>

                        <GlassCard className="p-6">
                          <h4 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Service Rates (μ)
                          </h4>
                          
                          <div className="space-y-4">
                            <GlassSlider
                              label="Triage Rate"
                              value={15}
                              onChange={() => {}}
                              min={5}
                              max={30}
                              unit="/hr"
                              icon={Clipboard}
                            />
                            
                            <GlassSlider
                              label="Treatment Rate"
                              value={8}
                              onChange={() => {}}
                              min={3}
                              max={15}
                              unit="/hr"
                              icon={Stethoscope}
                            />
                            
                            <GlassSlider
                              label="Lab Processing Rate"
                              value={12}
                              onChange={() => {}}
                              min={6}
                              max={20}
                              unit="/hr"
                              icon={FlaskConical}
                            />
                          </div>
                        </GlassCard>
                      </div>
                      <GlassCard className="p-6">
                        <h4 className="text-lg font-semibold text-slate-800 mb-4">Resource Utilization Preview</h4>
                        <div className="grid md:grid-cols-3 gap-4">
                          {Object.entries(resources).map(([type, resource]) => {
                            const utilization = (resource.active / resource.max) * 100;
                            const IconComponent = resource.icon;
                            
                            return (
                              <div key={type} className="text-center p-4 bg-white/10 rounded-lg">
                                <IconComponent className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                <div className="text-2xl font-bold text-blue-800 mb-1">
                                  {utilization.toFixed(0)}%
                                </div>
                                <div className="text-sm text-blue-700">{resource.name}</div>
                                <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-green-400 to-red-500"
                                    animate={{ width: `${utilization}%` }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </GlassCard>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </GlassCard>
          </motion.div>
          {/* Launch Button with Heart Rate Monitor Loading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-12"
          >
            <GlassCard className="p-8">
              {isSimulationRunning ? (
                <HeartRateLoader />
              ) : (
                <div>
                  <h3 className="text-2xl font-bold text-blue-800 mb-4">Ready to Launch Simulation</h3>
                  <p className="text-blue-700 mb-8">
                    All parameters configured. Click to start the Mover-Stayer analysis.
                  </p>
                  
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(220, 38, 38, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={runSimulation}
                    className="px-12 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-lg rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm flex items-center gap-3 mx-auto"
                  >
                    <Rocket className="w-6 h-6" />
                    Launch Simulation
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Pulse className="w-6 h-6" />
                    </motion.div>
                  </motion.button>
                </div>
              )}
            </GlassCard>
          </motion.div>
          {/* Simulation Results */}
          <AnimatePresence>
            {simulationResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8"
              >
                <GlassCard className="p-8">
                  <h3 className="text-3xl font-bold mb-8 text-blue-800 text-center">
                    Simulation Results - {SCENARIOS[simulationResults.scenario].name}
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <GlassCard className="p-6 text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                      <div className="text-4xl font-bold text-blue-800 mb-2">
                        {simulationResults.avgWaitTime.toFixed(1)}
                      </div>
                      <div className="text-blue-700">Average Wait Time (min)</div>
                    </GlassCard>
                    
                    <GlassCard className="p-6 text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-400" />
                      <div className="text-4xl font-bold text-blue-800 mb-2">
                        {simulationResults.throughput.toFixed(1)}
                      </div>
                      <div className="text-blue-700">Throughput (patients/hour)</div>
                    </GlassCard>
                    
                    <GlassCard className="p-6 text-center">
                      <Target className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                      <div className="text-4xl font-bold text-blue-800 mb-2">
                        {simulationResults.utilization.toFixed(1)}%
                      </div>
                      <div className="text-blue-700">Resource Utilization</div>
                    </GlassCard>
                  </div>

                  {patientProfiling && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <GlassCard className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <UserCheck className="w-8 h-8 text-green-400" />
                          <span className="text-xl font-bold text-blue-800">Mover Patients</span>
                        </div>
                        <div className="text-3xl font-bold text-green-400 mb-2">
                          {simulationResults.moverPercentage.toFixed(1)}%
                        </div>
                        <div className="text-blue-700">
                          Quick throughput, efficient resource usage
                        </div>
                      </GlassCard>
                      
                      <GlassCard className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <UserX className="w-8 h-8 text-orange-400" />
                          <span className="text-xl font-bold text-blue-800">Stayer Patients</span>
                        </div>
                        <div className="text-3xl font-bold text-orange-400 mb-2">
                          {simulationResults.stayerPercentage.toFixed(1)}%
                        </div>
                        <div className="text-blue-700">
                          Extended care, higher resource intensity
                        </div>
                      </GlassCard>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}