import { describe, expect, it } from "vitest";
import {
  actionTemplates,
  dataSourceDefinitions,
  diagnosisRules,
  domainDefinitions,
  goalMappings,
  metricDefinitions
} from ".";

const metricIds = new Set(metricDefinitions.map((metric) => metric.id));
const dataSourceIds = new Set(dataSourceDefinitions.map((source) => source.id));
const actionTemplateIds = new Set(actionTemplates.map((action) => action.id));
const domainIds = new Set(domainDefinitions.map((domain) => domain.id));

describe("domain foundation seed data", () => {
  it("covers the six long-term business domains", () => {
    expect(domainDefinitions.map((domain) => domain.id)).toEqual(
      expect.arrayContaining([
        "service",
        "product_growth",
        "trade_funnel",
        "factory_custom",
        "customer_repeat",
        "guardrail"
      ])
    );

    for (const domain of domainDefinitions) {
      for (const metricId of domain.primaryMetricIds.concat(domain.guardrailMetricIds)) {
        expect(metricIds.has(metricId)).toBe(true);
      }

      for (const sourceId of domain.sourceIds) {
        expect(dataSourceIds.has(sourceId)).toBe(true);
      }
    }
  });

  it("contains the first two goal mappings", () => {
    expect(goalMappings.map((goal) => goal.goalId)).toEqual(expect.arrayContaining(["protect_service", "factory_bronze"]));
  });

  it("keeps goal mappings connected to metrics, domains, and guardrails", () => {
    for (const goal of goalMappings) {
      for (const domainId of goal.domainIds) {
        expect(domainIds.has(domainId)).toBe(true);
      }

      for (const metricId of goal.requiredMetricIds.concat(goal.supportingMetricIds, goal.guardrailMetricIds)) {
        expect(metricIds.has(metricId)).toBe(true);
      }
    }
  });

  it("keeps metrics connected to known data sources", () => {
    for (const metric of metricDefinitions) {
      expect(domainIds.has(metric.domainId)).toBe(true);

      for (const sourceId of metric.sourceIds) {
        expect(dataSourceIds.has(sourceId)).toBe(true);
      }
    }
  });

  it("keeps actions and diagnosis rules connected", () => {
    for (const action of actionTemplates) {
      expect(domainIds.has(action.domainId)).toBe(true);

      for (const metricId of action.metricIds.concat(action.verificationMetricIds)) {
        expect(metricIds.has(metricId)).toBe(true);
      }
    }

    for (const rule of diagnosisRules) {
      expect(domainIds.has(rule.domainId)).toBe(true);

      for (const metricId of rule.inputMetricIds.concat(rule.guardrailChecks)) {
        expect(metricIds.has(metricId)).toBe(true);
      }

      for (const actionId of rule.recommendedActionTemplateIds) {
        expect(actionTemplateIds.has(actionId)).toBe(true);
      }
    }
  });
});
