import { ShieldCheck, Target } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import type { V2GoalId, buildV2GoalDashboard, getDefaultRuleVersions } from "../lib/operations";

type RuleVersion = ReturnType<typeof getDefaultRuleVersions>[number];

type RuleForm = {
  name: string;
  publishedAt: string;
  sourceUrl: string;
  scope: string;
};

type RulesPageProps = {
  activeRules: RuleVersion[];
  dashboard: ReturnType<typeof buildV2GoalDashboard>;
  goalId: V2GoalId;
  ruleForm: RuleForm;
  ruleVersions: RuleVersion[];
  goalLabel: (goalId: V2GoalId) => string;
  onAdoptRule: (ruleId: string) => void;
  onAddDraftRule: () => void;
  onBindRuleToCurrentGoal: (ruleId: string) => void;
  onUpdateRuleForm: (field: keyof RuleForm, value: string) => void;
};

export function RulesPage({
  activeRules,
  dashboard,
  goalId,
  ruleForm,
  ruleVersions,
  goalLabel,
  onAdoptRule,
  onAddDraftRule,
  onBindRuleToCurrentGoal,
  onUpdateRuleForm
}: RulesPageProps) {
  return (
    <>
      <PageHeader
        title="维护判断规则"
        description="这是后台维护页面，用来管理平台规则口径，不是员工每天必须处理的主流程。"
      />
      <section className="page-grid rules-grid">
        <div className="panel task-panel">
          <div className="section-title">
            <ShieldCheck aria-hidden="true" />
            <h2>规则版本库</h2>
          </div>
          <div className="rule-list">
            {ruleVersions.map((rule) => (
              <article className="rule-card" key={rule.id}>
                <div className="rule-card-head">
                  <span className={rule.status === "active" ? "confirmed" : rule.status}>
                    {formatRuleStatusBadge(rule)}
                  </span>
                  <strong>{rule.name}</strong>
                </div>
                <dl>
                  <dt>发布日期</dt>
                  <dd>{rule.publishedAt}</dd>
                  <dt>适用范围</dt>
                  <dd>{rule.scope}</dd>
                  <dt>官方链接</dt>
                  <dd>
                    {isValidSourceUrl(rule.sourceUrl) ? (
                      <a href={rule.sourceUrl} rel="noreferrer" target="_blank">
                        打开规则
                      </a>
                    ) : (
                      <span className="rule-warning">来源待补</span>
                    )}
                  </dd>
                  <dt>规则状态</dt>
                  <dd>{formatRuleStatus(rule.status)}</dd>
                  <dt>来源可信度</dt>
                  <dd>
                    {formatSourceConfidence(rule.sourceConfidence)}
                    {rule.sourceConfidence === "low" ? <span className="rule-warning"> 低可信，不能当官方确定</span> : null}
                  </dd>
                  <dt>最近维护</dt>
                  <dd>{rule.lastReviewedAt ?? "待补"}</dd>
                  <dt>维护说明</dt>
                  <dd>{rule.reviewNotes}</dd>
                  <dt>绑定目标</dt>
                  <dd>{rule.appliesToGoalIds.map((id) => goalLabel(id)).join("、")}</dd>
                </dl>
                <div className="rule-actions">
                  {rule.status !== "active" ? (
                    <button type="button" onClick={() => onAdoptRule(rule.id)}>
                      采用规则
                    </button>
                  ) : null}
                  {!rule.appliesToGoalIds.includes(goalId) ? (
                    <button type="button" onClick={() => onBindRuleToCurrentGoal(rule.id)}>
                      绑定当前目标
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
        <aside className="panel method-panel rule-admin-panel">
          <div className="section-title">
            <Target aria-hidden="true" />
            <h2>规则运营后台</h2>
          </div>
          <div className="rule-basis">
            <strong>当前采用规则 {activeRules.length} 条</strong>
            <p>
              {activeRules.length === 0
                ? "当前目标还没有采用中的规则版本；来源待补和草案规则只能弱提示，不能表现为官方确定。"
                : "已采用规则可进入目标差距和 checklist；来源待补规则只做维护提示。"}
            </p>
          </div>
          <div className="rule-form">
            <label>
              <span>规则名称</span>
              <input
                aria-label="规则名称"
                value={ruleForm.name}
                onChange={(event) => onUpdateRuleForm("name", event.target.value)}
              />
            </label>
            <label>
              <span>发布日期</span>
              <input
                aria-label="发布日期"
                value={ruleForm.publishedAt}
                onChange={(event) => onUpdateRuleForm("publishedAt", event.target.value)}
              />
            </label>
            <label>
              <span>官方链接</span>
              <input
                aria-label="官方链接"
                value={ruleForm.sourceUrl}
                onChange={(event) => onUpdateRuleForm("sourceUrl", event.target.value)}
              />
            </label>
            <label>
              <span>适用范围</span>
              <input
                aria-label="适用范围"
                value={ruleForm.scope}
                onChange={(event) => onUpdateRuleForm("scope", event.target.value)}
              />
            </label>
            <button className="primary-action" type="button" onClick={onAddDraftRule}>
              新增规则草案
            </button>
          </div>
          <div className="cadence-list">
            <p><strong>当前目标</strong>{dashboard.goalLabel}</p>
            <p><strong>使用原则</strong>active 才能用于派单；source_found 只做弱提示，draft 不进入自动派单。</p>
            <p><strong>更新动作</strong>官方规则变更后，新增规则版本，标记来源可信度，再按后台口径采用。</p>
          </div>
        </aside>
      </section>
    </>
  );
}

function formatRuleStatus(status: "draft" | "source_found" | "active" | "deprecated"): string {
  if (status === "active") return "生效";
  if (status === "source_found") return "有来源待确认";
  if (status === "deprecated") return "已废弃";
  return "草案";
}

function formatSourceConfidence(confidence: "low" | "medium" | "high"): string {
  if (confidence === "high") return "高";
  if (confidence === "medium") return "中";
  return "低";
}

function formatRuleStatusBadge(rule: RuleVersion): string {
  if (!isValidSourceUrl(rule.sourceUrl)) return "来源待补";
  if (rule.status === "active") return "当前采用";
  return formatRuleStatus(rule.status);
}

function isValidSourceUrl(sourceUrl: string): boolean {
  return /^https?:\/\/.+/.test(sourceUrl) && !sourceUrl.includes("example.com");
}
