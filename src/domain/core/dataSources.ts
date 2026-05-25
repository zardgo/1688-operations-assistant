import type { DataSourceDefinition } from "./types";

export const dataSourceDefinitions: DataSourceDefinition[] = [
  {
    id: "new_lighthouse",
    name: "新灯塔",
    sourceType: "manual",
    ownerRole: "operator",
    cadence: "30d",
    freshnessRule: "daily",
    confidence: "medium",
    providedMetricIds: [
      "lighthouse_score",
      "consultation_experience_score",
      "ww_3min_response_rate",
      "refund_processing_duration",
      "intervention_rate"
    ],
    sourceUrl: "https://work.1688.com/home/page/index.htm?_path_=sellerPro/lvyue/new-lighthouse-ai"
  },
  {
    id: "sycm_core_board",
    name: "生意参谋首页核心看板",
    sourceType: "xls",
    ownerRole: "operator",
    cadence: "daily",
    freshnessRule: "daily",
    confidence: "high",
    providedMetricIds: [
      "total_exposure",
      "visitors",
      "inquiries",
      "payments",
      "payment_amount",
      "repeat_buyer_rate",
      "repeat_payment_amount"
    ]
  },
  {
    id: "product_growth_backend",
    name: "商品成长后台",
    sourceType: "manual",
    ownerRole: "operator",
    cadence: "30d",
    freshnessRule: "daily",
    confidence: "medium",
    providedMetricIds: ["procurement_index_score", "town_shop_treasure_count", "quality_issue_product_count"]
  },
  {
    id: "product_list",
    name: "商品列表",
    sourceType: "copy_table",
    ownerRole: "operator",
    cadence: "daily",
    freshnessRule: "daily",
    confidence: "medium",
    providedMetricIds: ["quality_issue_product_count"]
  },
  {
    id: "factory_workbench",
    name: "找工厂后台",
    sourceType: "manual",
    ownerRole: "operator",
    cadence: "30d",
    freshnessRule: "daily",
    confidence: "medium",
    providedMetricIds: [
      "factory_service_response_rate",
      "factory_fulfillment_rate",
      "custom_trade_points",
      "contract_payment_rate"
    ]
  },
  {
    id: "after_sales_backend",
    name: "退款售后后台",
    sourceType: "manual",
    ownerRole: "customer_service",
    cadence: "30d",
    freshnessRule: "daily",
    confidence: "medium",
    providedMetricIds: ["refund_processing_duration", "intervention_rate"]
  },
  {
    id: "internal_profit_sheet",
    name: "内部利润表",
    sourceType: "manual",
    ownerRole: "manager",
    cadence: "weekly",
    freshnessRule: "weekly",
    confidence: "medium",
    providedMetricIds: ["gross_margin_rate"]
  },
  {
    id: "manual_input",
    name: "手填数据",
    sourceType: "manual",
    ownerRole: "operator",
    cadence: "daily",
    freshnessRule: "daily",
    confidence: "low",
    providedMetricIds: [
      "lighthouse_score",
      "consultation_experience_score",
      "ww_3min_response_rate",
      "refund_processing_duration",
      "intervention_rate",
      "total_exposure",
      "visitors",
      "inquiries",
      "payments",
      "payment_amount",
      "procurement_index_score",
      "town_shop_treasure_count",
      "quality_issue_product_count",
      "factory_service_response_rate",
      "factory_fulfillment_rate",
      "custom_trade_points",
      "contract_payment_rate",
      "repeat_buyer_rate",
      "repeat_payment_amount",
      "gross_margin_rate"
    ]
  }
];
