import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Factory,
  Gauge,
  ShieldAlert,
  Target,
  XCircle
} from "lucide-react";
import {
  createMvpWeeklyReview,
  diagnoseMvp,
  mvpSeedScenarios,
  type MvpTaskOutcome
} from "./lib/operations";
import "./styles.css";

type Page = "today" | "goals" | "review";

const pageLabels: Record<Page, string> = {
  today: "今日冲刺",
  goals: "官方目标",
  review: "周复盘 / SOP"
};

const goalLabels = {
  protect_service: "保基础服务分",
  factory_bronze: "冲找工厂铜牌",
  factory_silver: "冲找工厂银牌",
  factory_gold: "冲找工厂金牌",
  l_growth: "提升 L 等级",
  lighthouse_repair: "修复新灯塔短板"
};

export default function App() {
  const [page, setPage] = useState<Page>("today");
  const [scenarioId, setScenarioId] = useState(mvpSeedScenarios[0].id);
  const [outcomes, setOutcomes] = useState<MvpTaskOutcome[]>([]);
  const scenario = mvpSeedScenarios.find((item) => item.id === scenarioId) ?? mvpSeedScenarios[0];
  const diagnosis = useMemo(() => diagnoseMvp(scenario.input), [scenario]);
  const review = useMemo(() => createMvpWeeklyReview(diagnosis, outcomes), [diagnosis, outcomes]);

  function chooseScenario(nextScenarioId: string) {
    setScenarioId(nextScenarioId as typeof scenarioId);
    setOutcomes([]);
    setPage("today");
  }

  function recordOutcome(taskId: string, result: MvpTaskOutcome["result"]) {
    setOutcomes((current) => [
      ...current.filter((outcome) => outcome.taskId !== taskId),
      { taskId, result, note: result === "effective" ? "任务有效，进入周复盘候选" : "任务需要停止或换打法" }
    ]);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">保温杯 / 消费品 / MVP</p>
          <h1>1688 运营助手</h1>
        </div>
        <label className="scenario-picker">
          <span>种子场景</span>
          <select aria-label="种子场景" value={scenarioId} onChange={(event) => chooseScenario(event.target.value)}>
            {mvpSeedScenarios.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} {item.title}
              </option>
            ))}
          </select>
        </label>
      </header>

      <nav className="mode-tabs" aria-label="MVP 页面">
        {(Object.keys(pageLabels) as Page[]).map((key) => (
          <button
            className={page === key ? "active" : ""}
            key={key}
            type="button"
            onClick={() => setPage(key)}
          >
            {pageLabels[key]}
          </button>
        ))}
      </nav>

      <section className="risk-strip">
        <div className={`risk-card ${diagnosis.highestRisk.priority.toLowerCase()}`}>
          <Gauge aria-hidden="true" />
          <span>最高风险</span>
          <strong>{diagnosis.highestRisk.metricName}</strong>
          <small>
            {diagnosis.highestRisk.current} / 目标 {diagnosis.highestRisk.target}
          </small>
        </div>
        <div className="risk-explain">
          <p>{diagnosis.highestRisk.impact}</p>
          {diagnosis.blockers.map((blocker) => (
            <div className="blocker" key={blocker}>
              <ShieldAlert aria-hidden="true" />
              <span>{blocker}</span>
            </div>
          ))}
        </div>
      </section>

      {page === "today" && (
        <section className="page-grid today-grid">
          <div className="panel task-panel">
            <div className="section-title">
              <ClipboardList aria-hidden="true" />
              <h2>今日 3-5 个任务</h2>
            </div>
            <div className="task-list">
              {diagnosis.tasks.map((task) => {
                const outcome = outcomes.find((item) => item.taskId === task.id);
                return (
                  <article className={`task-card ${task.priority.toLowerCase()}`} key={task.id}>
                    <div className="task-head">
                      <span>{task.priority}</span>
                      <strong>{task.title}</strong>
                      {outcome && <small>{formatOutcome(outcome.result)}</small>}
                    </div>
                    <p>{task.todayAction}</p>
                    <dl>
                      <dt>对应指标</dt>
                      <dd>{task.metricNames.join(" / ")}</dd>
                      <dt>触发规则</dt>
                      <dd>{task.ruleIds.join(" / ")}</dd>
                      <dt>完成证据</dt>
                      <dd>{task.evidence.join("、")}</dd>
                    </dl>
                    <div className="task-actions">
                      <button type="button" onClick={() => recordOutcome(task.id, "effective")}>
                        <CheckCircle2 aria-hidden="true" />
                        标记有效
                      </button>
                      <button type="button" onClick={() => recordOutcome(task.id, "ineffective")}>
                        <XCircle aria-hidden="true" />
                        标记无效
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="panel method-panel">
            <div className="section-title">
              <AlertTriangle aria-hidden="true" />
              <h2>复盘问题</h2>
            </div>
            {diagnosis.tasks.map((task) => (
              <div className="review-question" key={task.id}>
                <strong>{task.title}</strong>
                <p>{task.reviewQuestion}</p>
              </div>
            ))}
          </aside>
        </section>
      )}

      {page === "goals" && (
        <section className="page-grid goals-grid">
          <div className="panel">
            <div className="section-title">
              <Target aria-hidden="true" />
              <h2>当前官方目标</h2>
            </div>
            <div className="goal-summary">
              <strong>{goalLabels[scenario.input.goal]}</strong>
              <p>主类目：保温杯；类目类型：消费品 / 日用百货；第一版手动录入指标，不接 API。</p>
              <p>找工厂状态：{scenario.input.isFactoryJoined ? "已入驻或可冲级" : "未确认入驻资格"}</p>
            </div>
          </div>
          <div className="panel metric-panel">
            <div className="section-title">
              <Factory aria-hidden="true" />
              <h2>指标录入快照</h2>
            </div>
            <div className="metric-list">
              {Object.entries(scenario.input)
                .filter(([key]) => !["goal", "shopCategory", "categoryType"].includes(key))
                .map(([key, value]) => (
                  <div key={key}>
                    <span>{metricLabel(key)}</span>
                    <strong>{formatMetricValue(value)}</strong>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {page === "review" && (
        <section className="page-grid review-grid">
          <div className="panel">
            <div className="section-title">
              <BookOpenCheck aria-hidden="true" />
              <h2>有效任务</h2>
            </div>
            {review.effectiveTasks.length === 0 ? (
              <p className="empty-copy">还没有有效任务记录。先在今日冲刺里标记结果。</p>
            ) : (
              review.effectiveTasks.map((task) => <p className="review-pill" key={task}>{task}</p>)
            )}
          </div>
          <div className="panel">
            <div className="section-title">
              <XCircle aria-hidden="true" />
              <h2>停止动作</h2>
            </div>
            {review.stopActions.length === 0 ? (
              <p className="empty-copy">暂无停止动作。</p>
            ) : (
              review.stopActions.map((task) => <p className="review-pill danger" key={task}>{task}</p>)
            )}
          </div>
          <div className="panel">
            <div className="section-title">
              <Target aria-hidden="true" />
              <h2>下周 1-3 个目标</h2>
            </div>
            {review.nextGoals.map((goal) => (
              <p className="review-pill" key={goal}>{goal}</p>
            ))}
            {review.sopCandidate && (
              <div className="sop-box">
                <span>SOP 候选</span>
                <strong>{review.sopCandidate.title}</strong>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

function formatOutcome(result: MvpTaskOutcome["result"]): string {
  if (result === "effective") return "有效";
  if (result === "ineffective") return "无效";
  return "待观察";
}

function metricLabel(key: string): string {
  const labels: Record<string, string> = {
    isFactoryJoined: "是否入驻找工厂",
    grossMarginFloor: "毛利底线",
    ww3MinResponseRate: "旺旺 3 分钟响应率",
    serviceResponseRate30d: "近 30 天服务响应率",
    lateResponseMessages: "未及时响应消息数",
    pickupRiskOrders: "48 小时揽收风险订单数",
    pendingShipmentOrders: "待发货订单数",
    afterSalesCount: "今日退款/售后数",
    factoryFulfillmentRate: "找工厂履约率",
    monthlyActiveSmallCustomSkuCount: "月动销小单定制商品数",
    customTradePoints30d: "定制交易积分",
    contractPaymentRate: "合约支付率",
    qualityRefundRisk: "品质退款风险",
    problemSkuCount: "问题 SKU 数",
    gmvTrend: "GMV 趋势",
    grossMarginRate: "毛利率",
    lowMarginOrderCount: "毛利异常订单数",
    weeklySopCount: "本周 SOP 新增数"
  };
  return labels[key] ?? key;
}

function formatMetricValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "是" : "否";
  if (typeof value === "number") {
    if (value > 0 && value < 1) return `${Math.round(value * 100)}%`;
    return `${value}`;
  }
  if (value === "consumer_goods") return "消费品";
  if (value === "up") return "上升";
  if (value === "flat") return "持平";
  if (value === "high") return "高";
  if (value === "normal") return "正常";
  return String(value);
}
