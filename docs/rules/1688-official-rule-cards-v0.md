# 1688 官方规则候选卡 v0

> 目的：把软件需要引用的官方规则先结构化，并记录规则版本、来源和可信度。  
> 重要边界：`/Users/leon/Documents/1688知识库` 当前没有完整官方规则原文，本文件不能替代 1688 规则中心或商家后台。软件可以先生成行动建议，但要允许后台实际口径覆盖。

## 0. 规则来源维护项

每条规则进入软件后，应尽量补齐：

- 规则名称是否与官方一致。
- 发布日期和最近更新日期。
- 是否仍然有效。
- 是否适用于保温杯、日用百货、找工厂商家或当前店铺类型。
- 指标阈值、统计周期、剔除口径是否正确。
- 后台字段名称和软件字段是否能一一对应。
- 是否有截图或链接作为来源证据。

## 1. 找工厂牌级规则

```yaml
rule_id: official_factory_level_2023_pending
rule_name: 找工厂商家牌级体系
rule_type: official
source_name: 1688 规则中心 - 关于 2023 找工厂商家牌级体系升级公告
source_link: https://rulechannel.1688.com/?type=detail&ruleId=20002931&cId=27#/rule/detail?ruleId=20002931&cId=27
publish_date: 待补
collected_date: 2026-05-24
applicability: 已入驻 1688 找工厂的商家；是否排除超级工厂待补后台口径
category_scope: 保温杯 / 日用百货 / 定制加工场景
goal_scope:
  - 冲找工厂铜牌
  - 冲找工厂银牌
  - 冲找工厂金牌
source_confidence: medium
last_reviewed_at:
review_notes:
```

| 指标 | 铜牌草案阈值 | 银牌草案阈值 | 金牌草案阈值 | 统计周期 | 软件字段 | 证据要求 |
| --- | --- | --- | --- | --- | --- | --- |
| 找工厂服务响应率 | ≥60% | ≥65% | ≥70% | 近 30 天 | `factory_service_response_rate_30d` | 找工厂后台截图 |
| 找工厂履约率 | ≥70% | ≥75% | ≥80% | 近 30 天 | `factory_fulfillment_rate_30d` | 找工厂后台截图 |
| 定制交易积分 | ≥10 万 | ≥80 万 | ≥150 万 | 近 30 天 | `custom_trade_points_30d` | 找工厂后台截图 |
| 合约支付率 | ≥50% | ≥60% | ≥70% | 近 30 天 | `contract_payment_rate` | 找工厂/交易后台截图 |
| 月动销小单定制商品数 | ≥3 款 | ≥3 款 | ≥3 款 | 当月 | `monthly_active_small_custom_sku_count` | 商品/交易后台截图 |

### 软件动作

- 任一指标低于目标：显示“暂不可冲”。
- 规则来源缺失：仍可生成动作建议，但显示“来源待补”，并提示以后台当前口径为准。
- 服务响应率低：优先生成客服响应、未响应咨询排查、快捷回复任务。
- 履约率低：生成定制订单交期排查、确认稿留痕、供应链确认任务。
- 定制交易积分低：生成小单定制入口、合约推进、定制案例整理任务。
- 合约支付率低：生成报价后 24/48 小时追单和流失原因记录。
- 小单定制商品数不足：生成 3 款小单定制商品补齐任务。

### 保温杯业务解释

找工厂牌级不是经营成功本身，而是平台身份和权益目标。保温杯店铺不能为了冲交易积分牺牲毛利、交付和售后安全。

## 2. 商家服务管理规则

```yaml
rule_id: official_merchant_service_20001500_pending
rule_name: 1688 商家服务管理规范
rule_type: official
source_name: 1688 规则中心 - 1688 商家服务管理规范
source_link: https://rulechannel.1688.com/?type=detail&ruleId=20001500&cId=3025#/rule/detail?ruleId=20001500&cId=3025
publish_date: 待补
collected_date: 2026-05-24
applicability: 1688 商家服务、咨询、发货、退款、纠纷相关场景
category_scope: 保温杯 / 日用百货 / 现货批发 / 定制订单
goal_scope:
  - 保基础服务分
  - 修复服务体验短板
  - 支撑找工厂牌级
source_confidence: medium
last_reviewed_at:
review_notes:
```

| 指标 | 草案目标 | 统计周期 | 软件字段 | 证据要求 |
| --- | --- | --- | --- | --- |
| 旺旺 3 分钟响应率 | 内部底线先按 ≥60%，优秀对标按 ≥95% | 当日 / 近 30 天 | `ww_3min_response_rate` | 服务后台截图 |
| 咨询满意度 | 待官方确认 | 近 30 天 | `consult_satisfaction_rate` | 服务后台截图 |
| 退款处理时长 | 待官方确认 | 近 30 天 | `refund_handling_hours_30d` | 售后后台截图 |
| 平台介入率 | 越低越好，阈值待补 | 近 30 天 | `platform_intervention_rate_30d` | 投诉/介入后台截图 |

### 软件动作

- 3 分钟响应率低：生成 09:00-21:00 值班、未响应原因复盘、快捷回复补齐。
- 咨询满意度低：生成客服话术质量复盘，而不是只追速度。
- 退款处理慢：生成当日退款清零和争议升级任务。
- 平台介入率上升：生成确认稿、售后边界、聊天留痕复盘任务。

### 保温杯业务解释

保温杯新店没有品牌优势，询盘一旦响应慢，会同时损失成交机会和平台服务体验。速度要和有效回复绑定，不能用无效自动回复冒充服务。

## 3. 消费品店铺等级与商品成长规则

```yaml
rule_id: official_consumer_store_level_20001718_pending
rule_name: 消费品行业商家店铺等级评价体系
rule_type: official
source_name: 1688 规则中心 - 关于调整消费品行业商家店铺等级评价体系的公告
source_link: https://rulechannel.1688.com/?type=detail&ruleId=20001718&cId=27#/rule/detail?ruleId=20001718&cId=27
publish_date: 待补
collected_date: 2026-05-24
applicability: 消费品行业商家；保温杯是否归入该口径待后台确认
category_scope: 保温杯 / 日用消费品
goal_scope:
  - 提升 L 等级
  - 提升商品力
  - 提升服务体验星级
source_confidence: medium
last_reviewed_at:
review_notes:
related_rule_versions:
  - official_product_growth_purchase_index_2026_05_09
```

### 2026-05-09 商品成长升级影响

用户已提供「1688商品成长升级的公告」原文：2026-05-09 公示，2026-05-25 逐步生效，2026-05-25 至 2026-06-25 为 30 天缓冲期。该公告将商品成长体系从“金冠品”升级为“采购指数4.0”。

结构化规则卡见：`1688-product-growth-purchase-index-2026-05-09.md`。

| 指标 | 草案口径 | 软件字段 | 证据要求 |
| --- | --- | --- | --- |
| GMV | 类目和等级阈值待后台确认 | `gmv_30d` | 生意参谋/等级后台截图 |
| 买家数 | 类目和等级阈值待后台确认 | `buyer_count_30d` | 生意参谋/等级后台截图 |
| 旺旺响应率 | 与服务体验联动 | `ww_response_rate` | 服务后台截图 |
| 揽收率 / 48 小时揽收率 | 与物流体验联动 | `pickup_rate_48h` | 物流后台截图 |
| 老客回头率 | 与复购能力联动 | `repeat_buyer_rate` | 客户/交易后台截图 |
| 潜力商品数 | 0 < 采购指数 < 4.0 | `potential_product_count` | 商品成长后台截图 |
| 采购指数4.0商品数 | 采购指数 >= 4.0 | `purchase_index_4_product_count` | 商品成长后台截图 |
| 商品采购指数 | 0 - 5.0 分，>=4.0 达标 | `purchase_index_score` | 商品成长后台截图 |
| 新品采购指数 | 新品期 0 - 5.0 分，>=4.0 达标，>=4.5 为超级新品门槛之一 | `new_purchase_index_score` | 商品成长后台截图 |
| 金冠品商品数 | 历史字段，2026-05-25 后进入过渡期逻辑 | `gold_crown_product_count` | 仅用于历史对比和缓冲期判断 |
| 特色货盘总数 | 商品/货盘字段，阈值待补 | `featured_assortment_count` | 商品/货盘后台截图 |
| 访客数 / 新访客数 | 流量能力字段，阈值待补 | `visitor_count_30d` / `new_visitor_count_30d` | 生意参谋截图 |

### 软件动作

- L 等级目标不能硬编码官方阈值，必须允许人工录入当前后台目标。
- GMV 或买家数不足时，先检查毛利、交付、售后是否安全。
- 潜力商品和采购指数4.0商品不足时，按采购指数五维度口碑、价格、服务、品质、商誉拆解任务。
- 缓冲期内的旧金冠品若采购指数低于 4.0，优先生成采购指数修复任务。
- 特色货盘不足时，生成现货、定制、礼品、复购四类货盘整理任务。

### 保温杯业务解释

消费品等级目标适合作为中期成长目标，但不能压过服务和毛利底线。保温杯店铺应先跑通询盘、报价、交付、复购，再扩大 GMV。

## 4. 待补官方来源

以下规则在软件中需要，但当前知识库没有原文或稳定链接：

| 规则方向 | 为什么需要 | 当前处理 |
| --- | --- | --- |
| 新灯塔 / 服务体验星级 | 对服务体验、商品体验、物流、售后有直接影响 | 暂做字段占位，待后台截图确认 |
| 交易勋章 / 交易助章 | 代运营表里出现 3A/4A 目标，可能影响交易规模目标 | 暂做字段占位，待后台截图确认 |
| 商品成长 / 采购指数4.0 | 决定商品力优化方向 | 已有 2026-05-09 公告原文，仍需补官方链接或后台截图后确认 |
| 找工厂权益细则 | 冲牌级后对应权益会影响优先级 | 待规则中心或后台确认 |
| 3 分钟响应率有效回复细则 | 防止员工用无效自动回复刷指标 | 待服务规则原文确认 |

## 5. 软件读取建议

第一版软件应该读取这些字段：

```yaml
rule_version:
  rule_id:
  rule_name:
  publish_date:
  source_link:
  applicability:
  source_confidence:
  last_reviewed_at:
  review_notes:
  metrics:
    - metric_id:
      target:
      period:
      evidence_needed:
```

读取规则：

- 不再用人工确认卡住员工端使用。
- `publish_date` 为空时，显示“发布时间待补”，但不阻塞 checklist。
- `source_link` 为空时，显示“来源待补”，但允许使用当前录入阈值。
- 每次规则更新必须新增版本，不能覆盖旧版本。
