# 1688 运营规则库

本目录用于沉淀软件可引用的规则和目标。规则分两类：

1. 官方规则：来自 1688 规则中心、商家后台、找工厂后台等官方口径。软件可以按规则版本和来源可信度使用，不再把“人工确认”作为前置门槛。
2. 经营目标：来自保温杯样本、内部经营方法论、员工复盘和业务经验。它可以指导运营动作，但不能冒充官方政策。

## 本次资料审计

检索目录：`/Users/leon/Documents/1688知识库`

可用资料：

- `1688新店稳定赚钱运营思维导图.md`
- `data/1688_factory_thermos_first100.json`
- `data/test_1688_thermos.jsonl`
- `data/1688_factory_store_product_counts.json`
- `scripts/*.mjs`

关键发现：

- 本地知识库没有保存完整的 1688 官方规则原文。
- 可稳定使用的是保温杯竞品样本和运营方法论。
- `1688新店稳定赚钱运营思维导图.md` 已明确提示：部分 CSV 和同源修正数据不应作为结论依据。
- 因此本次创建的官方规则卡默认需要显示来源和版本，不能当作永久政策。

## 规则状态

| 状态 | 含义 | 软件使用方式 |
| --- | --- | --- |
| `draft` | 草案，从计划文档或经营假设整理 | 只能做内部讨论和弱提示 |
| `source_found` | 找到官方链接、后台截图、用户摘录或飞书资料 | 可以生成建议动作，但必须显示来源和版本 |
| `active` | 当前软件采用的规则版本 | 可以驱动目标差距、提醒和 checklist |
| `deprecated` | 已被新政策替代或不再适用 | 只能用于历史解释和字段映射 |

## 规则卡字段

```yaml
rule_id:
rule_name:
rule_type: official | operating
source_name:
source_link:
publish_date:
collected_date:
applicability:
category_scope:
goal_scope:
metrics:
  - metric_id:
    metric_name:
    threshold:
    period:
    direction:
    unit:
    evidence_needed:
actions:
source_confidence: low | medium | high
last_reviewed_at:
review_notes:
notes:
```

## 当前文档

- `1688-official-rule-cards-v0.md`：官方规则候选卡，包含找工厂牌级、服务体验、消费品店铺等级等软件需要的底层规则。
- `1688-product-growth-purchase-index-2026-05-09.md`：用户提供的 2026-05-09 商品成长升级公告结构化规则卡，记录金冠品下线、采购指数4.0、生效和过渡期规则。
- `1688-feishu-source-audit-2026-05-24.md`：飞书「📘1688知识库」资料审计，区分官方规则、白皮书、培训资料和历史资料。
- `1688-factory-growth-playbook-2025.md`：从飞书找工厂培训资料提炼的找工厂经营规则卡。
- `1688-yanxuan-purchase-index-whitepaper.md`：从飞书严选机制白皮书提炼的严选采购指数规则卡。
- `1688-product-growth-legacy-gold-crown.md`：旧金冠商品成长体系的历史/过期规则卡，只用于字段映射和历史解释。
- `1688-transaction-medal-system.md`：用户提供的交易勋章体系规则摘录结构化卡，记录 1A-5A 门槛、T+1 更新、剔除口径和权益。
- `1688-business-points-l-level.md`：用户提供的 L 等级/生意积分结构化规则卡，区分消费品和工业品积分口径。
- `1688-new-lighthouse-5-service-experience.md`：用户提供的新灯塔5.0服务体验规则卡，记录物流、售后、咨询、商品体验和特色保障字段。
- `1688-buyer-protection-2026-candidate.md`：用户提供的 2026 买家保障 AI 摘录规则候选卡，低可信，用于保障服务 checklist。
- `1688-town-treasure-2026-candidate.md`：用户提供的镇店之宝 AI 摘录规则候选卡，低可信，用于候选商品筛选思路。
- `1688-product-quality-star-2026-candidate.md`：用户提供的商品质量星级 AI 摘录规则候选卡，低可信，用于发布质量 checklist。
- `thermos-operating-targets-from-knowledge-base.md`：从保温杯样本和本地方法论提炼的经营目标，不是官方政策。

## 使用原则

1. 软件不把“人工确认”作为使用前置条件，避免员工端产生额外摩擦。
2. 规则必须显示 `rule_name`、`publish_date`、`source_link`、`source_confidence` 和适用范围；缺失时显示“来源待补”，但不阻塞行动建议。
3. 经营目标可以生成建议动作，但必须显示来源为“样本/内部经营目标”。
4. 每次官方规则更新后，要新增规则版本，不覆盖旧版本。
5. 如果规则和经营目标冲突，以经营安全为底线，例如毛利、交付、售后风险优先。
