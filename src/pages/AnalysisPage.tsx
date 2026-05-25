import { Activity, BarChart3, BookOpenCheck, Brain, CheckCircle2, ClipboardList, RotateCcw, ShieldCheck, Target } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { MetricCard } from "../components/ui/MetricCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { trafficBattleMap } from "../data/knowledge/trafficBattleMap";
import type { DataQualityReport, DiagnosisMeta } from "../lib/dataQuality";
import type { MetricKnowledgeContext } from "../lib/knowledge/selectors";
import type {
  V5ChecklistBacktestResult,
  buildV2ActionPlan,
  buildV2GoalDashboard,
  buildV3OperatingReview,
  buildV5OperatingLoop,
  buildV8CommandCenter,
  buildResponseRateBenchmark
} from "../lib/operations";

type AnalysisPageProps = {
  actionPlan: ReturnType<typeof buildV2ActionPlan>;
  checkedChecklistIds: string[];
  commandCenter: ReturnType<typeof buildV8CommandCenter>;
  dataQualityReport: DataQualityReport;
  dashboard: ReturnType<typeof buildV2GoalDashboard>;
  diagnosisMeta: DiagnosisMeta;
  firstChecklistAction: ReturnType<typeof buildV5OperatingLoop>["checklist"][number] | null;
  primaryKnowledgeContext: MetricKnowledgeContext;
  responseRateBenchmark: ReturnType<typeof buildResponseRateBenchmark>;
  v3Review: ReturnType<typeof buildV3OperatingReview>;
  v5BacktestAfter: string;
  v5BacktestResult: V5ChecklistBacktestResult | null;
  v5Loop: ReturnType<typeof buildV5OperatingLoop>;
  onRunV5Backtest: () => void;
  onToggleChecklist: (id: string) => void;
  onV5BacktestAfterChange: (value: string) => void;
};

export function AnalysisPage({
  actionPlan,
  checkedChecklistIds,
  commandCenter,
  dataQualityReport,
  dashboard,
  diagnosisMeta,
  firstChecklistAction,
  primaryKnowledgeContext,
  responseRateBenchmark,
  v3Review,
  v5BacktestAfter,
  v5BacktestResult,
  v5Loop,
  onRunV5Backtest,
  onToggleChecklist,
  onV5BacktestAfterChange
}: AnalysisPageProps) {
  return (
    <>
      <PageHeader title="店铺哪里掉了？" description="先看最大掉点，再决定今天试什么动作。" />
      <section className="priority-grid" aria-label="卡点诊断优先区">
        <MetricCard
          label="漏斗"
          value={`${v5Loop.primaryBottleneck.label}瓶颈`}
          helper={v5Loop.primaryBottleneck.diagnosis}
          tone="warning"
        />
        <MetricCard
          label="最大卡点"
          value={commandCenter.primaryBlocker?.metricLabel ?? v5Loop.primaryBottleneck.label}
          helper={commandCenter.primaryBlocker?.gapLabel ?? "进入观察"}
          tone={commandCenter.primaryBlocker ? "danger" : "success"}
        />
        <MetricCard
          label="建议实验"
          value={v3Review.experimentCards[0]?.title ?? "先补数据"}
          helper={
            v3Review.experimentCards[0] ? `目标：${v3Review.experimentCards[0].expectedChange}` : "缺数据时不强行判断"
          }
          tone="action"
        />
      </section>

      <section className="page-grid diagnosis-grid">
        <div className="panel task-panel">
          <div className="section-title">
            <Brain aria-hidden="true" />
            <h2>诊断解释</h2>
          </div>
          <div className="diagnosis-explain-card">
            <div className="diagnosis-badge-row">
              <StatusBadge tone={diagnosisMeta.confidence === "high" ? "success" : diagnosisMeta.confidence === "medium" ? "warning" : "danger"}>
                置信度：{formatDiagnosisConfidence(diagnosisMeta.confidence)}
              </StatusBadge>
              <StatusBadge tone={dataQualityReport.level === "high" ? "success" : dataQualityReport.level === "medium" ? "warning" : "danger"}>
                数据：{dataQualityReport.label}
              </StatusBadge>
            </div>
            <strong>{commandCenter.primaryBlocker?.metricLabel ?? "当前没有明确主卡点"}</strong>
            <p>{diagnosisMeta.explanation}</p>
            <dl>
              <dt>判断依据</dt>
              <dd>{commandCenter.primaryBlocker?.whyItMatters ?? "核心指标已过线，优先复盘已有动作。"}</dd>
              <dt>所属战场</dt>
              <dd>
                {primaryKnowledgeContext.battleNodes.length > 0
                  ? primaryKnowledgeContext.battleNodes.map((node) => node.title).join("、")
                  : "暂无战场映射"}
              </dd>
              <dt>上游可能原因</dt>
              <dd>{formatNodeTitles(primaryKnowledgeContext.battleNodes.flatMap((node) => node.upstreamNodeIds))}</dd>
              <dt>下游影响</dt>
              <dd>{formatNodeTitles(primaryKnowledgeContext.battleNodes.flatMap((node) => node.downstreamNodeIds))}</dd>
              <dt>可能误判原因</dt>
              <dd>{formatReasonCodes(diagnosisMeta.reasonCodes)}</dd>
              <dt>需要补充的数据</dt>
              <dd>{dataQualityReport.missingFields.length > 0 ? dataQualityReport.missingFields.join("、") : "暂无关键缺失字段"}</dd>
            </dl>
          </div>
        </div>
        <aside className="panel method-panel">
          <div className="section-title">
            <Target aria-hidden="true" />
            <h2>同行基准</h2>
          </div>
          <div className="benchmark-list compact-benchmark-list">
            <p><strong>当前</strong>{responseRateBenchmark.currentLabel}</p>
            <p><strong>同行平均</strong>{responseRateBenchmark.averageLabel}</p>
            <p><strong>同行优秀</strong>{responseRateBenchmark.excellentLabel}</p>
          </div>
        </aside>
      </section>

      <section className="panel knowledge-diagnosis-panel">
        <div className="section-title">
          <BookOpenCheck aria-hidden="true" />
          <h2>流量战场与官方依据</h2>
        </div>
        <div className="battle-context-grid">
          {primaryKnowledgeContext.battleNodes.map((node) => (
            <article key={node.id}>
              <span>{formatTrafficStage(node.stage)}</span>
              <strong>{node.title}</strong>
              <p>{node.roleInTrafficSystem}</p>
              <small>核查动作：{node.recommendedActions.slice(0, 2).join("、")}</small>
            </article>
          ))}
        </div>
        <div className="official-basis-list diagnosis-official-list">
          {primaryKnowledgeContext.knowledgeCards.map((card) => (
            <article key={card.id}>
              <span>{card.confidence === "weak_reference" ? "参考资料" : "官方依据"}</span>
              <strong>{card.title}</strong>
              <p>{card.summary}</p>
              <small>{card.actionGuides.slice(0, 2).join("；")}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="v5-grid">
        <div className="panel">
          <div className="section-title">
            <BarChart3 aria-hidden="true" />
            <h2>趋势 BI</h2>
          </div>
          <div className="v5-trend-grid">
            {v5Loop.trends
              .filter((trend) =>
                ["visitors", "visitor_inquiry_rate", "inquiry_payment_rate", "ad_spend_share"].includes(
                  trend.metricId
                )
              )
              .map((trend) => (
                <article className={`v5-trend-card ${trend.status}`} key={trend.metricId}>
                  <span>{trend.label}</span>
                  <strong>{trend.latestLabel}</strong>
                  <small>7 日均值 {trend.averageLabel}</small>
                  <em>{formatTrendLabel(trend.trend)}</em>
                </article>
              ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-title">
            <Activity aria-hidden="true" />
            <h2>卡点漏斗</h2>
          </div>
          <div className="v5-funnel">
            {v5Loop.funnelStages.map((stage) => (
              <article className={`v5-funnel-stage ${stage.status}`} key={stage.id}>
                <span>{formatV5Status(stage.status)}</span>
                <strong>{stage.label}</strong>
                <p>{stage.currentLabel} / 目标 {stage.targetLabel}</p>
              </article>
            ))}
          </div>
          <div className="v5-bottleneck">
            <span>当前主卡点</span>
            <strong>主卡点：{v5Loop.primaryBottleneck.label}</strong>
            <p>{v5Loop.primaryBottleneck.diagnosis}</p>
          </div>
        </div>

        <div className="panel">
          <div className="section-title">
            <ClipboardList aria-hidden="true" />
            <h2>今日 Checklist</h2>
          </div>
          <div className="v5-checklist">
            {v5Loop.checklist.map((item) => (
              <article className="v5-check-item" key={item.id}>
                <label>
                  <input
                    checked={checkedChecklistIds.includes(item.id)}
                    type="checkbox"
                    onChange={() => onToggleChecklist(item.id)}
                  />
                  <span>{item.checkLabel}</span>
                </label>
                <strong>{item.title}</strong>
                <p>{item.notePrompt}</p>
                <small>{item.evidenceTrigger}</small>
              </article>
            ))}
          </div>
        </div>

        <aside className="panel v5-side-panel">
          <div className="section-title">
            <RotateCcw aria-hidden="true" />
            <h2>动作回测</h2>
          </div>
          {firstChecklistAction ? (
            <>
              <strong>回测动作：{firstChecklistAction.title}</strong>
              <p>{firstChecklistAction.reviewQuestion}</p>
              <label className="metric-input-row compact">
                <span>
                  <strong>回测后 访客询盘率</strong>
                  <small>填动作后 3 天均值</small>
                </span>
                <div>
                  <input
                    aria-label="回测后 访客询盘率"
                    inputMode="decimal"
                    type="number"
                    value={v5BacktestAfter}
                    onChange={(event) => onV5BacktestAfterChange(event.target.value)}
                  />
                  <em>%</em>
                </div>
              </label>
              <button className="primary-action" type="button" onClick={onRunV5Backtest}>
                记录 V5 回测
              </button>
            </>
          ) : (
            <p className="empty-copy">当前没有需要回测的 checklist。</p>
          )}

          <div className="section-title stacked-title">
            <BookOpenCheck aria-hidden="true" />
            <h2>SOP 候选</h2>
          </div>
          {v5BacktestResult ? (
            <div className={`v5-result-box ${v5BacktestResult.result}`}>
              <span>{formatV5BacktestLabel(v5BacktestResult.result)}</span>
              <strong>{v5BacktestResult.summary}</strong>
              {v5BacktestResult.sopCandidate ? <p>{v5BacktestResult.sopCandidate.title}</p> : null}
            </div>
          ) : (
            <p className="empty-copy">勾选 checklist 并录入回测后，系统判断是否进入 SOP 候选。</p>
          )}
        </aside>
      </section>

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
          <div className="section-title stacked-title">
            <ShieldCheck aria-hidden="true" />
            <h2>适用规则版本</h2>
          </div>
          <div className="rule-chip-list">
            {dashboard.ruleVersions.map((rule) => (
              <span className={rule.status === "active" ? "confirmed" : "unconfirmed"} key={rule.id}>
                {rule.name}
              </span>
            ))}
          </div>
        </aside>
      </section>

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
    </>
  );
}

function formatTrendLabel(trend: "up" | "flat" | "down"): string {
  if (trend === "up") return "向好";
  if (trend === "down") return "转弱";
  return "持平";
}

function formatV5Status(status: "healthy" | "watch" | "blocked"): string {
  if (status === "healthy") return "达标";
  if (status === "watch") return "观察";
  return "卡点";
}

function formatV5BacktestLabel(result: "effective" | "watch" | "ineffective"): string {
  if (result === "effective") return "有效";
  if (result === "ineffective") return "无效";
  return "观察";
}

function layerLabel(layer: "official" | "business" | "capability"): string {
  if (layer === "official") return "官方目标";
  if (layer === "business") return "经营目标";
  return "能力目标";
}

function formatDiagnosisConfidence(confidence: DiagnosisMeta["confidence"]): string {
  if (confidence === "high") return "高";
  if (confidence === "medium") return "中";
  if (confidence === "low") return "低";
  return "数据不足";
}

function formatReasonCodes(codes: DiagnosisMeta["reasonCodes"]): string {
  if (codes.length === 0) return "暂无";
  const labels: Record<DiagnosisMeta["reasonCodes"][number], string> = {
    complete_required_metrics: "关键字段完整",
    missing_required_metrics: "关键字段缺失",
    manual_input: "存在手动录入",
    demo_data: "仍是示例数据",
    small_sample: "样本偏小",
    fallback_used: "使用旧值兜底",
    conflicting_signals: "信号冲突",
    rule_not_active: "规则未采用"
  };
  return codes.map((code) => labels[code]).join("、");
}

function formatNodeTitles(nodeIds: string[]): string {
  const titles = Array.from(
    new Set(
      nodeIds
        .map((id) => trafficBattleMap.nodes.find((node) => node.id === id)?.title)
        .filter((title): title is string => Boolean(title))
    )
  );
  return titles.length > 0 ? titles.join("、") : "暂无";
}

function formatTrafficStage(stage: (typeof trafficBattleMap.nodes)[number]["stage"]): string {
  const labels: Record<(typeof trafficBattleMap.nodes)[number]["stage"], string> = {
    market_positioning: "市场定位",
    product_supply: "商品供给",
    search_exposure: "搜索曝光",
    recommendation_exposure: "推荐曝光",
    image_search: "图搜承接",
    ad_traffic: "广告投放",
    visitor_click: "访客点击",
    inquiry_conversion: "询盘转化",
    quote_conversion: "报价成交",
    payment_conversion: "支付成交",
    fulfillment_service: "履约服务",
    repeat_purchase: "复购沉淀",
    membership_rights: "会员权益",
    factory_level: "找工厂冲级",
    tooling_efficiency: "工具效率"
  };
  return labels[stage];
}
