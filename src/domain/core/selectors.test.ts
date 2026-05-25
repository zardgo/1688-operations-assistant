import { describe, expect, it } from "vitest";
import {
  getActionsForDiagnosisRule,
  getDataSourcesForMetric,
  getGoalMapping,
  getGuardrailsForGoal,
  getMetricsForGoal
} from "./selectors";

describe("domain foundation selectors", () => {
  it("resolves factory bronze from goal to metrics, data sources, actions, and guardrails", () => {
    const goal = getGoalMapping("factory_bronze");
    const metrics = getMetricsForGoal("factory_bronze");
    const factorySources = getDataSourcesForMetric("factory_service_response_rate");
    const actions = getActionsForDiagnosisRule("factory-service-response-low");
    const guardrails = getGuardrailsForGoal("factory_bronze");

    expect(goal.domainIds).toEqual(expect.arrayContaining(["factory_custom", "guardrail"]));
    expect(metrics.map((metric) => metric.id)).toContain("factory_service_response_rate");
    expect(factorySources.map((source) => source.id)).toContain("factory_workbench");
    expect(actions.map((action) => action.id)).toContain("factory-inquiry-followup");
    expect(guardrails.map((metric) => metric.id)).toContain("gross_margin_rate");
  });

  it("throws clear errors for unknown IDs", () => {
    expect(() => getGoalMapping("missing-goal")).toThrow("Unknown goal mapping: missing-goal");
    expect(() => getDataSourcesForMetric("missing-metric")).toThrow("Unknown metric definition: missing-metric");
    expect(() => getActionsForDiagnosisRule("missing-rule")).toThrow("Unknown diagnosis rule: missing-rule");
  });
});
