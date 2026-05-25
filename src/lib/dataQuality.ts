export type DataSourceType = "demo" | "manual" | "sycm_import" | "mixed";
export type DataQualityLevel = "high" | "medium" | "low" | "insufficient";
export type DataQualityIssue =
  | "demo_data"
  | "missing_required_field"
  | "fallback_used"
  | "manual_input"
  | "stale_data"
  | "small_sample"
  | "import_partial"
  | "unknown_source";

export type DataQualityReport = {
  sourceType: DataSourceType;
  level: DataQualityLevel;
  label: string;
  issues: DataQualityIssue[];
  importedFields: string[];
  fallbackFields: string[];
  missingFields: string[];
  lastUpdatedAt: string | null;
  canGenerateMission: boolean;
};

export type DiagnosisConfidence = "high" | "medium" | "low" | "insufficient_data";
export type DiagnosisReasonCode =
  | "complete_required_metrics"
  | "missing_required_metrics"
  | "manual_input"
  | "demo_data"
  | "small_sample"
  | "fallback_used"
  | "conflicting_signals"
  | "rule_not_active";

export type DiagnosisMeta = {
  confidence: DiagnosisConfidence;
  reasonCodes: DiagnosisReasonCode[];
  explanation: string;
};

export type BuildDataQualityReportInput = {
  sourceType: DataSourceType;
  importedFields: string[];
  fallbackFields: string[];
  missingFields: string[];
  lastUpdatedAt: string | null;
};

export function buildDataQualityReport(input: BuildDataQualityReportInput): DataQualityReport {
  const issues = new Set<DataQualityIssue>();
  if (input.sourceType === "demo") issues.add("demo_data");
  if (input.sourceType === "manual") issues.add("manual_input");
  if (input.sourceType === "mixed") issues.add("manual_input");
  if (input.missingFields.length > 0) issues.add("missing_required_field");
  if (input.fallbackFields.length > 0) issues.add("fallback_used");
  if (input.sourceType === "sycm_import" && (input.missingFields.length > 0 || input.fallbackFields.length > 0)) {
    issues.add("import_partial");
  }

  const hasBlockingMissingField = input.missingFields.includes("grossMarginRate");
  const level: DataQualityLevel =
    input.sourceType === "demo"
      ? "low"
      : hasBlockingMissingField
        ? "low"
        : input.missingFields.length > 0 || input.fallbackFields.length > 0
          ? "medium"
          : input.sourceType === "sycm_import"
            ? "high"
            : "medium";

  return {
    sourceType: input.sourceType,
    level,
    label: formatDataQualityLabel(input.sourceType, level),
    issues: Array.from(issues),
    importedFields: input.importedFields,
    fallbackFields: input.fallbackFields,
    missingFields: input.missingFields,
    lastUpdatedAt: input.lastUpdatedAt,
    canGenerateMission: !hasBlockingMissingField
  };
}

export function buildDiagnosisMeta(input: {
  dataQuality: DataQualityReport;
  activeRuleCount: number;
  hasGap: boolean;
}): DiagnosisMeta {
  const reasonCodes = new Set<DiagnosisReasonCode>();
  if (input.dataQuality.issues.includes("demo_data")) reasonCodes.add("demo_data");
  if (input.dataQuality.issues.includes("manual_input")) reasonCodes.add("manual_input");
  if (input.dataQuality.issues.includes("fallback_used")) reasonCodes.add("fallback_used");
  if (input.dataQuality.issues.includes("missing_required_field")) reasonCodes.add("missing_required_metrics");
  if (input.dataQuality.missingFields.length === 0) reasonCodes.add("complete_required_metrics");
  if (input.activeRuleCount === 0) reasonCodes.add("rule_not_active");

  const confidence: DiagnosisConfidence =
    input.dataQuality.level === "insufficient" || !input.dataQuality.canGenerateMission
      ? "insufficient_data"
      : input.dataQuality.issues.includes("demo_data") || input.activeRuleCount === 0
        ? "low"
        : input.dataQuality.level === "high" && input.hasGap
          ? "high"
          : "medium";

  return {
    confidence,
    reasonCodes: Array.from(reasonCodes),
    explanation: formatDiagnosisExplanation(confidence)
  };
}

function formatDataQualityLabel(sourceType: DataSourceType, level: DataQualityLevel): string {
  if (sourceType === "demo") return "示例数据，不建议用于真实派单";
  if (level === "high") return "生意参谋导入，关键字段完整";
  if (level === "medium") return "部分字段手动或沿用旧值";
  if (level === "low") return "数据不足或缺关键字段";
  return "数据不足，先补齐";
}

function formatDiagnosisExplanation(confidence: DiagnosisConfidence): string {
  if (confidence === "high") return "导入字段完整、规则已采用、指标缺口明确。";
  if (confidence === "medium") return "可以参考，但仍需关注手填字段或样本波动。";
  if (confidence === "low") return "当前判断只能作为提示，建议先核实数据或规则。";
  return "关键字段不足，不应自动派发强任务。";
}
