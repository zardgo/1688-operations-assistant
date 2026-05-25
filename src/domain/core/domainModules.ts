import { actionTemplates } from "./actionTemplates";
import { dataSourceDefinitions } from "./dataSources";
import { diagnosisRules } from "./diagnosisRules";
import { domainDefinitions } from "./domains";
import { metricDefinitions } from "./metrics";
import type { DataSourceDefinition, DomainId, DomainModule, MetricDefinition } from "./types";

export function getDomainModule(domainId: DomainId): DomainModule {
  const domain = domainDefinitions.find((item) => item.id === domainId);
  if (!domain) throw new Error(`Unknown domain module: ${domainId}`);

  const metricIds = unique(domain.primaryMetricIds.concat(domain.guardrailMetricIds));
  const metrics = metricIds.map(resolveMetric);
  const dataSourceIds = unique(domain.sourceIds.concat(metrics.flatMap((metric) => metric.sourceIds)));
  const moduleDiagnosisRules = diagnosisRules.filter((rule) => rule.domainId === domain.id);
  const moduleActionIds = unique(moduleDiagnosisRules.flatMap((rule) => rule.recommendedActionTemplateIds));

  return {
    domain,
    metrics,
    dataSources: dataSourceIds.map(resolveDataSource),
    diagnosisRules: moduleDiagnosisRules,
    actionTemplates: moduleActionIds.map((actionId) => {
      const action = actionTemplates.find((item) => item.id === actionId);
      if (!action) throw new Error(`Unknown action template: ${actionId}`);
      return action;
    }),
    guardrails: unique(domain.guardrailMetricIds).map(resolveMetric)
  };
}

export function listDomainModules(): DomainModule[] {
  return domainDefinitions.map((domain) => getDomainModule(domain.id));
}

function resolveMetric(metricId: string): MetricDefinition {
  const metric = metricDefinitions.find((item) => item.id === metricId);
  if (!metric) throw new Error(`Unknown metric definition: ${metricId}`);
  return metric;
}

function resolveDataSource(sourceId: string): DataSourceDefinition {
  const source = dataSourceDefinitions.find((item) => item.id === sourceId);
  if (!source) throw new Error(`Unknown data source: ${sourceId}`);
  return source;
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}
