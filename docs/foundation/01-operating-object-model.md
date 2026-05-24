# 01 经营对象模型

经营对象模型回答一个问题：这个软件长期到底认识什么。

如果对象模型不稳定，后续页面会越做越散。长期看，系统不应该围绕页面建模，而应该围绕经营因果链建模。

## 核心对象

| 对象 | 定义 | 长期作用 |
| --- | --- | --- |
| `Shop` | 一个 1688 店铺。 | 承载当前目标、类目、等级、经营阶段、数据源状态。 |
| `Product` | 一个商品或 SKU。 | 承载曝光、访客、询盘、成交、库存、商品诊断和类目信任点。 |
| `Employee` | 员工或负责人。 | 承载动作分配、完成状态、复盘能力和 SOP 使用情况。 |
| `Goal` | 平台目标或经营目标。 | 决定系统本阶段追什么，例如找工厂牌级、服务体验、成交增长。 |
| `Metric` | 指标定义。 | 决定系统如何度量目标、卡点和动作效果。 |
| `DataSource` | 数据来源。 | 决定指标从哪里来、多久更新、可信不可信。 |
| `RuleVersion` | 官方规则或内部规则版本。 | 防止旧政策被当作永久依据。 |
| `Bottleneck` | 经营卡点。 | 把指标异常翻译成可处理的问题类型。 |
| `ActionTemplate` | 动作模板。 | 系统从卡点中抽取今日可执行动作。 |
| `Mission` | 每日作战单。 | 员工每天实际执行的 1 个主目标和 1-3 个动作。 |
| `Review` | 复盘记录。 | 判断动作是否有效、是否停止、是否调整。 |
| `SOP` | 被验证过的标准动作。 | 把有效动作沉淀成可复用资产。 |

## 对象关系

```text
Shop
  has many Product
  has many Employee
  selects Goal
  receives DataSource

Goal
  requires Metric
  references RuleVersion
  produces Bottleneck

Metric
  maps to DataSource
  maps to Bottleneck
  validates ActionTemplate

Bottleneck
  maps to ActionTemplate
  generates Mission

Mission
  assigns ActionTemplate to Employee
  creates Review

Review
  updates ActionTemplate confidence
  promotes SOP
```

## 当前项目默认上下文

| 字段 | 当前假设 |
| --- | --- |
| 主类目 | 保温杯 |
| 类目类型 | 消费品 / 日用百货 |
| 经营形态 | 现货批发 + 拿样 + LOGO 定制 + 礼品团购 + 老客补货 |
| 主要使用者 | 运营员工、客服员工、负责人 |
| 当前软件阶段 | 先手工/XLS/截图录入，后续再接 API |
| 核心节奏 | 每日作战单 + 明日验证 + 周复盘 |

## 不能混淆的对象

1. `Metric` 和 `MetricReading` 不同：前者是指标定义，后者是某天的数值。
2. `Goal` 和 `RuleVersion` 不同：目标是要追什么，规则是依据什么判断。
3. `ActionTemplate` 和 `MissionAction` 不同：前者是动作库，后者是今天派给员工的具体动作。
4. `Bottleneck` 和 `MetricGap` 不同：指标差距只是现象，卡点是对现象的经营解释。
5. `Review` 和 `SOP` 不同：复盘是一次判断，SOP 是多次有效后沉淀的资产。

## 长期判断

软件真正的长期价值不在页面，而在这些对象之间的稳定关系：

```text
目标为什么重要
指标从哪里来
异常代表什么卡点
卡点应该派什么动作
动作怎么验证
有效动作如何沉淀
```

