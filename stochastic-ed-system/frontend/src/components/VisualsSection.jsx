import { motion } from 'framer-motion';
import { FileDown, Loader2 } from 'lucide-react';

import OptimizationTable from './OptimizationTable';
import { ArrivalRateSensitivityChart, ResourceUtilizationBarChart, OptimizationBarChart } from './AdvancedCharts';
import LOSHeatmap from './LOSHeatmap';
import LOSDistributionByPriority from './LOSDistributionByPriority';
import usePDFExport from '../hooks/usePDFExport';

// STRICT COLORS ONLY: #f5f8fb, #C1121F, #AE1F23, #669BBC
const COLORS = {
  primary: '#385a70',
  secondary: '#5f7c8d',
  accent: '#d8e1e7',
  light: '#f5f8fb',
  textDark: '#243744',
};

// KPI Card Component
const KPICard = ({ label, value, unit, trend, color = '#385a70' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
    className="bg-white rounded-lg p-4 border border-[#d8e0e6]"
  >
    <div className="flex items-start justify-between mb-2">
      {trend && (
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="text-2xl font-bold" style={{ color: COLORS.textDark }}>{value}</div>
    <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    {unit && <div className="text-[10px] text-gray-400">{unit}</div>}
  </motion.div>
);

// Section Title Component
const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-4">
    <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: COLORS.textDark }}>{title}</h3>
    {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
  </div>
);

// Chart Card Wrapper
const ChartCard = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3 }}
    className={`bg-white rounded-lg p-4 border border-[#d8e0e6] ${className}`}
  >
    {children}
  </motion.div>
);

const VisualsSection = ({ simulationData, sensitivityData }) => {
  const { exportToPDF, isExporting } = usePDFExport();

  const handleExportPDF = async () => {
    try {
      await exportToPDF('visuals-export-container', 'PulseFlow_Analysis_Report.pdf');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // KPI Data
  const kpiData = [
    { label: 'Avg LOS Reduction', value: '31%', trend: -31, color: COLORS.primary },
    { label: 'Throughput Increase', value: '56%', trend: 56, color: COLORS.secondary },
    { label: 'Wait Time Reduction', value: '55%', trend: -55, color: COLORS.primary },
    { label: 'Optimal Config', value: 'C3', unit: '5 docs, 7 nurses', color: COLORS.secondary },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mt-8"
    >
      {/* Analytics Header Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold" style={{ color: COLORS.textDark }}>Optimization & Sensitivity Analysis</h2>
          <p className="text-sm text-gray-500">Performance metrics and configuration comparison</p>
        </div>
        <motion.button
          onClick={handleExportPDF}
          disabled={isExporting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 text-white text-sm rounded-md font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
          style={{ backgroundColor: COLORS.primary }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2b4354'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              Export PDF
            </>
          )}
        </motion.button>
      </div>

      {/* Main Grid Container - Compact Bento Layout */}
      <div id="visuals-export-container" className="space-y-5">
        
        {/* Row 1: KPIs + Recommended Config (Side by Side) */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-8">
            <SectionTitle title="Key Performance Indicators" subtitle="Optimization impact summary" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {kpiData.map((kpi, index) => (
                <KPICard key={index} {...kpi} />
              ))}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <SectionTitle title="Recommendation" subtitle="Best configuration" />
            <div className="rounded-lg p-4 h-[calc(100%-32px)] border border-[#d8e0e6] bg-white">
              <div className="flex flex-col h-full justify-center">
                <div className="text-center mb-3">
                  <div className="text-3xl font-bold" style={{ color: COLORS.textDark }}>Config 3</div>
                  <div className="text-xs text-gray-500">5 doctors, 7 nurses</div>
                </div>
                <div className="flex justify-center gap-4">
                  <div className="text-center px-3 py-2 bg-[#f5f8fb] rounded-md">
                    <div className="text-lg font-bold" style={{ color: COLORS.textDark }}>31%</div>
                    <div className="text-[10px] text-gray-500">LOS ↓</div>
                  </div>
                  <div className="text-center px-3 py-2 bg-[#f5f8fb] rounded-md">
                    <div className="text-lg font-bold" style={{ color: COLORS.textDark }}>55%</div>
                    <div className="text-[10px] text-gray-500">Wait ↓</div>
                  </div>
                  <div className="text-center px-3 py-2 bg-[#f5f8fb] rounded-md">
                    <div className="text-lg font-bold" style={{ color: COLORS.textDark }}>56%</div>
                    <div className="text-[10px] text-gray-500">Thru ↑</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Sensitivity Analysis (2 charts side by side) */}
        <div>
          <SectionTitle title="Sensitivity Analysis" subtitle="Impact of arrival rate and resource allocation" />
          <div className="grid grid-cols-12 gap-4">
            <ChartCard className="col-span-12 lg:col-span-6">
              <h4 className="text-sm font-semibold mb-3" style={{ color: COLORS.textDark }}>Arrival Rate Sensitivity</h4>
              <div className="h-[300px]">
                <ArrivalRateSensitivityChart data={sensitivityData?.arrival_rate_sensitivity} />
              </div>
            </ChartCard>
            <ChartCard className="col-span-12 lg:col-span-6">
              <h4 className="text-sm font-semibold mb-3" style={{ color: COLORS.textDark }}>LOS Heatmap (Doctors x Arrival Rate)</h4>
              <div className="h-[300px]">
                <LOSHeatmap 
                  data={sensitivityData?.heatmap?.data}
                  xLabels={sensitivityData?.heatmap?.x_labels}
                  yLabels={sensitivityData?.heatmap?.y_labels}
                />
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Row 3: Resource Analysis (2 charts side by side) */}
        <div>
          <SectionTitle title="Resource Analysis" subtitle="Utilization and configuration performance" />
          <div className="grid grid-cols-12 gap-4">
            <ChartCard className="col-span-12 lg:col-span-5">
              <h4 className="text-sm font-semibold mb-3" style={{ color: COLORS.textDark }}>Resource Utilization</h4>
              <div className="h-[280px]">
                <ResourceUtilizationBarChart />
              </div>
            </ChartCard>
            <ChartCard className="col-span-12 lg:col-span-7">
              <h4 className="text-sm font-semibold mb-3" style={{ color: COLORS.textDark }}>Configuration Comparison</h4>
              <div className="h-[280px]">
                <OptimizationBarChart />
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Row 4: Priority Distribution + Optimization Table (Side by Side) */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-5">
            <SectionTitle title="Priority Distribution" subtitle="LOS by patient priority" />
            <ChartCard>
              <h4 className="text-sm font-semibold mb-3" style={{ color: COLORS.textDark }}>LOS Distribution by Priority</h4>
              <div className="h-[280px]">
                <LOSDistributionByPriority />
              </div>
            </ChartCard>
          </div>
          <div className="col-span-12 lg:col-span-7">
            <SectionTitle title="Optimization Results" subtitle="Configuration summary" />
            <ChartCard>
              <h4 className="text-sm font-semibold mb-3" style={{ color: COLORS.textDark }}>Configuration Summary Table</h4>
              <OptimizationTable />
            </ChartCard>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default VisualsSection;
