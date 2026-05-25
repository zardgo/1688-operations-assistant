import type { ReactNode } from "react";
import type { V2GoalId } from "../../lib/operations";
import { pageLabels, type Page } from "../../pages/pageConfig";
import { MainNav } from "./MainNav";

type GoalOption = {
  id: V2GoalId;
  label: string;
};

type AppShellProps = {
  children: ReactNode;
  goalId: V2GoalId;
  goalOptions: GoalOption[];
  page: Page;
  onGoalChange: (goalId: V2GoalId) => void;
  onPageChange: (page: Page) => void;
};

export function AppShell({ children, goalId, goalOptions, page, onGoalChange, onPageChange }: AppShellProps) {
  const currentGoal = goalOptions.find((goal) => goal.id === goalId)?.label ?? goalId;

  return (
    <div className="app-frame">
      <aside className="app-sidebar" aria-label="工作区导航">
        <div className="sidebar-brand">
          <p className="sidebar-kicker">OPERATIONS RADAR</p>
          <h1>1688 运营助手</h1>
          <p>保温杯店铺的每日经营闭环。</p>
        </div>

        <label className="scenario-picker sidebar-goal-picker">
          <span>当前目标</span>
          <select aria-label="当前目标" value={goalId} onChange={(event) => onGoalChange(event.target.value as V2GoalId)}>
            {goalOptions.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.label}
              </option>
            ))}
          </select>
        </label>

        <MainNav page={page} onChangePage={onPageChange} />

        <div className="sidebar-system-card">
          <span>执行闭环</span>
          <strong>数据 → 诊断 → 动作 → 复盘</strong>
          <p>员工只看今天该做什么；负责人看效果和规则。</p>
        </div>

        <div className="sidebar-system-card muted">
          <span>规则库</span>
          <strong>按目标绑定口径</strong>
          <p>官方规则独立维护，不进入员工高频操作区。</p>
        </div>
      </aside>

      <main className="app-main">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">DAILY INTELLIGENCE</p>
            <h2>运营情报看板</h2>
            <p>今天先看目标，再执行动作，明天用指标验证。</p>
          </div>
          <div className="workspace-sync">
            <span>全量同步</span>
            <strong>本地试用版</strong>
          </div>
        </header>

        <div className="workspace-toolbar" aria-label="当前工作上下文">
          <span>今日优先</span>
          <strong>{pageLabels[page]}</strong>
          <small>目标：{currentGoal}</small>
        </div>

        <div className="workspace-content">{children}</div>
      </main>
    </div>
  );
}
