import type { ActionTemplate } from "./types";

export const actionTemplates: ActionTemplate[] = [
  {
    id: "daily-response-cleanup",
    domainId: "service",
    bottleneckIds: ["response_mechanism_gap"],
    metricIds: ["ww_3min_response_rate"],
    frequency: "daily_operation",
    ownerRole: "customer_service",
    checklist: ["检查未及时回复咨询", "补齐快捷回复"],
    verificationMetricIds: ["ww_3min_response_rate"],
    verificationWindow: "next_day",
    evidencePolicy: "optional_note",
    stopPolicy: "metric_recovered"
  },
  {
    id: "refund-daily-clearance",
    domainId: "service",
    bottleneckIds: ["refund_processing_gap"],
    metricIds: ["refund_processing_duration", "intervention_rate"],
    frequency: "daily_operation",
    ownerRole: "customer_service",
    checklist: ["清理待处理退款", "标记需要负责人介入的售后"],
    verificationMetricIds: ["refund_processing_duration", "intervention_rate"],
    verificationWindow: "3d",
    evidencePolicy: "optional_note",
    stopPolicy: "refund_queue_cleared"
  },
  {
    id: "factory-inquiry-followup",
    domainId: "factory_custom",
    bottleneckIds: ["factory_response_gap"],
    metricIds: ["factory_service_response_rate", "ww_3min_response_rate"],
    frequency: "daily_operation",
    ownerRole: "customer_service",
    checklist: ["追踪找工厂未响应咨询", "补齐定制场景快捷回复"],
    verificationMetricIds: ["factory_service_response_rate"],
    verificationWindow: "3d",
    evidencePolicy: "optional_note",
    stopPolicy: "factory_response_recovered"
  },
  {
    id: "contract-payment-followup",
    domainId: "factory_custom",
    bottleneckIds: ["contract_payment_gap"],
    metricIds: ["contract_payment_rate", "custom_trade_points"],
    frequency: "daily_operation",
    ownerRole: "operator",
    checklist: ["筛选未支付合约订单", "跟进报价、打样、交期疑问"],
    verificationMetricIds: ["contract_payment_rate", "custom_trade_points"],
    verificationWindow: "7d",
    evidencePolicy: "optional_note",
    stopPolicy: "contract_payment_recovered"
  },
  {
    id: "margin-risk-review",
    domainId: "guardrail",
    bottleneckIds: ["gross_margin_gap"],
    metricIds: ["gross_margin_rate"],
    frequency: "exception_triggered",
    ownerRole: "manager",
    checklist: ["复核低毛利订单", "标记不可放大的商品或客户"],
    verificationMetricIds: ["gross_margin_rate"],
    verificationWindow: "7d",
    evidencePolicy: "required_note",
    stopPolicy: "margin_back_to_floor"
  }
];
