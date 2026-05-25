import type { ReactNode } from "react";
import type { V2GoalId } from "../../lib/operations";
import type { DataQualityReport } from "../../lib/dataQuality";
import type { WorkspaceMode } from "../../lib/storage";
import { pageLabels, type Page } from "../../pages/pageConfig";
import { MainNav } from "./MainNav";

type GoalOption = {
  id: V2GoalId;
  label: string;
};

type AppShellProps = {
  children: ReactNode;
  dataQualityReport: DataQualityReport;
  goalId: V2GoalId;
  goalOptions: GoalOption[];
  lastUpdatedAt: string | null;
  page: Page;
  ruleStatus: string;
  workspaceMode: WorkspaceMode;
  onGoalChange: (goalId: V2GoalId) => void;
  onModeChange: (mode: WorkspaceMode) => void;
  onPageChange: (page: Page) => void;
};

export function AppShell({
  children,
  dataQualityReport,
  goalId,
  goalOptions,
  lastUpdatedAt,
  page,
  ruleStatus,
  workspaceMode,
  onGoalChange,
  onModeChange,
  onPageChange
}: AppShellProps) {
  const currentGoal = goalOptions.find((goal) => goal.id === goalId)?.label ?? goalId;

  return (
    <div className="app-frame">
      <aside className="app-sidebar" aria-label="工作区导航">
        <div className="sidebar-brand">
          <p className="sidebar-kicker">1688 作战台</p>
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

        <MainNav mode={workspaceMode} page={page} onChangePage={onPageChange} />

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
            <p className="eyebrow">今日执行</p>
            <h2>今日执行台</h2>
            <p>今天先看目标，再执行动作，明天用指标验证。</p>
          </div>
          <div className="workspace-mode-switch" aria-label="工作模式">
            <button className={workspaceMode === "employee" ? "active" : ""} type="button" onClick={() => onModeChange("employee")}>
              员工
            </button>
            <button className={workspaceMode === "manager" ? "active" : ""} type="button" onClick={() => onModeChange("manager")}>
              负责人
            </button>
          </div>
        </header>

        <div className="workspace-toolbar" aria-label="当前工作上下文">
          <span>{workspaceMode === "employee" ? "员工模式" : "负责人模式"}</span>
          <strong>目标：{currentGoal}</strong>
          <small>数据：{dataQualityReport.label}</small>
          <small>更新：{lastUpdatedAt ? formatDateTime(lastUpdatedAt) : "未导入"}</small>
          <small>规则：{ruleStatus}</small>
        </div>

        <div className="workspace-content">{children}</div>
      </main>
    </div>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
