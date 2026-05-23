# 1688 Official Goal Iteration Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the current 1688 operations app into an official-goal-driven iteration dashboard where employees select an official target, enter metrics, receive gap diagnostics, execute daily tasks, and preserve SOP learnings.

**Architecture:** Keep the existing Vite + React + TypeScript app. Add a domain layer for official rules, metric definitions, goal presets, diagnostics, guardrails, task generation, and weekly review. The UI becomes a single-page operator workspace with four modes: Today, Official Goals, Weekly Review, and SOP/Rules.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, Lucide React, browser localStorage for first-version persistence.

## Task 1: Domain Types

**Files:**
- Create: `src/types/domain.ts`
- Test: `src/types/domain.test.ts`

**Step 1: Write failing type-oriented tests**

Create tests that instantiate:

- `RuleSource`
- `MetricDefinition`
- `GoalPreset`
- `ShopContext`
- `MetricReading`
- `TaskInstance`
- `WeeklyReview`
- `SopEntry`

Expected: test fails because `src/types/domain.ts` does not exist.

**Step 2: Implement domain types**

Add explicit TypeScript types and enums:

- `MetricPriority`
- `GoalType`
- `MetricDirection`
- `MetricUnit`
- `MetricCategory`
- `RuleStatus`
- `DataConfidence`
- `RiskLevel`
- `TaskStatus`
- `TaskResult`

**Step 3: Verify**

Run:

```bash
npm test -- --run src/types/domain.test.ts
```

Expected: pass.

## Task 2: Official Rule And Metric Data

**Files:**
- Create: `src/data/ruleSources.ts`
- Create: `src/data/metricDefinitions.ts`
- Create: `src/data/goalPresets.ts`
- Test: `src/data/officialTargets.test.ts`

**Step 1: Write failing tests**

Assert that:

- rule sources include the 2023 找工厂牌级公告
- rule sources include 1688 商家服务管理规范
- rule sources include 消费品行业商家店铺等级评价体系公告
- metric definitions include P0/P1/P2/P3 metrics
- bronze/silver/gold factory goals include service response rate, fulfillment rate, custom trade points, contract payment rate, and monthly active small custom SKU count

Expected: fail because data modules do not exist.

**Step 2: Implement data modules**

Create structured constants:

- `ruleSources`
- `metricDefinitions`
- `goalPresets`

Do not hardcode all L-level numeric goals. Store L-level as manually configurable because official values differ by category.

**Step 3: Verify**

Run:

```bash
npm test -- --run src/data/officialTargets.test.ts
```

Expected: pass.

## Task 3: Diagnostics Engine

**Files:**
- Create: `src/lib/diagnostics.ts`
- Test: `src/lib/diagnostics.test.ts`

**Step 1: Write failing tests**

Test these behaviors:

- bronze goal reports missing gap when service response rate is below 60%
- silver goal reports custom trade points gap below 800,000
- gold goal reports blocked state if shop is not in 找工厂
- P0 metrics sort before P1/P2/P3
- unknown or low-confidence readings are shown as requiring confirmation

Expected: fail because diagnostics does not exist.

**Step 2: Implement diagnostics**

Functions:

- `evaluateGoalStatus(goal, readings, shopContext)`
- `buildDiagnosticGaps(goalStatus)`
- `sortGapsByPriority(gaps)`
- `getHighestRiskGap(gaps)`

**Step 3: Verify**

Run:

```bash
npm test -- --run src/lib/diagnostics.test.ts
```

Expected: pass.

## Task 4: Guardrail Engine

**Files:**
- Create: `src/lib/guardrails.ts`
- Test: `src/lib/guardrails.test.ts`

**Step 1: Write failing tests**

Test these behaviors:

- low gross margin blocks GMV growth recommendations
- low fulfillment rate blocks promotion of complex custom orders
- P0 service risks pause P2/P3 expansion tasks
- response-rate improvement cannot be satisfied by invalid auto-replies

Expected: fail because guardrails does not exist.

**Step 2: Implement guardrails**

Functions:

- `evaluateGuardrails(readings, shopContext)`
- `isGoalBlocked(goal, guardrailResults)`
- `filterUnsafeTaskTemplates(templates, guardrailResults)`

**Step 3: Verify**

Run:

```bash
npm test -- --run src/lib/guardrails.test.ts
```

Expected: pass.

## Task 5: Task Generation

**Files:**
- Create: `src/data/taskTemplates.ts`
- Create: `src/lib/taskGeneration.ts`
- Test: `src/lib/taskGeneration.test.ts`

**Step 1: Write failing tests**

Test these behaviors:

- low 旺旺 3 分钟响应率 generates客服值班、未响应消息排查、快捷回复任务
- low fulfillment generates order risk and logistics tasks
- missing active small custom SKU count generates SKU completion task
- generated tasks include metric id, current value, target value, why, steps, and expected evidence
- task list is capped to 3-5 items

Expected: fail because modules do not exist.

**Step 2: Implement task templates and generator**

Functions:

- `generateDailyTasks(gaps, guardrails, templates)`
- `dedupeTasks(tasks)`
- `rankTasks(tasks)`

**Step 3: Verify**

Run:

```bash
npm test -- --run src/lib/taskGeneration.test.ts
```

Expected: pass.

## Task 6: Weekly Review Engine

**Files:**
- Create: `src/lib/weeklyReview.ts`
- Test: `src/lib/weeklyReview.test.ts`

**Step 1: Write failing tests**

Test these behaviors:

- compares this week vs previous week readings
- identifies improved and worsened official metrics
- links effective tasks to improved metrics
- suggests 1-3 next week goals
- suggests SOP entries from effective tasks

Expected: fail because weekly review does not exist.

**Step 2: Implement weekly review**

Functions:

- `compareMetricReadings(previous, current)`
- `buildWeeklyReview(input)`
- `suggestNextWeekGoals(review)`
- `suggestSopEntries(tasks, review)`

**Step 3: Verify**

Run:

```bash
npm test -- --run src/lib/weeklyReview.test.ts
```

Expected: pass.

## Task 7: Persistence Adapter

**Files:**
- Create: `src/lib/storage.ts`
- Test: `src/lib/storage.test.ts`

**Step 1: Write failing tests**

Test these behaviors:

- loads default shop context when storage is empty
- saves and loads selected goal
- saves and loads metric readings
- ignores malformed JSON and falls back safely
- storage is disabled in test mode without warning

Expected: fail because storage does not exist.

**Step 2: Implement storage adapter**

Functions:

- `loadAppState()`
- `saveAppState(state)`
- `getStorage()`
- `resetAppState()`

**Step 3: Verify**

Run:

```bash
npm test -- --run src/lib/storage.test.ts
```

Expected: pass.

## Task 8: UI Shell And Modes

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Test: `src/App.test.tsx`

**Step 1: Write failing UI tests**

Test these behaviors:

- app shows four modes: 今日冲刺、官方目标、周复盘、SOP / 规则库
- user can select “冲找工厂铜牌”
- app shows bronze target gaps
- low response rate generates a客服响应 task
- task completion can be marked effective and queued for SOP

Expected: fail against current dashboard UI.

**Step 2: Implement UI shell**

Replace the current dashboard hierarchy with:

- sticky current target summary
- segmented mode switch
- Today mode
- Official Goals mode
- Weekly Review mode
- SOP/Rules mode

**Step 3: Verify**

Run:

```bash
npm test -- --run src/App.test.tsx
```

Expected: pass.

## Task 9: Official Goals Mode

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Test: `src/App.test.tsx`

**Step 1: Write failing UI tests**

Test these behaviors:

- official goal page shows shop context fields
- metric cards show rule source, period, current value, target value, and confidence
- factory goal is blocked if shop has not joined 找工厂
- L-level goals are manually configurable

Expected: fail until implemented.

**Step 2: Implement Official Goals mode**

Build:

- goal selector
- shop context editor
- P0/P1/P2/P3 metric groups
- rule source badges
- confirmation state for metrics

**Step 3: Verify**

Run:

```bash
npm test -- --run src/App.test.tsx
```

Expected: pass.

## Task 10: Weekly Review And SOP Modes

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Test: `src/App.test.tsx`

**Step 1: Write failing UI tests**

Test these behaviors:

- weekly review shows improved and worsened metrics
- weekly review suggests 1-3 next goals
- effective task can become SOP entry
- SOP page separates rule playbooks, effective SOPs, pitfalls, and unverified methods

Expected: fail until implemented.

**Step 2: Implement modes**

Build:

- weekly metric comparison
- action attribution panel
- next goal recommendation
- SOP list and creation flow

**Step 3: Verify**

Run:

```bash
npm test -- --run src/App.test.tsx
```

Expected: pass.

## Task 11: Full Verification

**Files:**
- No code edits unless verification reveals defects.

**Step 1: Run all tests**

```bash
npm test -- --run
```

Expected: all tests pass.

**Step 2: Run production build**

```bash
npm run build
```

Expected: build succeeds.

**Step 3: Browser smoke test**

Start dev server:

```bash
npm run dev -- --port 5173
```

Verify:

- page renders without blank screen
- mode switching works
- selecting factory bronze updates target gaps
- low response rate generates daily task
- task result can create SOP candidate
- no major text overlap on desktop and mobile

## Implementation Notes

- Do not remove the existing knowledge-base method cards; convert them into SOP/method cards.
- Keep official rules separate from internal operating advice.
- Do not hardcode all L-level numeric thresholds.
- Keep localStorage persistence behind a safe adapter.
- Keep first version local-first; no backend.
- Every new pure function gets a failing unit test before implementation.
