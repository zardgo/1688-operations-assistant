import { getGoalMapping, getMetricDefinition } from "./selectors";
import type { DataSourceId, DomainId } from "./types";
import type { V2GoalId } from "../../lib/operations";

export type OperationsGoalAdapterOutput = {
  compatibleGoalId: V2GoalId;
  goalLabel: string;
  domainIds: DomainId[];
  requiredMetricIds: string[];
  supportingMetricIds: string[];
  guardrailMetricIds: string[];
  dataSourceIds: DataSourceId[];
  generatedActionTemplateIds: string[];
};

export function adaptGoalMappingForOperations(goalId: V2GoalId): OperationsGoalAdapterOutput {
  const goal = getGoalMapping(goalId);
  const sourceIds = goal.requiredMetricIds.flatMap((metricId) => getMetricDefinition(metricId).sourceIds);

  return {
    compatibleGoalId: goalId,
    goalLabel: goal.name,
    domainIds: goal.domainIds,
    requiredMetricIds: goal.requiredMetricIds,
    supportingMetricIds: goal.supportingMetricIds,
    guardrailMetricIds: goal.guardrailMetricIds,
    dataSourceIds: Array.from(new Set(sourceIds)),
    generatedActionTemplateIds: []
  };
}
