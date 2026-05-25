import { describe, expect, it } from "vitest";
import { createMetricReading } from "./metricReadings";

describe("metric readings contract", () => {
  it("creates a normalized metric reading for a known metric and data source", () => {
    const reading = createMetricReading({
      metricId: "ww_3min_response_rate",
      sourceId: "new_lighthouse",
      value: 0.52,
      period: "2026-05-23",
      capturedAt: "2026-05-23T10:00:00.000Z"
    });

    expect(reading).toEqual({
      id: "ww_3min_response_rate:new_lighthouse:2026-05-23",
      metricId: "ww_3min_response_rate",
      sourceId: "new_lighthouse",
      value: 0.52,
      period: "2026-05-23",
      capturedAt: "2026-05-23T10:00:00.000Z",
      unit: "%",
      cadence: "daily",
      confidence: "medium"
    });
  });

  it("rejects a source that does not provide the metric", () => {
    expect(() =>
      createMetricReading({
        metricId: "ww_3min_response_rate",
        sourceId: "sycm_core_board",
        value: 0.52,
        period: "2026-05-23",
        capturedAt: "2026-05-23T10:00:00.000Z"
      })
    ).toThrow("Data source sycm_core_board does not provide metric ww_3min_response_rate.");
  });
});
