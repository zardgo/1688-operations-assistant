import { describe, expect, it } from "vitest";
import {
  APP_STORAGE_KEY,
  APP_STORAGE_SCHEMA_VERSION,
  createDemoStorage,
  exportAppStorage,
  importAppStorage,
  loadAppStorage,
  saveAppStorage,
  validateAppStorage,
  type StorageAdapter
} from "./storage";

function createMemoryStorage(initial: Record<string, string> = {}): StorageAdapter {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key)
  };
}

describe("AppStorage repository", () => {
  it("loads demo storage with a schema version when local storage is empty", () => {
    const storage = createMemoryStorage();

    const result = loadAppStorage(storage);

    expect(result.storage.schemaVersion).toBe(APP_STORAGE_SCHEMA_VERSION);
    expect(result.recovered).toBe(false);
    expect(result.storage.currentPage).toBe("command");
    expect(result.storage.dailyFacts.length).toBeGreaterThan(0);
  });

  it("recovers from broken JSON without polluting the existing storage slot", () => {
    const storage = createMemoryStorage({ [APP_STORAGE_KEY]: "{bad json" });

    const result = loadAppStorage(storage);

    expect(result.recovered).toBe(true);
    expect(result.error).toMatch(/无法解析/);
    expect(storage.getItem(APP_STORAGE_KEY)).toBe("{bad json");
  });

  it("round-trips valid storage through export and import", () => {
    const storage = createMemoryStorage();
    const appStorage = createDemoStorage({
      metricReadings: [
        {
          id: "total_exposure:sycm_core_board:2026-05-23",
          metricId: "total_exposure",
          sourceId: "sycm_core_board",
          value: 2059,
          period: "2026-05-23",
          capturedAt: "2026-05-23T12:00:00.000Z",
          unit: "count",
          cadence: "daily",
          confidence: "high"
        }
      ]
    });
    const exported = exportAppStorage(appStorage);

    const result = importAppStorage(storage, exported);

    expect(result.ok).toBe(true);
    expect(loadAppStorage(storage).storage).toEqual(appStorage);
  });

  it("migrates v1 storage by adding metric readings", () => {
    const legacy = createDemoStorage();
    const storage = createMemoryStorage({
      [APP_STORAGE_KEY]: JSON.stringify({
        ...legacy,
        schemaVersion: 1,
        metricReadings: undefined
      })
    });

    const result = loadAppStorage(storage);

    expect(result.recovered).toBe(false);
    expect(result.storage.schemaVersion).toBe(APP_STORAGE_SCHEMA_VERSION);
    expect(result.storage.metricReadings).toEqual([]);
  });

  it("rejects invalid imports and keeps the previous valid storage", () => {
    const storage = createMemoryStorage();
    const previous = createDemoStorage({ currentGoalId: "protect_service" });
    saveAppStorage(storage, previous);

    const result = importAppStorage(storage, JSON.stringify({ schemaVersion: 999, dailyFacts: [] }));

    expect(result.ok).toBe(false);
    expect(loadAppStorage(storage).storage.currentGoalId).toBe("protect_service");
  });

  it("validates that execution logs must bind to an existing mission", () => {
    const result = validateAppStorage({
      ...createDemoStorage(),
      missionInstances: [],
      executionLogs: [
        {
          id: "log-1",
          missionId: "missing-mission",
          completed: true,
          completedAt: "2026-05-24T10:00:00.000Z",
          operatorName: "客服员工",
          note: "",
          abnormalReason: ""
        }
      ]
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("ExecutionLog 必须绑定已存在的 MissionInstance。");
  });
});
