import { actionTemplates } from "./actionTemplates";
import { dataSourceDefinitions } from "./dataSources";
import { diagnosisRules } from "./diagnosisRules";
import { goalMappings } from "./goalMappings";
import { metricDefinitions } from "./metrics";
import type { ActionTemplate, DataSourceDefinition, DiagnosisRule, GoalMapping, MetricDefinition } from "./types";

export function getGoalMapping(goalId: string): GoalMapping {
  const goal = goalMappings.find((item) => item.goalId === goalId);
  if (!goal) throw new Error(`Unknown goal mapping: ${goalId}`);
  return goal;
}

export function getMetricDefinition(metricId: string): MetricDefinition {
  const metric = metricDefinitions.find((item) => item.id === metricId);
  if (!metric) throw new Error(`Unknown metric definition: ${metricId}`);
  return metric;
}

export function getDiagnosisRule(ruleId: string): DiagnosisRule {
  const rule = diagnosisRules.find((item) => item.id === ruleId);
  if (!rule) throw new Error(`Unknown diagnosis rule: ${ruleId}`);
  return rule;
}

export function getMetricsForGoal(goalId: string): MetricDefinition[] {
  const goal = getGoalMapping(goalId);
  const ids = unique(goal.requiredMetricIds.concat(goal.supportingMetricIds, goal.guardrailMetricIds));
  return ids.map(getMetricDefinition);
}

export function getDataSourcesForMetric(metricId: string): DataSourceDefinition[] {
  const metric = getMetricDefinition(metricId);
  return metric.sourceIds.map((sourceId) => {
    const source = dataSourceDefinitions.find((item) => item.id === sourceId);
    if (!source) throw new Error(`Unknown data source: ${sourceId}`);
    return source;
  });
}

export function getActionsForDiagnosisRule(ruleId: string): ActionTemplate[] {
  const rule = getDiagnosisRule(ruleId);
  return rule.recommendedActionTemplateIds.map((actionId) => {
    const action = actionTemplates.find((item) => item.id === actionId);
    if (!action) throw new Error(`Unknown action template: ${actionId}`);
    return action;
  });
}

export function getGuardrailsForGoal(goalId: string): MetricDefinition[] {
  const goal = getGoalMapping(goalId);
  return unique(goal.guardrailMetricIds).map(getMetricDefinition);
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}
