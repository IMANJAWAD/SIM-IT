import { useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';

// STRICT COLORS ONLY: #caf0f8, #0077b6, #00b4d8, #f0f3bd
const COLORS = {
  primary: '#0077b6',
  secondary: '#00b4d8',
  accent: '#f0f3bd',
  light: '#caf0f8',
};

// Custom Node Component
function StateNode({ data }) {
  const probability = (data.probability * 100).toFixed(1);
  const isHighProb = data.probability > 0.1;
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-white"
      style={{
        background: isHighProb ? COLORS.primary : '#ffffff',
        boxShadow: isHighProb ? '0 0 20px rgba(0, 180, 216, 0.5)' : '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <span className={`text-lg font-bold ${isHighProb ? 'text-white' : 'text-[#0077b6]'}`}>
        {data.label}
      </span>
      <span style={{ color: isHighProb ? '#ffffff' : COLORS.primary }} className="text-xs font-medium">
        {probability}%
      </span>
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </motion.div>
  );
}

const nodeTypes = { stateNode: StateNode };

export default function MarkovChainVisualization({ data }) {
  const { nodes, edges } = useMemo(() => {
    if (!data?.state_diagram) {
      return { nodes: [], edges: [] };
    }

    const diagramNodes = data.state_diagram.nodes.map((node, index) => ({
      id: node.id,
      type: 'stateNode',
      position: { x: index * 120, y: 150 },
      data: { label: node.label, probability: node.probability },
    }));

    const diagramEdges = data.state_diagram.edges.map((edge, index) => ({
      id: `edge-${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.probability.toFixed(3),
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#00b4d8', strokeWidth: 2 },
      labelStyle: { fontSize: 10, fill: '#0077b6' },
      labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#00b4d8' },
    }));

    return { nodes: diagramNodes, edges: diagramEdges };
  }, [data]);

  const proOptions = { hideAttribution: true };

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 h-[400px] flex items-center justify-center shadow-sm">
        <p className="text-gray-400 font-medium">Run simulation to see Markov chain visualization</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div 
          className="p-2 rounded-xl"
          style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
        >
          <GitBranch className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-base font-semibold" style={{ color: '#1a365d' }}>Markov Chain State Diagram</h2>
      </div>

      <div className="p-5">
        {/* Flow Diagram */}
        <div className="h-[300px] rounded-xl overflow-hidden border border-gray-100" style={{ backgroundColor: '#fafafa' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            proOptions={proOptions}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#e5e5e5" gap={20} size={1} />
            <Controls className="bg-white rounded-lg shadow-lg" />
          </ReactFlow>
        </div>

        {/* Steady State Probabilities */}
        {data?.steady_state_probabilities && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#1a365d' }}>Steady-State Probabilities π(n)</h3>
            <div className="flex flex-wrap gap-2">
              {data.steady_state_probabilities.slice(0, 10).map((prob, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                  style={{
                    background: prob > 0.1 ? COLORS.primary : COLORS.accent,
                    color: prob > 0.1 ? '#ffffff' : COLORS.primary,
                    borderColor: prob > 0.1 ? COLORS.primary : '#e0e0e0'
                  }}
                >
                  π({i}) = {(prob * 100).toFixed(2)}%
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metrics */}
        {data?.metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-xl border border-gray-100" style={{ backgroundColor: '#f8fafc' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>ρ (Utilization)</p>
              <p className="text-xl font-bold" style={{ color: COLORS.secondary }}>{data.metrics.stability_condition}</p>
              <p className="text-xs font-semibold mt-1" style={{ color: data.metrics.is_stable ? '#10b981' : '#ef4444' }}>
                {data.metrics.is_stable ? '✓ Stable' : '✗ Unstable'}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-100" style={{ backgroundColor: '#f8fafc' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>E[Queue Length]</p>
              <p className="text-xl font-bold" style={{ color: COLORS.primary }}>{data.metrics.expected_queue_length}</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-100" style={{ backgroundColor: '#f8fafc' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>E[Wait Time]</p>
              <p className="text-xl font-bold" style={{ color: COLORS.primary }}>{data.metrics.expected_waiting_time} min</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.accent }}>
              <p className="text-xs font-medium mb-1" style={{ color: COLORS.primary }}>P(Congestion)</p>
              <p className="text-xl font-bold" style={{ color: COLORS.primary }}>{data.metrics.probability_of_congestion}%</p>
            </div>
          </div>
        )}

        {/* Transition Matrix Preview */}
        {data?.transition_matrix && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#1a365d' }}>Transition Matrix P (first 6 states)</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="text-xs w-full">
                <thead>
                  <tr>
                    <th className="p-3 bg-gray-50 font-semibold" style={{ color: COLORS.primary }}></th>
                    {data.states?.slice(0, 6).map(s => (
                      <th key={s} className="p-3 bg-gray-50 text-center font-semibold" style={{ color: COLORS.primary }}>{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.transition_matrix.slice(0, 6).map((row, i) => (
                    <tr key={i}>
                      <td className="p-3 bg-gray-50 font-semibold text-center" style={{ color: COLORS.primary }}>{i}</td>
                      {row.slice(0, 6).map((val, j) => (
                        <td 
                          key={j}
                          className="p-3 text-center font-medium"
                          style={{
                            background: val > 0.3 ? COLORS.primary : val > 0.1 ? COLORS.secondary : '#f8fafc',
                            color: val > 0.1 ? '#ffffff' : COLORS.primary
                          }}
                        >
                          {val.toFixed(3)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
