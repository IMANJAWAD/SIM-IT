import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Clock, 
  Zap, 
  BarChart3, 
  ArrowRight,
  CheckCircle,
  Play
} from 'lucide-react';
import HeroSection from '../components/HeroSection';
import FeatureCard from '../components/FeatureCard';

const Landing = () => {
  const features = [
    {
      icon: Activity,
      title: 'Poisson Process',
      description: 'Model patient arrivals using Non-Homogeneous Poisson Processes with time-varying intensity functions.'
    },
    {
      icon: TrendingUp,
      title: 'Markov Chain Analysis',
      description: 'M/M/c queueing theory for steady-state probability distributions and performance metrics.'
    },
    {
      icon: Users,
      title: 'Monte Carlo Simulation',
      description: 'Run thousands of iterations to generate confidence intervals and statistical insights.'
    },
    {
      icon: Clock,
      title: 'Real-time Metrics',
      description: 'Track wait times, utilization rates, and queue lengths with live visualizations.'
    },
    {
      icon: Zap,
      title: 'Sensitivity Analysis',
      description: 'Understand how parameter changes impact system performance and optimize resources.'
    },
    {
      icon: BarChart3,
      title: 'Decision Support',
      description: 'Data-driven recommendations for staffing, capacity planning, and workflow optimization.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Configure Parameters',
      description: 'Set arrival rates, service times, and number of servers to match your ED environment.'
    },
    {
      number: '02',
      title: 'Run Simulations',
      description: 'Execute discrete-event simulations with Monte Carlo methods for robust results.'
    },
    {
      number: '03',
      title: 'Analyze Results',
      description: 'Visualize performance metrics, state distributions, and optimization recommendations.'
    },
    {
      number: '04',
      title: 'Export & Share',
      description: 'Download reports in multiple formats to share insights with stakeholders.'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Simulations Run' },
    { value: '99.9%', label: 'Accuracy Rate' },
    { value: '<100ms', label: 'Response Time' },
    { value: '24/7', label: 'Availability' }
  ];

  return (
    <div className="min-h-screen bg-[#caf0f8]">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#0077b6] mb-4">
              Powerful Modeling Techniques
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Leverage advanced stochastic processes and simulation methods to optimize your emergency department operations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
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
      <section className="py-20 px-6 bg-gradient-to-br from-[#0077b6] to-[#00b4d8]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Four simple steps to transform your ED operations with data-driven insights.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 h-full">
                  <span className="text-6xl font-bold text-white/20 absolute top-4 right-6">
                    {step.number}
                  </span>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-[#f0f3bd] flex items-center justify-center mb-4">
                      <CheckCircle className="w-6 h-6 text-[#0077b6]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-white/70">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <ArrowRight className="w-8 h-8 text-white/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="text-5xl font-bold text-[#0077b6] mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-[#caf0f8]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-[#0077b6] to-[#00b4d8] rounded-3xl p-12 text-center relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#f0f3bd] rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Optimize Your ED?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Start running simulations today and discover insights that can transform your emergency department operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white text-[#0077b6] rounded-2xl font-semibold flex items-center gap-2 mx-auto sm:mx-0"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <Link to="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-2xl font-semibold flex items-center gap-2 mx-auto sm:mx-0"
                  >
                    <Play className="w-5 h-5" />
                    Try Demo
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

export default Landing;
