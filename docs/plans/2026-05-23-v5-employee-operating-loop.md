# V5 Employee Operating Loop Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the first employee-usable loop: historical daily data, BI trend cards, funnel bottleneck diagnosis, low-friction checklist, action backtest, and SOP candidate.

**Architecture:** Keep V5 inside the existing React/Vite app and operations engine. The engine accepts an array of V4 daily facts, computes 7-day trend snapshots and the primary funnel bottleneck, then generates checklist tasks and backtests one action from before/after windows.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, existing CSS.

## Product Boundary

V5 does not build heavy evidence upload, multi-user permissions, external API sync, or a full BI builder. It turns V4 daily metrics into an employee workflow that can be tested with seeded history.

## Tasks

### Task 1: Engine Tests

**Files:**
- Modify: `src/lib/operations.test.ts`

**Steps:**
1. Add a failing test for `buildV5OperatingLoop(history)` that verifies:
   - 7-day trend metrics exist.
   - Funnel stages include exposure, visitor, inquiry, payment, profit.
   - Primary bottleneck is visitor-to-inquiry when visitor inquiry rate is below target.
   - Checklist contains concrete employee actions and no required evidence by default.
2. Add a failing test for `backtestV5ChecklistAction(action, before, after)` that verifies:
   - Improvement returns `effective`.
   - Effective result creates an SOP candidate.
   - Weak improvement returns `watch`.
3. Run `npm test -- --run src/lib/operations.test.ts` and confirm failure because V5 functions are missing.

### Task 2: Engine Implementation

**Files:**
- Modify: `src/lib/operations.ts`

**Steps:**
1. Add V5 types for trend metrics, funnel stages, checklist items, backtest result, and operating loop.
2. Implement `buildV5OperatingLoop(history)` by reusing `buildV4DailyOperatingReview` for the latest day.
3. Compute latest value, previous value, 7-day average, target, status, and trend direction for core metrics.
4. Build a funnel with thresholds for exposure-to-visitor, visitor-to-inquiry, inquiry-to-payment, ad/profit health.
5. Generate a small checklist from the primary bottleneck. Each item should have a checkbox label, one-sentence completion note prompt, optional evidence trigger, and review metric.
6. Implement `backtestV5ChecklistAction` using before/after metric windows.
7. Run the engine test and make it pass.

### Task 3: UI Tests

**Files:**
- Modify: `src/App.test.tsx`

**Steps:**
1. Add a failing test that clicks `V5 闭环` and verifies:
   - headings `趋势 BI`, `卡点漏斗`, `今日 Checklist`, `动作回测`, `SOP 候选`
   - trend text for `访客询盘率`
   - bottleneck text `访客到询盘`
2. Add a failing test that checks a checklist item, enters an after value, runs backtest, and sees `有效` and an SOP candidate.
3. Run `npm test -- --run src/App.test.tsx` and confirm failure because the UI page is missing.

### Task 4: UI Implementation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Steps:**
1. Add `loop` page label `V5 闭环`.
2. Seed 7 daily facts from the V4 sample and compute `v5Loop`.
3. Render trend cards, funnel stages, checklist items, action backtest controls, and SOP candidate.
4. Use compact operational UI styling. Keep cards shallow and avoid nested cards.
5. Ensure checklist uses checkbox + short note, not evidence upload.
6. Run App tests and make them pass.

### Task 5: Verification

**Commands:**
- `npm test -- --run`
- `npm run build`
- `git diff --check`
- Browser QA on `http://127.0.0.1:5174/` for desktop and mobile.

Expected: all commands pass, V5 page has no horizontal overflow, checklist/backtest interaction works.
