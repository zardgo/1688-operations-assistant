import { getDomainModulesForGoal } from "./domainModules";
import { getGoalMapping, getMetricDefinition } from "./selectors";
import type { DataSourceId, DomainId } from "./types";
import type { V2GoalId } from "../../lib/operations";

export type OperationsGoalAdapterOutput = {
  compatibleGoalId: V2GoalId;
  goalLabel: string;
  domainIds: DomainId[];
  domainModuleIds: DomainId[];
  requiredMetricIds: string[];
  supportingMetricIds: string[];
  guardrailMetricIds: string[];
  dataSourceIds: DataSourceId[];
  generatedActionTemplateIds: string[];
};

export function adaptGoalMappingForOperations(goalId: V2GoalId): OperationsGoalAdapterOutput {
  const goal = getGoalMapping(goalId);
  const sourceIds = goal.requiredMetricIds
    .concat(goal.supportingMetricIds, goal.guardrailMetricIds)
    .flatMap((metricId) => getMetricDefinition(metricId).sourceIds);

  return {
    compatibleGoalId: goalId,
    goalLabel: goal.name,
    domainIds: goal.domainIds,
    domainModuleIds: getDomainModulesForGoal(goalId).map((module) => module.domain.id),
    requiredMetricIds: goal.requiredMetricIds,
    supportingMetricIds: goal.supportingMetricIds,
    guardrailMetricIds: goal.guardrailMetricIds,
    dataSourceIds: Array.from(new Set(sourceIds)),
    generatedActionTemplateIds: []
  };
}
