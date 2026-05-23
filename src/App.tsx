import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  ClipboardList,
  Factory,
  GraduationCap,
  PackageCheck,
  RotateCcw,
  Target
} from "lucide-react";
import {
  backtestV2Action,
  buildV2ActionPlan,
  buildV2GoalDashboard,
  buildV3OperatingReview,
  type V2Action,
  type V2BacktestResult,
  type V2GoalId,
  type V2MetricId,
  type V2MetricReadingInput,
  type V3CapabilitySnapshot,
  type V3SkuFact
} from "./lib/operations";
import "./styles.css";

type Page = "entry" | "gaps" | "path" | "backtest" | "reasoning" | "sku" | "capability";

type EditableMetric = {
  id: V2MetricId;
  label: string;
  helper: string;
  unit: "%" | "款" | "分";
  period: string;
};

const pageLabels: Record<Page, string> = {
  entry: "数据录入",
  gaps: "目标差距",
  path: "路径拆解",
  backtest: "动作回测",
  reasoning: "经营推理",
  sku: "SKU 组合",
  capability: "员工能力"
};

const goalOptions: Array<{ id: V2GoalId; label: string }> = [
  { id: "protect_service", label: "保基础服务分" },
  { id: "factory_bronze", label: "冲找工厂铜牌" },
  { id: "factory_silver", label: "冲找工厂银牌" },
  { id: "factory_gold", label: "冲找工厂金牌" },
  { id: "l_growth", label: "提升 L 等级" }
];

const editableMetrics: EditableMetric[] = [
  {
    id: "ww_3min_response_rate",
    label: "旺旺 3 分钟响应率",
    helper: "每日录入，09:00-21:00 有效回复口径",
    unit: "%",
    period: "2026-05-23"
  },
  {
    id: "factory_service_response_rate_30d",
    label: "找工厂服务响应率",
    helper: "近 30 天滚动口径",
    unit: "%",
    period: "2026-05-23"
  },
  {
    id: "factory_fulfillment_rate_30d",
    label: "找工厂履约率",
    helper: "近 30 天滚动口径",
    unit: "%",
    period: "2026-05-23"
  },
  {
    id: "monthly_active_small_custom_sku_count",
    label: "月动销小单定制商品数",
    helper: "每月看是否达到 3 款",
    unit: "款",
    period: "2026-05"
  },
  {
    id: "custom_trade_points_30d",
    label: "定制交易积分",
    helper: "近 30 天找工厂积分",
    unit: "分",
    period: "2026-05-23"
  },
  {
    id: "contract_payment_rate",
    label: "合约支付率",
    helper: "定制成交规范度",
    unit: "%",
    period: "2026-05-23"
  },
  {
    id: "gross_margin_rate",
    label: "毛利率",
    helper: "每周录入真实毛利，含包装、运费、售后、广告",
    unit: "%",
    period: "2026-W21"
  }
];

const initialValues: Record<V2MetricId, number> = {
  ww_3min_response_rate: 0.52,
  factory_service_response_rate_30d: 0.55,
  pickup_48h_rate_30d: 0.96,
  factory_fulfillment_rate_30d: 0.68,
  monthly_active_small_custom_sku_count: 1,
  custom_trade_points_30d: 60000,
  contract_payment_rate: 0.45,
  gross_margin_rate: 0.11,
  quality_refund_rate: 0.01,
  weekly_sop_count: 0
};

const sampleSkuFacts: V3SkuFact[] = [
  {
    name: "316 商务礼品杯",
    inquiries: 18,
    validInquiryRate: 0.72,
    grossMarginRate: 0.32,
    conversionRate: 0.18,
    customizationRequests: 9,
    repeatOrders: 2,
    afterSalesRate: 0.01,
    fulfillmentRisk: "low"
  },
  {
    name: "低价通用杯",
    inquiries: 25,
    validInquiryRate: 0.28,
    grossMarginRate: 0.08,
    conversionRate: 0.04,
    customizationRequests: 1,
    repeatOrders: 0,
    afterSalesRate: 0.03,
    fulfillmentRisk: "medium"
  },
  {
    name: "掉漆儿童杯",
    inquiries: 10,
    validInquiryRate: 0.42,
    grossMarginRate: 0.2,
    conversionRate: 0.08,
    customizationRequests: 1,
    repeatOrders: 0,
    afterSalesRate: 0.09,
    fulfillmentRisk: "high"
  }
];

const sampleCapability: V3CapabilitySnapshot = {
  weeklySopCount: 0,
  completedAttributionCount: 0,
  stoppedIneffectiveActions: 0,
  independentJudgmentCount: 0
};

export default function App() {
  const [page, setPage] = useState<Page>("entry");
  const [goalId, setGoalId] = useState<V2GoalId>("factory_bronze");
  const [values, setValues] = useState(initialValues);
  const [backtestAfter, setBacktestAfter] = useState("62");
  const [backtestResult, setBacktestResult] = useState<V2BacktestResult | null>(null);

  const readings = useMemo<V2MetricReadingInput[]>(
    () =>
      editableMetrics.map((metric) => ({
        id: metric.id,
        value: values[metric.id],
        period: metric.period
      })),
    [values]
  );
  const dashboard = useMemo(() => buildV2GoalDashboard(goalId, readings), [goalId, readings]);
  const actionPlan = useMemo(() => buildV2ActionPlan(dashboard), [dashboard]);
  const v3Review = useMemo(
    () =>
      buildV3OperatingReview({
        goalId,
        readings,
        skuFacts: sampleSkuFacts,
        capability: sampleCapability
      }),
    [goalId, readings]
  );
  const firstAction = actionPlan.actions[0] ?? null;

  function updateMetric(metric: EditableMetric, rawValue: string) {
    const numericValue = Number(rawValue);
    setValues((current) => ({
      ...current,
      [metric.id]: metric.unit === "%" ? numericValue / 100 : numericValue
    }));
    setBacktestResult(null);
  }

  function runBacktest(action: V2Action) {
    const metric = editableMetrics.find((item) => item.id === action.targetMetricId);
    const afterValue = Number(backtestAfter);
    const normalizedAfter = metric?.unit === "%" ? afterValue / 100 : afterValue;
    setBacktestResult(backtestV2Action(action, values[action.targetMetricId], normalizedAfter));
  }

  return (
    <main className="app-shell">
      <header className="topbar v2-topbar">
        <div>
          <p className="eyebrow">保温杯 / 经营推理 / V3</p>
          <h1>1688 运营助手</h1>
        </div>
        <label className="scenario-picker">
          <span>当前目标</span>
          <select aria-label="当前目标" value={goalId} onChange={(event) => setGoalId(event.target.value as V2GoalId)}>
            {goalOptions.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <nav className="mode-tabs v2-tabs" aria-label="V3 页面">
        {(Object.keys(pageLabels) as Page[]).map((key) => (
          <button className={page === key ? "active" : ""} key={key} type="button" onClick={() => setPage(key)}>
            {pageLabels[key]}
          </button>
        ))}
      </nav>

      <section className="risk-strip v2-scoreboard">
        <div className={`risk-card ${dashboard.gaps[0]?.priority.toLowerCase() ?? "p3"}`}>
          <Activity aria-hidden="true" />
          <span>当前目标</span>
          <strong>{dashboard.goalLabel}</strong>
          <small>{dashboard.summary}</small>
        </div>
        <div className="risk-explain">
          <p>V3 不只看官方指标，还会同时裁决经营健康和员工能力，避免为了冲平台目标把利润和判断力打没。</p>
          <div className="flow-line">
            {v3Review.goalLayers.map((layer) => (
              <span key={layer.id}>{layer.label}</span>
            ))}
            <span>原因假设</span>
            <span>实验卡</span>
            <span>SOP</span>
          </div>
        </div>
      </section>

      {page === "entry" && (
        <section className="page-grid entry-grid">
          <div className="panel task-panel">
            <div className="section-title">
              <ClipboardList aria-hidden="true" />
              <h2>V2 数据录入</h2>
            </div>
            <div className="entry-list">
              {editableMetrics.map((metric) => (
                <label className="metric-input-row" key={metric.id}>
                  <span>
                    <strong>{metric.label}</strong>
                    <small>{metric.helper}</small>
                  </span>
                  <div>
                    <input
                      aria-label={metric.label}
                      inputMode="decimal"
                      type="number"
                      value={formatInputValue(values[metric.id], metric.unit)}
                      onChange={(event) => updateMetric(metric, event.target.value)}
                    />
                    <em>{metric.unit}</em>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <aside className="panel method-panel">
            <div className="section-title">
              <Factory aria-hidden="true" />
              <h2>录入节奏</h2>
            </div>
            <div className="cadence-list">
              <p><strong>每日</strong> 响应率、履约率、积分、合约支付。</p>
              <p><strong>每周</strong> 毛利、售后归因、有效动作。</p>
              <p><strong>每月</strong> 小单定制动销商品数和牌级进度。</p>
            </div>
          </aside>
        </section>
      )}

      {page === "gaps" && (
        <section className="page-grid goals-grid">
          <div className="panel task-panel">
            <div className="section-title">
              <Target aria-hidden="true" />
              <h2>目标差距</h2>
            </div>
            <div className="gap-list">
              {dashboard.gaps.map((gap) => (
                <article className={`gap-card ${gap.priority.toLowerCase()}`} key={gap.metricId}>
                  <div>
                    <span>{gap.priority}</span>
                    <strong>{gap.metricLabel}{gap.gapLabel}</strong>
                  </div>
                  <p>{gap.currentLabel} / 目标 {gap.targetLabel}</p>
                  <small>{gap.whyItMatters}</small>
                </article>
              ))}
            </div>
          </div>
          <aside className="panel method-panel">
            <div className="section-title">
              <BarChart3 aria-hidden="true" />
              <h2>指标快照</h2>
            </div>
            <div className="metric-list">
              {dashboard.readings.map((reading) => (
                <div key={reading.id}>
                  <span>{reading.label}</span>
                  <strong>{reading.currentLabel}</strong>
                </div>
              ))}
            </div>
          </aside>
        </section>
      )}

      {page === "path" && (
        <section className="page-grid today-grid">
          <div className="panel task-panel">
            <div className="section-title">
              <Target aria-hidden="true" />
              <h2>路径拆解</h2>
            </div>
            <div className="path-list">
              {actionPlan.pathSteps.map((step, index) => (
                <article className="path-card" key={step.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{step.title}</strong>
                  <p>{step.formula}</p>
                  <small>{step.checkpoint}</small>
                </article>
              ))}
            </div>
          </div>
          <aside className="panel method-panel">
            <div className="section-title">
              <CheckCircle2 aria-hidden="true" />
              <h2>今日动作</h2>
            </div>
            <div className="task-list">
              {actionPlan.actions.map((action) => (
                <article className={`task-card ${action.priority.toLowerCase()}`} key={action.id}>
                  <div className="task-head">
                    <span>{action.priority}</span>
                    <strong>{action.title}</strong>
                  </div>
                  <p>{action.method}</p>
                  <dl>
                    <dt>完成证据</dt>
                    <dd className="evidence-list">
                      {action.evidence.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </dd>
                    <dt>复盘问题</dt>
                    <dd>{action.reviewQuestion}</dd>
                  </dl>
                </article>
              ))}
            </div>
          </aside>
        </section>
      )}

      {page === "backtest" && (
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
                <label className="metric-input-row compact">
                  <span>
                    <strong>回测后 旺旺 3 分钟响应率</strong>
                    <small>填动作后最新数据</small>
                  </span>
                  <div>
                    <input
                      aria-label="回测后 旺旺 3 分钟响应率"
                      inputMode="decimal"
                      type="number"
                      value={backtestAfter}
                      onChange={(event) => setBacktestAfter(event.target.value)}
                    />
                    <em>%</em>
                  </div>
                </label>
                <button className="primary-action" type="button" onClick={() => runBacktest(firstAction)}>
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
      )}

      {page === "reasoning" && (
        <section className="page-grid reasoning-grid">
          <div className="panel task-panel">
            <div className="section-title">
              <Brain aria-hidden="true" />
              <h2>优先级裁判</h2>
            </div>
            <div className="decision-card">
              <span>{layerLabel(v3Review.priorityDecision.layer)}</span>
              <strong>{v3Review.priorityDecision.focus}</strong>
              <p>{v3Review.priorityDecision.reason}</p>
              <div className="block-list">
                {v3Review.priorityDecision.blockedGoals.map((goal) => (
                  <em key={goal}>{goal}</em>
                ))}
              </div>
            </div>

            <div className="section-title stacked-title">
              <BarChart3 aria-hidden="true" />
              <h2>原因假设</h2>
            </div>
            <div className="hypothesis-list">
              {v3Review.causeHypotheses.slice(0, 4).map((item) => (
                <article className="hypothesis-card" key={`${item.symptom}-${item.hypothesis}`}>
                  <span>{item.confidence}</span>
                  <strong>{item.hypothesis}</strong>
                  <p>{item.symptom}</p>
                  <small>{item.evidenceToCheck}</small>
                </article>
              ))}
            </div>
          </div>
          <aside className="panel method-panel">
            <div className="section-title">
              <CheckCircle2 aria-hidden="true" />
              <h2>动作实验卡</h2>
            </div>
            {v3Review.experimentCards.map((experiment) => (
              <article className="experiment-card" key={experiment.id}>
                <span>{experiment.reviewCadence}</span>
                <strong>{experiment.title}</strong>
                <p>{experiment.hypothesis}</p>
                <dl>
                  <dt>动作</dt>
                  <dd>{experiment.action}</dd>
                  <dt>预期</dt>
                  <dd>{experiment.expectedChange}</dd>
                  <dt>停止</dt>
                  <dd>{experiment.stopCondition}</dd>
                </dl>
              </article>
            ))}
          </aside>
        </section>
      )}

      {page === "sku" && (
        <section className="page-grid sku-grid">
          <div className="panel task-panel">
            <div className="section-title">
              <PackageCheck aria-hidden="true" />
              <h2>SKU 经营组合</h2>
            </div>
            <div className="sku-list">
              {v3Review.skuPortfolio.map((sku) => (
                <article className={`sku-card ${sku.role === "风险款" ? "risk" : ""}`} key={sku.name}>
                  <span>{sku.role}</span>
                  <strong>{sku.name}</strong>
                  <p>{sku.recommendation}</p>
                  <div className="sku-metrics">
                    <small>询盘 {sku.inquiries}</small>
                    <small>有效 {Math.round(sku.validInquiryRate * 100)}%</small>
                    <small>毛利 {Math.round(sku.grossMarginRate * 100)}%</small>
                    <small>售后 {Math.round(sku.afterSalesRate * 100)}%</small>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <aside className="panel method-panel">
            <div className="section-title">
              <Target aria-hidden="true" />
              <h2>组合原则</h2>
            </div>
            <div className="cadence-list">
              <p><strong>定制款</strong> 负责 LOGO、刻字、礼品包装和找工厂积分。</p>
              <p><strong>引流款</strong> 可以带询盘，但必须有毛利和低质量询盘警戒线。</p>
              <p><strong>风险款</strong> 先控售后、履约和毛利，不继续加流量。</p>
            </div>
          </aside>
        </section>
      )}

      {page === "capability" && (
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
      )}
    </main>
  );
}

function formatInputValue(value: number, unit: EditableMetric["unit"]): string {
  if (unit === "%") return String(Math.round(value * 100));
  return String(value);
}

function formatSopState(state: V2Action["sopState"]): string {
  if (state === "validated") return "已验证";
  if (state === "stopped") return "停止";
  return "SOP 候选";
}

function layerLabel(layer: "official" | "business" | "capability"): string {
  if (layer === "official") return "官方目标";
  if (layer === "business") return "经营目标";
  return "能力目标";
}
