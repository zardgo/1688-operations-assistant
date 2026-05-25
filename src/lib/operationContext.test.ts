import { describe, expect, it } from "vitest";
import { buildOperationContext } from "./operationContext";
import { adoptRuleVersion, getDefaultRuleVersions, type V2MetricReadingInput, type V3CapabilitySnapshot, type V3SkuFact, type V4DailyFactInput } from "./operations";
import type { ExecutionLog } from "./storage";

const metricReadings: V2MetricReadingInput[] = [
  { id: "ww_3min_response_rate", value: 0.52, period: "2026-05-23" },
  { id: "factory_service_response_rate_30d", value: 0.55, period: "2026-05-23" },
  { id: "factory_fulfillment_rate_30d", value: 0.68, period: "2026-05-23" },
  { id: "monthly_active_small_custom_sku_count", value: 1, period: "2026-05" },
  { id: "custom_trade_points_30d", value: 60000, period: "2026-05-23" },
  { id: "contract_payment_rate", value: 0.45, period: "2026-05-23" },
  { id: "gross_margin_rate", value: 0.11, period: "2026-W21" }
];

const dailyFact: V4DailyFactInput = {
  date: "2026-05-23",
  totalExposure: 6400,
  adExposure: 3200,
  naturalExposure: 3200,
  adSpend: 110,
  visitors: 200,
  inquiries: 6,
  payments: 1,
  paymentAmount: 940,
  grossMarginRate: 0.2
};

const skuFacts: V3SkuFact[] = [
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
  }
];

const capability: V3CapabilitySnapshot = {
  weeklySopCount: 0,
  completedAttributionCount: 0,
  stoppedIneffectiveActions: 0,
  independentJudgmentCount: 0
};

function buildBaseContext(overrides: Partial<Parameters<typeof buildOperationContext>[0]> = {}) {
  return buildOperationContext({
    goalId: "factory_bronze",
    metricReadings,
    latestDailyFact: dailyFact,
    dailyHistory: [dailyFact],
    skuFacts,
    capability,
    ruleVersions: getDefaultRuleVersions(),
    dataQualityInput: {
      sourceType: "demo",
      importedFields: [],
      fallbackFields: [],
      missingFields: [],
      lastUpdatedAt: null
    },
    executionLogs: [],
    backtestResults: [],
    sopCandidates: [],
    ...overrides
  });
}

describe("buildOperationContext", () => {
  it("threads data, diagnosis, mission and official knowledge into one context", () => {
    const context = buildBaseContext();

    expect(context.data.metricReadings).toHaveLength(metricReadings.length);
    expect(context.diagnosis.dashboard.gaps[0]?.metricId).toBe("ww_3min_response_rate");
    expect(context.mission.commandCenter.primaryBlocker?.metricId).toBe("ww_3min_response_rate");
    expect(context.mission.activeMission.id).toBe("2026-05-23:factory_bronze:ww_3min_response_rate");
    expect(context.mission.activeMission.actions).toHaveLength(context.mission.commandCenter.mission.actions.length);
    expect(context.knowledge.primaryKnowledgeContext.battleNodes.map((node) => node.id)).toContain("inquiry_conversion");
    expect(context.knowledge.actionKnowledgeContexts["action-ww_3min_response_rate"].knowledgeCards.map((card) => card.id)).toContain("knowledge-customer-response");
    expect(context.diagnosis.diagnosisMeta.confidence).toBe("low");
  });

  it("counts completed mission actions from execution logs", () => {
    const executionLogs: ExecutionLog[] = [
      {
        id: "2026-05-23:factory_bronze:ww_3min_response_rate:action-ww_3min_response_rate",
        missionId: "2026-05-23:factory_bronze:ww_3min_response_rate",
        completed: true,
        completedAt: "2026-05-23T09:00:00.000Z",
        operatorName: "员工",
        note: "",
        abnormalReason: "",
        evidenceText: "",
        evidenceUrls: [],
        quality: "unknown",
        createdAt: "2026-05-23T09:00:00.000Z",
        updatedAt: "2026-05-23T09:00:00.000Z"
      }
    ];

    const context = buildBaseContext({ executionLogs });

    expect(context.mission.missionCompletedCount).toBe(1);
    expect(context.mission.executionLogs).toBe(executionLogs);
  });

  it("raises diagnosis confidence when imported data is complete and a rule is active", () => {
    const ruleVersions = adoptRuleVersion(getDefaultRuleVersions(), "factory-bronze-2026-05-draft", "2026-05-25");
    const context = buildBaseContext({
      ruleVersions,
      dataQualityInput: {
        sourceType: "sycm_import",
        importedFields: ["totalExposure", "adExposure", "visitors", "inquiries", "payments", "paymentAmount", "grossMarginRate"],
        fallbackFields: [],
        missingFields: [],
        lastUpdatedAt: "2026-05-25T09:00:00.000Z"
      }
    });

    expect(context.data.dataQuality.level).toBe("high");
    expect(context.rules.activeRules).toHaveLength(1);
    expect(context.diagnosis.diagnosisMeta.confidence).toBe("high");
  });
});
