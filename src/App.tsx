import { useEffect, useMemo, useState } from "react";
import {
  backtestV2Action,
  backtestV5ChecklistAction,
  buildV2ActionPlan,
  buildV2GoalDashboard,
  buildV3OperatingReview,
  buildV4DailyOperatingReview,
  buildV5OperatingLoop,
  buildV8CommandCenter,
  buildResponseRateBenchmark,
  bindRuleVersionToGoal,
  adoptRuleVersion,
  createDraftRuleVersion,
  getActiveRuleVersionsForGoal,
  getDefaultRuleVersions,
  type V2Action,
  type V2BacktestResult,
  type V2GoalId,
  type V2MetricId,
  type V2MetricReadingInput,
  type V3CapabilitySnapshot,
  type V3SkuFact,
  type V4DailyFactInput,
  type V5ChecklistBacktestResult
} from "./lib/operations";
import { parseSycmCoreBoardRows, type SheetRows, type SycmCoreBoardImport } from "./lib/sycmImport";
import { buildDataQualityReport, buildDiagnosisMeta, type DataSourceType } from "./lib/dataQuality";
import {
  createDemoStorage,
  loadAppStorage,
  saveAppStorage,
  type BacktestResult,
  type ExecutionLog,
  type MissionInstance,
  type WorkspaceMode
} from "./lib/storage";
import { AppShell } from "./components/layout/AppShell";
import { AnalysisPage } from "./pages/AnalysisPage";
import { CommandPage } from "./pages/CommandPage";
import { DataPage } from "./pages/DataPage";
import { ProductPage } from "./pages/ProductPage";
import { ReviewPage } from "./pages/ReviewPage";
import { RulesPage } from "./pages/RulesPage";
import type { Page } from "./pages/pageConfig";
import "./styles.css";

type EditableMetric = {
  id: V2MetricId;
  label: string;
  helper: string;
  unit: "%" | "款" | "分";
  period: string;
};

const goalOptions: Array<{ id: V2GoalId; label: string }> = [
  { id: "protect_service", label: "保基础服务分" },
  { id: "factory_bronze", label: "冲找工厂铜牌" },
  { id: "factory_silver", label: "冲找工厂银牌" },
  { id: "factory_gold", label: "冲找工厂金牌" },
  { id: "l_growth", label: "提升 L 等级" }
];

const editableMetrics: EditableMetric[] = [
  {
    id: "ww_3min_response_rate",
    label: "旺旺 3 分钟响应率",
    helper: "每日录入，09:00-21:00 有效回复口径",
    unit: "%",
    period: "2026-05-23"
  },
  {
    id: "factory_service_response_rate_30d",
    label: "找工厂服务响应率",
    helper: "近 30 天滚动口径",
    unit: "%",
    period: "2026-05-23"
  },
  {
    id: "factory_fulfillment_rate_30d",
    label: "找工厂履约率",
    helper: "近 30 天滚动口径",
    unit: "%",
    period: "2026-05-23"
  },
  {
    id: "monthly_active_small_custom_sku_count",
    label: "月动销小单定制商品数",
    helper: "每月看是否达到 3 款",
    unit: "款",
    period: "2026-05"
  },
  {
    id: "custom_trade_points_30d",
    label: "定制交易积分",
    helper: "近 30 天找工厂积分",
    unit: "分",
    period: "2026-05-23"
  },
  {
    id: "contract_payment_rate",
    label: "合约支付率",
    helper: "定制成交规范度",
    unit: "%",
    period: "2026-05-23"
  },
  {
    id: "gross_margin_rate",
    label: "目标毛利率",
    helper: "每周录入真实毛利，含包装、运费、售后、广告",
    unit: "%",
    period: "2026-W21"
  }
];

type DailyField = {
  id: keyof V4DailyFactInput;
  label: string;
  helper: string;
  unit: "次" | "元" | "%";
};

const dailyFields: DailyField[] = [
  { id: "totalExposure", label: "总曝光", helper: "每日从生意参谋或店铺统计录入", unit: "次" },
  { id: "adExposure", label: "广告曝光", helper: "站内投放带来的曝光", unit: "次" },
  { id: "naturalExposure", label: "自然曝光", helper: "总曝光减广告曝光，也可手动录入", unit: "次" },
  { id: "adSpend", label: "广告消耗", helper: "当日广告实际消耗", unit: "元" },
  { id: "visitors", label: "访客", helper: "进入店铺或商品详情的访客", unit: "次" },
  { id: "inquiries", label: "询盘", helper: "旺旺、找工厂等有效咨询", unit: "次" },
  { id: "payments", label: "支付", helper: "当日支付订单数", unit: "次" },
  { id: "paymentAmount", label: "支付金额", helper: "当日支付成交额", unit: "元" },
  { id: "grossMarginRate", label: "毛利率", helper: "按真实成本估算，当天无精确值时用主推款毛利", unit: "%" }
];

const initialDailyFacts: V4DailyFactInput = {
  date: "2026-04-11",
  totalExposure: 6641,
  adExposure: 6399,
  naturalExposure: 242,
  adSpend: 146,
  visitors: 84,
  inquiries: 6,
  payments: 1,
  paymentAmount: 1000,
  grossMarginRate: 0.16,
  storeLayerRank: "第一层级735名",
  spotProductCount: 37,
  potentialProductCount: 5,
  crownProductCount: 1,
  replenishmentBuyerCount: 0
};

const sampleDailyHistory: V4DailyFactInput[] = [
  {
    date: "2026-05-17",
    totalExposure: 5200,
    adExposure: 2600,
    naturalExposure: 2600,
    adSpend: 90,
    visitors: 155,
    inquiries: 12,
    payments: 2,
    paymentAmount: 1600,
    grossMarginRate: 0.22
  },
  {
    date: "2026-05-18",
    totalExposure: 5400,
    adExposure: 2700,
    naturalExposure: 2700,
    adSpend: 95,
    visitors: 162,
    inquiries: 11,
    payments: 2,
    paymentAmount: 1680,
    grossMarginRate: 0.22
  },
  {
    date: "2026-05-19",
    totalExposure: 5600,
    adExposure: 2800,
    naturalExposure: 2800,
    adSpend: 98,
    visitors: 170,
    inquiries: 10,
    payments: 2,
    paymentAmount: 1700,
    grossMarginRate: 0.21
  },
  {
    date: "2026-05-20",
    totalExposure: 5800,
    adExposure: 2900,
    naturalExposure: 2900,
    adSpend: 102,
    visitors: 178,
    inquiries: 8,
    payments: 2,
    paymentAmount: 1720,
    grossMarginRate: 0.21
  },
  {
    date: "2026-05-21",
    totalExposure: 6000,
    adExposure: 3000,
    naturalExposure: 3000,
    adSpend: 105,
    visitors: 185,
    inquiries: 7,
    payments: 1,
    paymentAmount: 900,
    grossMarginRate: 0.2
  },
  {
    date: "2026-05-22",
    totalExposure: 6200,
    adExposure: 3100,
    naturalExposure: 3100,
    adSpend: 108,
    visitors: 190,
    inquiries: 6,
    payments: 1,
    paymentAmount: 920,
    grossMarginRate: 0.2
  },
  {
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
  }
];

const initialValues: Record<V2MetricId, number> = {
  ww_3min_response_rate: 0.52,
  factory_service_response_rate_30d: 0.55,
  pickup_48h_rate_30d: 0.96,
  lighthouse_score: 88,
  store_service_star_level: 4,
  lighthouse_logistics_score: 90,
  lighthouse_after_sales_score: 86,
  lighthouse_consult_score: 82,
  lighthouse_product_score: 89,
  factory_fulfillment_rate_30d: 0.68,
  monthly_active_small_custom_sku_count: 1,
  custom_trade_points_30d: 60000,
  contract_payment_rate: 0.45,
  gross_margin_rate: 0.11,
  quality_refund_rate: 0.01,
  weekly_sop_count: 0
};

const initialRuleForm = {
  name: "官方规则草案",
  publishedAt: "2026-06-01",
  sourceUrl: "https://factory.1688.com/rules/factory-level-june",
  scope: "保温杯 / 找工厂 / 新规则待确认"
};

type SycmImportStatus = {
  fileName: string;
  result: SycmCoreBoardImport | null;
  error: string | null;
};

const sampleSkuFacts: V3SkuFact[] = [
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
];

const sampleCapability: V3CapabilitySnapshot = {
  weeklySopCount: 0,
  completedAttributionCount: 0,
  stoppedIneffectiveActions: 0,
  independentJudgmentCount: 0
};

export default function App() {
  const [initialStorage] = useState(() => loadAppStorage().storage);
  const [page, setPage] = useState<Page>(initialStorage.currentPage);
  const [goalId, setGoalId] = useState<V2GoalId>(initialStorage.currentGoalId);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(initialStorage.workspaceMode);
  const [values, setValues] = useState(initialValues);
  const [dailyFacts, setDailyFacts] = useState<V4DailyFactInput>(initialStorage.dailyFacts[0] ?? initialDailyFacts);
  const [dataSourceType, setDataSourceType] = useState<DataSourceType>(initialStorage.dataSourceType);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(initialStorage.lastUpdatedAt);
  const [importedFields, setImportedFields] = useState<string[]>(initialStorage.importedFields);
  const [fallbackFields, setFallbackFields] = useState<string[]>(initialStorage.fallbackFields);
  const [missingFields, setMissingFields] = useState<string[]>(initialStorage.missingFields);
  const [backtestAfter, setBacktestAfter] = useState("62");
  const [backtestResult, setBacktestResult] = useState<V2BacktestResult | null>(null);
  const [missionInstances, setMissionInstances] = useState<MissionInstance[]>(initialStorage.missionInstances);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>(initialStorage.executionLogs);
  const [storedBacktestResults, setStoredBacktestResults] = useState<BacktestResult[]>(initialStorage.backtestResults);
  const [checkedChecklistIds, setCheckedChecklistIds] = useState<string[]>(initialStorage.checkedChecklistIds);
  const [completedMissionActionIds, setCompletedMissionActionIds] = useState<string[]>(
    initialStorage.completedMissionActionIds
  );
  const [v5BacktestAfter, setV5BacktestAfter] = useState("6.1");
  const [v5BacktestResult, setV5BacktestResult] = useState<V5ChecklistBacktestResult | null>(null);
  const [ruleVersions, setRuleVersions] = useState(() => getDefaultRuleVersions());
  const [ruleForm, setRuleForm] = useState(initialRuleForm);
  const [sycmImportStatus, setSycmImportStatus] = useState<SycmImportStatus | null>(null);

  const readings = useMemo<V2MetricReadingInput[]>(
    () =>
      editableMetrics.map((metric) => ({
        id: metric.id,
        value: values[metric.id],
        period: metric.period
      })),
    [values]
  );
  const dashboard = useMemo(() => buildV2GoalDashboard(goalId, readings, ruleVersions), [goalId, readings, ruleVersions]);
  const actionPlan = useMemo(() => buildV2ActionPlan(dashboard), [dashboard]);
  const activeRules = useMemo(
    () => getActiveRuleVersionsForGoal(goalId, ruleVersions),
    [goalId, ruleVersions]
  );
  const dataQualityReport = useMemo(
    () =>
      buildDataQualityReport({
        sourceType: dataSourceType,
        importedFields,
        fallbackFields,
        missingFields,
        lastUpdatedAt
      }),
    [dataSourceType, fallbackFields, importedFields, lastUpdatedAt, missingFields]
  );
  const diagnosisMeta = useMemo(
    () =>
      buildDiagnosisMeta({
        dataQuality: dataQualityReport,
        activeRuleCount: activeRules.length,
        hasGap: dashboard.gaps.length > 0
      }),
    [activeRules.length, dashboard.gaps.length, dataQualityReport]
  );
  const commandCenter = useMemo(
    () => buildV8CommandCenter(dashboard, actionPlan, activeRules),
    [dashboard, actionPlan, activeRules]
  );
  const activeMission = useMemo(
    () => buildMissionInstance(commandCenter, goalId, dailyFacts.date),
    [commandCenter, dailyFacts.date, goalId]
  );
  const missionCompletedCount = commandCenter.mission.actions.filter((action) =>
    executionLogs.some((log) => log.missionId === activeMission.id && log.id.endsWith(`:${action.id}`) && log.completed)
  ).length;
  const v3Review = useMemo(
    () =>
      buildV3OperatingReview({
        goalId,
        readings,
        skuFacts: sampleSkuFacts,
        capability: sampleCapability
      }),
    [goalId, readings]
  );
  const v4Review = useMemo(() => buildV4DailyOperatingReview(dailyFacts), [dailyFacts]);
  const v5Loop = useMemo(() => buildV5OperatingLoop(sampleDailyHistory), []);
  const firstAction = actionPlan.actions[0] ?? null;
  const firstChecklistAction = v5Loop.checklist[0] ?? null;
  const todayPrimaryMetric = commandCenter.primaryBlocker ?? commandCenter.mission.goal;
  const todayGapLabel =
    commandCenter.primaryBlocker?.gapLabel.replace(/^差\s*/, "") ?? "已达标";
  const todayHeroReason =
    commandCenter.primaryBlocker?.whyItMatters ?? commandCenter.mission.goal.priorityReason;
  const responseRateTarget =
    dashboard.readings.find((reading) => reading.id === "ww_3min_response_rate")?.target ?? 0.6;
  const responseRateBenchmark = useMemo(
    () =>
      buildResponseRateBenchmark({
        currentRate: values.ww_3min_response_rate,
        platformTargetRate: responseRateTarget
      }),
    [responseRateTarget, values.ww_3min_response_rate]
  );

  useEffect(() => {
    setMissionInstances((current) =>
      current.some((mission) => mission.id === activeMission.id) ? current : [activeMission, ...current]
    );
  }, [activeMission]);

  useEffect(() => {
    if (backtestResult || !firstAction) return;
    const completedLogIds = new Set(executionLogs.filter((log) => log.completed).map((log) => log.id));
    const storedResult = storedBacktestResults.find((result) => completedLogIds.has(result.executionLogId));
    if (!storedResult || storedResult.afterValue === null) return;
    const beforeValue = storedResult.beforeValue ?? values[firstAction.targetMetricId];
    setBacktestResult(backtestV2Action(firstAction, beforeValue, storedResult.afterValue));
  }, [backtestResult, executionLogs, firstAction, storedBacktestResults, values]);

  useEffect(() => {
    saveAppStorage(window.localStorage, {
      ...createDemoStorage(),
      currentGoalId: goalId,
      currentPage: page,
      workspaceMode,
      dataSourceType,
      lastUpdatedAt,
      importedFields,
      fallbackFields,
      missingFields,
      dailyFacts: [dailyFacts],
      missionInstances,
      executionLogs,
      backtestResults: storedBacktestResults,
      checkedChecklistIds,
      completedMissionActionIds
    });
  }, [checkedChecklistIds, completedMissionActionIds, dailyFacts, dataSourceType, executionLogs, fallbackFields, goalId, importedFields, lastUpdatedAt, missingFields, missionInstances, page, storedBacktestResults, workspaceMode]);

  function updateMetric(metric: EditableMetric, rawValue: string) {
    const numericValue = Number(rawValue);
    setValues((current) => ({
      ...current,
      [metric.id]: metric.unit === "%" ? numericValue / 100 : numericValue
    }));
    setDataSourceType((current) => (current === "sycm_import" ? "mixed" : "manual"));
    setLastUpdatedAt(new Date().toISOString());
    setBacktestResult(null);
  }

  function runBacktest(action: V2Action) {
    const executionLog = executionLogs.find((log) => log.completed);
    if (!executionLog) return;
    const metric = editableMetrics.find((item) => item.id === action.targetMetricId);
    const afterValue = Number(backtestAfter);
    const normalizedAfter = metric?.unit === "%" ? afterValue / 100 : afterValue;
    setBacktestResult(backtestV2Action(action, values[action.targetMetricId], normalizedAfter));
    const result: BacktestResult = {
      id: `${executionLog.id}:backtest`,
      executionLogId: executionLog.id,
      missionId: executionLog.missionId,
      result:
        normalizedAfter > values[action.targetMetricId]
          ? "effective"
          : normalizedAfter === values[action.targetMetricId]
            ? "watch"
            : "ineffective",
      beforeValue: values[action.targetMetricId],
      afterValue: normalizedAfter
    };
    setStoredBacktestResults((current) => [result, ...current.filter((item) => item.id !== result.id)]);
  }

  function updateDailyFact(field: DailyField, rawValue: string) {
    const numericValue = Number(rawValue);
    setDailyFacts((current) => ({
      ...current,
      [field.id]: field.unit === "%" ? numericValue / 100 : numericValue
    }));
    setDataSourceType((current) => (current === "sycm_import" ? "mixed" : "manual"));
    setLastUpdatedAt(new Date().toISOString());
  }

  async function importSycmCoreBoard(file: File) {
    try {
      const XLSX = await import("xlsx");
      const buffer = await readFileAsArrayBuffer(file);
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) throw new Error("文件中没有工作表。");

      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: "" }) as SheetRows;
      const result = parseSycmCoreBoardRows(rows, dailyFacts);
      setDailyFacts(result.fact);
      setDataSourceType("sycm_import");
      setImportedFields(["totalExposure", "adExposure", "visitors", "payments", "paymentAmount", "adSpend"]);
      setFallbackFields(result.missingFields);
      setMissingFields(result.missingFields);
      setLastUpdatedAt(new Date().toISOString());
      setSycmImportStatus({ fileName: file.name, result, error: null });
      setPage("data");
    } catch (error) {
      setSycmImportStatus({
        fileName: file.name,
        result: null,
        error: error instanceof Error ? error.message : "导入失败，请检查文件格式。"
      });
    }
  }

  function toggleChecklist(id: string) {
    setCheckedChecklistIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function toggleMissionAction(id: string) {
    setExecutionLogs((current) => upsertExecutionLog(current, activeMission.id, id, { toggleCompleted: true }));
    setCompletedMissionActionIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function updateExecutionLogText(actionId: string, field: "note" | "abnormalReason" | "evidenceText", value: string) {
    setExecutionLogs((current) => upsertExecutionLog(current, activeMission.id, actionId, { [field]: value }));
  }

  function runV5Backtest() {
    if (!firstChecklistAction) return;
    const before = v5Loop.primaryBottleneck.current;
    const after = Number(v5BacktestAfter) / 100;
    setV5BacktestResult(backtestV5ChecklistAction(firstChecklistAction, before, after));
  }

  function updateRuleForm(field: keyof typeof initialRuleForm, value: string) {
    setRuleForm((current) => ({ ...current, [field]: value }));
  }

  function addDraftRule() {
    const draft = createDraftRuleVersion({
      ...ruleForm,
      appliesToGoalIds: [goalId]
    });
    setRuleVersions((current) => current.filter((rule) => rule.id !== draft.id).concat(draft));
  }

  function adoptRule(ruleId: string) {
    setRuleVersions((current) => adoptRuleVersion(current, ruleId, "2026-05-23"));
  }

  function bindRuleToCurrentGoal(ruleId: string) {
    setRuleVersions((current) => bindRuleVersionToGoal(current, ruleId, goalId));
  }

  return (
    <AppShell
      dataQualityReport={dataQualityReport}
      goalId={goalId}
      goalOptions={goalOptions}
      lastUpdatedAt={lastUpdatedAt}
      page={page}
      ruleStatus={commandCenter.ruleBasis.label}
      workspaceMode={workspaceMode}
      onGoalChange={setGoalId}
      onModeChange={setWorkspaceMode}
      onPageChange={setPage}
    >
      {page === "command" ? (
        <CommandPage
          commandCenter={commandCenter}
          dataQualityReport={dataQualityReport}
          diagnosisMeta={diagnosisMeta}
          completedMissionActionIds={completedMissionActionIds}
          executionLogs={executionLogs.filter((log) => log.missionId === activeMission.id)}
          missionCompletedCount={missionCompletedCount}
          todayGapLabel={todayGapLabel}
          todayHeroReason={todayHeroReason}
          todayPrimaryMetric={todayPrimaryMetric}
          onOpenData={() => setPage("data")}
          onToggleMissionAction={toggleMissionAction}
          onUpdateExecutionLogText={updateExecutionLogText}
        />
      ) : null}

      {page === "data" ? (
        <DataPage
          dailyFacts={dailyFacts}
          dailyFields={dailyFields}
          editableMetrics={editableMetrics}
          sycmImportStatus={sycmImportStatus}
          dataQualityReport={dataQualityReport}
          v4Review={v4Review}
          values={values}
          onOpenAnalysis={() => setPage("analysis")}
          onOpenCommand={() => setPage("command")}
          onImportSycmCoreBoard={(file) => void importSycmCoreBoard(file)}
          onUpdateDailyFact={updateDailyFact}
          onUpdateMetric={updateMetric}
        />
      ) : null}

      {page === "analysis" ? (
        <AnalysisPage
          actionPlan={actionPlan}
          checkedChecklistIds={checkedChecklistIds}
          commandCenter={commandCenter}
          dataQualityReport={dataQualityReport}
          dashboard={dashboard}
          diagnosisMeta={diagnosisMeta}
          firstChecklistAction={firstChecklistAction}
          responseRateBenchmark={responseRateBenchmark}
          v3Review={v3Review}
          v5BacktestAfter={v5BacktestAfter}
          v5BacktestResult={v5BacktestResult}
          v5Loop={v5Loop}
          onRunV5Backtest={runV5Backtest}
          onToggleChecklist={toggleChecklist}
          onV5BacktestAfterChange={setV5BacktestAfter}
        />
      ) : null}

      {page === "rules" ? (
        <RulesPage
          activeRules={activeRules}
          dashboard={dashboard}
          goalId={goalId}
          goalLabel={goalLabel}
          ruleForm={ruleForm}
          ruleVersions={ruleVersions}
          onAddDraftRule={addDraftRule}
          onAdoptRule={adoptRule}
          onBindRuleToCurrentGoal={bindRuleToCurrentGoal}
          onUpdateRuleForm={updateRuleForm}
        />
      ) : null}

      {page === "review" ? (
        <ReviewPage
          backtestAfter={backtestAfter}
          backtestResult={backtestResult}
          executionLogs={executionLogs}
          firstAction={firstAction}
          v3Review={v3Review}
          onBacktestAfterChange={setBacktestAfter}
          onRunBacktest={runBacktest}
        />
      ) : null}

      {page === "product" ? <ProductPage v3Review={v3Review} /> : null}
    </AppShell>
  );
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === "function") return file.arrayBuffer();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
        return;
      }
      reject(new Error("无法读取上传文件。"));
    };
    reader.onerror = () => reject(new Error("无法读取上传文件。"));
    reader.readAsArrayBuffer(file);
  });
}

function goalLabel(goalId: V2GoalId): string {
  return goalOptions.find((goal) => goal.id === goalId)?.label ?? goalId;
}

function buildMissionInstance(commandCenter: ReturnType<typeof buildV8CommandCenter>, goalId: V2GoalId, date: string): MissionInstance {
  const targetMetricId = commandCenter.tomorrowCheck.metricId ?? commandCenter.todayActions[0]?.targetMetricId ?? "weekly_sop_count";
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

function upsertExecutionLog(
  logs: ExecutionLog[],
  missionId: string,
  actionId: string,
  patch: Partial<ExecutionLog> & { toggleCompleted?: boolean }
): ExecutionLog[] {
  const id = `${missionId}:${actionId}`;
  const now = new Date().toISOString();
  const existing = logs.find((log) => log.id === id);
  const nextCompleted = patch.toggleCompleted ? !existing?.completed : existing?.completed ?? false;
  const nextLog: ExecutionLog = {
    id,
    missionId,
    completed: nextCompleted,
    completedAt: nextCompleted ? existing?.completedAt ?? now : undefined,
    operatorName: existing?.operatorName ?? "员工",
    note: existing?.note ?? "",
    abnormalReason: existing?.abnormalReason ?? "",
    evidenceText: existing?.evidenceText ?? "",
    evidenceUrls: existing?.evidenceUrls ?? [],
    quality: existing?.quality ?? "unknown",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    ...patch
  };
  delete (nextLog as ExecutionLog & { toggleCompleted?: boolean }).toggleCompleted;
  return existing ? logs.map((log) => (log.id === id ? nextLog : log)) : [nextLog, ...logs];
}
