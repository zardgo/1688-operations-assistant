import { BookOpenCheck, GraduationCap, RotateCcw } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import type { V2Action, V2BacktestResult, buildV3OperatingReview } from "../lib/operations";

type ReviewPageProps = {
  firstAction: V2Action | null;
  backtestAfter: string;
  backtestResult: V2BacktestResult | null;
  v3Review: ReturnType<typeof buildV3OperatingReview>;
  onBacktestAfterChange: (value: string) => void;
  onRunBacktest: (action: V2Action) => void;
};

export function ReviewPage({
  firstAction,
  backtestAfter,
  backtestResult,
  v3Review,
  onBacktestAfterChange,
  onRunBacktest
}: ReviewPageProps) {
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
                    onChange={(event) => onBacktestAfterChange(event.target.value)}
                  />
                  <em>%</em>
                </div>
              </label>
              <button className="primary-action" type="button" onClick={() => onRunBacktest(firstAction)}>
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
