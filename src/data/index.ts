import type { CaseFlow, CaseOption, ProvinceCity } from '../types';
import laborShenzhen from './flows/labor_shenzhen';
import laborBeijing from './flows/labor_beijing';
import divorceShanghai from './flows/divorce_shanghai';

export const CASE_OPTIONS: CaseOption[] = [
  { label: '劳动争议', value: 'labor' },
  { label: '离婚诉讼', value: 'divorce' },
];

export const PROVINCE_CITIES: ProvinceCity[] = [
  { province: '北京', cities: ['北京'] },
  { province: '上海', cities: ['上海'] },
  { province: '广东', cities: ['深圳', '广州', '东莞', '佛山'] },
];

const flows: CaseFlow[] = [
  laborShenzhen,
  laborBeijing,
  divorceShanghai,
];

export function getFlow(caseType: string, city: string): CaseFlow | null {
  return flows.find(f => f.case_type === caseType && f.city === city) ?? null;
}

export function getAvailableCities(caseType: string): string[] {
  return flows
    .filter(f => f.case_type === caseType)
    .map(f => f.city);
}
