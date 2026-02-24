import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#caf0f8] via-white to-[#e0f7fa]">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-[15%] w-64 h-64 bg-gradient-to-br from-[#00b4d8]/30 to-[#0077b6]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 right-[10%] w-80 h-80 bg-gradient-to-br from-[#f0f3bd]/50 to-[#00b4d8]/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 right-[25%] w-40 h-40 bg-gradient-to-br from-[#0077b6]/20 to-transparent rounded-full blur-2xl"
        />

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#0077b6 1px, transparent 1px), linear-gradient(90deg, #0077b6 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-8"
        >
          <Sparkles className="w-4 h-4 text-[#00b4d8]" />
          <span className="text-sm font-medium text-gray-700">
            Academic-Grade Stochastic Simulation
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-[#0077b6] via-[#00b4d8] to-[#0077b6] bg-clip-text text-transparent">
            SIMIT
          </span>
          <br />
          <span className="text-3xl sm:text-4xl lg:text-5xl">
            Intelligent Stochastic Simulation Platform
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Advanced emergency department optimization using{' '}
          <span className="font-semibold text-[#0077b6]">Poisson Process</span>,{' '}
          <span className="font-semibold text-[#00b4d8]">Markov Chain</span>, and{' '}
          <span className="font-semibold text-[#0077b6]">Monte Carlo</span> modeling
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white font-semibold rounded-2xl shadow-xl shadow-[#0077b6]/30 hover:shadow-2xl hover:shadow-[#0077b6]/40 transition-all duration-300"
            >
              <Play className="w-5 h-5" />
              Launch Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>

          <Link to="/about">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-4 bg-white text-[#0077b6] font-semibold rounded-2xl shadow-lg hover:shadow-xl border-2 border-[#0077b6]/20 hover:border-[#0077b6]/40 transition-all duration-300"
            >
              View Features
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { label: 'Simulation Speed', value: '1000+', unit: 'runs/min' },
            { label: 'Accuracy', value: '99.2%', unit: 'validated' },
            { label: 'Parameters', value: '8+', unit: 'configurable' },
            { label: 'Analysis', value: 'Real-time', unit: 'insights' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg"
            >
              <div className="text-2xl font-bold text-[#0077b6]">{stat.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">{stat.unit}</div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-[#0077b6]/30 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-[#0077b6] rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
