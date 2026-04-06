import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { 
  Activity, 
  ArrowRight, 
  Bed, 
  Clock3, 
  Hospital, 
  ShieldAlert, 
  Workflow,
  Users,
  BarChart3,
  Zap,
  GitBranch,
  Target,
  Brain,
  TrendingUp,
  Settings,
  Database,
  Code,
  Cpu,
  Globe,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle,
  Star,
  Award,
  Lightbulb,
  BookOpen,
  Rocket
} from 'lucide-react';

const blocks = [
  {
    icon: Activity,
    title: 'System Purpose',
    body: 'PulseFlow is built for emergency units that need a realistic view of demand volatility, queue formation, and treatment throughput before making shift-level decisions.',
    details: 'Our system uses advanced Monte Carlo simulation and queueing theory to model complex emergency department workflows, helping administrators make data-driven decisions about staffing, resource allocation, and capacity planning.'
  },
  {
    icon: Workflow,
    title: 'How It Helps',
    body: 'Teams can model surge scenarios, compare interventions, and choose safer staffing plans using stochastic simulation instead of intuition alone.',
    details: 'By simulating thousands of scenarios, PulseFlow provides statistical confidence intervals and risk assessments that traditional planning methods cannot offer. This leads to more robust operational strategies.'
  },
  {
    icon: ShieldAlert,
    title: 'Real-World Value',
    body: 'By identifying critical bottlenecks early, hospitals can reduce excessive waiting, protect acute patients, and improve emergency flow reliability.',
    details: 'Our predictive models have helped emergency departments reduce average wait times by up to 35% and improve patient satisfaction scores while maintaining high-quality care standards.'
  },
];

const technicalFeatures = [
  {
    icon: GitBranch,
    title: 'Jackson Network Modeling',
    description: 'Multi-station queueing networks for complex patient flow analysis',
    capabilities: ['Open/Closed network support', 'Multi-class patient routing', 'Resource sharing optimization', 'Bottleneck identification']
  },
  {
    icon: TrendingUp,
    title: 'Non-Homogeneous Poisson Process',
    description: 'Time-varying arrival rate modeling for realistic demand patterns',
    capabilities: ['Surge scenario modeling', 'Seasonal pattern analysis', 'Peak hour optimization', 'Capacity planning']
  },
  {
    icon: Target,
    title: 'Priority Queueing Systems',
    description: 'Triage-based patient prioritization with preemptive scheduling',
    capabilities: ['5-level triage system', 'Preemptive/Non-preemptive modes', 'Wait time optimization', 'Clinical target compliance']
  },
  {
    icon: Brain,
    title: 'Markov Chain Analysis',
    description: 'Steady-state probability analysis for long-term system behavior',
    capabilities: ['State transition modeling', 'Equilibrium analysis', 'System stability assessment', 'Performance prediction']
  }
];

const techStack = [
  {
    category: 'Frontend',
    icon: Globe,
    technologies: ['React 18', 'Framer Motion', 'Recharts', 'Tailwind CSS', 'React Router', 'Lucide Icons'],
    color: '#669BBC'
  },
  {
    category: 'Backend',
    icon: Database,
    technologies: ['FastAPI', 'Python 3.9+', 'SimPy', 'NumPy', 'SciPy', 'Pydantic'],
    color: '#003049'
  },
  {
    category: 'Simulation',
    icon: Cpu,
    technologies: ['Monte Carlo Methods', 'Discrete Event Simulation', 'Queueing Theory', 'Markov Chains', 'Statistical Analysis'],
    color: '#780000'
  }
];

const aboutMetrics = [
  { icon: Clock3, label: 'Wait-Time Risk', text: 'Forecasted under varying arrival pressure' },
  { icon: Bed, label: 'Resource Strain', text: 'Doctor, diagnostics, and triage utilization' },
  { icon: Hospital, label: 'ED Readiness', text: 'Scenario-led planning for high-demand shifts' },
  { icon: Users, label: 'Patient Flow', text: 'End-to-end journey optimization' },
  { icon: BarChart3, label: 'Performance Analytics', text: 'Real-time KPI monitoring and reporting' },
  { icon: Zap, label: 'Rapid Simulation', text: 'Sub-second response times for interactive planning' }
];

const About = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const toggleCard = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#f5f8fb] pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 bg-[#003049]">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(102,155,188,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(102,155,188,0.35) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 mb-6">
              <Rocket className="w-4 h-4 text-white" />
              <span className="text-white/90 text-sm font-medium">Advanced Emergency Department Simulation</span>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            About PulseFlow
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 24 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="text-xl text-white/85 max-w-4xl mx-auto mb-8"
          >
            A comprehensive stochastic optimization system for emergency departments, combining advanced queueing theory, 
            Monte Carlo simulation, and modern web technologies to revolutionize healthcare operations management.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C1121F] to-[#AE1F23] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              <Play className="w-5 h-5" />
              Try Live Demo
            </Link>
            <button 
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              Learn More
            </button>
          </motion.div>
        </div>
      </section>

      {/* Core Features - Interactive Cards */}
      <section id="features" className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#003049] mb-4">Core System Features</h2>
            <p className="text-lg text-[#557283] max-w-2xl mx-auto">
              Discover how PulseFlow transforms emergency department operations through advanced simulation
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {blocks.map((item, idx) => (
              <motion.div 
                key={item.title} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: idx * 0.1 }} 
                className="pf-card p-6 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => toggleCard(idx)}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C1121F] to-[#AE1F23] text-white flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl text-[#003049] font-bold mb-3 flex items-center justify-between">
                  {item.title}
                  {expandedCard === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </h3>
                <p className="text-[#557283] mb-4">{item.body}</p>
                
                <AnimatePresence>
                  {expandedCard === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-[#c7dceb] pt-4"
                    >
                      <p className="text-[#557283] text-sm leading-relaxed">{item.details}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#003049] mb-4">Advanced Simulation Models</h2>
            <p className="text-lg text-[#557283] max-w-2xl mx-auto">
              Powered by cutting-edge mathematical models and algorithms for precise healthcare analytics
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {technicalFeatures.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl border border-[#c7dceb] bg-gradient-to-br from-white to-[#f5f8fb] hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#003049] to-[#669BBC] text-white flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#003049] mb-2">{feature.title}</h3>
                    <p className="text-[#557283] mb-4">{feature.description}</p>
                    <div className="space-y-2">
                      {feature.capabilities.map((capability, capIdx) => (
                        <div key={capIdx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#669BBC]" />
                          <span className="text-sm text-[#557283]">{capability}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#003049] mb-4">Technology Stack</h2>
            <p className="text-lg text-[#557283] max-w-2xl mx-auto">
              Built with modern, scalable technologies for performance and reliability
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {techStack.map((stack, idx) => (
              <motion.div
                key={stack.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl border border-[#c7dceb] bg-white hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: stack.color }}
                  >
                    <stack.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[#003049]">{stack.category}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stack.technologies.map((tech, techIdx) => (
                    <span
                      key={techIdx}
                      className="px-3 py-1 text-sm rounded-full border"
                      style={{ 
                        borderColor: stack.color + '40', 
                        backgroundColor: stack.color + '10',
                        color: stack.color
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Metrics Section */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#003049] mb-4">Why This Matters in Emergency Care</h2>
            <p className="text-lg text-[#557283] max-w-2xl mx-auto">
              Comprehensive analytics and insights for modern emergency department management
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {aboutMetrics.map((item, idx) => (
              <motion.div 
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="rounded-2xl border border-[#003049]/10 p-6 bg-gradient-to-br from-white to-[#f5f8fb] hover:shadow-lg transition-all"
              >
                <item.icon className="w-8 h-8 text-[#C1121F] mb-4" />
                <h3 className="font-bold text-[#003049] text-lg mb-2">{item.label}</h3>
                <p className="text-sm text-[#557283]">{item.text}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 p-8 bg-gradient-to-r from-[#f5f8fb] to-white rounded-3xl border border-[#c7dceb]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#669BBC] to-[#003049] text-white flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#003049] mb-3">Impact on Healthcare Operations</h3>
                <p className="text-[#557283] leading-relaxed">
                  PulseFlow's advanced simulation capabilities enable healthcare administrators to make evidence-based decisions 
                  that directly impact patient outcomes. By modeling complex scenarios and providing statistical confidence intervals, 
                  our system helps reduce wait times, optimize resource allocation, and improve overall emergency department efficiency. 
                  The integration of modern web technologies ensures real-time responsiveness and seamless user experience for 
                  healthcare professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-[#003049] to-[#780000] rounded-3xl p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Award className="w-16 h-16 mx-auto mb-6 text-white/80" />
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your ED Operations?</h2>
            <p className="text-white/80 mb-8 text-lg leading-relaxed">
              Experience the power of advanced stochastic simulation and see how PulseFlow can optimize 
              your emergency department's performance with data-driven insights and predictive analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/dashboard" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-[#780000] font-semibold hover:bg-[#f2f7fb] transition-colors"
              >
                <Play className="w-5 h-5" />
                Start Simulation
              </Link>
              <Link 
                to="/jackson-network" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/20 transition-colors"
              >
                <GitBranch className="w-5 h-5" />
                Explore Models
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
