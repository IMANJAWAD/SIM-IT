import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  BarChart3, 
  TrendingUp, 
  Shuffle,
  Target,
  Lightbulb,
  BookOpen,
  Github,
  Mail,
  ArrowRight
} from 'lucide-react';

const About = () => {
  const modelingTechniques = [
    {
      icon: Activity,
      title: 'Poisson Process',
      description: 'Patient arrivals in an ED are modeled using Poisson processes, which capture the random nature of arrivals over time. We implement Non-Homogeneous Poisson Processes (NHPP) to account for time-varying arrival rates throughout the day.',
      formula: 'P(N(t) = k) = (λt)^k e^{-λt} / k!',
      details: [
        'Exponential inter-arrival times',
        'Time-varying intensity λ(t)',
        'Memoryless property',
        'Thinning algorithm for NHPP'
      ]
    },
    {
      icon: Shuffle,
      title: 'Markov Chain Analysis',
      description: 'M/M/c queueing theory provides steady-state analysis of the ED system. This allows us to compute equilibrium probabilities, expected queue lengths, and waiting times analytically.',
      formula: 'π_n = (λ/μ)^n / n! · π_0  for n ≤ c',
      details: [
        'Steady-state probability distribution',
        'Erlang-C formula for delays',
        'System stability analysis (ρ < 1)',
        'Long-term behavior prediction'
      ]
    },
    {
      icon: TrendingUp,
      title: 'Monte Carlo Simulation',
      description: 'We run thousands of simulation replications to estimate performance metrics with confidence intervals. This helps quantify uncertainty and provides robust statistical insights.',
      formula: 'CI = x̄ ± t_{α/2,n-1} · s/√n',
      details: [
        '95% confidence intervals',
        'Variance reduction techniques',
        'Warm-up period handling',
        'Replication independence'
      ]
    },
    {
      icon: BarChart3,
      title: 'Discrete-Event Simulation',
      description: 'Using SimPy, we model the ED as a network of queues with patients moving through triage, examination, diagnostics, and treatment stages. Each event triggers state changes in the system.',
      formula: 'Event-driven: {arrival, service_start, service_end}',
      details: [
        'Resource contention modeling',
        'Priority-based queuing',
        'Patient pathway routing',
        'Real-time metrics collection'
      ]
    }
  ];

  const teamMembers = [
    {
      name: 'Simulation Engine',
      role: 'SimPy + Python',
      description: 'High-performance discrete-event simulation with resource management and event scheduling.'
    },
    {
      name: 'API Backend',
      role: 'FastAPI',
      description: 'Async REST API with automatic OpenAPI documentation and type validation.'
    },
    {
      name: 'Analytics Engine',
      role: 'NumPy + SciPy',
      description: 'Numerical computing for statistical analysis, matrix operations, and Markov chain solving.'
    },
    {
      name: 'Frontend',
      role: 'React + Vite',
      description: 'Modern UI with glassmorphism design, interactive charts, and real-time updates.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#caf0f8]">
      {/* Hero Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-72 h-72 bg-[#00b4d8]/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-[#0077b6]/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#0077b6] to-[#00b4d8] rounded-3xl flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0077b6] mb-4">
              About SIMIT
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              <strong>S</strong>imulation <strong>I</strong>ntelligence & <strong>M</strong>odeling <strong>I</strong>nterface <strong>T</strong>ool — 
              A comprehensive stochastic simulation system for optimizing hospital emergency department operations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f0f3bd] flex items-center justify-center">
                  <Target className="w-6 h-6 text-[#0077b6]" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Our Mission</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Emergency departments face constant challenges: unpredictable patient arrivals, 
                limited resources, and the need to provide timely care. SIMIT brings together 
                advanced stochastic modeling techniques to help healthcare administrators make 
                data-driven decisions.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By simulating thousands of scenarios, SIMIT helps predict system behavior, 
                identify bottlenecks, and optimize resource allocation — ultimately improving 
                patient outcomes and operational efficiency.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-[#0077b6] to-[#00b4d8] rounded-3xl p-8 text-white"
            >
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Key Features</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f0f3bd] mt-2" />
                  <span>Real-time discrete-event simulation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f0f3bd] mt-2" />
                  <span>M/M/c queueing theory analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f0f3bd] mt-2" />
                  <span>Monte Carlo confidence intervals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f0f3bd] mt-2" />
                  <span>Sensitivity analysis & optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f0f3bd] mt-2" />
                  <span>Interactive visualizations</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modeling Techniques Section */}
      <section className="py-20 px-6 bg-[#caf0f8]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#0077b6] mb-4">Modeling Techniques</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              SIMIT combines multiple stochastic modeling approaches for comprehensive analysis.
            </p>
          </motion.div>

          <div className="space-y-8">
            {modelingTechniques.map((technique, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 border border-white/50"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-2/3">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0077b6] to-[#00b4d8] flex items-center justify-center">
                        <technique.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">{technique.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{technique.description}</p>
                    <div className="bg-gray-100 rounded-xl p-4 font-mono text-sm text-[#0077b6]">
                      {technique.formula}
                    </div>
                  </div>
                  <div className="md:w-1/3 bg-[#caf0f8] rounded-2xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Key Concepts:</h4>
                    <ul className="space-y-2">
                      {technique.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00b4d8] mt-2" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#0077b6] to-[#00b4d8]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Technology Stack</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Built with modern, high-performance technologies for reliable simulations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20"
              >
                <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-[#f0f3bd] font-medium mb-3">{member.role}</p>
                <p className="text-white/70 text-sm">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Ready to Try SIMIT?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
              Start running simulations and discover insights that can transform your emergency department operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white rounded-2xl font-semibold flex items-center gap-2 shadow-lg shadow-[#0077b6]/30 mx-auto sm:mx-0"
                >
                  Open Dashboard
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gray-800 text-white rounded-2xl font-semibold flex items-center gap-2 mx-auto sm:mx-0"
                >
                  <Github className="w-5 h-5" />
                  View on GitHub
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 px-6 bg-[#caf0f8]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Mail className="w-5 h-5" />
            <span>Questions? Reach out to us at</span>
            <a href="mailto:support@simit.dev" className="text-[#0077b6] font-semibold hover:underline">
              support@simit.dev
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
