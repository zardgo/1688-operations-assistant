import { getDataSourcesForMetric, getMetricDefinition } from "./selectors";
import type { DataSourceId, MetricReading } from "./types";

export type CreateMetricReadingInput = {
  metricId: string;
  sourceId: DataSourceId;
  value: number;
  period: string;
  capturedAt: string;
};

export function createMetricReading(input: CreateMetricReadingInput): MetricReading {
  const metric = getMetricDefinition(input.metricId);
  const source = getDataSourcesForMetric(input.metricId).find((item) => item.id === input.sourceId);

  if (!source) {
    throw new Error(`Data source ${input.sourceId} does not provide metric ${input.metricId}.`);
  }

  return {
    id: `${input.metricId}:${input.sourceId}:${input.period}`,
    metricId: input.metricId,
    sourceId: input.sourceId,
    value: input.value,
    period: input.period,
    capturedAt: input.capturedAt,
    unit: metric.unit,
    cadence: metric.cadence,
    confidence: source.confidence
  };
}
