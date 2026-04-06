import { motion } from 'framer-motion';
import { Download, FileText, Camera } from 'lucide-react';

// Results palette: Cosmos Blue and Blue Marble
const COLORS = {
  primary: '#003049',
  secondary: '#669BBC',
  accent: '#669BBC',
  light: '#f5f8fb',
};

export default function ExportButtons({ simulationData, onExportPDF, onExportCSV, onScreenshot }) {
  const handleExportCSV = () => {
    if (!simulationData) return;

    const csvContent = [
      ['Metric', 'Value', 'Lower CI', 'Upper CI'],
      ['Average Waiting Time', simulationData.metrics?.avg_waiting_time, 
       simulationData.confidence_intervals?.waiting_time?.[0], 
       simulationData.confidence_intervals?.waiting_time?.[1]],
      ['Average LOS', simulationData.metrics?.avg_los,
       simulationData.confidence_intervals?.los?.[0],
       simulationData.confidence_intervals?.los?.[1]],
      ['Throughput', simulationData.metrics?.throughput,
       simulationData.confidence_intervals?.throughput?.[0],
       simulationData.confidence_intervals?.throughput?.[1]],
      ['Doctor Utilization %', simulationData.metrics?.resource_utilization?.doctors],
      ['Nurse Utilization %', simulationData.metrics?.resource_utilization?.nurses],
      ['X-Ray Utilization %', simulationData.metrics?.resource_utilization?.xray],
      ['Overload Probability %', simulationData.metrics?.steady_state_overload_probability],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simulation_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!simulationData) return;

    const blob = new Blob([JSON.stringify(simulationData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simulation_results.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleExportCSV}
        disabled={!simulationData}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ border: `1px solid ${COLORS.light}`, color: COLORS.secondary }}
      >
        <Download className="w-4 h-4" />
        Export CSV
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleExportJSON}
        disabled={!simulationData}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ border: `1px solid ${COLORS.light}`, color: COLORS.primary }}
      >
        <FileText className="w-4 h-4" />
        Export JSON
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors"
        style={{ backgroundColor: COLORS.accent, color: COLORS.primary, border: `1px solid ${COLORS.accent}` }}
      >
        <Camera className="w-4 h-4" />
        Print/PDF
      </motion.button>
    </motion.div>
  );
}
