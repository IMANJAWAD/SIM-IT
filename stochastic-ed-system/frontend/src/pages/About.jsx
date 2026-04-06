import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Bed, Clock3, Hospital, ShieldAlert, Workflow } from 'lucide-react';

const blocks = [
  {
    icon: Activity,
    title: 'System Purpose',
    body: 'PulseFlow is built for emergency units that need a realistic view of demand volatility, queue formation, and treatment throughput before making shift-level decisions.',
  },
  {
    icon: Workflow,
    title: 'How It Helps',
    body: 'Teams can model surge scenarios, compare interventions, and choose safer staffing plans using stochastic simulation instead of intuition alone.',
  },
  {
    icon: ShieldAlert,
    title: 'Real-World Value',
    body: 'By identifying critical bottlenecks early, hospitals can reduce excessive waiting, protect acute patients, and improve emergency flow reliability.',
  },
];

const aboutMetrics = [
  { icon: Clock3, label: 'Wait-Time Risk', text: 'Forecasted under varying arrival pressure' },
  { icon: Bed, label: 'Resource Strain', text: 'Doctor, diagnostics, and triage utilization' },
  { icon: Hospital, label: 'ED Readiness', text: 'Scenario-led planning for high-demand shifts' },
];

const About = () => {
  return (
    <div className="min-h-screen bg-[#f5f8fb] pt-16">
      <section className="relative overflow-hidden px-6 py-20 bg-[#003049]">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(102,155,188,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(102,155,188,0.35) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-white mb-4">
            About PulseFlow
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-white/85 max-w-3xl mx-auto">
            PulseFlow: A Stochastic Optimization System for Emergency Departments.
            This interface is designed to feel like a real operations console for modern hospital emergency management.
          </motion.p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {blocks.map((item, idx) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="pf-card p-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C1121F] to-[#AE1F23] text-white flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h2 className="text-xl text-[#003049] font-bold mb-2">{item.title}</h2>
              <p className="text-[#557283]">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto pf-card p-8 bg-gradient-to-r from-[#ffffff] to-[#f3f7fa]">
          <h3 className="text-2xl font-bold text-[#003049] mb-6">Why This Matters in Emergency Care</h3>
          <div className="grid md:grid-cols-3 gap-5">
            {aboutMetrics.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#003049]/10 p-5 bg-white">
                <item.icon className="w-6 h-6 text-[#C1121F] mb-3" />
                <p className="font-bold text-[#003049]">{item.label}</p>
                <p className="text-sm text-[#557283] mt-1">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="text-[#557283] mt-6">
            Frontend technologies are used to provide responsive charts, smooth transitions, and interactive controls, while preserving compatibility with your existing simulation backend.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-[#003049] to-[#780000] rounded-3xl p-10 text-white">
          <h4 className="text-3xl font-bold mb-3">Ready to run your next ED scenario?</h4>
          <p className="text-white/80 mb-6">Enter PulseFlow and compare stochastic outcomes before operational decisions are finalized.</p>
          <Link to="/dashboard" className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-[#780000] font-semibold hover:bg-[#f2f7fb] transition-colors">
            Open Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
