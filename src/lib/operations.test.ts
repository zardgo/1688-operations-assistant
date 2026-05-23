import { describe, expect, it } from "vitest";
import {
  backtestV2Action,
  buildV3OperatingReview,
  buildV2ActionPlan,
  buildV2GoalDashboard,
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

  it("compares manually entered V2 readings against factory bronze targets", () => {
    const dashboard = buildV2GoalDashboard("factory_bronze", [
      { id: "ww_3min_response_rate", value: 0.52, period: "2026-05-23" },
      { id: "factory_service_response_rate_30d", value: 0.55, period: "2026-05-23" },
      { id: "factory_fulfillment_rate_30d", value: 0.68, period: "2026-05-23" },
      { id: "monthly_active_small_custom_sku_count", value: 1, period: "2026-05" },
      { id: "custom_trade_points_30d", value: 60000, period: "2026-05-23" },
      { id: "contract_payment_rate", value: 0.45, period: "2026-05-23" }
    ]);

    expect(dashboard.goalLabel).toBe("冲找工厂铜牌");
    expect(dashboard.gaps.map((gap) => gap.metricId)).toEqual([
      "ww_3min_response_rate",
      "factory_service_response_rate_30d",
      "monthly_active_small_custom_sku_count",
      "custom_trade_points_30d",
      "factory_fulfillment_rate_30d",
      "contract_payment_rate"
    ]);
    expect(dashboard.gaps[0]).toMatchObject({
      metricLabel: "旺旺 3 分钟响应率",
      priority: "P0",
      cadence: "daily",
      currentLabel: "52%",
      targetLabel: "60%"
    });
  });

  it("decomposes V2 gaps into formulas, path steps, and measurable actions", () => {
    const dashboard = buildV2GoalDashboard("factory_bronze", [
      { id: "ww_3min_response_rate", value: 0.52, period: "2026-05-23" },
      { id: "factory_service_response_rate_30d", value: 0.55, period: "2026-05-23" },
      { id: "monthly_active_small_custom_sku_count", value: 1, period: "2026-05" }
    ]);
    const actionPlan = buildV2ActionPlan(dashboard);

    expect(actionPlan.pathSteps[0].formula).toContain("目标");
    expect(actionPlan.pathSteps[0].formula).toContain("数据");
    expect(actionPlan.pathSteps.map((step) => step.title)).toContain("先保 09:00-21:00 首响");
    expect(actionPlan.actions[0]).toMatchObject({
      targetMetricId: "ww_3min_response_rate",
      cadence: "daily",
      sopState: "candidate"
    });
    expect(actionPlan.actions[0].evidence).toContain("当日旺旺 3 分钟响应率截图");
  });

  it("backtests V2 actions and only promotes SOP after the target metric improves", () => {
    const dashboard = buildV2GoalDashboard("factory_bronze", [
      { id: "ww_3min_response_rate", value: 0.52, period: "2026-05-23" }
    ]);
    const [action] = buildV2ActionPlan(dashboard).actions;

    const improved = backtestV2Action(action, 0.52, 0.62);
    const weak = backtestV2Action(action, 0.52, 0.53);

    expect(improved.effect).toBe("effective");
    expect(improved.sopState).toBe("validated");
    expect(improved.summary).toContain("52% -> 62%");
    expect(weak.effect).toBe("watch");
    expect(weak.sopState).toBe("candidate");
  });

  it("builds V3 goal layers and blocks platform growth when profit health is broken", () => {
    const review = buildV3OperatingReview({
      goalId: "factory_bronze",
      readings: [
        { id: "ww_3min_response_rate", value: 0.66, period: "2026-05-23" },
        { id: "factory_service_response_rate_30d", value: 0.63, period: "2026-05-23" },
        { id: "custom_trade_points_30d", value: 60000, period: "2026-05-23" },
        { id: "gross_margin_rate", value: 0.11, period: "2026-W21" }
      ],
      skuFacts: [],
      capability: {
        weeklySopCount: 0,
        completedAttributionCount: 1,
        stoppedIneffectiveActions: 0,
        independentJudgmentCount: 1
      }
    });

    expect(review.goalLayers.map((layer) => layer.id)).toEqual(["official", "business", "capability"]);
    expect(review.priorityDecision.layer).toBe("business");
    expect(review.priorityDecision.focus).toBe("先修利润健康");
    expect(review.priorityDecision.blockedGoals).toContain("暂停冲定制交易积分和 GMV");
  });

  it("turns symptoms into cause hypotheses and experiment cards", () => {
    const review = buildV3OperatingReview({
      goalId: "factory_bronze",
      readings: [
        { id: "ww_3min_response_rate", value: 0.52, period: "2026-05-23" },
        { id: "factory_service_response_rate_30d", value: 0.55, period: "2026-05-23" }
      ],
      skuFacts: [],
      capability: {
        weeklySopCount: 1,
        completedAttributionCount: 2,
        stoppedIneffectiveActions: 1,
        independentJudgmentCount: 3
      }
    });

    expect(review.causeHypotheses[0]).toMatchObject({
      symptom: "旺旺 3 分钟响应率低",
      hypothesis: "客服首响机制和快捷回复不足",
      evidenceToCheck: "未响应消息按时间段和问题类型归因"
    });
    expect(review.experimentCards[0]).toMatchObject({
      targetMetricId: "ww_3min_response_rate",
      hypothesis: "客服首响机制和快捷回复不足",
      expectedChange: "3 天内旺旺 3 分钟响应率提升到 60% 以上",
      stopCondition: "连续 3 天无改善，改查低质量询盘和排班"
    });
  });

  it("classifies thermos SKU portfolio and reviews employee capability", () => {
    const review = buildV3OperatingReview({
      goalId: "l_growth",
      readings: [{ id: "gross_margin_rate", value: 0.22, period: "2026-W21" }],
      skuFacts: [
        {
          name: "316 商务礼品杯",
          inquiries: 18,
          validInquiryRate: 0.72,
          grossMarginRate: 0.32,
          conversionRate: 0.18,
          customizationRequests: 9,
          repeatOrders: 2,
          afterSalesRate: 0.01,
          fulfillmentRisk: "low"
        },
        {
          name: "低价通用杯",
          inquiries: 25,
          validInquiryRate: 0.28,
          grossMarginRate: 0.08,
          conversionRate: 0.04,
          customizationRequests: 1,
          repeatOrders: 0,
          afterSalesRate: 0.03,
          fulfillmentRisk: "medium"
        },
        {
          name: "掉漆儿童杯",
          inquiries: 10,
          validInquiryRate: 0.42,
          grossMarginRate: 0.2,
          conversionRate: 0.08,
          customizationRequests: 1,
          repeatOrders: 0,
          afterSalesRate: 0.09,
          fulfillmentRisk: "high"
        }
      ],
      capability: {
        weeklySopCount: 0,
        completedAttributionCount: 0,
        stoppedIneffectiveActions: 0,
        independentJudgmentCount: 0
      }
    });

    expect(review.skuPortfolio.map((sku) => [sku.name, sku.role])).toEqual([
      ["316 商务礼品杯", "定制款"],
      ["低价通用杯", "风险款"],
      ["掉漆儿童杯", "风险款"]
    ]);
    expect(review.capabilityReview.level).toBe("needs_training");
    expect(review.capabilityReview.nextTraining).toContain("本周至少沉淀 1 条有效动作 SOP");
  });
});
