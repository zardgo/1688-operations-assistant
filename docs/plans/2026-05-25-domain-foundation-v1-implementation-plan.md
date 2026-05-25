# Domain Foundation V1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 `docs/architecture/domain-foundation-v1.md` 中定义的领域基座落到 TypeScript 类型、seed 数据和现有运营引擎中，为后续服务域、商品成长域、交易漏斗域、找工厂/定制域的模块化开发打底。

**Architecture:** 先新增独立 `src/domain/core/` 基座层，使用 TypeScript 类型和 seed 文件表达 `Domain`、`DataSource`、`MetricDefinition`、`GoalMapping`、`ActionTemplate`、`DiagnosisRule`。现有页面和 `operations.ts` 先不大拆，只通过适配函数读取新基座，确保行为不变、测试可控。

**Tech Stack:** React、TypeScript、Vitest、Testing Library、Markdown 架构文档、TypeScript seed 配置。

**Related Docs:**
- `docs/architecture/domain-foundation-v1.md`
- `docs/foundation/03-mapping-system.md`
- `docs/plans/2026-05-24-1688-modular-architecture-and-build-order.md`

## Scope

第一批只做基座，不做 UI 重设计，不接 API，不扩展完整后台配置。

包含：

1. 六张底层表的 TypeScript 类型。
2. 第一批 seed 数据。
3. `ActiveGoalContext` 类型和最小适配。
4. 两个目标的映射：`protect_service`、`factory_bronze`。
5. 三个核心数据源：`new_lighthouse`、`sycm_core_board`、`factory_workbench`。
6. 风险护栏最小集：毛利、退款、介入、履约。
7. 测试证明目标、指标、数据源、动作、诊断可串起来。

不包含：

1. 新灯塔自动解析。
2. 生意参谋之外的 XLS 解析。
3. 自定义后台规则编辑器。
4. UI 大改。
5. 多店铺、多账号权限。
6. AI 自动建议。

## Current Workspace Preparation

执行开发前必须确认：

```bash
git status --short
```

期望：除本计划文档和 `docs/architecture/domain-foundation-v1.md` 外，没有旧 UI/计算改动混入。

## Task 1: Add Core Domain Types

**Files:**
- Create: `src/domain/core/types.ts`
- Test: `src/domain/core/types.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import type {
  ActionTemplate,
  DataSourceDefinition,
  DiagnosisRule,
  DomainDefinition,
  GoalMapping,
  MetricDefinition
} from "./types";

describe("domain foundation core types", () => {
  it("supports the six foundation tables", () => {
    const domain: DomainDefinition = {
      id: "service",
      name: "服务域",
      purpose: "响应、物流、售后、履约、服务星级",
      primaryMetricIds: ["lighthouse_score"],
      sourceIds: ["new_lighthouse"],
      ownerRoles: ["operator", "customer_service"],
      guardrailMetricIds: ["intervention_rate"]
    };

    const source: DataSourceDefinition = {
      id: "new_lighthouse",
      name: "新灯塔",
      sourceType: "manual",
      ownerRole: "operator",
      cadence: "30d",
      freshnessRule: "daily",
      confidence: "medium",
      providedMetricIds: ["lighthouse_score"],
      sourceUrl: "https://work.1688.com/home/page/index.htm?_path_=sellerPro/lvyue/new-lighthouse-ai"
    };

    const metric: MetricDefinition = {
      id: "lighthouse_score",
      name: "新灯塔分",
      domainId: "service",
      sourceIds: ["new_lighthouse"],
      unit: "score",
      direction: "higher_is_better",
      cadence: "30d",
      definition: "1688 新灯塔页面展示的店铺服务体验综合分。",
      isOfficialMetric: true,
      canBeGoalMetric: true,
      canBeVerificationMetric: true,
      guardrailLevel: "none"
    };

    const goal: GoalMapping = {
      goalId: "protect_service",
      name: "保基础服务分",
      domainIds: ["service", "guardrail"],
      requiredMetricIds: ["lighthouse_score"],
      supportingMetricIds: [],
      guardrailMetricIds: ["intervention_rate"],
      ruleVersionIds: [],
      priorityPolicy: "largest_gap_first",
      applicableScope: "保温杯店铺 / 服务体验"
    };

    const action: ActionTemplate = {
      id: "daily-response-cleanup",
      domainId: "service",
      bottleneckIds: ["response_mechanism_gap"],
      metricIds: ["ww_3min_response_rate"],
      frequency: "daily_operation",
      ownerRole: "customer_service",
      checklist: ["检查未及时回复咨询", "补齐快捷回复"],
      verificationMetricIds: ["ww_3min_response_rate"],
      verificationWindow: "next_day",
      evidencePolicy: "optional_note",
      stopPolicy: "metric_recovered"
    };

    const diagnosis: DiagnosisRule = {
      id: "response-rate-low",
      domainId: "service",
      inputMetricIds: ["ww_3min_response_rate"],
      condition: "value_below_target",
      bottleneckId: "response_mechanism_gap",
      severityPolicy: "official_goal_gap",
      confidencePolicy: "requires_current_reading",
      recommendedActionTemplateIds: ["daily-response-cleanup"],
      fallbackWhenMissingData: "ask_for_metric_reading",
      guardrailChecks: []
    };

    expect(domain.id).toBe("service");
    expect(source.providedMetricIds).toContain(metric.id);
    expect(goal.requiredMetricIds).toContain(metric.id);
    expect(action.verificationMetricIds).toContain("ww_3min_response_rate");
    expect(diagnosis.recommendedActionTemplateIds).toContain(action.id);
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- --run src/domain/core/types.test.ts
```

Expected: FAIL because `src/domain/core/types.ts` does not exist.

**Step 3: Implement minimal types**

Create `src/domain/core/types.ts` with:

```ts
export type DomainId =
  | "service"
  | "product_growth"
  | "trade_funnel"
  | "factory_custom"
  | "customer_repeat"
  | "guardrail";

export type DataSourceId =
  | "new_lighthouse"
  | "sycm_core_board"
  | "product_growth_backend"
  | "product_list"
  | "factory_workbench"
  | "after_sales_backend"
  | "ad_backend"
  | "internal_profit_sheet"
  | "manual_input";

export type MetricDirection = "higher_is_better" | "lower_is_better" | "target_range";
export type MetricUnit = "%" | "score" | "count" | "money" | "hour" | "stars" | "points";
export type MetricCadence = "daily" | "weekly" | "monthly" | "30d" | "realtime";
export type SourceType = "manual" | "xls" | "copy_table" | "screenshot" | "api";
export type SourceConfidence = "low" | "medium" | "high";
export type OwnerRole = "operator" | "customer_service" | "manager";
export type GuardrailLevel = "none" | "watch" | "blocking";
export type ActionFrequency =
  | "one_time_setup"
  | "daily_operation"
  | "periodic_check"
  | "exception_triggered"
  | "experiment";
export type EvidencePolicy = "none" | "optional_note" | "required_note" | "screenshot_required";
export type VerificationWindow = "next_day" | "3d" | "7d" | "30d";

export type DomainDefinition = {
  id: DomainId;
  name: string;
  purpose: string;
  primaryMetricIds: string[];
  sourceIds: DataSourceId[];
  ownerRoles: OwnerRole[];
  guardrailMetricIds: string[];
};

export type DataSourceDefinition = {
  id: DataSourceId;
  name: string;
  sourceType: SourceType;
  ownerRole: OwnerRole;
  cadence: MetricCadence;
  freshnessRule: string;
  confidence: SourceConfidence;
  providedMetricIds: string[];
  sourceUrl?: string;
};

export type MetricDefinition = {
  id: string;
  name: string;
  domainId: DomainId;
  sourceIds: DataSourceId[];
  unit: MetricUnit;
  direction: MetricDirection;
  cadence: MetricCadence;
  definition: string;
  isOfficialMetric: boolean;
  canBeGoalMetric: boolean;
  canBeVerificationMetric: boolean;
  guardrailLevel: GuardrailLevel;
};

export type GoalMapping = {
  goalId: string;
  name: string;
  domainIds: DomainId[];
  requiredMetricIds: string[];
  supportingMetricIds: string[];
  guardrailMetricIds: string[];
  ruleVersionIds: string[];
  priorityPolicy: "largest_gap_first" | "official_priority_first" | "risk_first";
  applicableScope: string;
};

export type ActionTemplate = {
  id: string;
  domainId: DomainId;
  bottleneckIds: string[];
  metricIds: string[];
  frequency: ActionFrequency;
  ownerRole: OwnerRole;
  checklist: string[];
  verificationMetricIds: string[];
  verificationWindow: VerificationWindow;
  evidencePolicy: EvidencePolicy;
  stopPolicy: string;
};

export type DiagnosisRule = {
  id: string;
  domainId: DomainId;
  inputMetricIds: string[];
  condition: string;
  bottleneckId: string;
  severityPolicy: string;
  confidencePolicy: string;
  recommendedActionTemplateIds: string[];
  fallbackWhenMissingData: string;
  guardrailChecks: string[];
};
```

**Step 4: Run test to verify it passes**

```bash
npm test -- --run src/domain/core/types.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/domain/core/types.ts src/domain/core/types.test.ts
git commit -m "feat: add domain foundation core types"
```

## Task 2: Add Foundation Seed Data

**Files:**
- Create: `src/domain/core/domains.ts`
- Create: `src/domain/core/dataSources.ts`
- Create: `src/domain/core/metrics.ts`
- Create: `src/domain/core/goalMappings.ts`
- Create: `src/domain/core/actionTemplates.ts`
- Create: `src/domain/core/diagnosisRules.ts`
- Create: `src/domain/core/index.ts`
- Test: `src/domain/core/foundation.test.ts`

**Step 1: Write failing tests**

Test should prove:

1. Every `GoalMapping.requiredMetricIds` exists in `metricDefinitions`.
2. Every `MetricDefinition.sourceIds` exists in `dataSourceDefinitions`.
3. Every `ActionTemplate.verificationMetricIds` exists in `metricDefinitions`.
4. Every `DiagnosisRule.recommendedActionTemplateIds` exists in `actionTemplates`.
5. `protect_service` and `factory_bronze` are present.

**Step 2: Run test**

```bash
npm test -- --run src/domain/core/foundation.test.ts
```

Expected: FAIL because seed files do not exist.

**Step 3: Implement minimal seed data**

Start with these records only:

Domains:

```ts
service
trade_funnel
factory_custom
guardrail
```

Data sources:

```ts
new_lighthouse
sycm_core_board
factory_workbench
internal_profit_sheet
manual_input
```

Metrics:

```ts
lighthouse_score
consultation_experience_score
ww_3min_response_rate
refund_processing_duration
intervention_rate
total_exposure
visitors
inquiries
payments
payment_amount
factory_service_response_rate
factory_fulfillment_rate
custom_trade_points
contract_payment_rate
gross_margin_rate
```

Goals:

```ts
protect_service
factory_bronze
```

Actions:

```ts
daily-response-cleanup
refund-daily-clearance
factory-inquiry-followup
contract-payment-followup
margin-risk-review
```

Diagnosis rules:

```ts
response-rate-low
refund-processing-slow
factory-service-response-low
contract-payment-low
gross-margin-below-floor
```

**Step 4: Run test**

```bash
npm test -- --run src/domain/core/foundation.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/domain/core
git commit -m "feat: seed domain foundation mappings"
```

## Task 3: Add Active Goal Context

**Files:**
- Modify: `src/domain/core/types.ts`
- Test: `src/domain/core/activeGoalContext.test.ts`

**Step 1: Write failing test**

```ts
import { describe, expect, it } from "vitest";
import type { ActiveGoalContext } from "./types";

describe("ActiveGoalContext", () => {
  it("models current goal as runtime context", () => {
    const context: ActiveGoalContext = {
      goalId: "factory_bronze",
      shopId: "default-shop",
      domainIds: ["factory_custom", "service", "guardrail"],
      startedAt: "2026-05-25",
      targetWindow: "30d",
      status: "active"
    };

    expect(context.status).toBe("active");
    expect(context.domainIds).toContain("guardrail");
  });
});
```

**Step 2: Run test**

```bash
npm test -- --run src/domain/core/activeGoalContext.test.ts
```

Expected: FAIL because `ActiveGoalContext` does not exist.

**Step 3: Implement type**

Add to `src/domain/core/types.ts`:

```ts
export type ActiveGoalContext = {
  goalId: string;
  shopId: string;
  domainIds: DomainId[];
  startedAt: string;
  targetWindow: "daily" | "weekly" | "monthly" | "30d";
  status: "active" | "paused" | "completed";
};
```

**Step 4: Run test**

```bash
npm test -- --run src/domain/core/activeGoalContext.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/domain/core/types.ts src/domain/core/activeGoalContext.test.ts
git commit -m "feat: model active goal context"
```

## Task 4: Add Foundation Query Helpers

**Files:**
- Create: `src/domain/core/selectors.ts`
- Test: `src/domain/core/selectors.test.ts`

**Step 1: Write failing tests**

Selectors should support:

```ts
getGoalMapping(goalId)
getMetricsForGoal(goalId)
getDataSourcesForMetric(metricId)
getActionsForDiagnosisRule(ruleId)
getGuardrailsForGoal(goalId)
```

Test `factory_bronze`:

1. includes `factory_custom` and `guardrail` domains;
2. includes `factory_service_response_rate`;
3. includes `factory_workbench` as a data source;
4. includes `gross_margin_rate` as a guardrail.

**Step 2: Run test**

```bash
npm test -- --run src/domain/core/selectors.test.ts
```

Expected: FAIL because selectors do not exist.

**Step 3: Implement selectors**

Keep implementation pure and deterministic. Throw clear errors for unknown IDs.

**Step 4: Run test**

```bash
npm test -- --run src/domain/core/selectors.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/domain/core/selectors.ts src/domain/core/selectors.test.ts
git commit -m "feat: add domain foundation selectors"
```

## Task 5: Add Compatibility Adapter For Existing Operations Engine

**Files:**
- Create: `src/domain/core/operationsAdapter.ts`
- Test: `src/domain/core/operationsAdapter.test.ts`
- Modify only if necessary: `src/lib/operations.ts`

**Step 1: Write failing test**

The adapter should convert foundation goal mappings into the existing goal/dashboard world without changing UI behavior.

Minimum test:

1. `factory_bronze` maps to existing goal id or compatible goal label.
2. required metrics include metrics already used by the current dashboard.
3. no action is generated directly from goal mapping.

**Step 2: Run test**

```bash
npm test -- --run src/domain/core/operationsAdapter.test.ts
```

Expected: FAIL because adapter does not exist.

**Step 3: Implement minimal adapter**

Do not rewrite `operations.ts`. Add a bridge that existing code can adopt gradually.

**Step 4: Run test**

```bash
npm test -- --run src/domain/core/operationsAdapter.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/domain/core/operationsAdapter.ts src/domain/core/operationsAdapter.test.ts
git commit -m "feat: bridge domain foundation to operations engine"
```

## Task 6: Wire Documentation Cross-References

**Files:**
- Modify: `docs/foundation/README.md`
- Modify: `docs/architecture/domain-foundation-v1.md`
- Modify: `docs/plans/2026-05-25-domain-foundation-v1-implementation-plan.md`

**Step 1: Update docs**

Add links:

1. `docs/foundation/README.md` should point to `docs/architecture/domain-foundation-v1.md`.
2. `docs/architecture/domain-foundation-v1.md` should point to this implementation plan.
3. This implementation plan should reference `docs/foundation/03-mapping-system.md` and `docs/plans/2026-05-24-1688-modular-architecture-and-build-order.md`.

**Step 2: Verify links manually**

```bash
rg -n "domain-foundation-v1|2026-05-25-domain-foundation-v1|03-mapping-system|modular-architecture" docs
```

Expected: each target appears.

**Step 3: Commit**

```bash
git add docs/foundation/README.md docs/architecture/domain-foundation-v1.md docs/plans/2026-05-25-domain-foundation-v1-implementation-plan.md
git commit -m "docs: link domain foundation architecture and plan"
```

## Final Verification

After all tasks:

```bash
npm test -- --run
npm run build
git diff --check
git status --short
```

Expected:

1. all tests pass;
2. build succeeds;
3. no whitespace errors;
4. working tree clean after commits.

## Development Gate

Do not start UI or business-domain refactoring until these are true:

1. `src/domain/core` exists.
2. `protect_service` and `factory_bronze` are fully represented in seed data.
3. every goal metric resolves to a metric definition.
4. every metric source resolves to a data source definition.
5. every diagnosis rule resolves to action templates.
6. `ActiveGoalContext` exists but UI behavior remains unchanged.
7. existing tests still pass.

## Notes For Current Target

当前目标要保留，但开发时需要从页面状态升级为 `ActiveGoalContext`：

```text
当前目标不是一个下拉框值，而是系统运行上下文。
它决定使用哪套 GoalMapping、哪些业务域、哪些风险护栏和哪个目标周期。
```

第一版不要求员工端频繁切目标。员工端只读当前目标，负责人端后续再支持暂停、完成或切换目标。
