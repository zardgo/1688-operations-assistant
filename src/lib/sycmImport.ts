import type { V4DailyFactInput } from "./operations";

export type SheetCell = string | number | boolean | null | undefined;
export type SheetRows = SheetCell[][];

export type SycmCoreBoardImport = {
  fact: V4DailyFactInput;
  rowCount: number;
  missingFields: Array<"inquiries" | "grossMarginRate">;
};

type HeaderKey =
  | "date"
  | "totalExposure"
  | "adExposure"
  | "visitors"
  | "paymentAmount"
  | "payments"
  | "adSpend"
  | "inquiries"
  | "grossMarginRate";

const headerMap: Record<string, HeaderKey> = {
  日期: "date",
  展现次数: "totalExposure",
  广告展现次数: "adExposure",
  访客数: "visitors",
  支付金额: "paymentAmount",
  支付订单数: "payments",
  网销宝推广消耗金额: "adSpend",
  询盘数: "inquiries",
  毛利率: "grossMarginRate"
};

export function parseSycmCoreBoardRows(rows: SheetRows, fallback: V4DailyFactInput): SycmCoreBoardImport {
  const headerRowIndex = rows.findIndex((row) => getHeaderIndex(row).has("date") && getHeaderIndex(row).has("totalExposure"));
  if (headerRowIndex < 0) {
    throw new Error("没有识别到生意参谋核心看板表头，请上传首页核心看板导出的 xls/xlsx 文件。");
  }

  const headerIndex = getHeaderIndex(rows[headerRowIndex]);
  const dataRows = rows.slice(headerRowIndex + 1).filter((row) => normalizeCell(row[headerIndex.get("date") ?? -1]) !== "");
  const latestRow = dataRows[0];

  if (!latestRow) {
    throw new Error("生意参谋核心看板没有可导入的数据行。");
  }

  const totalExposure = readNumber(latestRow, headerIndex, "totalExposure", fallback.totalExposure);
  const adExposure = readNumber(latestRow, headerIndex, "adExposure", fallback.adExposure);
  const importedInquiries = readOptionalNumber(latestRow, headerIndex, "inquiries");
  const importedGrossMarginRate = readOptionalPercent(latestRow, headerIndex, "grossMarginRate");
  const missingFields: SycmCoreBoardImport["missingFields"] = [];

  if (importedInquiries === null) missingFields.push("inquiries");
  if (importedGrossMarginRate === null) missingFields.push("grossMarginRate");

  return {
    rowCount: dataRows.length,
    missingFields,
    fact: {
      ...fallback,
      date: readText(latestRow, headerIndex, "date", fallback.date),
      totalExposure,
      adExposure,
      naturalExposure: Math.max(totalExposure - adExposure, 0),
      visitors: readNumber(latestRow, headerIndex, "visitors", fallback.visitors),
      paymentAmount: readNumber(latestRow, headerIndex, "paymentAmount", fallback.paymentAmount),
      payments: readNumber(latestRow, headerIndex, "payments", fallback.payments),
      adSpend: readNumber(latestRow, headerIndex, "adSpend", fallback.adSpend),
      inquiries: importedInquiries ?? fallback.inquiries,
      grossMarginRate: importedGrossMarginRate ?? fallback.grossMarginRate
    }
  };
}

function getHeaderIndex(row: SheetCell[]): Map<HeaderKey, number> {
  const result = new Map<HeaderKey, number>();
  row.forEach((cell, index) => {
    const key = headerMap[normalizeCell(cell)];
    if (key && !result.has(key)) result.set(key, index);
  });
  return result;
}

function readText(row: SheetCell[], headerIndex: Map<HeaderKey, number>, key: HeaderKey, fallback: string): string {
  const index = headerIndex.get(key);
  if (index === undefined) return fallback;
  const value = normalizeCell(row[index]);
  return value === "" ? fallback : value;
}

function readNumber(row: SheetCell[], headerIndex: Map<HeaderKey, number>, key: HeaderKey, fallback: number): number {
  return readOptionalNumber(row, headerIndex, key) ?? fallback;
}

function readOptionalNumber(row: SheetCell[], headerIndex: Map<HeaderKey, number>, key: HeaderKey): number | null {
  const index = headerIndex.get(key);
  if (index === undefined) return null;
  const value = normalizeCell(row[index]);
  if (value === "" || value === "-") return null;
  const numberValue = Number(value.replace(/,/g, "").replace("%", ""));
  return Number.isFinite(numberValue) ? numberValue : null;
}

function readOptionalPercent(row: SheetCell[], headerIndex: Map<HeaderKey, number>, key: HeaderKey): number | null {
  const value = readOptionalNumber(row, headerIndex, key);
  return value === null ? null : value / 100;
}

function normalizeCell(cell: SheetCell): string {
  return String(cell ?? "").trim();
}
