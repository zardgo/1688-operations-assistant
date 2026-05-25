# Domain Modules V1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将第一批 `src/domain/core/` 基座进一步整理成可按业务域读取的领域模块，为服务域、商品成长域、交易漏斗域、找工厂/定制域、老客复购域、风险护栏域的后续开发提供稳定接口。

**Architecture:** 不改 UI，不改现有 `operations.ts` 计算逻辑。先补齐六个长期业务域的 seed 覆盖，再新增纯派生 selector，把 `Domain`、`MetricDefinition`、`DataSource`、`DiagnosisRule`、`ActionTemplate` 聚合成领域模块。所有模块只描述结构和口径，不包含当前数值，当前数值仍然由后续录入和导入层提供。

**Tech Stack:** TypeScript、Vitest、Markdown 架构文档。

## Scope

包含：

1. 六个长期业务域 seed 覆盖：服务域、商品成长域、交易漏斗域、找工厂/定制域、老客复购域、风险护栏域。
2. 补齐商品成长和老客复购的最小数据源、指标、诊断、动作模板。
3. 新增 `DomainModule` 派生类型和 selector。
4. 新增按目标读取领域模块的接口。
5. 文档说明“数据源不是模块，业务域才是模块”。

不包含：

1. 新页面。
2. 自动解析新灯塔或生意参谋。
3. 当前数值计算。
4. 任务派发状态机。
5. 后台配置器。

## Task 1: Complete Six Domain Seed Coverage

**Files:**
- Modify: `src/domain/core/domains.ts`
- Modify: `src/domain/core/dataSources.ts`
- Modify: `src/domain/core/metrics.ts`
- Modify: `src/domain/core/diagnosisRules.ts`
- Modify: `src/domain/core/actionTemplates.ts`
- Test: `src/domain/core/foundation.test.ts`

**Step 1: Write the failing test**

Add a test that expects all six long-term domains to exist and every domain primary metric to resolve.

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- --run src/domain/core/foundation.test.ts
```

Expected: FAIL because `product_growth` and `customer_repeat` are not seeded yet.

**Step 3: Implement minimal seed data**

Add:

- `product_growth` domain
- `customer_repeat` domain
- `product_growth_backend` data source
- `product_list` data source
- `procurement_index_score`
- `town_shop_treasure_count`
- `quality_issue_product_count`
- `repeat_buyer_rate`
- `repeat_payment_amount`
- Product growth diagnosis/action template
- Customer repeat diagnosis/action template

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- --run src/domain/core/foundation.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/domain/core
git commit -m "feat: complete domain foundation seed coverage"
```

## Task 2: Add Derived Domain Module Selector

**Files:**
- Create: `src/domain/core/domainModules.ts`
- Create: `src/domain/core/domainModules.test.ts`
- Modify: `src/domain/core/types.ts`
- Modify: `src/domain/core/index.ts`

**Step 1: Write the failing test**

Add tests for:

- `getDomainModule("service")` returns domain, metrics, data sources, diagnosis rules and action templates.
- New灯塔 appears as a data source, not as a domain module.
- Domain modules do not include current metric readings.
- Unknown domain throws a clear error.

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- --run src/domain/core/domainModules.test.ts
```

Expected: FAIL because `domainModules.ts` does not exist.

**Step 3: Implement minimal selector**

Create `DomainModule` type and derived selectors:

- `getDomainModule(domainId)`
- `listDomainModules()`

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- --run src/domain/core/domainModules.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/domain/core
git commit -m "feat: add domain module selectors"
```

## Task 3: Compose Domain Modules By Goal

**Files:**
- Modify: `src/domain/core/domainModules.ts`
- Modify: `src/domain/core/domainModules.test.ts`
- Modify: `src/domain/core/operationsAdapter.ts`
- Modify: `src/domain/core/operationsAdapter.test.ts`

**Step 1: Write the failing test**

Add tests for:

- `getDomainModulesForGoal("factory_bronze")` returns service, factory_custom and guardrail modules.
- `adaptGoalMappingForOperations("factory_bronze")` exposes module IDs without generating actions.

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- --run src/domain/core/domainModules.test.ts src/domain/core/operationsAdapter.test.ts
```

Expected: FAIL because goal module composition is not implemented.

**Step 3: Implement minimal composition**

Add:

- `getDomainModulesForGoal(goalId)`
- `domainModuleIds` to operations adapter output.

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- --run src/domain/core/domainModules.test.ts src/domain/core/operationsAdapter.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/domain/core
git commit -m "feat: compose domain modules by goal"
```

## Task 4: Document Domain Module Handoff

**Files:**
- Modify: `docs/architecture/domain-foundation-v1.md`
- Modify: `docs/foundation/README.md`

**Step 1: Update docs**

Document:

- `new_lighthouse` is a data source.
- `service` is the business module.
- Domain modules are derived from foundation tables and contain no current readings.

**Step 2: Verify references**

Run:

```bash
rg -n "DomainModule|领域模块|new_lighthouse|service" docs/architecture/domain-foundation-v1.md docs/foundation/README.md
```

Expected: matching references appear.

**Step 3: Commit**

```bash
git add docs/architecture/domain-foundation-v1.md docs/foundation/README.md
git commit -m "docs: explain domain module handoff"
```

## Final Verification

Run:

```bash
npm test -- --run
npm run build
git diff --check
git status --short
```

Expected:

- All tests pass.
- Build succeeds.
- No whitespace errors.
- Working tree is clean after commits.
