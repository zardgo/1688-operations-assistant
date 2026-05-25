import { Card } from "../components/ui/Card";
import { MetricCard } from "../components/ui/MetricCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { buildV8CommandCenter } from "../lib/operations";
import type { DataQualityReport, DiagnosisMeta } from "../lib/dataQuality";
import type { MetricKnowledgeContext } from "../lib/knowledge/selectors";
import type { ExecutionLog } from "../lib/storage";

type CommandCenter = ReturnType<typeof buildV8CommandCenter>;

type CommandPageProps = {
  commandCenter: CommandCenter;
  todayPrimaryMetric: {
    currentLabel: string;
    targetLabel: string;
  };
  todayGapLabel: string;
  todayHeroReason: string;
  missionCompletedCount: number;
  dataQualityReport: DataQualityReport;
  diagnosisMeta: DiagnosisMeta;
  actionKnowledgeContexts: Record<string, MetricKnowledgeContext>;
  completedMissionActionIds: string[];
  executionLogs: ExecutionLog[];
  onToggleMissionAction: (id: string) => void;
  onUpdateExecutionLogText: (actionId: string, field: "note" | "abnormalReason" | "evidenceText", value: string) => void;
  onOpenData: () => void;
};

export function CommandPage({
  commandCenter,
  todayPrimaryMetric,
  todayGapLabel,
  todayHeroReason,
  missionCompletedCount,
  dataQualityReport,
  diagnosisMeta,
  actionKnowledgeContexts,
  completedMissionActionIds,
  executionLogs,
  onToggleMissionAction,
  onUpdateExecutionLogText,
  onOpenData
}: CommandPageProps) {
  const shouldVerifyData = diagnosisMeta.confidence === "low" || diagnosisMeta.confidence === "insufficient_data";
  const canShowMission = diagnosisMeta.confidence !== "insufficient_data" && dataQualityReport.canGenerateMission;

  return (
    <section className="today-page">
      <section className="today-hero">
        <div className="today-hero-copy">
          <span className="hero-eyebrow">今日唯一主目标</span>
          <h1>今天先处理：{commandCenter.primaryBlocker?.metricLabel ?? commandCenter.mission.goal.title}</h1>
          <p className="hero-metric-line">
            当前 {todayPrimaryMetric.currentLabel}，目标 {todayPrimaryMetric.targetLabel}，差 {todayGapLabel}
          </p>
          <p className="hero-reason">原因：{todayHeroReason}</p>
        </div>
        <div className="today-hero-action">
          <StatusBadge tone={shouldVerifyData ? "warning" : commandCenter.primaryBlocker ? "danger" : "success"}>
            {shouldVerifyData ? "建议先核实数据" : commandCenter.primaryBlocker ? "必须处理" : "已达标"}
          </StatusBadge>
          <StatusBadge tone={dataQualityReport.level === "high" ? "success" : dataQualityReport.level === "medium" ? "warning" : "danger"}>
            数据可信度：{formatDataQualityLevel(dataQualityReport.level)}
          </StatusBadge>
          <StatusBadge tone={diagnosisMeta.confidence === "high" ? "success" : diagnosisMeta.confidence === "medium" ? "warning" : "danger"}>
            置信度：{formatDiagnosisConfidence(diagnosisMeta.confidence)}
          </StatusBadge>
          <button className="primary-action" type="button" onClick={onOpenData}>
            {diagnosisMeta.confidence === "insufficient_data" ? "先补齐数据" : "录入今日数据"}
          </button>
        </div>
      </section>

      <section className="summary-grid" aria-label="今日摘要">
        <MetricCard
          label="最大卡点"
          value={commandCenter.primaryBlocker?.metricLabel ?? "无核心卡点"}
          helper={commandCenter.primaryBlocker?.gapLabel ?? "进入复盘和 SOP 固化"}
          tone={commandCenter.primaryBlocker ? "danger" : "success"}
        />
        <MetricCard
          label="今日任务数"
          value={`已完成 ${missionCompletedCount}/${commandCenter.mission.actions.length}`}
          helper={commandCenter.mission.goal.title}
          tone="action"
        />
        <MetricCard
          label="明日验证指标"
          value={commandCenter.tomorrowCheck.metricLabel}
          helper={commandCenter.tomorrowCheck.question}
          tone="success"
        />
      </section>

      <Card title="今日 checklist" eyebrow="只做最少必要动作" tone="action">
        {canShowMission ? (
          <>
            <p className="command-instruction">
              <strong>今天只处理 {commandCenter.todayActions.length} 件事</strong>
              {commandCenter.employeeInstruction.replace(`今天只处理 ${commandCenter.todayActions.length} 件事`, "")}
            </p>
            <div className="task-list command-task-list">
              {commandCenter.mission.actions.map((action) => {
                const log = executionLogs.find((item) => item.id.endsWith(`:${action.id}`));
                return (
                  <MissionActionCard
                    action={action}
                    completed={Boolean(log?.completed) || completedMissionActionIds.includes(action.id)}
                    key={action.id}
                    knowledgeContext={actionKnowledgeContexts[action.id]}
                    log={log}
                    onToggleMissionAction={onToggleMissionAction}
                    onUpdateExecutionLogText={onUpdateExecutionLogText}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <div className="empty-state-card">
            <strong>请先补齐数据</strong>
            <p>{diagnosisMeta.explanation}</p>
            <button className="primary-action" type="button" onClick={onOpenData}>
              先补齐数据
            </button>
          </div>
        )}
      </Card>

      <Card title="明日验证" eyebrow="做完之后看这个" tone="success">
        <div className="tomorrow-check">
          <span>{commandCenter.tomorrowCheck.metricLabel}</span>
          <strong>{commandCenter.tomorrowCheck.question}</strong>
          <p>
            当前 {commandCenter.tomorrowCheck.currentLabel} / 目标 {commandCenter.tomorrowCheck.targetLabel}
          </p>
        </div>
      </Card>

      <details className="soft-details">
        <summary>规则依据</summary>
        <div className={`rule-basis command-rule-basis ${commandCenter.ruleBasis.status}`}>
          <strong>
            {commandCenter.ruleBasis.status === "active" ? commandCenter.ruleBasis.label : "规则来源状态待维护"}
          </strong>
          <p>{commandCenter.ruleBasis.detail}</p>
        </div>
      </details>

      <details className="soft-details">
        <summary>昨日复盘</summary>
        <div className="mission-review-card">
          <span>{commandCenter.mission.yesterdayReview.label}</span>
          <strong>{commandCenter.mission.yesterdayReview.summary}</strong>
          <p>{commandCenter.mission.yesterdayReview.decision}</p>
        </div>
      </details>
    </section>
  );
}

function MissionActionCard({
  action,
  completed,
  knowledgeContext,
  log,
  onToggleMissionAction,
  onUpdateExecutionLogText
}: {
  action: CommandCenter["mission"]["actions"][number];
  completed: boolean;
  knowledgeContext: MetricKnowledgeContext | undefined;
  log: ExecutionLog | undefined;
  onToggleMissionAction: (id: string) => void;
  onUpdateExecutionLogText: (actionId: string, field: "note" | "abnormalReason" | "evidenceText", value: string) => void;
}) {
  return (
    <article className={`task-card mission-action-card ${action.priority.toLowerCase()}`}>
              <div className="task-head">
                <span>{action.priority}</span>
                <strong>{action.title}</strong>
              </div>
              <div className="mission-action-meta">
                <small>负责人：{action.owner}</small>
                <small>截止：{action.dueTime}</small>
                <small>指标：{action.targetMetricLabel}</small>
              </div>
              <p>{action.method}</p>
      <div className="execution-fields">
        <label>
          <span>备注</span>
          <textarea
            aria-label={`${action.title} 备注`}
            value={log?.note ?? ""}
            onChange={(event) => onUpdateExecutionLogText(action.id, "note", event.target.value)}
          />
        </label>
        <label>
          <span>异常原因</span>
          <textarea
            aria-label={`${action.title} 异常原因`}
            value={log?.abnormalReason ?? ""}
            onChange={(event) => onUpdateExecutionLogText(action.id, "abnormalReason", event.target.value)}
          />
        </label>
        <label>
          <span>证据说明</span>
          <textarea
            aria-label={`${action.title} 证据说明`}
            value={log?.evidenceText ?? ""}
            onChange={(event) => onUpdateExecutionLogText(action.id, "evidenceText", event.target.value)}
          />
        </label>
      </div>
      <button
        aria-label={action.checkLabel}
        className={completed ? "secondary-action" : "primary-action"}
        type="button"
        onClick={() => onToggleMissionAction(action.id)}
      >
        {completed ? "取消完成" : action.checkLabel}
      </button>
              <dl>
                <dt>明日验证</dt>
                <dd>{action.expectedImpact}</dd>
                <dt>备注</dt>
                <dd>{action.notePrompt}</dd>
              </dl>
      <details className="official-basis-details">
        <summary>官方依据</summary>
        {knowledgeContext && knowledgeContext.knowledgeCards.length > 0 ? (
          <div className="official-basis-list">
            {knowledgeContext.knowledgeCards.map((card) => {
              const article = knowledgeContext.articles.find((item) => item.id === card.sourceArticleId);
              const basisLabel = card.confidence === "weak_reference" ? "参考资料" : "官方依据";
              return (
                <article key={card.id}>
                  <span>{basisLabel}</span>
                  <strong>{card.title}</strong>
                  <p>{article?.title ?? card.officialBasis}</p>
                  <small>
                    关联战场：{knowledgeContext.battleNodes.map((node) => node.title).join("、") || "待补"}
                  </small>
                  <small>{card.summary}</small>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="empty-copy">当前动作暂无官方知识绑定，请到流量地图中补充。</p>
        )}
      </details>
    </article>
  );
}

function formatDataQualityLevel(level: DataQualityReport["level"]): string {
  if (level === "high") return "高";
  if (level === "medium") return "中";
  if (level === "low") return "低";
  return "不足";
}

function formatDiagnosisConfidence(confidence: DiagnosisMeta["confidence"]): string {
  if (confidence === "high") return "高";
  if (confidence === "medium") return "中";
  if (confidence === "low") return "低";
  return "数据不足";
}
