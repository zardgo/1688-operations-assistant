import { describe, expect, it } from "vitest";
import {
  canGenerateMission,
  completeMission,
  createMissionInstance,
  createSopCandidate,
  expireMission,
  skipMission,
  verifyMission
} from "./mission";

describe("Mission protocol", () => {
  it("deduplicates missions by date, goal, and bottleneck", () => {
    const mission = createMissionInstance({
      date: "2026-05-24",
      goalId: "factory_bronze",
      bottleneckId: "ww-response",
      title: "补齐客服首响",
      targetMetricId: "ww_3min_response_rate",
      verifyDate: "2026-05-25"
    });

    expect(canGenerateMission([mission], mission)).toBe(false);
    expect(canGenerateMission([], mission)).toBe(true);
  });

  it("completes a mission with an execution log bound to the mission", () => {
    const mission = createMissionInstance({
      date: "2026-05-24",
      goalId: "factory_bronze",
      bottleneckId: "visitor-inquiry",
      title: "重做 3 个主推商品的定制承诺",
      targetMetricId: "factory_service_response_rate_30d",
      verifyDate: "2026-05-25"
    });

    const result = completeMission(mission, {
      completedAt: "2026-05-24T10:00:00.000Z",
      operatorName: "客服员工",
      note: "已更新快捷回复"
    });

    expect(result.mission.status).toBe("completed");
    expect(result.executionLog.missionId).toBe(mission.id);
    expect(result.executionLog.completed).toBe(true);
  });

  it("requires a skipped mission to keep the reason and not count as completed", () => {
    const mission = createMissionInstance({
      date: "2026-05-24",
      goalId: "factory_bronze",
      bottleneckId: "buyer-protection",
      title: "检查买家保障状态",
      targetMetricId: "lighthouse_score",
      verifyDate: "2026-05-31"
    });

    const result = skipMission(mission, "买家保障已开通，本周只巡检不重复派发");

    expect(result.mission.status).toBe("skipped");
    expect(result.executionLog.completed).toBe(false);
    expect(result.executionLog.abnormalReason).toContain("已开通");
  });

  it("expires unfinished missions after the verify date", () => {
    const mission = createMissionInstance({
      date: "2026-05-24",
      goalId: "factory_bronze",
      bottleneckId: "pickup-risk",
      title: "检查 48 小时揽收风险订单",
      targetMetricId: "pickup_48h_rate_30d",
      verifyDate: "2026-05-25"
    });

    expect(expireMission(mission, "2026-05-26").status).toBe("expired");
    expect(expireMission(mission, "2026-05-25").status).toBe("pending");
  });

  it("verifies completed missions into effective, watch, or inconclusive results", () => {
    const mission = createMissionInstance({
      date: "2026-05-24",
      goalId: "factory_bronze",
      bottleneckId: "ww-response",
      title: "补齐客服首响",
      targetMetricId: "ww_3min_response_rate",
      verifyDate: "2026-05-25",
      baselineValue: 0.52
    });
    const completed = completeMission(mission, { completedAt: "2026-05-24T10:00:00.000Z" });

    const verified = verifyMission(completed.mission, completed.executionLog, {
      afterValue: 0.62,
      sampleSize: 20
    });

    expect(verified.mission.status).toBe("verified");
    expect(verified.backtestResult.executionLogId).toBe(completed.executionLog.id);
    expect(verified.backtestResult.result).toBe("effective");

    const inconclusive = verifyMission(completed.mission, completed.executionLog, {
      afterValue: 0.62,
      sampleSize: 2
    });

    expect(inconclusive.mission.status).toBe("inconclusive");
    expect(inconclusive.backtestResult.result).toBe("inconclusive");
  });

  it("creates SOP candidates only from two effective verified executions", () => {
    const missionA = createMissionInstance({
      date: "2026-05-22",
      goalId: "factory_bronze",
      bottleneckId: "ww-response",
      title: "补齐客服首响",
      targetMetricId: "ww_3min_response_rate",
      verifyDate: "2026-05-23",
      baselineValue: 0.52
    });
    const missionB = createMissionInstance({
      date: "2026-05-24",
      goalId: "factory_bronze",
      bottleneckId: "ww-response",
      title: "补齐客服首响",
      targetMetricId: "ww_3min_response_rate",
      verifyDate: "2026-05-25",
      baselineValue: 0.58
    });
    const completedA = completeMission(missionA, { completedAt: "2026-05-22T10:00:00.000Z" });
    const completedB = completeMission(missionB, { completedAt: "2026-05-24T10:00:00.000Z" });
    const verifiedA = verifyMission(completedA.mission, completedA.executionLog, { afterValue: 0.6, sampleSize: 20 });
    const verifiedB = verifyMission(completedB.mission, completedB.executionLog, { afterValue: 0.64, sampleSize: 20 });

    const candidate = createSopCandidate("客服首响巡检 SOP", [
      verifiedA.backtestResult,
      verifiedB.backtestResult
    ]);

    expect(candidate?.status).toBe("candidate");
    expect(candidate?.sourceExecutionLogIds).toEqual([
      completedA.executionLog.id,
      completedB.executionLog.id
    ]);

    expect(createSopCandidate("客服首响巡检 SOP", [verifiedA.backtestResult])).toBeNull();
  });
});
