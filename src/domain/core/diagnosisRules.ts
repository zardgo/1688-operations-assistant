import type { DiagnosisRule } from "./types";

export const diagnosisRules: DiagnosisRule[] = [
  {
    id: "response-rate-low",
    domainId: "service",
    inputMetricIds: ["ww_3min_response_rate"],
    condition: "value_below_target",
    bottleneckId: "response_mechanism_gap",
    severityPolicy: "official_goal_gap",
    confidencePolicy: "requires_current_reading",
    recommendedActionTemplateIds: ["daily-response-cleanup"],
    fallbackWhenMissingData: "ask_for_metric_reading",
    guardrailChecks: []
  },
  {
    id: "refund-processing-slow",
    domainId: "service",
    inputMetricIds: ["refund_processing_duration", "intervention_rate"],
    condition: "refund_duration_or_intervention_above_target",
    bottleneckId: "refund_processing_gap",
    severityPolicy: "risk_first",
    confidencePolicy: "requires_30d_reading",
    recommendedActionTemplateIds: ["refund-daily-clearance"],
    fallbackWhenMissingData: "ask_for_after_sales_reading",
    guardrailChecks: ["intervention_rate"]
  },
  {
    id: "factory-service-response-low",
    domainId: "factory_custom",
    inputMetricIds: ["factory_service_response_rate", "ww_3min_response_rate"],
    condition: "factory_response_below_target",
    bottleneckId: "factory_response_gap",
    severityPolicy: "official_goal_gap",
    confidencePolicy: "requires_factory_reading",
    recommendedActionTemplateIds: ["factory-inquiry-followup"],
    fallbackWhenMissingData: "ask_for_factory_workbench_reading",
    guardrailChecks: []
  },
  {
    id: "contract-payment-low",
    domainId: "factory_custom",
    inputMetricIds: ["contract_payment_rate", "custom_trade_points"],
    condition: "contract_payment_or_points_below_target",
    bottleneckId: "contract_payment_gap",
    severityPolicy: "official_goal_gap",
    confidencePolicy: "requires_factory_reading",
    recommendedActionTemplateIds: ["contract-payment-followup"],
    fallbackWhenMissingData: "ask_for_factory_workbench_reading",
    guardrailChecks: ["gross_margin_rate"]
  },
  {
    id: "gross-margin-below-floor",
    domainId: "guardrail",
    inputMetricIds: ["gross_margin_rate"],
    condition: "gross_margin_below_floor",
    bottleneckId: "gross_margin_gap",
    severityPolicy: "risk_first",
    confidencePolicy: "requires_profit_reading",
    recommendedActionTemplateIds: ["margin-risk-review"],
    fallbackWhenMissingData: "ask_for_profit_reading",
    guardrailChecks: ["gross_margin_rate"]
  }
];
