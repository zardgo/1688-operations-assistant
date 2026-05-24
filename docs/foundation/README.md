# 1688 运营助手长期基座

本文档组记录软件暂不内置、但必须先想清楚的底层经营知识。它不是页面说明，也不是开发任务清单，而是以后所有功能、规则、数据导入、作战单、BI 和员工动作的共同底座。

核心链路：

```text
经营对象
  -> 指标字典
  -> 数据源映射
  -> 目标-指标映射
  -> 指标-卡点映射
  -> 卡点-动作映射
  -> 动作-验证映射
  -> 复盘-SOP 沉淀
```

## 文档结构

| 文档 | 作用 |
| --- | --- |
| `01-operating-object-model.md` | 定义系统长期要认识的经营对象：店铺、商品、目标、指标、规则、卡点、动作、复盘、SOP。 |
| `02-metric-dictionary.md` | 定义指标字典的字段、口径、频率、数据可信度和第一批核心指标。 |
| `03-mapping-system.md` | 定义目标映射、数据映射、指标映射、规则映射，避免目标直接跳到动作。 |
| `04-diagnosis-action-validation.md` | 定义诊断、动作、验证、复盘、SOP 的闭环，让系统能迭代进步。 |
| `05-thermos-category-knowledge.md` | 沉淀保温杯类目知识：采购关注点、商品信任点、询盘问题、动作增强。 |
| `06-governance-and-maintenance.md` | 定义这些底层表将来如何维护、确认、废弃和版本化。 |
| `07-rule-version-foundation.md` | 单独定义官方规则版本、确认状态、适用范围、替代关系和启用原则。 |
| `08-employee-role-responsibility.md` | 定义员工角色、指标责任、动作分配、升级条件和能力模型。 |
| `09-refactor-principles.md` | 定义产品重构原则：监测、分析、行动、复盘，以及运营颗粒度原则。 |

## 10 层基座对应关系

| 层级 | 当前文档 |
| --- | --- |
| 1. 经营对象模型 | `01-operating-object-model.md` |
| 2. 指标字典 | `02-metric-dictionary.md` |
| 3. 数据源映射 | `03-mapping-system.md` |
| 4. 目标-指标映射 | `03-mapping-system.md` |
| 5. 指标-卡点映射 | `03-mapping-system.md` |
| 6. 卡点-动作映射 | `03-mapping-system.md` |
| 7. 动作-验证映射 | `03-mapping-system.md`、`04-diagnosis-action-validation.md` |
| 8. 规则版本库 | `07-rule-version-foundation.md`、`docs/rules/` |
| 9. 保温杯类目知识库 | `05-thermos-category-knowledge.md` |
| 10. 员工角色与责任模型 | `08-employee-role-responsibility.md` |

## 设计原则

1. 方法论先用 Markdown 沉淀，不急着写死进软件。
2. 员工端只看作战单，不直接看底层映射表。
3. 管理者可以维护规则、目标、动作和指标口径。
4. 官方规则必须版本化，不能把旧政策当永久真理。
5. 经营动作必须绑定验证指标，否则只是待办事项。
6. 保温杯类目知识是差异化资产，不能只做通用 1688 工具。

## 与现有文档关系

- `docs/plans/2026-05-23-1688-data-model.md` 偏产品数据模型。
- `docs/plans/2026-05-23-1688-thermos-rule-tables.md` 偏规则、动作和任务生成示例。
- `docs/rules/` 偏官方规则卡和经营目标来源。
- 本目录偏长期基座，负责把这些内容抽象成稳定结构。
