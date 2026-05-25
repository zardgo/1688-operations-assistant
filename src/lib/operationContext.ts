import {
  buildResponseRateBenchmark,
  buildV2ActionPlan,
  buildV2GoalDashboard,
  buildV3OperatingReview,
  buildV4DailyOperatingReview,
  buildV5OperatingLoop,
  buildV8CommandCenter,
  getActiveRuleVersionsForGoal,
  type ResponseRateBenchmark,
  type RuleVersion,
  type V2Action,
  type V2ActionPlan,
  type V2GoalDashboard,
  type V2GoalId,
  type V2MetricGap,
  type V2MetricReadingInput,
  type V3CapabilitySnapshot,
  type V3OperatingReview,
  type V3SkuFact,
  type V4DailyFactInput,
  type V4DailyOperatingReview,
  type V5ChecklistItem,
  type V5OperatingLoop,
  type V8CommandCenter,
  type V8DailyMission,
  type V8RuleBasis
} from "./operations";
import { buildDataQualityReport, buildDiagnosisMeta, type BuildDataQualityReportInput, type DataQualityReport, type DiagnosisMeta } from "./dataQuality";
import type { BacktestResult, ExecutionLog, MissionInstance, SopCandidate } from "./storage";
import { getKnowledgeContextForMetric, type MetricKnowledgeContext } from "./knowledge/selectors";

export type OperationContextInput = {
  goalId: V2GoalId;
  metricReadings: V2MetricReadingInput[];
  latestDailyFact: V4DailyFactInput;
  dailyHistory: V4DailyFactInput[];
  skuFacts: V3SkuFact[];
  capability: V3CapabilitySnapshot;
  ruleVersions: RuleVersion[];
  dataQualityInput: BuildDataQualityReportInput;
  executionLogs: ExecutionLog[];
  backtestResults: BacktestResult[];
  sopCandidates: SopCandidate[];
};

export type OperationContext = {
  goalId: V2GoalId;
  data: {
    latestDailyFact: V4DailyFactInput;
    dailyHistory: V4DailyFactInput[];
    metricReadings: V2MetricReadingInput[];
    skuFacts: V3SkuFact[];
    capability: V3CapabilitySnapshot;
    dataQuality: DataQualityReport;
  };
  rules: {
    ruleVersions: RuleVersion[];
    activeRules: RuleVersion[];
    ruleBasis: V8RuleBasis;
  };
  diagnosis: {
    dashboard: V2GoalDashboard;
    actionPlan: V2ActionPlan;
    v3Review: V3OperatingReview;
    v4Review: V4DailyOperatingReview;
    v5Loop: V5OperatingLoop;
    diagnosisMeta: DiagnosisMeta;
    responseRateBenchmark: ResponseRateBenchmark;
  };
  knowledge: {
    primaryKnowledgeContext: MetricKnowledgeContext;
    actionKnowledgeContexts: Record<string, MetricKnowledgeContext>;
  };
  mission: {
    commandCenter: V8CommandCenter;
    activeMission: MissionInstance;
    missionCompletedCount: number;
    firstAction: V2Action | null;
    firstChecklistAction: V5ChecklistItem | null;
    todayPrimaryMetric: V2MetricGap | V8DailyMission["goal"];
    todayGapLabel: string;
    todayHeroReason: string;
    executionLogs: ExecutionLog[];
  };
  review: {
    backtestResults: BacktestResult[];
    sopCandidates: SopCandidate[];
  };
};

export function buildOperationContext(input: OperationContextInput): OperationContext {
  const dataQuality = buildDataQualityReport(input.dataQualityInput);
  const dashboard = buildV2GoalDashboard(input.goalId, input.metricReadings, input.ruleVersions);
  const actionPlan = buildV2ActionPlan(dashboard);
  const activeRules = getActiveRuleVersionsForGoal(input.goalId, input.ruleVersions);
  const diagnosisMeta = buildDiagnosisMeta({
    dataQuality,
    activeRuleCount: activeRules.length,
    hasGap: dashboard.gaps.length > 0
  });
  const commandCenter = buildV8CommandCenter(dashboard, actionPlan, activeRules);
  const activeMission = buildOperationMissionInstance(commandCenter, input.goalId, input.latestDailyFact.date);
  const missionCompletedCount = commandCenter.mission.actions.filter((action) =>
    input.executionLogs.some(
      (log) => log.missionId === activeMission.id && log.id.endsWith(`:${action.id}`) && log.completed
    )
  ).length;
  const v3Review = buildV3OperatingReview({
    goalId: input.goalId,
    readings: input.metricReadings,
    skuFacts: input.skuFacts,
    capability: input.capability
  });
  const v4Review = buildV4DailyOperatingReview(input.latestDailyFact);
  const history = input.dailyHistory.length > 0 ? input.dailyHistory : [input.latestDailyFact];
  const v5Loop = buildV5OperatingLoop(history);
  const firstAction = actionPlan.actions[0] ?? null;
  const firstChecklistAction = v5Loop.checklist[0] ?? null;
  const todayPrimaryMetric = commandCenter.primaryBlocker ?? commandCenter.mission.goal;
  const todayGapLabel = commandCenter.primaryBlocker?.gapLabel.replace(/^差\s*/, "") ?? "已达标";
  const todayHeroReason = commandCenter.primaryBlocker?.whyItMatters ?? commandCenter.mission.goal.priorityReason;
  const responseRateTarget =
    dashboard.readings.find((reading) => reading.id === "ww_3min_response_rate")?.target ?? 0.6;
  const currentResponseRate =
    input.metricReadings.find((reading) => reading.id === "ww_3min_response_rate")?.value ?? 0;
  const responseRateBenchmark = buildResponseRateBenchmark({
    currentRate: currentResponseRate,
    platformTargetRate: responseRateTarget
  });
  const actionKnowledgeContexts = Object.fromEntries(
    commandCenter.todayActions.map((action) => [action.id, getKnowledgeContextForMetric(action.targetMetricId)])
  );
  const primaryKnowledgeContext = commandCenter.primaryBlocker
    ? getKnowledgeContextForMetric(commandCenter.primaryBlocker.metricId)
    : getKnowledgeContextForMetric("weekly_sop_count");

  return {
    goalId: input.goalId,
    data: {
      latestDailyFact: input.latestDailyFact,
      dailyHistory: history,
      metricReadings: input.metricReadings,
      skuFacts: input.skuFacts,
      capability: input.capability,
      dataQuality
    },
    rules: {
      ruleVersions: input.ruleVersions,
      activeRules,
      ruleBasis: commandCenter.ruleBasis
    },
    diagnosis: {
      dashboard,
      actionPlan,
      v3Review,
      v4Review,
      v5Loop,
      diagnosisMeta,
      responseRateBenchmark
    },
    knowledge: {
      primaryKnowledgeContext,
      actionKnowledgeContexts
    },
    mission: {
      commandCenter,
      activeMission,
      missionCompletedCount,
      firstAction,
      firstChecklistAction,
      todayPrimaryMetric,
      todayGapLabel,
      todayHeroReason,
      executionLogs: input.executionLogs
    },
    review: {
      backtestResults: input.backtestResults,
      sopCandidates: input.sopCandidates
    }
  };
}

export function buildOperationMissionInstance(
  commandCenter: V8CommandCenter,
  goalId: V2GoalId,
  date: string
): MissionInstance {
  const targetMetricId =
    commandCenter.tomorrowCheck.metricId ?? commandCenter.todayActions[0]?.targetMetricId ?? "weekly_sop_count";
  return {
    id: `${date}:${goalId}:${commandCenter.primaryBlocker?.metricId ?? "sop_review"}`,
    date,
    goalId,
    bottleneckId: commandCenter.primaryBlocker?.metricId ?? "sop_review",
    source: "system",
    status: "pending",
    title: commandCenter.mission.goal.title,
    targetMetricId,
    verifyDate: date,
    generatedFrom: {},
    actions: commandCenter.mission.actions.map((action) => ({
      actionId: action.id,
      title: action.title,
      targetMetricId: commandCenter.todayActions.find((item) => item.id === action.id)?.targetMetricId ?? targetMetricId,
      owner: action.owner,
      dueTime: action.dueTime
    })),
    backtestPlan: {
      baselineDate: date,
      baselineValue: commandCenter.primaryBlocker?.current ?? null,
      expectedDirection: "increase",
      targetMetricId,
      verifyDate: date,
      successRule: "improved"
    }
  };
}
