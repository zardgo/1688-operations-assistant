# 1688 Operations Assistant Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a local-first 1688 operations assistant that helps employees turn weekly operating data into diagnoses, target gaps, recommended actions, and reusable playbooks.

**Architecture:** A Vite + React + TypeScript single-page app with a small domain engine in `src/lib`. The app stores weekly metrics in browser state/localStorage, uses knowledge-base-derived rules to score operations, and renders a dense operating dashboard for repeated staff use.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, Lucide React.

### Task 1: Domain Engine

**Files:**
- Create: `src/lib/operations.ts`
- Test: `src/lib/operations.test.ts`

**Step 1:** Write failing tests for health scoring, roadmap phase detection, keyword matrix generation, SKU role recommendations, and next-action generation.

**Step 2:** Run `npm test -- --run src/lib/operations.test.ts` and verify tests fail because `src/lib/operations.ts` does not exist.

**Step 3:** Implement only the domain functions required by the tests.

**Step 4:** Re-run the unit tests and confirm they pass.

### Task 2: Knowledge Data

**Files:**
- Create: `src/data/knowledge.ts`
- Test: `src/data/knowledge.test.ts`

**Step 1:** Write failing tests that assert the app includes the 90-day roadmap, weekly review modules, stable-profit rules, and sample factory benchmarks.

**Step 2:** Run the tests and verify they fail because the data module does not exist.

**Step 3:** Implement the data module using the knowledge-base method: vertical category focus, trust signals, keyword matrix, conversion questions, delivery controls, gross-profit and repeat-purchase loops.

**Step 4:** Re-run the tests and confirm they pass.

### Task 3: Application UI

**Files:**
- Create: `src/App.tsx`
- Create: `src/App.test.tsx`
- Create: `src/main.tsx`
- Create: `src/styles.css`

**Step 1:** Write a failing UI test showing that editing KPI inputs updates diagnosis and actions.

**Step 2:** Run the test and verify it fails because the UI does not exist.

**Step 3:** Implement the operator dashboard: KPI inputs, target gap cards, recommended action queue, 90-day roadmap, playbook library, keyword matrix, and factory benchmark table.

**Step 4:** Re-run UI tests and confirm they pass.

### Task 4: Project Tooling

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vitest.setup.ts`

**Step 1:** Add package scripts for `dev`, `test`, and `build`.

**Step 2:** Install dependencies.

**Step 3:** Run `npm test -- --run` and `npm run build`.

### Task 5: Browser Verification

**Step 1:** Start the dev server.

**Step 2:** Open the local app in the in-app browser.

**Step 3:** Verify the dashboard renders, KPI changes update the diagnosis, and no major layout overlap appears.
