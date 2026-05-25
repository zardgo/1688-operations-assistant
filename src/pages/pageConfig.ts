export type Page =
  | "command"
  | "data"
  | "analysis"
  | "product"
  | "review"
  | "rules";

export const pageLabels: Record<Page, string> = {
  command: "今日任务",
  data: "数据录入",
  analysis: "卡点诊断",
  product: "商品诊断",
  review: "动作复盘",
  rules: "规则维护"
};

export const pageMeta: Record<Page, { step: string; detail: string }> = {
  command: { step: "01", detail: "先做什么" },
  data: { step: "02", detail: "导入补录" },
  analysis: { step: "03", detail: "找掉点" },
  product: { step: "04", detail: "看商品" },
  review: { step: "05", detail: "验效果" },
  rules: { step: "06", detail: "管口径" }
};

export const pages = Object.keys(pageLabels) as Page[];
