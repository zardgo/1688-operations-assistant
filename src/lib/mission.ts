import type {
  BacktestResult,
  ExecutionLog,
  MissionInstance,
  SopCandidate
} from "./storage";
import type { V2GoalId, V2MetricId } from "./operations";

type CreateMissionInput = {
  date: string;
  goalId: V2GoalId;
  bottleneckId: string;
  title: string;
  targetMetricId: V2MetricId;
  verifyDate: string;
  baselineValue?: number | null;
  expectedDirection?: "increase" | "decrease";
};

type CompleteMissionInput = {
  completedAt: string;
  operatorName?: string;
  note?: string;
};

type VerifyMissionInput = {
  afterValue: number | null;
  sampleSize?: number;
  interferenceNotes?: string;
};

export function createMissionInstance(input: CreateMissionInput): MissionInstance {
  const id = buildMissionId(input.date, input.goalId, input.bottleneckId, input.title);
  return {
    id,
    date: input.date,
    goalId: input.goalId,
    bottleneckId: input.bottleneckId,
    source: "system",
    status: "pending",
    title: input.title,
    targetMetricId: input.targetMetricId,
    verifyDate: input.verifyDate,
    generatedFrom: {
      diagnosisId: input.bottleneckId
    },
    backtestPlan: {
      baselineDate: input.date,
      baselineValue: input.baselineValue ?? null,
      expectedDirection: input.expectedDirection ?? "increase",
      targetMetricId: input.targetMetricId,
      verifyDate: input.verifyDate,
      successRule: "improved"
    }
  };
}

export function canGenerateMission(existing: MissionInstance[], candidate: MissionInstance): boolean {
  return !existing.some(
    (mission) =>
      mission.date === candidate.date &&
      mission.goalId === candidate.goalId &&
      mission.bottleneckId === candidate.bottleneckId
  );
}

export function completeMission(
  mission: MissionInstance,
  input: CompleteMissionInput
): { mission: MissionInstance; executionLog: ExecutionLog } {
  const updatedMission: MissionInstance = { ...mission, status: "completed" };
  return {
    mission: updatedMission,
    executionLog: {
      id: `${mission.id}:log:${input.completedAt}`,
      missionId: mission.id,
      completed: true,
      completedAt: input.completedAt,
      operatorName: input.operatorName,
      note: input.note,
      abnormalReason: ""
    }
  };
}

export function skipMission(
  mission: MissionInstance,
  abnormalReason: string
): { mission: MissionInstance; executionLog: ExecutionLog } {
  return {
    mission: { ...mission, status: "skipped" },
    executionLog: {
      id: `${mission.id}:skip`,
      missionId: mission.id,
      completed: false,
      abnormalReason,
      note: ""
    }
  };
}

export function expireMission(mission: MissionInstance, currentDate: string): MissionInstance {
  if (mission.status !== "pending") return mission;
  if (currentDate <= mission.verifyDate) return mission;
  return { ...mission, status: "expired" };
}

export function verifyMission(
  mission: MissionInstance,
  executionLog: ExecutionLog,
  input: VerifyMissionInput
): { mission: MissionInstance; backtestResult: BacktestResult } {
  const result = judgeBacktestResult(mission, executionLog, input);
  return {
    mission: {
      ...mission,
      status: result === "inconclusive" ? "inconclusive" : "verified"
    },
    backtestResult: {
      id: `${executionLog.id}:backtest`,
      executionLogId: executionLog.id,
      missionId: mission.id,
      result,
      beforeValue: mission.backtestPlan.baselineValue,
      afterValue: input.afterValue,
      sampleSize: input.sampleSize,
      interferenceNotes: input.interferenceNotes
    }
  };
}

export function createSopCandidate(title: string, results: BacktestResult[]): SopCandidate | null {
  const effectiveResults = results.filter((result) => result.result === "effective");
  if (effectiveResults.length < 2) return null;

  return {
    id: `sop:${slugify(title)}`,
    title,
    sourceExecutionLogIds: effectiveResults.map((result) => result.executionLogId),
    status: "candidate"
  };
}

function judgeBacktestResult(
  mission: MissionInstance,
  executionLog: ExecutionLog,
  input: VerifyMissionInput
): BacktestResult["result"] {
  if (!executionLog.completed) return "inconclusive";
  if (mission.status !== "completed") return "inconclusive";
  if ((input.sampleSize ?? 0) > 0 && (input.sampleSize ?? 0) < 5) return "inconclusive";
  if (mission.backtestPlan.baselineValue === null || input.afterValue === null) return "inconclusive";

  const improved =
    mission.backtestPlan.expectedDirection === "increase"
      ? input.afterValue > mission.backtestPlan.baselineValue
      : input.afterValue < mission.backtestPlan.baselineValue;

  if (improved) return "effective";
  if (input.afterValue === mission.backtestPlan.baselineValue) return "watch";
  return "ineffective";
}

function buildMissionId(date: string, goalId: V2GoalId, bottleneckId: string, title: string) {
  return `mission:${date}:${goalId}:${bottleneckId}:${slugify(title)}`;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
