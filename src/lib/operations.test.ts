import { describe, expect, it } from "vitest";
import {
  buildKeywordMatrix,
  createActionQueue,
  createMvpWeeklyReview,
  diagnoseMvp,
  evaluateOperations,
  getRoadmapPhase,
  mvpSeedScenarios,
  recommendSkuRoles,
  type WeeklyMetrics
} from "./operations";

const baselineMetrics: WeeklyMetrics = {
  week: 3,
  inquiries: 18,
  validInquiryRate: 0.58,
  responseRate: 0.91,
  quoteFollowupRate: 0.44,
  sampleOrders: 4,
  grossMarginRate: 0.24,
  repeatPurchaseRate: 0.08,
  deliveryIssueRate: 0.04,
  assetsCompleted: 5,
  leonDailyHours: 0.5,
  adSpendShare: 0.08
};

describe("1688 operations engine", () => {
  it("scores weekly operations around stable-profit goals", () => {
    const result = evaluateOperations(baselineMetrics);

    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.level).toBe("healthy");
    expect(result.gaps.map((gap) => gap.metric)).toContain("repeatPurchaseRate");
    expect(result.gaps.map((gap) => gap.metric)).not.toContain("deliveryIssueRate");
  });

  it("flags strategic boundary risk when Leon is pulled into daily operations", () => {
    const result = evaluateOperations({
      ...baselineMetrics,
      leonDailyHours: 3.5,
      grossMarginRate: 0.09,
      deliveryIssueRate: 0.19
    });

    expect(result.level).toBe("critical");
    expect(result.gaps[0].metric).toBe("leonDailyHours");
    expect(result.summary).toContain("降级或止损");
  });

  it("detects the correct 90-day roadmap phase", () => {
    expect(getRoadmapPhase(1).name).toBe("第 1 周：可信店铺底座");
    expect(getRoadmapPhase(3).name).toBe("第 2-4 周：询盘到样品闭环");
    expect(getRoadmapPhase(8).name).toBe("第 2-3 个月：主推款和 SOP");
    expect(getRoadmapPhase(15).name).toBe("3 个月以后：复购和战略判断");
  });

  it("builds keyword matrix titles from category, material, buyer, scene, and intent", () => {
    const matrix = buildKeywordMatrix("保温杯");

    expect(matrix.columns.map((column) => column.name)).toEqual([
      "核心词",
      "材质词",
      "人群词",
      "场景词",
      "功能词"
    ]);
    expect(matrix.exampleTitles[0]).toContain("316不锈钢");
    expect(matrix.exampleTitles[0]).toContain("商务礼品");
    expect(matrix.exampleTitles[0]).toContain("批发");
  });

  it("recommends SKU roles from inquiry and margin feedback", () => {
    const roles = recommendSkuRoles([
      { name: "316 商务礼品杯", inquiries: 14, grossMarginRate: 0.31, repeatOrders: 2, customizationRequests: 8 },
      { name: "低价通用杯", inquiries: 20, grossMarginRate: 0.08, repeatOrders: 0, customizationRequests: 1 },
      { name: "儿童吸管杯", inquiries: 5, grossMarginRate: 0.23, repeatOrders: 4, customizationRequests: 1 }
    ]);

    expect(roles[0].role).toBe("定制款");
    expect(roles[1].role).toBe("引流款");
    expect(roles[2].role).toBe("复购款");
  });

  it("turns gaps into employee action queue", () => {
    const actions = createActionQueue(
      evaluateOperations({
        ...baselineMetrics,
        validInquiryRate: 0.22,
        quoteFollowupRate: 0.12,
        assetsCompleted: 2
      })
    );

    expect(actions[0].owner).toBe("运营员工");
    expect(actions.map((action) => action.title)).toContain("补齐客户、SKU、关键词、话术和利润表资产");
    expect(actions.map((action) => action.title)).toContain("重写客服首响和三档报价模板");
  });

  it("generates MVP response-rate tasks before product optimization", () => {
    const responseLow = mvpSeedScenarios.find((scenario) => scenario.id === "S1")!;
    const diagnosis = diagnoseMvp(responseLow.input);

    expect(diagnosis.highestRisk.metricName).toBe("旺旺 3 分钟响应率");
    expect(diagnosis.highestRisk.priority).toBe("P0");
    expect(diagnosis.blockers).toContain("响应率未回到目标前，不优先做商品标题优化。");
    expect(diagnosis.tasks.map((task) => task.ruleIds.join(","))).toContain("R01,R02");
    expect(diagnosis.tasks[0].evidence).toContain("未响应原因清单");
  });

  it("blocks growth when GMV is up but margin is below the floor", () => {
    const lowMargin = mvpSeedScenarios.find((scenario) => scenario.id === "S5")!;
    const diagnosis = diagnoseMvp(lowMargin.input);

    expect(diagnosis.highestRisk.metricName).toBe("毛利率");
    expect(diagnosis.blockers).toContain("毛利低于底线，不建议继续冲 GMV 或定制交易积分。");
    expect(diagnosis.tasks[0].title).toBe("补单品毛利表并标记低毛利订单");
    expect(diagnosis.tasks[0].ruleIds).toEqual(["R15"]);
  });

  it("creates a weekly review from task outcomes and limits next goals", () => {
    const responseLow = mvpSeedScenarios.find((scenario) => scenario.id === "S1")!;
    const diagnosis = diagnoseMvp(responseLow.input);
    const review = createMvpWeeklyReview(diagnosis, [
      { taskId: diagnosis.tasks[0].id, result: "effective", note: "补值班后响应率回到 61%" },
      { taskId: diagnosis.tasks[1].id, result: "ineffective", note: "快捷回复还没被使用" }
    ]);

    expect(review.effectiveTasks).toEqual([diagnosis.tasks[0].title]);
    expect(review.stopActions).toContain(diagnosis.tasks[1].title);
    expect(review.nextGoals.length).toBeLessThanOrEqual(3);
    expect(review.sopCandidate?.title).toContain("客服响应机制");
  });
});
