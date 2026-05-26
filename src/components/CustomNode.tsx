import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { FlowNodeData, NodeType } from '../types';

const NODE_COLORS: Record<NodeType, { bg: string; border: string; badge: string }> = {
  start:    { bg: '#f0fdf4', border: '#16a34a', badge: '#16a34a' },
  normal:   { bg: '#eff6ff', border: '#2563eb', badge: '#2563eb' },
  decision: { bg: '#fffbeb', border: '#d97706', badge: '#d97706' },
  end:      { bg: '#f5f3ff', border: '#7c3aed', badge: '#7c3aed' },
};

const NODE_LABELS: Record<NodeType, string> = {
  start:    '起始环节',
  normal:   '处理环节',
  decision: '决策节点',
  end:      '终止环节',
};

type CustomNodeProps = NodeProps & { data: FlowNodeData & { selected?: boolean } };

export default function CustomNode({ data, selected }: CustomNodeProps) {
  const type: NodeType = data.nodeType ?? 'normal';
  const colors = NODE_COLORS[type];

  return (
    <div
      style={{
        background: colors.bg,
        border: `3px solid ${selected ? '#1d4ed8' : colors.border}`,
        borderRadius: 14,
        width: 380,
        boxShadow: selected
          ? `0 0 0 4px rgba(37,99,235,0.2), 0 8px 24px rgba(0,0,0,0.18)`
          : '0 4px 14px rgba(0,0,0,0.12)',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />

      {/* Header */}
      <div
        style={{
          background: colors.badge,
          borderRadius: '11px 11px 0 0',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span
          style={{
            background: 'rgba(255,255,255,0.28)',
            borderRadius: 8,
            padding: '3px 14px',
            fontSize: 18,
            color: '#fff',
            fontWeight: 800,
            letterSpacing: 2,
            lineHeight: 1.4,
          }}
        >
          {String(data.step).padStart(2, '0')}
        </span>
        <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
          {NODE_LABELS[type]}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px 20px' }}>
        {/* 节点名称 */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#1e293b',
            lineHeight: 1.35,
            marginBottom: 14,
          }}
        >
          {data.name}
        </div>

        {/* 时间 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.04)',
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⏱</span>
          <div>
            <div style={{ fontSize: 15, color: '#374151', fontWeight: 500 }}>{data.duration}</div>
            {data.duration_legal && (
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                法定：{data.duration_legal}
              </div>
            )}
          </div>
        </div>

        {/* 警告 */}
        {data.warnings && data.warnings.length > 0 && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 14,
              color: '#dc2626',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 6,
              lineHeight: 1.6,
            }}
          >
            <span style={{ flexShrink: 0, fontWeight: 700 }}>⚠</span>
            <span>{data.warnings[0]}</span>
          </div>
        )}

        {/* 点击提示 */}
        <div
          style={{
            marginTop: 12,
            fontSize: 14,
            color: colors.badge,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            opacity: 0.85,
          }}
        >
          <span>点击查看材料清单与注意事项</span>
          <span style={{ fontSize: 16 }}>→</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}
