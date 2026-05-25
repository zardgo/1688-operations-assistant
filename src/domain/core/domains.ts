import type { DomainDefinition } from "./types";

export const domainDefinitions: DomainDefinition[] = [
  {
    id: "service",
    name: "服务域",
    purpose: "响应、物流、售后、履约、服务星级。",
    primaryMetricIds: ["lighthouse_score", "consultation_experience_score", "ww_3min_response_rate"],
    sourceIds: ["new_lighthouse", "after_sales_backend", "manual_input"],
    ownerRoles: ["operator", "customer_service", "manager"],
    guardrailMetricIds: ["intervention_rate", "refund_processing_duration"]
  },
  {
    id: "product_growth",
    name: "商品成长域",
    purpose: "采购指数、镇店之宝、商品质量和商品成长路径。",
    primaryMetricIds: ["procurement_index_score", "town_shop_treasure_count", "quality_issue_product_count"],
    sourceIds: ["product_growth_backend", "product_list", "manual_input"],
    ownerRoles: ["operator", "manager"],
    guardrailMetricIds: ["gross_margin_rate", "intervention_rate"]
  },
  {
    id: "trade_funnel",
    name: "交易漏斗域",
    purpose: "曝光、访客、询盘、支付和成交金额。",
    primaryMetricIds: ["total_exposure", "visitors", "inquiries", "payments", "payment_amount"],
    sourceIds: ["sycm_core_board", "manual_input"],
    ownerRoles: ["operator", "manager"],
    guardrailMetricIds: ["gross_margin_rate"]
  },
  {
    id: "factory_custom",
    name: "找工厂/定制域",
    purpose: "找工厂牌级、定制交易、合约支付和履约。",
    primaryMetricIds: [
      "factory_service_response_rate",
      "factory_fulfillment_rate",
      "custom_trade_points",
      "contract_payment_rate"
    ],
    sourceIds: ["factory_workbench", "manual_input"],
    ownerRoles: ["operator", "customer_service", "manager"],
    guardrailMetricIds: ["gross_margin_rate", "intervention_rate"]
  },
  {
    id: "customer_repeat",
    name: "老客复购域",
    purpose: "老客复购、客户回访、补货提醒和客户分层。",
    primaryMetricIds: ["repeat_buyer_rate", "repeat_payment_amount"],
    sourceIds: ["sycm_core_board", "manual_input"],
    ownerRoles: ["operator", "customer_service", "manager"],
    guardrailMetricIds: ["gross_margin_rate"]
  },
  {
    id: "guardrail",
    name: "风险护栏域",
    purpose: "毛利、退款、介入、履约和合规风险。",
    primaryMetricIds: ["gross_margin_rate", "intervention_rate", "factory_fulfillment_rate"],
    sourceIds: ["internal_profit_sheet", "after_sales_backend", "factory_workbench", "manual_input"],
    ownerRoles: ["manager"],
    guardrailMetricIds: []
  }
];
