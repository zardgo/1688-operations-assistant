import { describe, expect, it } from "vitest";
import {
  factoryBenchmarks,
  playbooks,
  roadmap,
  stableProfitRules,
  weeklyReviewModules
} from "./knowledge";

describe("knowledge base data", () => {
  it("contains the 90-day operating roadmap", () => {
    expect(roadmap).toHaveLength(4);
    expect(roadmap[0].goal).toContain("可信店铺底座");
    expect(roadmap[2].checks).toContain("员工能按 SOP 独立执行");
  });

  it("keeps weekly review modules tied to target feedback", () => {
    expect(weeklyReviewModules.map((module) => module.name)).toContain("询盘");
    expect(weeklyReviewModules.map((module) => module.name)).toContain("利润");
    expect(weeklyReviewModules.find((module) => module.name === "战略边界")?.fallback).toContain("降低 Leon 参与深度");
  });

  it("includes stable-profit rules employees can act on", () => {
    expect(stableProfitRules).toContain("客服先问用途、数量、预算、交期，再给三档方案");
    expect(stableProfitRules).toContain("先验证询盘、报价、交付、毛利和组织可执行性，再加大站内投放");
  });

  it("surfaces factory benchmarks from the 1688 knowledge base", () => {
    expect(factoryBenchmarks.length).toBeGreaterThanOrEqual(3);
    expect(factoryBenchmarks[0]).toMatchObject({
      category: "保温杯",
      city: "金华"
    });
  });

  it("includes playbooks for conversion, delivery, profit, and repeat purchase", () => {
    expect(playbooks.map((playbook) => playbook.title)).toEqual([
      "定位和货盘",
      "询盘转化",
      "交付控损",
      "利润和复购"
    ]);
  });
});
