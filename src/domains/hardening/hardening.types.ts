// hardening.types.ts

export const ExecutionType = {
  FULL_STANDARD: 'FULL_STANDARD',
  ASSIGNED_PROFILE: 'ASSIGNED_PROFILE',
  CUSTOM_ADHOC: 'CUSTOM_ADHOC',
} as const;

export type ExecutionType = (typeof ExecutionType)[keyof typeof ExecutionType];

export const FindingStatus = {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  EXEMPT: 'EXEMPT',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
} as const;

export type FindingStatus = (typeof FindingStatus)[keyof typeof FindingStatus];

export const RuleSeverity = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

export type RuleSeverity = (typeof RuleSeverity)[keyof typeof RuleSeverity];

export const OperatorType = {
  EQUALS: 'EQUALS',
  NOT_EQUALS: 'NOT_EQUALS',
  REGEX_MATCH: 'REGEX_MATCH',
  CONTAINS: 'CONTAINS',
} as const;

export type OperatorType = (typeof OperatorType)[keyof typeof OperatorType];

export interface DynamicConditionSchema {
  block_path?: string;
  field?: string;
  operator: OperatorType;
  expected_value: string | number | boolean;
  remediation_cmd?: string;
}

export interface AuditExecutionPayload {
  device_id: string;
  raw_config: string;
  execution_type: ExecutionType;
  profile_id?: string;
  adhoc_rule_ids?: string[];
  vdom_id?: string;
  standard_version?: string;
}

export interface Finding {
  id: string;
  rule_id: string;
  rule_name?: string;
  category?: string;
  status: FindingStatus;
  severity: RuleSeverity;
  current_value?: string;
  raw_evidence?: string;
  reason?: string;
  expected_value?: string;
  remediation_cmd?: string;
  details?: Record<string, unknown>;
}

export interface AuditReport {
  id: string;
  device_id: string;
  vdom_id?: string;
  execution_type: ExecutionType;
  profile_id?: string;
  standard_version?: string;
  score: number;
  total_passed: number;
  total_failed: number;
  total_rules_evaluated: number;
  total_not_applicable?: number;
  executed_at: string;
  findings_data?: Finding[]; // Mapeo para alias del Backend
  findings: Finding[];
}

export interface RuleCatalogItem {
  id: string;
  rule_id?: string;
  code?: string;
  name: string;
  description?: string;
  category?: string;
  standard?: string;
  standard_version?: string;
  default_severity?: RuleSeverity | string;
  is_active?: boolean;
  condition_schema?: DynamicConditionSchema;
}

export interface HardeningProfile {
  id: string;
  name: string;
  description?: string;
  profile_type: string;
  standard_version?: string;
  is_active: boolean;
  created_at: string;
  rules: RuleCatalogItem[];
}

// Agregar al final de hardening.types.ts

export interface AuditReportListItem {
  id: string;
  device_id: string;
  device_name?: string;
  execution_type: ExecutionType;
  profile_id?: string;
  profile_name?: string;
  score: number;
  total_passed: number;
  total_failed: number;
  total_not_applicable?: number;
  executed_at: string;
}

export interface FetchReportsParams {
  device_id?: string;
  limit?: number;
  offset?: number;
}