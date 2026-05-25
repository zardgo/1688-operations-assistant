import type { GoalMapping } from "./types";

export const goalMappings: GoalMapping[] = [
  {
    goalId: "protect_service",
    name: "保基础服务分",
    domainIds: ["service", "guardrail"],
    requiredMetricIds: ["lighthouse_score", "consultation_experience_score", "ww_3min_response_rate"],
    supportingMetricIds: ["refund_processing_duration"],
    guardrailMetricIds: ["intervention_rate"],
    ruleVersionIds: ["new-lighthouse-5-service-experience"],
    priorityPolicy: "largest_gap_first",
    applicableScope: "保温杯店铺 / 服务体验"
  },
  {
    goalId: "factory_bronze",
    name: "冲找工厂铜牌",
    domainIds: ["factory_custom", "service", "guardrail"],
    requiredMetricIds: [
      "factory_service_response_rate",
      "factory_fulfillment_rate",
      "custom_trade_points",
      "contract_payment_rate"
    ],
    supportingMetricIds: ["ww_3min_response_rate", "consultation_experience_score"],
    guardrailMetricIds: ["gross_margin_rate", "intervention_rate"],
    ruleVersionIds: ["factory-bronze-2026-05-draft"],
    priorityPolicy: "official_priority_first",
    applicableScope: "保温杯 / 找工厂 / 铜牌升级"
  }
];
