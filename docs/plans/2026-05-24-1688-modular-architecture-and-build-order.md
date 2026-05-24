# 1688 运营助手模块化架构与开发顺序

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把 1688 运营助手拆成稳定模块，先完成模块边界、输入输出和开发顺序，再进入代码开发。

**Architecture:** 不按页面拆模块，而按经营闭环拆模块：数据进入、规则解释、目标判断、诊断卡点、派发动作、验证结果、沉淀 SOP。页面只消费模块输出，不能把业务规则写死在页面里。

**Tech Stack:** React、TypeScript、Vitest、Testing Library、Markdown 规则库、XLS/手填/截图数据源，后续预留 API。

## 1. 模块化总原则

模块化不是把页面分成很多 tab，而是让每个模块只回答一个稳定问题。

```text
数据模块：这个数从哪里来？
指标模块：这个数是什么意思？
规则模块：平台怎么判定？
目标模块：当前要冲什么？
诊断模块：差距代表什么卡点？
动作模块：今天该做什么？
验证模块：做完有没有用？
SOP 模块：有效动作如何复用？
```

模块之间只传结构化对象，不互相读取对方内部规则。比如买家保障模块输出“保障配置状态”和“保障异常”，新灯塔模块只引用这个状态，不把买家保障规则复制进去。

## 2. 第一层：底座模块

这些模块先做，因为所有业务模块都会依赖它们。

| 模块 | 负责什么 | 输入 | 输出 | 不负责什么 |
| --- | --- | --- | --- | --- |
| `DataSourceModule` | 管数据来源、录入方式、更新时间、可信度 | XLS、手填、截图、复制表格、API | `MetricReading`、数据新鲜度、来源说明 | 不判断好坏 |
| `MetricModule` | 管指标定义、单位、方向、周期、口径 | 指标字典 | `MetricDefinition` | 不派任务 |
| `RuleModule` | 管规则版本、来源可信度、适用范围、过期关系 | 规则卡、飞书资料、后台链接 | `RuleVersion`、规则适用性 | 不直接决定员工动作 |
| `GoalModule` | 管当前阶段目标和目标所需指标 | 规则、指标、店铺上下文 | `GoalProgress`、目标缺口 | 不解释卡点原因 |
| `MappingModule` | 管目标-指标-数据-卡点-动作-验证映射 | 指标、目标、动作模板 | 结构化映射表 | 不存业务数据 |

底座先跑通，后续业务模块才能像插件一样接进来。

## 3. 第二层：经营诊断模块

这些模块负责把数据变成判断。

| 模块 | 负责什么 | 关键对象 | 输出 |
| --- | --- | --- | --- |
| `BIModule` | 趋势、排行、漏斗、目标进度 | `MetricReading[]` | 趋势卡、卡点排行、漏斗阶段 |
| `BottleneckModule` | 把指标异常解释成经营卡点 | `MetricGap`、映射表 | `Bottleneck` |
| `RiskModule` | 判断毛利、履约、售后、品质是否阻断放大 | 毛利、退款、履约、介入 | 风险等级、阻断原因 |
| `PriorityModule` | 决定今天先处理什么 | 目标缺口、风险、动作频率 | P0/P1/P2 优先级 |

这里的关键是：诊断模块只给出“为什么卡”，不直接把员工拖进复杂规则。

## 4. 第三层：动作与执行模块

员工真正接触的是这一层。

| 模块 | 负责什么 | 动作频率 |
| --- | --- | --- |
| `ActionTemplateModule` | 管动作模板，例如改标题、补属性、退款日清、询盘追单 | 模板 |
| `MissionModule` | 每天生成 1 个主目标和 1-3 个 checklist | 每日 |
| `ActionFrequencyModule` | 区分一次性配置、日常运营、周期巡检、异常触发、实验动作 | 常驻 |
| `EmployeeAssignmentModule` | 把任务派给运营、客服、负责人 | 每日/每周 |
| `ExecutionModule` | 记录勾选、短备注、必要截图 | 每日 |

动作频率是降低摩擦的关键。

| 频率 | 例子 | 系统行为 |
| --- | --- | --- |
| 一次性配置 | 买家保障已开通、基础服务已配置 | 完成后不再日常派发 |
| 周期巡检 | 每周看新灯塔、镇店之宝配额 | 到周期再派发 |
| 日常运营 | 回复询盘、处理退款、待发货日清 | 每日按异常派发 |
| 异常触发 | 服务星级下降、保障违约、退款超时 | 越线才派发 |
| 实验动作 | 改标题、改主图、改报价 | 到验证周期回测 |

## 5. 第四层：业务域模块

业务域模块像插件，每个模块都有自己的目标、指标、动作和验证方式。

| 业务域 | 核心目标 | 关键指标 | 典型动作 |
| --- | --- | --- | --- |
| 服务履约模块 | 修新灯塔、保店铺服务星级 | 新灯塔总分、服务星级、物流/售后/咨询/商品体验 | 客服响应、退款日清、物流异常、品质退款处理 |
| 商品成长模块 | 冲采购指数4.0、优化商品质量 | 采购指数、新品采购指数、标题属性、保障状态 | 修类目、标题、属性、服务保障、商品诊断 |
| 镇店之宝模块 | 用好配额，放大核心商品 | 配额、采购指数4.0商品数、转化、服务风险 | 选候选商品、修短板、配置/复核 |
| 找工厂/定制模块 | 提升定制承接和牌级 | 服务响应、履约、定制交易、合约支付 | 补定制入口、MOQ、打样周期、报价追单 |
| 交易增长模块 | 曝光到支付的漏斗增长 | 曝光、访客、询盘、支付、GMV、毛利 | 修点击、修询盘、报价跟进、广告边界 |
| 老客复购模块 | 建客户资产和补货节奏 | 老客数、回访数、复购机会、复购额 | 7/30 天回访、规格复用、新品推荐 |
| 经营安全模块 | 防止冲指标冲坏生意 | 毛利、退款、介入、履约、低毛利订单 | 停推问题 SKU、毛利表、售后归因 |

第一阶段不要一次性做完所有业务域。先做“服务履约 + 商品成长 + 交易漏斗”，因为它们和新灯塔、生意参谋、采购指数最直接。

## 6. 页面如何对应模块

页面只组合模块输出，不承载核心业务逻辑。

| 页面 | 调用哪些模块 | 页面职责 |
| --- | --- | --- |
| 今日冲刺 | Goal、Priority、Mission、Execution | 展示今天做什么 |
| 趋势 BI | DataSource、Metric、BI、Bottleneck | 展示趋势和卡点 |
| 官方目标 | Rule、Goal、Metric、Mapping | 展示目标差距和来源 |
| 商品成长 | 商品成长域、镇店之宝域、商品质量域 | 管商品资产 |
| 服务履约 | 新灯塔域、售后域、物流域 | 管服务分和风险 |
| 复盘 SOP | Review、Validation、SOP | 判断动作是否有效 |
| 数据导入 | DataSource、MetricReading | 上传和维护数据 |

页面越简单越好。员工端默认只看“今日冲刺”和“趋势 BI”；负责人再看规则和目标来源。

## 7. 模块接口草案

后续代码里可以先用 TypeScript 类型表达接口。

```ts
type ModuleOutput<T> = {
  data: T;
  sourceIds: string[];
  confidence: "low" | "medium" | "high";
  generatedAt: string;
};

type ActionFrequency =
  | "one_time_setup"
  | "periodic_check"
  | "daily_operation"
  | "exception_triggered"
  | "experiment";

type DiagnosisResult = {
  bottleneckId: string;
  severity: "P0" | "P1" | "P2" | "P3";
  metricIds: string[];
  reason: string;
  recommendedActionTemplateIds: string[];
};

type MissionAction = {
  id: string;
  title: string;
  frequency: ActionFrequency;
  ownerRole: "operator" | "customer_service" | "manager";
  checklist: string[];
  reviewMetricIds: string[];
  verificationWindowDays: number;
};
```

## 8. 开发顺序

### Phase 0：文档和类型对齐

目标：先让模块边界稳定。

1. 对齐现有对象：`Shop`、`Product`、`Goal`、`Metric`、`DataSource`、`RuleVersion`、`ActionTemplate`、`Mission`、`Review`、`SOP`。
2. 把 `ActionFrequency` 加进动作模板。
3. 把新灯塔 AI 页面加入数据源种子。
4. 把买家保障标记为已完成一次性配置。

验收：类型、测试、文档都能解释“为什么买家保障不再每日派发”。

### Phase 1：底座模块

目标：让数据、指标、规则、目标分离。

1. `MetricDefinition` 种子化。
2. `DataSourceDefinition` 种子化。
3. `RuleVersion` 增加 `sourceConfidence` 和 `status: draft | source_found | active | deprecated`。
4. `GoalPreset` 只绑定指标，不直接绑定动作。

验收：官方目标页能显示目标、指标、来源、频率、可信度。

### Phase 2：BI 与诊断

目标：从数据里看趋势和卡点。

1. 生意参谋 XLS 继续作为店铺经营数据源。
2. 新灯塔页面数据先手填。
3. 生成趋势卡、漏斗卡、服务卡点排行。
4. 输出 `Bottleneck`，不直接派动作。

验收：趋势 BI 能回答“哪里卡住了”，而不是只显示数字。

### Phase 3：动作频率和今日 checklist

目标：减少员工摩擦。

1. `one_time_setup` 完成后只显示状态。
2. `daily_operation` 每天按异常派发。
3. `periodic_check` 到周期再派发。
4. `exception_triggered` 只在越线时派发。
5. `experiment` 必须带验证周期。

验收：已开通买家保障不会反复出现；新灯塔下降才触发服务修复任务。

### Phase 4：业务域插件化

目标：先接三个高价值业务域。

1. 服务履约域：新灯塔、店铺服务星级、退款、物流、咨询。
2. 商品成长域：采购指数4.0、商品质量、标题属性、保障状态。
3. 交易漏斗域：曝光、访客、询盘、支付、毛利。

验收：每个业务域都能输出指标、卡点、建议动作、验证指标。

### Phase 5：复盘和 SOP 生命周期

目标：让软件迭代进步。

1. 每个动作记录前后指标。
2. 动作到期后回测。
3. 有效动作进入 SOP 候选。
4. 连续无效动作停止派发，并要求重拆原因。

验收：系统能区分“做了但没用”和“做了有效”，不再无限重复无效动作。

## 9. 不做什么

第一轮先不做：

- 全自动 API；
- 复杂权限系统；
- 多店铺集团版；
- 自定义 BI 拖拽编辑器；
- 大量证据上传；
- 把 AI 摘录里的流量加权数字写成承诺；
- 把规则确认做成员工端阻塞项。

## 10. 第一批开发任务建议

按最小可用闭环开发：

1. 新增 `ActionFrequency` 类型和测试。
2. 给现有 checklist 动作补频率字段。
3. 增加新灯塔数据源和指标定义。
4. 增加买家保障已完成配置状态。
5. 调整今日 checklist 生成逻辑：一次性配置完成后不派发。
6. 在 BI 页面展示新灯塔/店铺服务星级入口和录入提示。
7. 给服务履约域生成第一版卡点：咨询、物流、售后、商品体验。

这 7 步完成后，再扩展商品成长、镇店之宝、找工厂，不要反过来先铺满所有业务域。
