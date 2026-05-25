export const foundationTableNames = [
  "Domain",
  "DataSource",
  "MetricDefinition",
  "GoalMapping",
  "ActionTemplate",
  "DiagnosisRule"
] as const;

export type DomainId =
  | "service"
  | "product_growth"
  | "trade_funnel"
  | "factory_custom"
  | "customer_repeat"
  | "guardrail";

export type DataSourceId =
  | "new_lighthouse"
  | "sycm_core_board"
  | "product_growth_backend"
  | "product_list"
  | "factory_workbench"
  | "after_sales_backend"
  | "ad_backend"
  | "internal_profit_sheet"
  | "manual_input";

export type MetricDirection = "higher_is_better" | "lower_is_better" | "target_range";
export type MetricUnit = "%" | "score" | "count" | "money" | "hour" | "stars" | "points";
export type MetricCadence = "daily" | "weekly" | "monthly" | "30d" | "realtime";
export type SourceType = "manual" | "xls" | "copy_table" | "screenshot" | "api";
export type SourceConfidence = "low" | "medium" | "high";
export type OwnerRole = "operator" | "customer_service" | "manager";
export type GuardrailLevel = "none" | "watch" | "blocking";
export type ActionFrequency =
  | "one_time_setup"
  | "daily_operation"
  | "periodic_check"
  | "exception_triggered"
  | "experiment";
export type EvidencePolicy = "none" | "optional_note" | "required_note" | "screenshot_required";
export type VerificationWindow = "next_day" | "3d" | "7d" | "30d";

export type DomainDefinition = {
  id: DomainId;
  name: string;
  purpose: string;
  primaryMetricIds: string[];
  sourceIds: DataSourceId[];
  ownerRoles: OwnerRole[];
  guardrailMetricIds: string[];
};

export type DataSourceDefinition = {
  id: DataSourceId;
  name: string;
  sourceType: SourceType;
  ownerRole: OwnerRole;
  cadence: MetricCadence;
  freshnessRule: string;
  confidence: SourceConfidence;
  providedMetricIds: string[];
  sourceUrl?: string;
};

export type MetricDefinition = {
  id: string;
  name: string;
  domainId: DomainId;
  sourceIds: DataSourceId[];
  unit: MetricUnit;
  direction: MetricDirection;
  cadence: MetricCadence;
  definition: string;
  isOfficialMetric: boolean;
  canBeGoalMetric: boolean;
  canBeVerificationMetric: boolean;
  guardrailLevel: GuardrailLevel;
};

export type GoalMapping = {
  goalId: string;
  name: string;
  domainIds: DomainId[];
  requiredMetricIds: string[];
  supportingMetricIds: string[];
  guardrailMetricIds: string[];
  ruleVersionIds: string[];
  priorityPolicy: "largest_gap_first" | "official_priority_first" | "risk_first";
  applicableScope: string;
};

export type ActionTemplate = {
  id: string;
  domainId: DomainId;
  bottleneckIds: string[];
  metricIds: string[];
  frequency: ActionFrequency;
  ownerRole: OwnerRole;
  checklist: string[];
  verificationMetricIds: string[];
  verificationWindow: VerificationWindow;
  evidencePolicy: EvidencePolicy;
  stopPolicy: string;
};

export type DiagnosisRule = {
  id: string;
  domainId: DomainId;
  inputMetricIds: string[];
  condition: string;
  bottleneckId: string;
  severityPolicy: string;
  confidencePolicy: string;
  recommendedActionTemplateIds: string[];
  fallbackWhenMissingData: string;
  guardrailChecks: string[];
};
