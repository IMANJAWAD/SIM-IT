import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

// Sample optimization data - in real app, this would come from API
const defaultData = [
  {
    config: 'Baseline',
    avgLOS: 142.5,
    avgConsultWait: 28.3,
    avgDiagWait: 15.2,
    throughput: 7.2,
    doctorUtil: 78.4,
    xrayUtil: 62.1,
    criticalLOS: 98.6,
    isBest: false
  },
  {
    config: 'Config 1',
    avgLOS: 128.7,
    avgConsultWait: 22.1,
    avgDiagWait: 12.8,
    throughput: 8.1,
    doctorUtil: 82.3,
    xrayUtil: 68.5,
    criticalLOS: 86.2,
    isBest: false
  },
  {
    config: 'Config 2',
    avgLOS: 115.3,
    avgConsultWait: 18.5,
    avgDiagWait: 10.4,
    throughput: 9.4,
    doctorUtil: 85.7,
    xrayUtil: 72.3,
    criticalLOS: 74.8,
    isBest: false
  },
  {
    config: 'Config 3',
    avgLOS: 98.2,
    avgConsultWait: 12.4,
    avgDiagWait: 7.6,
    throughput: 11.2,
    doctorUtil: 88.9,
    xrayUtil: 78.4,
    criticalLOS: 62.3,
    isBest: true
  }
];

const columns = [
  { key: 'config', label: 'Configuration', sortable: true },
  { key: 'avgLOS', label: 'Avg LOS (min)', sortable: true },
  { key: 'avgConsultWait', label: 'Consult Wait (min)', sortable: true },
  { key: 'avgDiagWait', label: 'Diag Wait (min)', sortable: true },
  { key: 'throughput', label: 'Throughput (p/h)', sortable: true },
  { key: 'doctorUtil', label: 'Doctor Util (%)', sortable: true },
  { key: 'xrayUtil', label: 'X-ray Util (%)', sortable: true },
  { key: 'criticalLOS', label: 'Critical LOS (min)', sortable: true }
];

const OptimizationTable = ({ data = defaultData }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    
    if (typeof aVal === 'string') {
      return sortConfig.direction === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={`px-3 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap ${
                  col.sortable ? 'cursor-pointer hover:text-[#385a70] transition-colors' : ''
                }`}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortConfig.key === col.key && (
                    sortConfig.direction === 'asc' 
                      ? <ChevronUp className="w-3 h-3" />
                      : <ChevronDown className="w-3 h-3" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr
              key={row.config}
              className={`
                border-b border-gray-100 transition-colors text-sm
                ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                ${row.isBest ? 'bg-[#385a70]/5 border-l-2 border-l-[#385a70]' : ''}
                hover:bg-gray-100/50
              `}
            >
              <td className="px-3 py-2 font-medium text-gray-800">
                <div className="flex items-center gap-2">
                  {row.config}
                  {row.isBest && (
                    <span className="px-1.5 py-0.5 bg-[#385a70] text-white text-[10px] rounded font-medium">
                      BEST
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-2 text-gray-700">{row.avgLOS.toFixed(1)}</td>
              <td className="px-3 py-2 text-gray-700">{row.avgConsultWait.toFixed(1)}</td>
              <td className="px-3 py-2 text-gray-700">{row.avgDiagWait.toFixed(1)}</td>
              <td className="px-3 py-2 text-[#385a70] font-medium">{row.throughput.toFixed(1)}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#385a70] rounded-full"
                      style={{ width: `${row.doctorUtil}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{row.doctorUtil.toFixed(0)}%</span>
                </div>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#5f7c8d] rounded-full"
                      style={{ width: `${row.xrayUtil}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{row.xrayUtil.toFixed(0)}%</span>
                </div>
              </td>
              <td className="px-3 py-2 text-gray-700">{row.criticalLOS.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OptimizationTable;
