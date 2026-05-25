import { describe, expect, it } from "vitest";
import { buildMetricReadingsFromDailyFact } from "./dailyFactAdapter";
import type { V4DailyFactInput } from "../../lib/operations";

const fact: V4DailyFactInput = {
  date: "2026-05-23",
  totalExposure: 2059,
  adExposure: 1960,
  naturalExposure: 99,
  adSpend: 34,
  visitors: 29,
  inquiries: 2,
  payments: 0,
  paymentAmount: 0,
  grossMarginRate: 0.18
};

describe("daily fact adapter", () => {
  it("converts a daily operating fact into metric readings", () => {
    const readings = buildMetricReadingsFromDailyFact(fact, "2026-05-23T12:00:00.000Z");

    expect(readings.map((reading) => reading.metricId)).toEqual(
      expect.arrayContaining([
        "total_exposure",
        "visitors",
        "inquiries",
        "payments",
        "payment_amount",
        "gross_margin_rate"
      ])
    );
    expect(readings.find((reading) => reading.metricId === "total_exposure")).toMatchObject({
      sourceId: "sycm_core_board",
      value: 2059,
      period: "2026-05-23",
      confidence: "high"
    });
    expect(readings.find((reading) => reading.metricId === "gross_margin_rate")).toMatchObject({
      sourceId: "manual_input",
      value: 0.18,
      confidence: "low"
    });
  });
});
