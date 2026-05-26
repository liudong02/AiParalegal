export interface Material {
  name: string;
  required: boolean;
  note?: string;
}

export type NodeType = 'start' | 'normal' | 'decision' | 'end';
export type EdgeStyle = 'normal' | 'success' | 'warning' | 'dashed';

export interface FlowNodeData {
  id: string;
  step: number;
  name: string;
  nodeType?: NodeType;
  duration: string;
  duration_legal?: string;
  materials: Material[];
  key_points: string[];
  warnings?: string[];
}

export interface EdgeDef {
  from: string;
  to: string;
  label?: string;
  style?: EdgeStyle;
}

export interface CaseFlow {
  case_type: string;
  city: string;
  province: string;
  updated_at: string;
  nodes: FlowNodeData[];
  edges: EdgeDef[];
}

export interface CaseOption {
  label: string;
  value: string;
}

export interface ProvinceCity {
  province: string;
  cities: string[];
}
