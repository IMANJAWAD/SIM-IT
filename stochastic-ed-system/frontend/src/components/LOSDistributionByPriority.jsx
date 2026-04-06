import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Sample data for LOS distribution by priority
const defaultDistributionData = [
  { los: 20, critical: 15, urgent: 5, nonUrgent: 2 },
  { los: 40, critical: 35, urgent: 18, nonUrgent: 8 },
  { los: 60, critical: 28, urgent: 42, nonUrgent: 22 },
  { los: 80, critical: 12, urgent: 55, nonUrgent: 45 },
  { los: 100, critical: 6, urgent: 48, nonUrgent: 58 },
  { los: 120, critical: 3, urgent: 32, nonUrgent: 52 },
  { los: 140, critical: 1, urgent: 18, nonUrgent: 38 },
  { los: 160, critical: 0, urgent: 8, nonUrgent: 25 },
  { los: 180, critical: 0, urgent: 4, nonUrgent: 15 },
  { los: 200, critical: 0, urgent: 2, nonUrgent: 8 },
  { los: 220, critical: 0, urgent: 1, nonUrgent: 5 },
  { los: 240, critical: 0, urgent: 0, nonUrgent: 3 },
];

const LOSDistributionByPriority = ({ data }) => {
  // Use default data if no data provided
  const chartData = (data && Array.isArray(data) && data.length > 0) ? data : defaultDistributionData;
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 40, bottom: 30 }}>
          <defs>
            <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#385a70" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#385a70" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorUrgent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5f7c8d" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#5f7c8d" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorNonUrgent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d8e1e7" stopOpacity={1}/>
              <stop offset="95%" stopColor="#d8e1e7" stopOpacity={0.3}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="los" 
            tick={{ fill: '#6b7280', fontSize: 11 }}
            label={{ value: 'Length of Stay (minutes)', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 11 }}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 11 }}
            label={{ value: 'Frequency', angle: -90, position: 'insideLeft', offset: 10, fill: '#6b7280', fontSize: 11 }}
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
          <Legend 
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            iconType="circle"
          />
          <Area 
            type="monotone" 
            dataKey="critical" 
            name="Critical"
            stroke="#385a70" 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCritical)" 
            animationDuration={1500}
          />
          <Area 
            type="monotone" 
            dataKey="urgent" 
            name="Urgent"
            stroke="#5f7c8d" 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorUrgent)" 
            animationDuration={1500}
            animationBegin={200}
          />
          <Area 
            type="monotone" 
            dataKey="nonUrgent" 
            name="Non-Urgent"
            stroke="#6f8695" 
            strokeWidth={1}
            strokeDasharray="4 2"
            fillOpacity={1}
            fill="url(#colorNonUrgent)" 
            animationDuration={1500}
            animationBegin={400}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LOSDistributionByPriority;
