import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Factory,
  RotateCcw,
  Target
} from "lucide-react";
import {
  backtestV2Action,
  buildV2ActionPlan,
  buildV2GoalDashboard,
  type V2Action,
  type V2BacktestResult,
  type V2GoalId,
  type V2MetricId,
  type V2MetricReadingInput
} from "./lib/operations";
import "./styles.css";

type Page = "entry" | "gaps" | "path" | "backtest";

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
  backtest: "动作回测"
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
  gross_margin_rate: 0.21,
  quality_refund_rate: 0.01,
  weekly_sop_count: 0
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
          <p className="eyebrow">保温杯 / 数据驱动 / V2</p>
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

      <nav className="mode-tabs v2-tabs" aria-label="V2 页面">
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
          <p>录入频率按指标属性分层：响应、履约、积分每日看；小单定制入口每月看；SOP 每周回测。</p>
          <div className="flow-line">
            <span>目标</span>
            <span>数据</span>
            <span>差距</span>
            <span>路径</span>
            <span>动作</span>
            <span>回测</span>
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
