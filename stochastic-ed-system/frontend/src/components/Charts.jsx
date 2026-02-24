import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Legend, Cell
} from 'recharts';
import { BarChart3, TrendingUp, Activity, Layers } from 'lucide-react';

const COLORS = {
  primary: '#0077b6',
  secondary: '#00b4d8',
  accent: '#f0f3bd',
  light: '#caf0f8',
  textMuted: '#4a5568',
};

function ChartContainer({ title, icon: Icon, children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ boxShadow: '0 8px 24px rgba(0,119,182,0.12)' }}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div 
          className="p-2 rounded-xl"
          style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-base font-semibold" style={{ color: '#1a365d' }}>{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

export function LOSDistributionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <ChartContainer title="LOS Distribution" icon={BarChart3}>
        <div className="h-[250px] flex items-center justify-center text-gray-400">
          No data available
        </div>
      </ChartContainer>
    );
  }

  // Create histogram bins
  const bins = [];
  const binSize = 20;
  const maxVal = Math.max(...data);
  for (let i = 0; i <= maxVal; i += binSize) {
    const count = data.filter(v => v >= i && v < i + binSize).length;
    bins.push({ range: `${i}-${i + binSize}`, count, percentage: (count / data.length * 100).toFixed(1) });
  }

  return (
    <ChartContainer title="Length of Stay Distribution" icon={BarChart3}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={bins.slice(0, 10)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="range" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid #00b4d8',
              borderRadius: '12px',
            }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {bins.slice(0, 10).map((entry, index) => (
              <Cell key={index} fill={index % 2 === 0 ? COLORS.primary : COLORS.secondary} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function QueueLengthChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <ChartContainer title="Queue Length Over Time" icon={TrendingUp}>
        <div className="h-[250px] flex items-center justify-center text-gray-400">
          No data available
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Queue Length Over Time" icon={TrendingUp}>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorQueue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 11 }} 
            tickFormatter={(v) => `${Math.round(v)}m`}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid #00b4d8',
              borderRadius: '12px',
            }}
            formatter={(value) => [value.toFixed(2), 'Queue Length']}
            labelFormatter={(v) => `Time: ${Math.round(v)} min`}
          />
          <Area 
            type="monotone" 
            dataKey="avg_queue" 
            stroke={COLORS.secondary} 
            fillOpacity={1}
            fill="url(#colorQueue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function ResourceUtilizationChart({ data }) {
  if (!data) {
    return (
      <ChartContainer title="Resource Utilization" icon={Activity}>
        <div className="h-[250px] flex items-center justify-center text-gray-400">
          No data available
        </div>
      </ChartContainer>
    );
  }

  const chartData = [
    { name: 'Doctors', utilization: data.doctors || 0, color: COLORS.primary },
    { name: 'Nurses', utilization: data.nurses || 0, color: COLORS.secondary },
    { name: 'X-Ray', utilization: data.xray || 0, color: '#bfcc47' },
  ];

  return (
    <ChartContainer title="Resource Utilization" icon={Activity}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
          <Tooltip
            contentStyle={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid #00b4d8',
              borderRadius: '12px',
            }}
            formatter={(value) => [`${value.toFixed(1)}%`, 'Utilization']}
          />
          <Bar dataKey="utilization" radius={[0, 8, 8, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function SensitivityChart({ data, type = 'arrival_rate' }) {
  if (!data || data.length === 0) {
    return (
      <ChartContainer title="Sensitivity Analysis" icon={Layers}>
        <div className="h-[250px] flex items-center justify-center text-gray-400">
          No data available
        </div>
      </ChartContainer>
    );
  }

  const xKey = type === 'arrival_rate' ? 'arrival_rate' : 'num_doctors';
  const xLabel = type === 'arrival_rate' ? 'Arrival Rate (λ)' : 'Number of Doctors';

  return (
    <ChartContainer title={`Impact of ${xLabel}`} icon={Layers}>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid #00b4d8',
              borderRadius: '12px',
            }}
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="avg_waiting_time" 
            stroke={COLORS.primary}
            strokeWidth={2}
            dot={{ fill: COLORS.primary, r: 4 }}
            name="Waiting Time (min)"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="throughput" 
            stroke={COLORS.secondary}
            strokeWidth={2}
            dot={{ fill: COLORS.secondary, r: 4 }}
            name="Throughput"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function HeatmapChart({ data, xLabels, yLabels }) {
  if (!data || data.length === 0) {
    return (
      <ChartContainer title="Waiting Time Heatmap" icon={Layers}>
        <div className="h-[250px] flex items-center justify-center text-gray-400">
          No data available
        </div>
      </ChartContainer>
    );
  }

  const maxVal = Math.max(...data.flat());
  const minVal = Math.min(...data.flat());

  const getColorAndText = (val) => {
    const ratio = (val - minVal) / (maxVal - minVal || 1);
    // Use accent (#f0f3bd) for low, secondary (#00b4d8) for mid, primary (#0077b6) for high
    if (ratio < 0.33) return { bg: COLORS.accent, text: COLORS.primary };
    if (ratio < 0.66) return { bg: COLORS.secondary, text: '#ffffff' };
    return { bg: COLORS.primary, text: '#ffffff' };
  };

  return (
    <ChartContainer title="Waiting Time Heatmap (Doctors vs Arrival Rate)" icon={Layers}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-2 font-semibold" style={{ color: COLORS.primary }}>Doctors</th>
              {xLabels?.map((label, i) => (
                <th key={i} className="p-2 text-center font-semibold" style={{ color: COLORS.primary }}>λ={label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td className="p-2 font-semibold text-center" style={{ color: COLORS.primary }}>{yLabels?.[i]}</td>
                {row.map((val, j) => {
                  const colors = getColorAndText(val);
                  return (
                    <td 
                      key={j}
                      className="p-3 text-center font-bold rounded-lg"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {val.toFixed(1)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center items-center gap-6 mt-4 text-sm font-medium">
        <span className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md border border-gray-200" style={{ background: COLORS.accent }}></div>
          <span style={{ color: COLORS.textMuted }}>Low Wait</span>
        </span>
        <span className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md" style={{ background: COLORS.secondary }}></div>
          <span style={{ color: COLORS.textMuted }}>Medium</span>
        </span>
        <span className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md" style={{ background: COLORS.primary }}></div>
          <span style={{ color: COLORS.textMuted }}>High Wait</span>
        </span>
      </div>
    </ChartContainer>
  );
}
