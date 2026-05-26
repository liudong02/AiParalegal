import { Drawer, Tag, Timeline, Divider, Badge } from 'antd';
import {
  FileTextOutlined,
  BulbOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { FlowNodeData, Material } from '../types';

interface NodeDetailProps {
  node: FlowNodeData | null;
  open: boolean;
  onClose: () => void;
}

function MaterialTag({ material }: { material: Material }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '10px 12px',
        background: material.required ? '#eff6ff' : '#f8fafc',
        border: `1px solid ${material.required ? '#bfdbfe' : '#e2e8f0'}`,
        borderRadius: 8,
        marginBottom: 8,
      }}
    >
      <div style={{ marginTop: 2, flexShrink: 0 }}>
        {material.required ? (
          <CheckCircleOutlined style={{ color: '#2563eb', fontSize: 14 }} />
        ) : (
          <ExclamationCircleOutlined style={{ color: '#94a3b8', fontSize: 14 }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>
            {material.name}
          </span>
          <Tag
            color={material.required ? 'blue' : 'default'}
            style={{ fontSize: 11, margin: 0, borderRadius: 4 }}
          >
            {material.required ? '必须' : '选提'}
          </Tag>
        </div>
        {material.note && (
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, lineHeight: 1.5 }}>
            {material.note}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NodeDetail({ node, open, onClose }: NodeDetailProps) {
  if (!node) return null;

  const requiredCount = node.materials.filter(m => m.required).length;
  const optionalCount = node.materials.filter(m => !m.required).length;

  return (
    <Drawer
      title={
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge
              count={String(node.step).padStart(2, '0')}
              style={{ backgroundColor: '#2563eb', fontWeight: 700, fontSize: 12 }}
            />
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
              {node.name}
            </span>
          </div>
        </div>
      }
      placement="right"
      width={480}
      open={open}
      onClose={onClose}
      styles={{
        body: { padding: '16px 20px', background: '#f8fafc' },
        header: { borderBottom: '1px solid #e2e8f0', background: '#fff', padding: '16px 20px' },
      }}
      closable
    >
      {/* Time info */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <ClockCircleOutlined style={{ color: '#2563eb' }} />
          <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>时间周期</span>
        </div>
        <div style={{ fontSize: 14, color: '#374151', marginBottom: 4 }}>
          <span style={{ color: '#64748b', marginRight: 6 }}>预估：</span>
          {node.duration}
        </div>
        {node.duration_legal && (
          <div style={{ fontSize: 13, color: '#64748b' }}>
            <span style={{ marginRight: 6 }}>法定：</span>
            {node.duration_legal}
          </div>
        )}
      </div>

      {/* Materials */}
      {node.materials.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileTextOutlined style={{ color: '#2563eb' }} />
              <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
                所需材料
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {requiredCount > 0 && (
                <Tag color="blue" style={{ fontSize: 11, borderRadius: 4 }}>
                  必须 {requiredCount} 项
                </Tag>
              )}
              {optionalCount > 0 && (
                <Tag style={{ fontSize: 11, borderRadius: 4 }}>
                  选提 {optionalCount} 项
                </Tag>
              )}
            </div>
          </div>
          <div>
            {node.materials.map((m, i) => (
              <MaterialTag key={i} material={m} />
            ))}
          </div>
        </div>
      )}

      {/* Key points */}
      {node.key_points.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 10,
            }}
          >
            <BulbOutlined style={{ color: '#d97706' }} />
            <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
              关键注意事项
            </span>
          </div>
          <Timeline
            items={node.key_points.map((point, i) => ({
              key: i,
              color: '#d97706',
              children: (
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, paddingBottom: 4 }}>
                  {point}
                </div>
              ),
            }))}
          />
        </div>
      )}

      {/* Warnings */}
      {node.warnings && node.warnings.length > 0 && (
        <div>
          <Divider style={{ margin: '12px 0', borderColor: '#fee2e2' }} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 10,
            }}
          >
            <WarningOutlined style={{ color: '#dc2626' }} />
            <span style={{ fontWeight: 600, fontSize: 13, color: '#dc2626' }}>
              风险提示
            </span>
          </div>
          <div>
            {node.warnings.map((w, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 8,
                  padding: '10px 12px',
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: 8,
                  marginBottom: 8,
                  fontSize: 13,
                  color: '#b91c1c',
                  lineHeight: 1.6,
                }}
              >
                <span style={{ flexShrink: 0 }}>▸</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Drawer>
  );
}
