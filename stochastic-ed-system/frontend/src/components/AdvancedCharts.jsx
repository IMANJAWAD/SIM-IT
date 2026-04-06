import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

// Sample data for arrival rate sensitivity
const defaultSensitivityData = [
  { arrival_rate: 4, avg_los: 85, throughput: 3.8 },
  { arrival_rate: 6, avg_los: 98, throughput: 5.6 },
  { arrival_rate: 8, avg_los: 118, throughput: 7.2 },
  { arrival_rate: 10, avg_los: 142, throughput: 8.4 },
  { arrival_rate: 12, avg_los: 178, throughput: 9.1 },
  { arrival_rate: 14, avg_los: 215, throughput: 9.5 },
  { arrival_rate: 16, avg_los: 268, throughput: 9.7 },
];

const ArrivalRateSensitivityChart = ({ data }) => {
  // Use default data if no data provided or data is empty/invalid
  const chartData = (data && Array.isArray(data) && data.length > 0) ? data : defaultSensitivityData;
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 60, left: 20, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="arrival_rate" 
            label={{ value: 'Arrival Rate (patients/hour)', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 11 }}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickMargin={5}
            tickFormatter={(value) => Math.round(value)}
          />
          <YAxis 
            yAxisId="left" 
            label={{ value: 'LOS (min)', angle: -90, position: 'insideLeft', offset: 5, fill: '#385a70', fontSize: 11 }}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            domain={['auto', 'auto']}
            tickFormatter={(value) => Math.round(value)}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            label={{ value: 'Throughput', angle: 90, position: 'insideRight', offset: 5, fill: '#5f7c8d', fontSize: 11 }}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            domain={['auto', 'auto']}
            tickFormatter={(value) => typeof value === 'number' ? value.toFixed(1) : value}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              fontSize: '12px'
            }}
            formatter={(value, name) => [typeof value === 'number' ? value.toFixed(2) : value, name]}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="avg_los" 
            name="Length of Stay"
            stroke="#385a70" 
            strokeWidth={2}
            dot={{ fill: '#385a70', strokeWidth: 1, r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={1500}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="throughput" 
            name="Throughput"
            stroke="#5f7c8d" 
            strokeWidth={2}
            dot={{ fill: '#5f7c8d', strokeWidth: 1, r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={1500}
            animationBegin={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Sample data for resource utilization
const defaultUtilizationData = [
  { resource: 'Doctors', utilization: 88.9, capacity: 100 },
  { resource: 'Nurses', utilization: 76.2, capacity: 100 },
  { resource: 'X-ray', utilization: 78.4, capacity: 100 },
  { resource: 'Beds', utilization: 65.8, capacity: 100 },
];

const ResourceUtilizationBarChart = ({ data = defaultUtilizationData }) => {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            label={{ value: 'Utilization (%)', position: 'insideBottom', offset: -5, style: { fill: '#6b7280', fontSize: 11 } }}
          />
          <YAxis 
            type="category" 
            dataKey="resource"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            width={55}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              fontSize: '12px'
            }}
            formatter={(value) => [`${value.toFixed(1)}%`, 'Utilization']}
          />
          <Bar 
            dataKey="utilization" 
            radius={[0, 4, 4, 0]}
            animationDuration={1200}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#gradient-${index})`}
              />
            ))}
          </Bar>
          <defs>
            {data.map((_, index) => (
              <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#385a70" />
                <stop offset="100%" stopColor="#5f7c8d" />
              </linearGradient>
            ))}
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Sample data for optimization comparison
const defaultOptimizationBarData = [
  { metric: 'Avg LOS', baseline: 142.5, config1: 128.7, config2: 115.3, config3: 98.2 },
  { metric: 'Throughput', baseline: 7.2, config1: 8.1, config2: 9.4, config3: 11.2 },
  { metric: 'Wait Time', baseline: 28.3, config1: 22.1, config2: 18.5, config3: 12.4 },
  { metric: 'Critical LOS', baseline: 98.6, config1: 86.2, config2: 74.8, config3: 62.3 },
];

const OptimizationBarChart = ({ data = defaultOptimizationBarData }) => {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 40, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="metric" 
            tick={{ fill: '#6b7280', fontSize: 11 }} 
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 11 }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              fontSize: '12px'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
          <Bar dataKey="baseline" name="Baseline" fill="#f5f8fb" stroke="#385a70" strokeWidth={1} radius={[3, 3, 0, 0]} animationDuration={1000} />
          <Bar dataKey="config1" name="Config 1" fill="#385a70" radius={[3, 3, 0, 0]} animationDuration={1000} animationBegin={100} />
          <Bar dataKey="config2" name="Config 2" fill="#5f7c8d" radius={[3, 3, 0, 0]} animationDuration={1000} animationBegin={200} />
          <Bar dataKey="config3" name="Config 3 (Best)" fill="#b7c7d2" stroke="#385a70" strokeWidth={1} radius={[3, 3, 0, 0]} animationDuration={1000} animationBegin={300} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export { ArrivalRateSensitivityChart, ResourceUtilizationBarChart, OptimizationBarChart };
