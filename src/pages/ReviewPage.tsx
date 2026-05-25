import { BookOpenCheck, GraduationCap, RotateCcw } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import type { V2Action, V2BacktestResult, V2MetricId, buildV3OperatingReview } from "../lib/operations";
import type { ExecutionLog } from "../lib/storage";

type ReviewPageProps = {
  firstAction: V2Action | null;
  backtestAfter: string;
  backtestResult: V2BacktestResult | null;
  executionLogs: ExecutionLog[];
  v3Review: ReturnType<typeof buildV3OperatingReview>;
  onBacktestAfterChange: (value: string) => void;
  onRunBacktest: (action: V2Action) => void;
};

export function ReviewPage({
  firstAction,
  backtestAfter,
  backtestResult,
  executionLogs,
  v3Review,
  onBacktestAfterChange,
  onRunBacktest
}: ReviewPageProps) {
  const completedLogs = executionLogs.filter((log) => log.completed);
  const metric = firstAction ? getReviewMetric(firstAction.targetMetricId) : null;
  const canBacktest = firstAction && completedLogs.length > 0;

  return (
    <>
      <PageHeader title="这个动作有没有用？" description="先记录当前回测，再决定是否沉淀成 SOP。" />
      <section className="page-grid review-grid">
        <div className="panel backtest-panel">
          <div className="section-title">
            <RotateCcw aria-hidden="true" />
            <h2>动作回测</h2>
          </div>
          {firstAction ? (
            <>
              <strong>{firstAction.title}</strong>
              <p>{firstAction.method}</p>
              {completedLogs.length === 0 ? (
                <p className="empty-copy">请先完成动作记录，再录入回测数据。</p>
              ) : null}
              <label className="metric-input-row compact">
                <span>
                  <strong>回测后 {metric?.label ?? "目标指标"}</strong>
                  <small>填动作后最新数据</small>
                </span>
                <div>
                  <input
                    aria-label={`回测后 ${metric?.label ?? "目标指标"}`}
                    disabled={!canBacktest}
                    inputMode="decimal"
                    type="number"
                    value={backtestAfter}
                    onChange={(event) => onBacktestAfterChange(event.target.value)}
                  />
                  <em>{metric?.unit ?? ""}</em>
                </div>
              </label>
              <button className="primary-action" disabled={!canBacktest} type="button" onClick={() => onRunBacktest(firstAction)}>
                记录回测
              </button>
            </>
          ) : (
            <p className="empty-copy">当前没有缺口动作，先录入新的指标。</p>
          )}
        </div>
        <div className="panel">
          <div className="section-title">
            <BookOpenCheck aria-hidden="true" />
            <h2>SOP 状态</h2>
          </div>
          {backtestResult ? (
            <div className="sop-box">
              <span>{formatSopState(backtestResult.sopState)}</span>
              <strong>{backtestResult.summary}</strong>
            </div>
          ) : (
            <p className="empty-copy">完成动作后录入回测数据。</p>
          )}
        </div>
      </section>

      <section className="page-grid capability-grid">
        <div className="panel task-panel">
          <div className="section-title">
            <GraduationCap aria-hidden="true" />
            <h2>员工能力复盘</h2>
          </div>
          <div className="decision-card">
            <span>{v3Review.capabilityReview.level}</span>
            <strong>{v3Review.capabilityReview.summary}</strong>
            <p>能力目标不是多填表，而是让员工能归因、能停止无效动作、能沉淀 SOP。</p>
          </div>
          <div className="training-list">
            {v3Review.capabilityReview.nextTraining.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
        <aside className="panel method-panel">
          <div className="section-title">
            <BookOpenCheck aria-hidden="true" />
            <h2>三层目标</h2>
          </div>
          <div className="layer-list">
            {v3Review.goalLayers.map((layer) => (
              <article key={layer.id}>
                <span>{layer.label}</span>
                <p>{layer.purpose}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </>
  );
}

function formatSopState(state: V2Action["sopState"]): string {
  if (state === "validated") return "已验证";
  if (state === "candidate") return "候选";
  return "观察中";
}

function getReviewMetric(metricId: V2MetricId): { label: string; unit: string } {
  const metrics: Record<V2MetricId, { label: string; unit: string }> = {
    ww_3min_response_rate: { label: "旺旺 3 分钟响应率", unit: "%" },
    factory_service_response_rate_30d: { label: "找工厂服务响应率", unit: "%" },
    pickup_48h_rate_30d: { label: "48 小时揽收率", unit: "%" },
    totalExposure: { label: "总曝光", unit: "次" },
    naturalExposureShare: { label: "自然曝光占比", unit: "%" },
    adExposureShare: { label: "广告曝光占比", unit: "%" },
    exposureVisitorRate: { label: "曝光访客率", unit: "%" },
    visitorInquiryRate: { label: "访客询盘率", unit: "%" },
    inquiryPaymentRate: { label: "询盘支付率", unit: "%" },
    adCostPerInquiry: { label: "单询盘广告成本", unit: "元" },
    adCostPerPayment: { label: "单支付广告成本", unit: "元" },
    adSpendShare: { label: "广告费率", unit: "%" },
    paymentAmount: { label: "支付金额", unit: "元" },
    visitors: { label: "访客数", unit: "人" },
    inquiries: { label: "询盘数", unit: "次" },
    payments: { label: "支付订单数", unit: "笔" },
    lighthouse_score: { label: "新灯塔分", unit: "分" },
    store_service_star_level: { label: "店铺服务星级", unit: "星" },
    lighthouse_logistics_score: { label: "物流体验分", unit: "分" },
    lighthouse_after_sales_score: { label: "售后体验分", unit: "分" },
    lighthouse_consult_score: { label: "咨询体验分", unit: "分" },
    lighthouse_product_score: { label: "商品体验分", unit: "分" },
    factory_fulfillment_rate_30d: { label: "找工厂履约率", unit: "%" },
    monthly_active_small_custom_sku_count: { label: "月动销小单定制商品数", unit: "款" },
    custom_trade_points_30d: { label: "定制交易积分", unit: "分" },
    contract_payment_rate: { label: "合约支付率", unit: "%" },
    gross_margin_rate: { label: "目标毛利率", unit: "%" },
    quality_refund_rate: { label: "品质退款率", unit: "%" },
    weekly_sop_count: { label: "周 SOP 数", unit: "条" }
  };
  return metrics[metricId];
}
