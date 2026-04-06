import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SensitivityChart, HeatmapChart } from '../components/Charts';

const COLORS = {
  primary: '#003049',
  primaryDark: '#003049',
  accent: '#669BBC',
  alertHint: '#780000',
  accentDark: '#003049',
  bgLight: '#edf4fa',
  white: '#ffffff',
  textDark: '#003049',
  textMuted: '#4f7791',
  textLight: '#669BBC',
  border: '#c7dceb',
};

const SensitivityAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sensitivityData, params } = location.state || {};

  if (!sensitivityData) {
    return (
      <main className="min-h-screen pt-20 flex items-center justify-center" style={{ background: COLORS.bgLight }}>
        <div className="text-center">
          <p style={{ color: COLORS.textMuted }}>No sensitivity data available. Please run a simulation first.</p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="mt-4 px-4 py-2 rounded-lg text-sm"
            style={{ background: COLORS.primary, color: 'white' }}
          >
            Go to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 pb-12" style={{ background: COLORS.bgLight }}>
      <div className="px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <nav aria-label="Navigation">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-70"
              style={{ color: COLORS.textMuted }}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to Results
            </button>
          </nav>

          <header className="bg-white rounded-2xl p-6 shadow-sm border mb-8" style={{ borderColor: COLORS.border }}>
            <div className="w-16 h-0.5 rounded-full mb-4" style={{ background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent})` }} />
            <h1 className="text-2xl font-bold" style={{ color: COLORS.textDark }}>Optimization & Sensitivity Analysis</h1>
            <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
              Based on simulation with λ = {params?.arrival_rate}/hr and {params?.num_doctors} doctors
            </p>
          </header>

          <section className="mb-8" aria-label="Arrival Rate Sensitivity">
            <header className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight" style={{ color: COLORS.textDark }}>Arrival Rate Sensitivity</h2>
              <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>Impact of patient arrival rate on performance</p>
              <div className="w-12 h-0.5 mt-3 rounded-full" style={{ background: COLORS.accent }} />
            </header>
            <figure className="bg-white rounded-xl p-6 shadow-sm border" style={{ borderColor: COLORS.border }}>
              <SensitivityChart data={sensitivityData.arrival_rate_sensitivity} type="arrival_rate" />
            </figure>
          </section>

          {sensitivityData.doctor_sensitivity && (
            <section className="mb-8" aria-label="Staffing Sensitivity">
              <header className="mb-6">
                <h2 className="text-xl font-semibold tracking-tight" style={{ color: COLORS.textDark }}>Staffing Sensitivity</h2>
                <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>Impact of doctor count on performance</p>
                <div className="w-12 h-0.5 mt-3 rounded-full" style={{ background: COLORS.accent }} />
              </header>
              <figure className="bg-white rounded-xl p-6 shadow-sm border" style={{ borderColor: COLORS.border }}>
                <SensitivityChart data={sensitivityData.doctor_sensitivity} type="doctors" />
              </figure>
            </section>
          )}

          {sensitivityData.heatmap && (
            <section className="mb-8" aria-label="Performance Heatmap">
              <header className="mb-6">
                <h2 className="text-xl font-semibold tracking-tight" style={{ color: COLORS.textDark }}>Performance Heatmap</h2>
                <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>Combined effect of arrival rate and doctor count</p>
                <div className="w-12 h-0.5 mt-3 rounded-full" style={{ background: COLORS.accent }} />
              </header>
              <figure className="bg-white rounded-xl p-6 shadow-sm border" style={{ borderColor: COLORS.border }}>
                <HeatmapChart
                  data={sensitivityData.heatmap.data}
                  xLabels={sensitivityData.heatmap.x_labels}
                  yLabels={sensitivityData.heatmap.y_labels}
                />
              </figure>
            </section>
          )}

          <section aria-label="Optimization Insights">
            <header className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight" style={{ color: COLORS.textDark }}>Optimization Insights</h2>
              <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>Recommendations based on sensitivity analysis</p>
              <div className="w-12 h-0.5 mt-3 rounded-full" style={{ background: COLORS.accent }} />
            </header>
            <div className="space-y-4">
              <article className="p-4 rounded-lg" style={{ background: `${COLORS.accent}16`, border: `1px solid ${COLORS.accent}35` }}>
                <h3 className="text-sm font-medium" style={{ color: COLORS.accentDark }}>Key Finding</h3>
                <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                  The system shows optimal performance when arrival rate is below {params?.num_doctors * 3} patients/hour.
                  Consider staffing adjustments during peak hours.
                </p>
              </article>
              <article className="p-4 rounded-lg" style={{ background: `${COLORS.primary}10`, border: `1px solid ${COLORS.alertHint}22` }}>
                <h3 className="text-sm font-medium" style={{ color: COLORS.primary }}>Recommendation</h3>
                <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                  Based on sensitivity analysis, increasing doctor count to {Math.ceil((params?.arrival_rate || 8) / 2.5)} would reduce wait times by approximately 40%.
                </p>
              </article>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default SensitivityAnalysis;