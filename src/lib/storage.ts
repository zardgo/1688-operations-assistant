import type { V2GoalId, V2MetricId, V4DailyFactInput } from "./operations";
import type { MetricReading } from "../domain/core";

export const APP_STORAGE_KEY = "1688-operations-assistant:v6";
export const APP_STORAGE_SCHEMA_VERSION = 2;

export type StorageAdapter = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type StoredPage = "command" | "data" | "analysis" | "product" | "review" | "rules";

export type MissionStatus = "pending" | "completed" | "skipped" | "expired" | "verified" | "inconclusive";

export type BacktestPlan = {
  baselineDate: string;
  baselineValue: number | null;
  expectedDirection: "increase" | "decrease";
  targetMetricId: V2MetricId;
  verifyDate: string;
  successRule: "improved" | "threshold_reached" | "risk_reduced";
};

export type MissionInstance = {
  id: string;
  date: string;
  goalId: V2GoalId;
  bottleneckId: string;
  source: "system" | "manual";
  status: MissionStatus;
  title: string;
  targetMetricId: V2MetricId;
  verifyDate: string;
  generatedFrom: {
    ruleVersionId?: string;
    diagnosisId?: string;
    templateId?: string;
  };
  backtestPlan: BacktestPlan;
};

export type ExecutionLog = {
  id: string;
  missionId: string;
  completed: boolean;
  completedAt?: string;
  operatorName?: string;
  note?: string;
  abnormalReason?: string;
};

export type BacktestResult = {
  id: string;
  executionLogId: string;
  missionId: string;
  result: "effective" | "watch" | "ineffective" | "inconclusive";
  beforeValue: number | null;
  afterValue: number | null;
  sampleSize?: number;
  interferenceNotes?: string;
};

export type WeeklyReview = {
  id: string;
  weekStart: string;
  missionIds: string[];
  summary: string;
};

export type SopCandidate = {
  id: string;
  title: string;
  sourceExecutionLogIds: string[];
  status: "candidate" | "approved" | "active" | "deprecated";
};

export type AppStorage = {
  schemaVersion: typeof APP_STORAGE_SCHEMA_VERSION;
  currentGoalId: V2GoalId;
  currentPage: StoredPage;
  dailyFacts: V4DailyFactInput[];
  metricReadings: MetricReading[];
  missionInstances: MissionInstance[];
  executionLogs: ExecutionLog[];
  backtestResults: BacktestResult[];
  weeklyReviews: WeeklyReview[];
  sopCandidates: SopCandidate[];
  checkedChecklistIds: string[];
  completedMissionActionIds: string[];
};

export type StorageValidationResult = {
  valid: boolean;
  errors: string[];
};

export type LoadStorageResult = {
  storage: AppStorage;
  recovered: boolean;
  error: string | null;
};

export type ImportStorageResult =
  | { ok: true; storage: AppStorage }
  | { ok: false; error: string; storage: AppStorage };

export function createDemoStorage(overrides: Partial<AppStorage> = {}): AppStorage {
  return {
    schemaVersion: APP_STORAGE_SCHEMA_VERSION,
    currentGoalId: "factory_bronze",
    currentPage: "command",
    dailyFacts: [
      {
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
      }
    ],
    metricReadings: [],
    missionInstances: [],
    executionLogs: [],
    backtestResults: [],
    weeklyReviews: [],
    sopCandidates: [],
    checkedChecklistIds: [],
    completedMissionActionIds: [],
    ...overrides
  };
}

export function loadAppStorage(storage: StorageAdapter = window.localStorage): LoadStorageResult {
  const raw = storage.getItem(APP_STORAGE_KEY);
  if (!raw) {
    return { storage: createDemoStorage(), recovered: false, error: null };
  }

  const parsed = parseStorage(raw);
  if (!parsed.ok) {
    return { storage: createDemoStorage(), recovered: true, error: parsed.error };
  }

  const migrated = migrateAppStorage(parsed.storage);
  const validation = validateAppStorage(migrated);
  if (!validation.valid) {
    return { storage: createDemoStorage(), recovered: true, error: validation.errors.join(" ") };
  }

  return { storage: migrated, recovered: false, error: null };
}

export function saveAppStorage(storage: StorageAdapter = window.localStorage, appStorage: AppStorage) {
  const validation = validateAppStorage(appStorage);
  if (!validation.valid) {
    throw new Error(validation.errors.join(" "));
  }
  storage.setItem(APP_STORAGE_KEY, exportAppStorage(appStorage));
}

export function exportAppStorage(appStorage: AppStorage): string {
  return JSON.stringify(appStorage, null, 2);
}

export function importAppStorage(storage: StorageAdapter, raw: string): ImportStorageResult {
  const current = loadAppStorage(storage).storage;
  const parsed = parseStorage(raw);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error, storage: current };
  }

  const migrated = migrateAppStorage(parsed.storage);
  const validation = validateAppStorage(migrated);
  if (!validation.valid) {
    return { ok: false, error: validation.errors.join(" "), storage: current };
  }

  saveAppStorage(storage, migrated);
  return { ok: true, storage: migrated };
}

export function resetDemoStorage(storage: StorageAdapter = window.localStorage): AppStorage {
  const demo = createDemoStorage();
  saveAppStorage(storage, demo);
  return demo;
}

export function validateAppStorage(candidate: unknown): StorageValidationResult {
  const errors: string[] = [];
  const value = candidate as Partial<AppStorage> | null;

  if (!value || typeof value !== "object") {
    return { valid: false, errors: ["AppStorage 必须是对象。"] };
  }

  if (value.schemaVersion !== APP_STORAGE_SCHEMA_VERSION) {
    errors.push(`不支持的 schemaVersion：${String(value.schemaVersion)}。`);
  }

  if (!Array.isArray(value.dailyFacts)) errors.push("dailyFacts 必须是数组。");
  if (!Array.isArray(value.metricReadings)) errors.push("metricReadings 必须是数组。");
  if (!Array.isArray(value.missionInstances)) errors.push("missionInstances 必须是数组。");
  if (!Array.isArray(value.executionLogs)) errors.push("executionLogs 必须是数组。");
  if (!Array.isArray(value.backtestResults)) errors.push("backtestResults 必须是数组。");
  if (!Array.isArray(value.weeklyReviews)) errors.push("weeklyReviews 必须是数组。");
  if (!Array.isArray(value.sopCandidates)) errors.push("sopCandidates 必须是数组。");

  const facts = Array.isArray(value.dailyFacts) ? value.dailyFacts : [];
  const factKeys = new Set<string>();
  for (const fact of facts) {
    const key = `${fact.date}:${value.currentGoalId}`;
    if (factKeys.has(key)) errors.push("同一天同一目标只能有一组 DailyFact。");
    factKeys.add(key);
  }

  const missions = Array.isArray(value.missionInstances) ? value.missionInstances : [];
  const missionIds = new Set(missions.map((mission) => mission.id));
  const missionKeys = new Set<string>();
  for (const mission of missions) {
    const key = `${mission.date}:${mission.goalId}:${mission.bottleneckId}`;
    if (missionKeys.has(key)) errors.push("同一天同一目标同一主卡点只能有一个 MissionInstance 批次。");
    missionKeys.add(key);
    if (!mission.targetMetricId) errors.push("MissionInstance 必须绑定 targetMetricId。");
  }

  const logs = Array.isArray(value.executionLogs) ? value.executionLogs : [];
  for (const log of logs) {
    if (!missionIds.has(log.missionId)) {
      errors.push("ExecutionLog 必须绑定已存在的 MissionInstance。");
    }
  }

  const logIds = new Set(logs.map((log) => log.id));
  const results = Array.isArray(value.backtestResults) ? value.backtestResults : [];
  for (const result of results) {
    if (!logIds.has(result.executionLogId)) {
      errors.push("BacktestResult 必须绑定已存在的 ExecutionLog。");
    }
  }

  return { valid: errors.length === 0, errors };
}

function migrateAppStorage(candidate: AppStorage | (Partial<AppStorage> & { schemaVersion?: number })): AppStorage {
  if (candidate.schemaVersion === APP_STORAGE_SCHEMA_VERSION) return candidate as AppStorage;

  if (candidate.schemaVersion === 1) {
    const legacy = candidate as Partial<AppStorage>;
    return {
      ...legacy,
      schemaVersion: APP_STORAGE_SCHEMA_VERSION,
      metricReadings: Array.isArray(legacy.metricReadings) ? legacy.metricReadings : []
    } as AppStorage;
  }

  if (!Array.isArray(candidate.metricReadings)) {
    return {
      ...(candidate as AppStorage),
      metricReadings: []
    };
  }

  return candidate as AppStorage;
}

function parseStorage(raw: string): { ok: true; storage: AppStorage } | { ok: false; error: string } {
  try {
    return { ok: true, storage: JSON.parse(raw) as AppStorage };
  } catch {
    return { ok: false, error: "无法解析 AppStorage JSON。" };
  }
}
