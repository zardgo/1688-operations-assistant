import { describe, expect, it } from "vitest";
import { buildDataQualityReport, buildDiagnosisMeta } from "./dataQuality";

describe("data quality report", () => {
  it("marks demo data as low quality and warns against real dispatch", () => {
    const report = buildDataQualityReport({
      sourceType: "demo",
      importedFields: [],
      fallbackFields: [],
      missingFields: [],
      lastUpdatedAt: null
    });

    expect(report.level).toBe("low");
    expect(report.label).toContain("示例数据");
    expect(report.issues).toContain("demo_data");
    expect(report.canGenerateMission).toBe(true);
  });

  it("downgrades imports when required fields fall back to old values", () => {
    const report = buildDataQualityReport({
      sourceType: "sycm_import",
      importedFields: ["totalExposure", "visitors"],
      fallbackFields: ["inquiries"],
      missingFields: ["grossMarginRate"],
      lastUpdatedAt: "2026-05-25T10:00:00.000Z"
    });

    expect(report.level).toBe("low");
    expect(report.issues).toEqual(expect.arrayContaining(["fallback_used", "missing_required_field", "import_partial"]));
    expect(report.canGenerateMission).toBe(false);
  });
});

describe("diagnosis meta", () => {
  it("does not allow demo data to become high confidence", () => {
    const meta = buildDiagnosisMeta({
      dataQuality: buildDataQualityReport({
        sourceType: "demo",
        importedFields: [],
        fallbackFields: [],
        missingFields: [],
        lastUpdatedAt: null
      }),
      activeRuleCount: 1,
      hasGap: true
    });

    expect(meta.confidence).toBe("low");
    expect(meta.reasonCodes).toContain("demo_data");
  });

  it("uses high confidence only for complete imported data and active rules", () => {
    const meta = buildDiagnosisMeta({
      dataQuality: buildDataQualityReport({
        sourceType: "sycm_import",
        importedFields: ["totalExposure", "visitors", "inquiries", "grossMarginRate"],
        fallbackFields: [],
        missingFields: [],
        lastUpdatedAt: "2026-05-25T10:00:00.000Z"
      }),
      activeRuleCount: 1,
      hasGap: true
    });

    expect(meta.confidence).toBe("high");
    expect(meta.reasonCodes).toContain("complete_required_metrics");
  });
});
