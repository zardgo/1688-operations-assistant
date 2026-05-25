import { describe, expect, it } from "vitest";
import { getDomainModule, getDomainModulesForGoal, listDomainModules } from "./domainModules";

describe("domain modules", () => {
  it("derives a service module from foundation tables", () => {
    const serviceModule = getDomainModule("service");

    expect(serviceModule.domain.id).toBe("service");
    expect(serviceModule.metrics.map((metric) => metric.id)).toEqual(
      expect.arrayContaining(["lighthouse_score", "ww_3min_response_rate", "intervention_rate"])
    );
    expect(serviceModule.dataSources.map((source) => source.id)).toEqual(
      expect.arrayContaining(["new_lighthouse", "after_sales_backend", "manual_input"])
    );
    expect(serviceModule.diagnosisRules.map((rule) => rule.id)).toContain("response-rate-low");
    expect(serviceModule.actionTemplates.map((action) => action.id)).toContain("daily-response-cleanup");
  });

  it("keeps platform pages as data sources instead of domain modules", () => {
    const moduleIds = listDomainModules().map((item) => item.domain.id);

    expect(moduleIds).toContain("service");
    expect(moduleIds).not.toContain("new_lighthouse");
  });

  it("does not include current metric readings in a domain module", () => {
    const serviceModule = getDomainModule("service");

    expect("metricReadings" in serviceModule).toBe(false);
    expect("currentValue" in serviceModule).toBe(false);
  });

  it("throws a clear error for unknown domain modules", () => {
    expect(() => getDomainModule("new_lighthouse" as never)).toThrow("Unknown domain module: new_lighthouse");
  });

  it("composes domain modules for a goal mapping", () => {
    const modules = getDomainModulesForGoal("factory_bronze");

    expect(modules.map((item) => item.domain.id)).toEqual(
      expect.arrayContaining(["service", "factory_custom", "guardrail"])
    );
  });
});
