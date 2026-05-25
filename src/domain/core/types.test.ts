import { describe, expect, it } from "vitest";
import { foundationTableNames } from "./types";
import type {
  ActionTemplate,
  DataSourceDefinition,
  DiagnosisRule,
  DomainDefinition,
  GoalMapping,
  MetricDefinition
} from "./types";

describe("domain foundation core types", () => {
  it("supports the six foundation tables", () => {
    const domain: DomainDefinition = {
      id: "service",
      name: "服务域",
      purpose: "响应、物流、售后、履约、服务星级",
      primaryMetricIds: ["lighthouse_score"],
      sourceIds: ["new_lighthouse"],
      ownerRoles: ["operator", "customer_service"],
      guardrailMetricIds: ["intervention_rate"]
    };

    const source: DataSourceDefinition = {
      id: "new_lighthouse",
      name: "新灯塔",
      sourceType: "manual",
      ownerRole: "operator",
      cadence: "30d",
      freshnessRule: "daily",
      confidence: "medium",
      providedMetricIds: ["lighthouse_score"],
      sourceUrl: "https://work.1688.com/home/page/index.htm?_path_=sellerPro/lvyue/new-lighthouse-ai"
    };

    const metric: MetricDefinition = {
      id: "lighthouse_score",
      name: "新灯塔分",
      domainId: "service",
      sourceIds: ["new_lighthouse"],
      unit: "score",
      direction: "higher_is_better",
      cadence: "30d",
      definition: "1688 新灯塔页面展示的店铺服务体验综合分。",
      isOfficialMetric: true,
      canBeGoalMetric: true,
      canBeVerificationMetric: true,
      guardrailLevel: "none"
    };

    const goal: GoalMapping = {
      goalId: "protect_service",
      name: "保基础服务分",
      domainIds: ["service", "guardrail"],
      requiredMetricIds: ["lighthouse_score"],
      supportingMetricIds: [],
      guardrailMetricIds: ["intervention_rate"],
      ruleVersionIds: [],
      priorityPolicy: "largest_gap_first",
      applicableScope: "保温杯店铺 / 服务体验"
    };

    const action: ActionTemplate = {
      id: "daily-response-cleanup",
      domainId: "service",
      bottleneckIds: ["response_mechanism_gap"],
      metricIds: ["ww_3min_response_rate"],
      frequency: "daily_operation",
      ownerRole: "customer_service",
      checklist: ["检查未及时回复咨询", "补齐快捷回复"],
      verificationMetricIds: ["ww_3min_response_rate"],
      verificationWindow: "next_day",
      evidencePolicy: "optional_note",
      stopPolicy: "metric_recovered"
    };

    const diagnosis: DiagnosisRule = {
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
    };

    expect(domain.id).toBe("service");
    expect(source.providedMetricIds).toContain(metric.id);
    expect(goal.requiredMetricIds).toContain(metric.id);
    expect(action.verificationMetricIds).toContain("ww_3min_response_rate");
    expect(diagnosis.recommendedActionTemplateIds).toContain(action.id);
    expect(foundationTableNames).toEqual([
      "Domain",
      "DataSource",
      "MetricDefinition",
      "GoalMapping",
      "ActionTemplate",
      "DiagnosisRule"
    ]);
  });
});
