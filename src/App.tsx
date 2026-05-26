import { useState, useMemo } from 'react';
import { Select, Button, Alert, Tag, Tooltip } from 'antd';
import { SearchOutlined, SwapOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { CASE_OPTIONS, PROVINCE_CITIES, getFlow, getAvailableCities } from './data';
import type { CaseFlow, FlowNodeData } from './types';
import FlowChart from './components/FlowChart';
import NodeDetail from './components/NodeDetail';

const { Option, OptGroup } = Select;

export default function App() {
  const [caseType, setCaseType] = useState<string>('labor');
  const [city, setCity] = useState<string>('深圳');
  const [activeFlow, setActiveFlow] = useState<CaseFlow | null>(() => getFlow('labor', '深圳'));
  const [selectedNode, setSelectedNode] = useState<FlowNodeData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const availableCities = useMemo(() => getAvailableCities(caseType), [caseType]);

  const handleCaseTypeChange = (v: string) => {
    setCaseType(v);
    setCity('');
    setActiveFlow(null);
  };

  const handleSearch = () => {
    const flow = getFlow(caseType, city);
    setActiveFlow(flow);
    setSelectedNode(null);
    setDrawerOpen(false);
    setSelectedNodeId(null);
  };

  const handleNodeClick = (node: FlowNodeData) => {
    setSelectedNode(node);
    setSelectedNodeId(node.id);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedNodeId(null);
  };

  const hasData = availableCities.includes(city);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#f1f5f9',
        fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          background: '#1e3a5f',
          padding: '0 24px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>⚖️</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: 0.5 }}>
            法律案件处理流程查询
          </span>
          <Tag
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 11,
              borderRadius: 4,
            }}
          >
            律师工具
          </Tag>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
          数据持续更新中 · 仅供参考
        </div>
      </div>

      {/* Selector bar */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>案件类型</span>
          <Select
            value={caseType}
            onChange={handleCaseTypeChange}
            style={{ width: 140 }}
            size="middle"
          >
            {CASE_OPTIONS.map(o => (
              <Option key={o.value} value={o.value}>
                {o.label}
              </Option>
            ))}
          </Select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>发生城市</span>
          <Select
            value={city || undefined}
            onChange={setCity}
            placeholder="选择城市"
            style={{ width: 160 }}
            size="middle"
            showSearch
          >
            {PROVINCE_CITIES.map(pc => (
              <OptGroup key={pc.province} label={pc.province}>
                {pc.cities.map(c => {
                  const available = availableCities.includes(c);
                  return (
                    <Option key={c} value={c} disabled={!available}>
                      <span style={{ color: available ? undefined : '#cbd5e1' }}>
                        {c}
                        {!available && (
                          <span style={{ fontSize: 11, marginLeft: 4 }}>（暂无数据）</span>
                        )}
                      </span>
                    </Option>
                  );
                })}
              </OptGroup>
            ))}
          </Select>
        </div>

        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleSearch}
          disabled={!caseType || !city || !hasData}
          style={{ background: '#1e3a5f', borderColor: '#1e3a5f' }}
        >
          查看流程
        </Button>

        {activeFlow && (
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <SwapOutlined style={{ color: '#94a3b8' }} />
            <span style={{ fontSize: 12, color: '#64748b' }}>
              正在查看：
              <strong style={{ color: '#1e3a5f', marginLeft: 4 }}>
                {activeFlow.city} · {CASE_OPTIONS.find(o => o.value === activeFlow.case_type)?.label}
              </strong>
            </span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              共 {activeFlow.nodes.length} 个环节
            </span>
            <Tooltip title="点击流程图中的节点，查看该环节所需材料和注意事项">
              <InfoCircleOutlined style={{ color: '#94a3b8', cursor: 'pointer' }} />
            </Tooltip>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {!activeFlow ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 16,
            }}
          >
            <span style={{ fontSize: 56 }}>⚖️</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                选择案件类型和城市，查看完整处理流程
              </div>
              <div style={{ fontSize: 14, color: '#64748b' }}>
                目前支持：劳动争议（北京、深圳）· 离婚诉讼（上海）
              </div>
            </div>
            <Alert
              message="点击流程图中任意节点，可查看该环节所需材料清单、关键注意事项和风险提示"
              type="info"
              showIcon
              style={{ maxWidth: 480, borderRadius: 8 }}
            />
          </div>
        ) : (
          <FlowChart
            flow={activeFlow}
            onNodeClick={handleNodeClick}
            selectedNodeId={selectedNodeId}
          />
        )}
      </div>

      <NodeDetail
        node={selectedNode}
        open={drawerOpen}
        onClose={handleDrawerClose}
      />
    </div>
  );
}
