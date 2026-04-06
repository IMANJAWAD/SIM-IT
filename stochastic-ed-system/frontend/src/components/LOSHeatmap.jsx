// Sample heatmap data: rows = arrival rates, cols = number of doctors
const defaultHeatmapData = {
  xLabels: [2, 3, 4, 5, 6], // Number of doctors
  yLabels: [6, 8, 10, 12, 14], // Arrival rate (patients/hour)
  data: [
    [95, 82, 74, 68, 65],   // arrival rate 6
    [118, 98, 86, 78, 72],  // arrival rate 8
    [156, 128, 108, 94, 85], // arrival rate 10
    [210, 168, 138, 118, 102], // arrival rate 12
    [285, 225, 178, 148, 125], // arrival rate 14
  ]
};

// Color interpolation function
const getHeatmapColor = (value, min, max) => {
  const ratio = (value - min) / (max - min);
  
  // Gradient: light gray-blue (low) -> muted blue (mid) -> deep slate (high)
  if (ratio < 0.5) {
    // From #eef3f7 to #8aa1b1
    const r = Math.round(238 + (138 - 238) * (ratio * 2));
    const g = Math.round(243 + (161 - 243) * (ratio * 2));
    const b = Math.round(247 + (177 - 247) * (ratio * 2));
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // From #8aa1b1 to #385a70
    const r = Math.round(138 + (56 - 138) * ((ratio - 0.5) * 2));
    const g = Math.round(161 + (90 - 161) * ((ratio - 0.5) * 2));
    const b = Math.round(177 + (112 - 177) * ((ratio - 0.5) * 2));
    return `rgb(${r}, ${g}, ${b})`;
  }
};

const LOSHeatmap = ({ 
  data = defaultHeatmapData.data, 
  xLabels = defaultHeatmapData.xLabels, 
  yLabels = defaultHeatmapData.yLabels 
}) => {
  // Calculate min and max for color scaling
  const flatData = data.flat();
  const minValue = Math.min(...flatData);
  const maxValue = Math.max(...flatData);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex gap-3">
        {/* Y-axis label */}
        <div className="flex items-center">
          <span className="text-xs font-medium text-gray-600 transform -rotate-90 whitespace-nowrap">
            Arrival Rate (p/h)
          </span>
        </div>

        <div className="flex-1">
          {/* Heatmap grid */}
          <div className="flex flex-col gap-0.5">
            {data.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-0.5">
                {/* Y-axis tick */}
                <div className="w-14 text-right text-xs font-medium text-gray-600 pr-1">
                  {yLabels[rowIndex]}
                </div>
                
                {/* Cells */}
                {row.map((value, colIndex) => (
                  <div
                    key={colIndex}
                    className="relative group">
                    <div
                      className="w-14 h-10 rounded flex items-center justify-center text-xs font-medium transition-all hover:scale-105 hover:z-10 cursor-pointer"
                      style={{ 
                        backgroundColor: getHeatmapColor(value, minValue, maxValue),
                        color: value > (minValue + maxValue) / 2 ? 'white' : '#374151'
                      }}
                    >
                      {typeof value === 'number' ? value.toFixed(1) : value}
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                      <div>LOS: {value} min</div>
                      <div>Docs: {xLabels[colIndex]}</div>
                      <div>Arrival: {yLabels[rowIndex]} p/h</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            
            {/* X-axis ticks */}
            <div className="flex items-center gap-0.5 mt-1">
              <div className="w-14" />
              {xLabels.map((label, index) => (
                <div key={index} className="w-14 text-center text-xs font-medium text-gray-600">
                  {label}
                </div>
              ))}
            </div>
          </div>
          
          {/* X-axis label */}
          <div className="text-center text-xs font-medium text-gray-500 mt-1">
            Number of Doctors
          </div>
        </div>

        {/* Color Legend */}
        <div className="flex flex-col items-center gap-1 ml-2">
          <span className="text-[10px] text-gray-500">High</span>
          <div 
            className="w-4 h-24 rounded"
            style={{
              background: 'linear-gradient(to bottom, #385a70, #8aa1b1, #eef3f7)'
            }}
          />
          <span className="text-[10px] text-gray-500">Low</span>
          <div className="text-[9px] text-gray-400 mt-1 text-center">
            <div>{maxValue}</div>
            <div>to</div>
            <div>{minValue}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LOSHeatmap;
