import { describe, expect, it } from "vitest";
import { parseSycmCoreBoardRows } from "./sycmImport";
import type { V4DailyFactInput } from "./operations";

const fallbackDailyFact: V4DailyFactInput = {
  date: "2026-05-22",
  totalExposure: 100,
  adExposure: 20,
  naturalExposure: 80,
  adSpend: 10,
  visitors: 5,
  inquiries: 6,
  payments: 1,
  paymentAmount: 100,
  grossMarginRate: 0.16,
  storeLayerRank: "第一层级735名",
  spotProductCount: 37,
  potentialProductCount: 5,
  crownProductCount: 1,
  replenishmentBuyerCount: 0
};

describe("sycm import", () => {
  it("parses a 生意参谋首页核心看板 sheet into the latest daily operating fact", () => {
    const result = parseSycmCoreBoardRows(
      [
        ["数据说明：以下数据为您所选时间周期的相关指标"],
        [],
        ["日期", "展现次数", "广告展现次数", "访客数", "支付金额", "支付订单数", "网销宝推广消耗金额"],
        ["2026-05-23", "2059", "1960", "29", "0", "0", "34"],
        ["2026-05-22", "1323", "1186", "17", "120", "1", "16"]
      ],
      fallbackDailyFact
    );

    expect(result.rowCount).toBe(2);
    expect(result.fact).toMatchObject({
      date: "2026-05-23",
      totalExposure: 2059,
      adExposure: 1960,
      naturalExposure: 99,
      adSpend: 34,
      visitors: 29,
      inquiries: 6,
      payments: 0,
      paymentAmount: 0,
      grossMarginRate: 0.16
    });
    expect(result.missingFields).toEqual(["inquiries", "grossMarginRate"]);
  });

  it("keeps manual values when 生意参谋 does not export inquiry or margin fields", () => {
    const result = parseSycmCoreBoardRows(
      [
        ["日期", "展现次数", "广告展现次数", "访客数", "支付金额", "支付订单数", "网销宝推广消耗金额"],
        ["2026-05-23", "2059", "1960", "29", "0", "0", "34"]
      ],
      { ...fallbackDailyFact, inquiries: 11, grossMarginRate: 0.22 }
    );

    expect(result.fact.inquiries).toBe(11);
    expect(result.fact.grossMarginRate).toBe(0.22);
  });

  it("throws a clear error when the sheet is not a 生意参谋核心看板 export", () => {
    expect(() => parseSycmCoreBoardRows([["商品名称", "价格"], ["保温杯", "12"]], fallbackDailyFact)).toThrow(
      "没有识别到生意参谋核心看板表头"
    );
  });
});
