import { describe, expect, it } from "vitest";
import { createActiveGoalContext } from "./types";
import type { ActiveGoalContext } from "./types";

describe("ActiveGoalContext", () => {
  it("models current goal as runtime context", () => {
    const context: ActiveGoalContext = {
      goalId: "factory_bronze",
      shopId: "default-shop",
      domainIds: ["factory_custom", "service", "guardrail"],
      startedAt: "2026-05-25",
      targetWindow: "30d",
      status: "active"
    };

    expect(context.status).toBe("active");
    expect(context.domainIds).toContain("guardrail");
  });

  it("creates an active goal context from required fields", () => {
    const context = createActiveGoalContext({
      goalId: "protect_service",
      shopId: "default-shop",
      domainIds: ["service", "guardrail"],
      startedAt: "2026-05-25",
      targetWindow: "30d"
    });

    expect(context).toMatchObject({
      goalId: "protect_service",
      status: "active"
    });
  });
});
