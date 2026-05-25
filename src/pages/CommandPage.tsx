import { Card } from "../components/ui/Card";
import { MetricCard } from "../components/ui/MetricCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { buildV8CommandCenter } from "../lib/operations";

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
  completedMissionActionIds: string[];
  onToggleMissionAction: (id: string) => void;
  onOpenData: () => void;
};

export function CommandPage({
  commandCenter,
  todayPrimaryMetric,
  todayGapLabel,
  todayHeroReason,
  missionCompletedCount,
  completedMissionActionIds,
  onToggleMissionAction,
  onOpenData
}: CommandPageProps) {
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
          <StatusBadge tone={commandCenter.primaryBlocker ? "danger" : "success"}>
            {commandCenter.primaryBlocker ? "必须处理" : "已达标"}
          </StatusBadge>
          <button className="primary-action" type="button" onClick={onOpenData}>
            录入今日数据
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
        <p className="command-instruction">
          <strong>今天只处理 {commandCenter.todayActions.length} 件事</strong>
          {commandCenter.employeeInstruction.replace(`今天只处理 ${commandCenter.todayActions.length} 件事`, "")}
        </p>
        <div className="task-list command-task-list">
          {commandCenter.mission.actions.map((action) => (
            <article className={`task-card mission-action-card ${action.priority.toLowerCase()}`} key={action.id}>
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
              <label className="mission-check">
                <input
                  checked={completedMissionActionIds.includes(action.id)}
                  type="checkbox"
                  onChange={() => onToggleMissionAction(action.id)}
                />
                <span>{action.checkLabel}</span>
              </label>
              <dl>
                <dt>明日验证</dt>
                <dd>{action.expectedImpact}</dd>
                <dt>备注</dt>
                <dd>{action.notePrompt}</dd>
              </dl>
            </article>
          ))}
        </div>
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
          <p>当前规则用于解释目标和动作，完整来源状态请到规则维护页查看。</p>
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
