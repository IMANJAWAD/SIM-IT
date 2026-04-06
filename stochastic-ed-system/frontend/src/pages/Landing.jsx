import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Clock, 
  Zap, 
  BarChart3, 
  ArrowRight,
  Play,
  Heart,
  AlertTriangle,
  Stethoscope,
  Ambulance,
  Gauge
} from 'lucide-react';

// ==================== MAIN LANDING COMPONENT (NO NAVBAR HERE) ====================
const Landing = () => {
  const features = [
    {
      icon: Activity,
      title: 'Arrival Forecasting',
      description: 'Use stochastic arrival curves to anticipate patient surges across triage categories and shifts.',
    },
    {
      icon: TrendingUp,
      title: 'Queue State Modeling',
      description: 'Estimate bed pressure, queue depth, and throughput using Markov chain state transitions.',
    },
    {
      icon: Users,
      title: 'Scenario Replications',
      description: 'Run Monte Carlo replications to compare interventions and confidence ranges before deployment.',
    },
    {
      icon: Clock,
      title: 'Operational Telemetry',
      description: 'Track live wait-time trends, bottlenecks, and resource load from a single command panel.',
    },
    {
      icon: Zap,
      title: 'Sensitivity Testing',
      description: 'Stress-test staffing, service rates, and triage mixes to identify safe operating windows.',
    },
    {
      icon: BarChart3,
      title: 'Decision Support',
      description: 'Turn simulation outputs into actionable shifts, staffing plans, and escalation thresholds.',
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Configure Parameters',
      description: 'Configure realistic ED assumptions such as staffing, service speed, and triage proportions.',
      icon: Stethoscope
    },
    {
      number: '02',
      title: 'Run Simulations',
      description: 'Execute simulations in seconds and track the system response under demand uncertainty.',
      icon: Activity
    },
    {
      number: '03',
      title: 'Analyze Results',
      description: 'Review pressure points and compare queue behavior across intervention strategies.',
      icon: Gauge
    },
    {
      number: '04',
      title: 'Export & Share',
      description: 'Export visual reports and simulation snapshots for medical leadership review.',
      icon: Ambulance
    }
  ];

  const stats = [
    { value: '24h', label: 'Shift-aware modeling', icon: Clock },
    { value: '5', label: 'Priority levels', icon: AlertTriangle },
    { value: '1000+', label: 'Replications per run', icon: TrendingUp },
    { value: 'Live', label: 'Operational dashboard', icon: Activity }
  ];

  // Animated counter component
  const AnimatedCounter = ({ value }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      let start = 0;
      const end = value === '24h' ? 24 : value === '5' ? 5 : value === '1000+' ? 1000 : 0;
      if (end === 0) return;
      
      const duration = 2000;
      const increment = end / (duration / 16);
      let current = start;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }, [value]);
    
    const displayValue = value === '1000+' ? `${count}+` : value === '24h' ? `${count}h` : value === '5' ? count : count;
    
    return <>{displayValue}</>;
  };

  return (
    <div className="min-h-screen bg-[#f5f8fb] bg-[radial-gradient(circle_at_20%_20%,rgba(193,18,31,0.03),transparent_40%)]">
      {/* NO NAVBAR HERE - It's in App.jsx globally */}
      
      {/* Hero Section - Dynamic ED Command Center */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#003049] via-[#780000] to-[#AE1F23] pt-24 md:pt-28">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="ekg-pattern" x="0" y="0" width="80" height="60" patternUnits="userSpaceOnUse">
                <path d="M0,30 L15,30 L20,10 L30,50 L40,30 L55,30 L60,15 L70,45 L80,30" 
                      stroke="#669BBC" fill="none" strokeWidth="1.5" className="ekg-line"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ekg-pattern)"/>
          </svg>
        </div>
        
        {/* Floating heartbeats */}
        <div className="absolute top-20 right-20 w-32 h-32 opacity-20">
          <Heart className="w-full h-full text-white animate-pulse" />
        </div>
        <div className="absolute bottom-20 left-20 w-24 h-24 opacity-15">
          <Activity className="w-full h-full text-[#669BBC] heartbeat-animation" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            >
              
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight">
                PulseFlow
                <span className="text-[#669BBC]"> ER</span>
              </h1>
              <p className="text-xl text-white/90 mt-6 max-w-lg leading-relaxed">
                Stochastic simulation and live operational intelligence for Emergency Departments. 
                Anticipate surges, optimize flow, and save critical time.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-8">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "#C1121F", color: "white" }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-white text-[#780000] font-bold rounded-xl flex items-center gap-2 shadow-xl transition-all"
                  >
                    Launch Command Center
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Live Demo
                  </motion.button>
                </Link>
              </div>
              
              {/* Live stats ticker */}
              <div className="flex gap-6 mt-8 pt-6 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#C1121F] rounded-full heartbeat-animation"></div>
                  <span className="text-white/70 text-sm">Beds: 42/48</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#669BBC] rounded-full animate-pulse"></div>
                  <span className="text-white/70 text-sm">Wait: 11min</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#AE1F23] rounded-full animate-pulse"></div>
                  <span className="text-white/70 text-sm">Triage 1: 3</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="relative"
            >
              {/* Live EKG Monitor with Real-Time Waveform */}
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-[#669BBC]/40 shadow-2xl">
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#C1121F] heartbeat-animation" />
                    <span className="text-white text-xs font-mono font-bold">LIVE TELEMETRY</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-[#669BBC] text-xs font-mono">HR: 78 BPM</span>
                    <span className="text-[#AE1F23] text-xs font-mono">PRIORITY ALERT</span>
                  </div>
                </div>
                <RealTimeWaveform />
                <div className="flex justify-between mt-3 px-2 text-white/60 text-xs font-mono">
                  <span>00:00:32</span>
                  <span>REAL-TIME DATA STREAM</span>
                  <span>00:00:47</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Smooth gradient transition to next section */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#f5f8fb]" />
        
        {/* Glow divider line */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C1121F] to-transparent opacity-60 blur-sm" />
      </section>

      {/* Rest of your sections remain the same... */}
      <section className="py-24 px-6 relative overflow-hidden bg-[#f5f8fb]">
        <div className="absolute inset-0 bg-monitor-grid opacity-5 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#C1121F]/10 px-4 py-2 rounded-full mb-4">
              <Activity className="w-4 h-4 text-[#C1121F]" />
              <span className="text-[#C1121F] font-semibold text-sm uppercase tracking-wide">Core Capabilities</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#003049] mb-4">
              Emergency Operations
              <span className="text-[#C1121F]"> Intelligence</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#780000] to-[#C1121F] mx-auto rounded-full"></div>
            <p className="text-lg text-[#557283] max-w-2xl mx-auto mt-5">
              PulseFlow translates stochastic modeling into practical hospital decisions for patient flow and resource stability.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCardEnhanced
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#003049] via-[#001f2f] to-[#780000] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%">
            {[...Array(5)].map((_, i) => (
              <path key={i} d="M0,100 L200,100 L250,50 L300,150 L400,100 L600,100" 
                    stroke="#669BBC" fill="none" strokeWidth="2" 
                    className="moving-ekg" style={{ animationDelay: `${i * 0.5}s` }}/>
            ))}
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Clinical Workflow
            </h2>
            <p className="text-lg text-[#669BBC] max-w-2xl mx-auto font-semibold">
              Four steps to transform your ED operations with data-driven insights
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <StepCardEnhanced
                key={index}
                number={step.number}
                title={step.title}
                description={step.description}
                icon={step.icon}
                delay={index * 0.15}
                isLast={index === steps.length - 1}
              />
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#f5f8fb] to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-[#f5f8fb] relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C1121F]/5 via-transparent to-[#669BBC]/5"></div>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center p-6 rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all border border-[#C1121F]/10"
              >
                <div className="w-14 h-14 rounded-xl bg-[#C1121F]/10 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-7 h-7 text-[#C1121F]" />
                </div>
                <h3 className="text-5xl font-black text-[#780000] mb-2">
                  {stat.value === 'Live' ? (
                    <span className="inline-flex items-center gap-2">
                      LIVE
                      <div className="w-2 h-2 bg-[#C1121F] rounded-full heartbeat-animation"></div>
                    </span>
                  ) : (
                    <AnimatedCounter value={stat.value} />
                  )}
                </h3>
                <p className="text-[#557283] font-semibold">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-[#f2f6fa]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#003049] via-[#780000] to-[#C1121F]"></div>
            
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%">
                <pattern id="heartbeat-cta" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M0,50 L25,50 L30,30 L40,70 L50,50 L75,50 L80,35 L90,65 L100,50" 
                        stroke="white" fill="none" strokeWidth="2" className="ekg-line"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#heartbeat-cta)"/>
              </svg>
            </div>
            
            <div className="relative z-10 p-12 text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Heart className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Command Your ED With Confidence
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Launch PulseFlow, run scenario-based stress tests, and improve emergency throughput 
                before real-world bottlenecks appear.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "#C1121F", color: "white" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white text-[#780000] rounded-xl font-bold flex items-center gap-2 mx-auto sm:mx-0 shadow-lg"
                  >
                    Login to Command Deck
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "#669BBC" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold flex items-center gap-2 mx-auto sm:mx-0"
                  >
                    <Play className="w-5 h-5" />
                    Start Free Simulation
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// ==================== REAL-TIME WAVEFORM COMPONENT ====================
const RealTimeWaveform = () => {
  const canvasRef = useRef(null);
  const dataPointsRef = useRef([]);
  const timeRef = useRef(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    let animationId;
    
    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      dataPointsRef.current = new Array(width).fill(height / 2);
    };
    
    window.addEventListener('resize', resize);
    resize();
    
    const generateEKGSample = (time) => {
      const t = time % 1;
      
      let pWave = 0;
      if (t > 0.12 && t < 0.20) {
        const pPos = (t - 0.12) / 0.08;
        pWave = Math.sin(pPos * Math.PI) * 0.15;
      }
      
      let qrsComplex = 0;
      if (t > 0.35 && t < 0.43) {
        const qrsPos = (t - 0.35) / 0.08;
        qrsComplex = Math.sin(qrsPos * Math.PI) * 1.2;
        if (qrsPos < 0.2) qrsComplex *= 1.5;
        if (qrsPos > 0.8) qrsComplex *= 0.8;
      }
      
      let tWave = 0;
      if (t > 0.55 && t < 0.75) {
        const tPos = (t - 0.55) / 0.20;
        tWave = Math.sin(tPos * Math.PI) * 0.35;
      }
      
      let uWave = 0;
      if (t > 0.78 && t < 0.88) {
        const uPos = (t - 0.78) / 0.10;
        uWave = Math.sin(uPos * Math.PI) * 0.08;
      }
      
      const noise = (Math.sin(time * 50) * 0.02) + (Math.sin(time * 120) * 0.01);
      
      return pWave + qrsComplex + tWave + uWave + noise;
    };
    
    const draw = (timestamp) => {
      if (!ctx) return;
      
      ctx.fillStyle = '#001a2a';
      ctx.fillRect(0, 0, width, height);
      
      ctx.beginPath();
      ctx.strokeStyle = '#1a3a4a';
      ctx.lineWidth = 0.5;
      
      for (let x = 0; x <= width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= height; y += 40) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      const centerY = height / 2;
      const amplitude = height * 0.35;
      
      const newValue = generateEKGSample(timeRef.current) * amplitude;
      const newY = centerY - newValue;
      
      dataPointsRef.current.push(newY);
      if (dataPointsRef.current.length > width) {
        dataPointsRef.current.shift();
      }
      
      ctx.beginPath();
      ctx.strokeStyle = '#C1121F';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#C1121F';
      
      for (let x = 0; x < dataPointsRef.current.length; x++) {
        const y = dataPointsRef.current[x];
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
      ctx.lineTo(dataPointsRef.current.length - 1, height);
      ctx.lineTo(0, height);
      ctx.fillStyle = 'rgba(193, 18, 31, 0.1)';
      ctx.fill();
      
      ctx.shadowBlur = 0;
      
      const scanPosition = (timestamp % 3000) / 3000 * width;
      ctx.beginPath();
      ctx.moveTo(scanPosition, 0);
      ctx.lineTo(scanPosition, height);
      ctx.strokeStyle = '#669BBC';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      const heartRate = 78 + Math.sin(timestamp * 0.005) * 2;
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#669BBC';
      ctx.fillText(`${Math.floor(heartRate)} BPM`, width - 70, 25);
      
      ctx.fillStyle = '#C1121F';
      ctx.fillText('Lead II', 10, 25);
      
      timeRef.current += 0.008;
      if (timeRef.current > 1) {
        timeRef.current = 0;
      }
      
      animationId = requestAnimationFrame(draw);
    };
    
    animationId = requestAnimationFrame(draw);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  
  return <canvas ref={canvasRef} style={{ width: '100%', height: '180px', borderRadius: '12px' }} />;
};

// ==================== ENHANCED FEATURE CARD ====================
const FeatureCardEnhanced = ({ icon: Icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-2xl p-7 shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#C1121F] to-[#669BBC] group-hover:w-2 transition-all"></div>
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#C1121F]/10 to-[#669BBC]/10 heartbeat-animation">
          <Icon className="w-7 h-7 text-[#C1121F]" />
        </div>
        <h3 className="text-xl font-black text-[#003049] tracking-tight">{title}</h3>
      </div>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
};

// ==================== ENHANCED STEP CARD ====================
const StepCardEnhanced = ({ number, title, description, icon: Icon, delay, isLast }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -5 }}
      className="relative group"
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-[#669BBC]/60 transition-all h-full">
        <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-[#C1121F] to-[#780000] flex items-center justify-center text-white font-black text-lg shadow-lg">
          {number}
        </div>
        <div className="mt-4">
          <div className="w-12 h-12 rounded-xl bg-[#669BBC]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6 text-[#669BBC]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-white/70 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
      {!isLast && (
        <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20">
          <ArrowRight className="w-6 h-6 text-[#C1121F] animate-pulse" />
        </div>
      )}
    </motion.div>
  );
};

// Add global styles for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes heartbeat-animation {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    25% { transform: scale(1.2); opacity: 1; }
    35% { transform: scale(1.1); }
    45% { transform: scale(1.25); }
    55% { transform: scale(1.05); }
  }
  .heartbeat-animation {
    animation: heartbeat-animation 1.2s ease-in-out infinite;
    transform-origin: center;
  }
  @keyframes ekg-line {
    0% { stroke-dashoffset: 200; }
    100% { stroke-dashoffset: 0; }
  }
  .ekg-line {
    stroke-dasharray: 200;
    stroke-dashoffset: 200;
    animation: ekg-line 1.5s linear infinite;
  }
  @keyframes moving-ekg {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .moving-ekg {
    animation: moving-ekg 3s linear infinite;
  }
  .bg-monitor-grid {
    background-image: radial-gradient(circle at 1px 1px, rgba(192,18,31,0.1) 1px, transparent 1px);
    background-size: 24px 24px;
  }
`;
document.head.appendChild(style);

export default Landing;