import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Activity, HeartPulse } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#003049]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(174,31,35,0.45),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(102,155,188,0.35),transparent_30%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#003049]/20 to-[#003049]" />
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-[15%] w-64 h-64 bg-gradient-to-br from-[#C1121F]/30 to-[#AE1F23]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 right-[10%] w-80 h-80 bg-gradient-to-br from-[#669BBC]/40 to-[#C1121F]/20 rounded-full blur-3xl"
        />
        <div className="absolute inset-0 opacity-[0.14]" style={{ backgroundImage: 'linear-gradient(rgba(102,155,188,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(102,155,188,0.35) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/15 backdrop-blur-sm rounded-full shadow-lg mb-8"
        >
          <HeartPulse className="w-4 h-4 text-[#669BBC] pf-pulse rounded-full" />
          <span className="text-sm font-medium text-white/90">
            Live Emergency Operations Simulator
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-white via-[#669BBC] to-white bg-clip-text text-transparent">
            PulseFlow
          </span>
          <br />
          <span className="text-2xl sm:text-3xl lg:text-4xl text-white/90">
            A Stochastic Optimization System for Emergency Departments
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Model arrivals, triage pressure, and service bottlenecks with practical stochastic workflows built for hospital command teams.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group pf-btn pf-btn-primary flex items-center gap-2 px-8 py-4"
            >
              <Activity className="w-5 h-5" />
              Login to Command Center
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>

          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="pf-btn pf-btn-secondary flex items-center gap-2 px-8 py-4"
            >
              <Play className="w-5 h-5" />
              Create Access
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { label: 'Patient Streams', value: '24h', unit: 'modeled' },
            { label: 'Triage Paths', value: '5', unit: 'prioritized' },
            { label: 'Forecast Runs', value: '1000+', unit: 'per scenario' },
            { label: 'Ops Insight', value: 'Live', unit: 'dashboard' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg"
            >
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-[#669BBC] uppercase tracking-wide">{stat.unit}</div>
              <div className="text-sm text-white/80 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-[#C1121F] rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
