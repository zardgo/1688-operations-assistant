import { describe, expect, it } from "vitest";
import { adaptGoalMappingForOperations } from "./operationsAdapter";

describe("operations adapter", () => {
  it("bridges factory bronze to the existing operations goal without generating actions directly", () => {
    const adapted = adaptGoalMappingForOperations("factory_bronze");

    expect(adapted.compatibleGoalId).toBe("factory_bronze");
    expect(adapted.goalLabel).toBe("冲找工厂铜牌");
    expect(adapted.requiredMetricIds).toEqual(
      expect.arrayContaining(["factory_service_response_rate", "factory_fulfillment_rate"])
    );
    expect(adapted.domainModuleIds).toEqual(expect.arrayContaining(["service", "factory_custom", "guardrail"]));
    expect(adapted.dataSourceIds).toContain("factory_workbench");
    expect(adapted.generatedActionTemplateIds).toEqual([]);
  });

  it("bridges protect service to the existing service goal", () => {
    const adapted = adaptGoalMappingForOperations("protect_service");

    expect(adapted.compatibleGoalId).toBe("protect_service");
    expect(adapted.domainIds).toEqual(expect.arrayContaining(["service", "guardrail"]));
    expect(adapted.guardrailMetricIds).toContain("intervention_rate");
  });
});
