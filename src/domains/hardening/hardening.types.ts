
export const ExecutionType = {
  FULL_STANDARD: 'FULL_STANDARD',
  ASSIGNED_PROFILE: 'ASSIGNED_PROFILE',
  CUSTOM_ADHOC: 'CUSTOM_ADHOC',
} as const;

export type ExecutionType = (typeof ExecutionType)[keyof typeof ExecutionType];

export const FindingStatus = {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
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

export interface AuditExecutionPayload {
  device_id: string;
  raw_config: string;
  execution_type: ExecutionType;
  profile_id?: string;
  adhoc_rule_ids?: string[];
  vdom_id?: string;
}

export interface Finding {
  id: string;
  rule_id: string;
  status: FindingStatus;
  severity: RuleSeverity;
  current_value?: string;
  expected_value?: string;
  remediation_cmd?: string;
}

export interface AuditReport {
  id: string;
  device_id: string;
  vdom_id?: string;
  execution_type: ExecutionType;
  profile_id?: string;
  score: number;
  total_passed: number;
  total_failed: number;
  total_not_applicable: number;
  executed_at: string;
  findings: Finding[];
}

export interface RuleCatalogItem {
  id: string;          // UUID interno
  rule_id?: string;    // Ejemplo: "CIS-1.1"
  code?: string;       // O de lo contrario "code"
  name: string;
  description?: string;
  category?: string;
  standard?: string;
  default_severity?: string;
  is_active?: boolean;
}

export interface HardeningProfile {
  id: string;
  name: string;
  description?: string;
  profile_type: string;
  is_active: boolean;
  created_at: string;
  rules: RuleCatalogItem[];
}