import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import type { CaseFlow, FlowNodeData, EdgeStyle } from '../types';
import CustomNode from './CustomNode';

const nodeTypes = { custom: CustomNode };

const EDGE_STYLE_MAP: Record<EdgeStyle, { stroke: string; strokeDasharray?: string }> = {
  normal: { stroke: '#94a3b8' },
  success: { stroke: '#16a34a' },
  warning: { stroke: '#d97706' },
  dashed: { stroke: '#94a3b8', strokeDasharray: '6 4' },
};

function buildDagreLayout(
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 120, marginx: 60, marginy: 60 });

  nodes.forEach(node => g.setNode(node.id, { width: 380, height: 180 }));
  edges.forEach(edge => g.setEdge(edge.source, edge.target));

  dagre.layout(g);

  return {
    nodes: nodes.map(node => {
      const pos = g.node(node.id);
      return { ...node, position: { x: pos.x - 190, y: pos.y - 90 } };
    }),
    edges,
  };
}

interface FlowChartProps {
  flow: CaseFlow;
  onNodeClick: (node: FlowNodeData) => void;
  selectedNodeId: string | null;
}

export default function FlowChart({ flow, onNodeClick, selectedNodeId }: FlowChartProps) {
  const rawNodes: Node[] = useMemo(
    () =>
      flow.nodes.map(n => ({
        id: n.id,
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { ...n, selected: n.id === selectedNodeId },
        selectable: true,
      })),
    [flow.nodes, selectedNodeId]
  );

  const rawEdges: Edge[] = useMemo(
    () =>
      flow.edges.map((e, i) => {
        const style = EDGE_STYLE_MAP[e.style ?? 'normal'];
        return {
          id: `e${i}`,
          source: e.from,
          target: e.to,
          label: e.label,
          labelStyle: { fontSize: 11, fill: '#64748b', fontWeight: 500 },
          labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.9 },
          labelBgPadding: [4, 6] as [number, number],
          labelBgBorderRadius: 4,
          animated: e.style === 'success',
          style: {
            stroke: style.stroke,
            strokeWidth: 2,
            strokeDasharray: style.strokeDasharray,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: style.stroke,
            width: 16,
            height: 16,
          },
        };
      }),
    [flow.edges]
  );

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => buildDagreLayout(rawNodes, rawEdges),
    [rawNodes, rawEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const nodeData = flow.nodes.find(n => n.id === node.id);
      if (nodeData) onNodeClick(nodeData);
    },
    [flow.nodes, onNodeClick]
  );

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 图例 */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
          background: 'rgba(255,255,255,0.96)',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '14px 18px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
          minWidth: 180,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 10, letterSpacing: 0.5 }}>
          图例说明
        </div>
        {[
          { color: '#16a34a', bg: '#f0fdf4', label: '起始环节', desc: '案件处理的起点' },
          { color: '#2563eb', bg: '#eff6ff', label: '处理环节', desc: '常规办理步骤' },
          { color: '#d97706', bg: '#fffbeb', label: '决策节点', desc: '需做选择的分叉点' },
          { color: '#7c3aed', bg: '#f5f3ff', label: '终止环节', desc: '案件结束或执行' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: item.bg,
                border: `2.5px solid ${item.color}`,
                flexShrink: 0,
              }}
            />
            <div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{item.label}</span>
              <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 6 }}>{item.desc}</span>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>连线说明</div>
          {[
            { color: '#16a34a', dash: false, animated: true, label: '流程推进路径' },
            { color: '#d97706', dash: false, animated: false, label: '不服结果，另行处理' },
            { color: '#94a3b8', dash: true,  animated: false, label: '上诉/申诉路径' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <svg width="32" height="10" style={{ flexShrink: 0 }}>
                <line
                  x1="0" y1="5" x2="28" y2="5"
                  stroke={item.color}
                  strokeWidth="2.5"
                  strokeDasharray={item.dash ? '5 3' : undefined}
                />
                <polygon points="24,2 32,5 24,8" fill={item.color} />
              </svg>
              <span style={{ fontSize: 12, color: '#475569' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.4}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls position="bottom-right" showInteractive={false} />
        <MiniMap
          position="bottom-left"
          nodeColor={node => {
            const colors: Record<string, string> = {
              start: '#16a34a',
              normal: '#2563eb',
              decision: '#d97706',
              end: '#7c3aed',
            };
            return colors[((node.data as unknown) as FlowNodeData).nodeType ?? 'normal'];
          }}
          maskColor="rgba(248,250,252,0.7)"
          style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  );
}