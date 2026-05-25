import { createMetricReading } from "./metricReadings";
import type { DataSourceId, MetricReading } from "./types";
import type { V4DailyFactInput } from "../../lib/operations";

type DailyFactMetricMapping = {
  field: keyof V4DailyFactInput;
  metricId: string;
  sourceId: DataSourceId;
};

const dailyFactMetricMappings: DailyFactMetricMapping[] = [
  { field: "totalExposure", metricId: "total_exposure", sourceId: "sycm_core_board" },
  { field: "visitors", metricId: "visitors", sourceId: "sycm_core_board" },
  { field: "inquiries", metricId: "inquiries", sourceId: "sycm_core_board" },
  { field: "payments", metricId: "payments", sourceId: "sycm_core_board" },
  { field: "paymentAmount", metricId: "payment_amount", sourceId: "sycm_core_board" },
  { field: "grossMarginRate", metricId: "gross_margin_rate", sourceId: "manual_input" }
];

export function buildMetricReadingsFromDailyFact(fact: V4DailyFactInput, capturedAt: string): MetricReading[] {
  return dailyFactMetricMappings.map((mapping) =>
    createMetricReading({
      metricId: mapping.metricId,
      sourceId: mapping.sourceId,
      value: Number(fact[mapping.field]),
      period: fact.date,
      capturedAt
    })
  );
}
