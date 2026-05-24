# 02 指标字典

指标字典是系统的度量语言。没有指标字典，员工录入的数据只是数字，系统无法判断目标、卡点、动作和复盘。

## 指标定义字段

每个指标至少需要这些字段：

| 字段 | 说明 |
| --- | --- |
| `metric_id` | 稳定唯一 ID，后续代码和映射表引用它。 |
| `metric_name` | 中文名称。 |
| `metric_type` | `official` 官方指标，`business` 经营指标，`capability` 能力指标。 |
| `unit` | `%`、`次`、`人`、`元`、`分`、`款`、`小时`。 |
| `direction` | `higher_better`、`lower_better`、`range_better`。 |
| `period` | 日、周、月、近 7 天、近 30 天、平台特殊周期。 |
| `formula` | 计算口径。没有公式时写明“后台直接取数”。 |
| `data_source_id` | 默认数据来源。 |
| `entry_method` | 手填、XLS 导入、复制表格、截图 OCR、API。 |
| `freshness_requirement` | 数据多久内算有效。 |
| `owner_role` | 谁负责录入或确认。 |
| `employee_influence` | 员工是否能短期影响：高、中、低。 |
| `used_by_goals` | 关联目标。 |
| `risk_if_bad` | 指标差会造成什么经营后果。 |
| `notes` | 口径限制和注意事项。 |

## 第一批核心指标

| 指标 ID | 指标名 | 类型 | 默认来源 | 频率 | 短期可影响 | 主要用途 |
| --- | --- | --- | --- | --- | --- | --- |
| `ww_3min_response_rate` | 旺旺 3 分钟响应率 | official | 服务体验/接待数据 | 每日 | 高 | 服务体验、找工厂、询盘转化 |
| `factory_service_response_rate_30d` | 找工厂服务响应率 | official | 找工厂后台 | 每日/近 30 天 | 中 | 找工厂牌级 |
| `factory_fulfillment_rate_30d` | 找工厂履约率 | official | 找工厂后台 | 每日/近 30 天 | 中 | 找工厂牌级 |
| `custom_trade_points_30d` | 定制交易积分 | official | 找工厂后台 | 每日/近 30 天 | 中 | 找工厂牌级 |
| `contract_payment_rate` | 合约支付率 | official | 交易/找工厂后台 | 每日/近 30 天 | 中 | 找工厂牌级 |
| `monthly_active_small_custom_sku_count` | 月动销小单定制商品数 | official | 商品/交易后台 | 每月 | 中 | 找工厂牌级 |
| `total_exposure` | 总曝光 | business | 生意参谋核心看板 | 每日 | 中 | 流量判断 |
| `ad_exposure` | 广告曝光 | business | 生意参谋核心看板 | 每日 | 高 | 广告依赖判断 |
| `natural_exposure` | 自然曝光 | business | 生意参谋核心看板 | 每日 | 中 | 商品自然流量判断 |
| `visitors` | 访客数 | business | 生意参谋核心看板 | 每日 | 中 | 点击/承接判断 |
| `inquiries` | 询盘数 | business | 生意参谋/客服台账 | 每日 | 高 | 商品信任与客服判断 |
| `payments` | 支付订单数 | business | 生意参谋/交易后台 | 每日 | 中 | 成交判断 |
| `payment_amount` | 支付金额 | business | 生意参谋/交易后台 | 每日 | 中 | GMV 判断 |
| `ad_spend` | 广告消耗 | business | 生意参谋/网销宝 | 每日 | 高 | 投放效率判断 |
| `gross_margin_rate` | 毛利率 | business | 内部利润表 | 周 | 中 | 经营安全底线 |
| `quality_refund_rate` | 品质退款率 | official/business | 售后后台 | 周/近 30 天 | 中 | 商品质量和服务体验 |
| `refund_processing_hours` | 退款处理时长 | official/business | 售后后台 | 每日/近 30 天 | 高 | 服务体验 |
| `lighthouse_score` | 新灯塔总分 | official | 新灯塔 AI 页面 | 每日/每周 | 中 | 服务体验、L 等级、活动准入 |
| `store_service_star_level` | 店铺服务星级 | official | 新灯塔 AI 页面 | 每日/每周 | 中 | 服务体验、买家信任、平台权益 |
| `lighthouse_logistics_score` | 新灯塔物流体验分 | official | 新灯塔 AI 页面 | 每日/每周 | 中 | 发货、履约、物流风险 |
| `lighthouse_after_sales_score` | 新灯塔售后体验分 | official | 新灯塔 AI 页面 | 每日/每周 | 中 | 退款、介入、售后风险 |
| `lighthouse_consult_score` | 新灯塔咨询体验分 | official | 新灯塔 AI 页面 | 每日/每周 | 高 | 客服响应和咨询质量 |
| `lighthouse_product_score` | 新灯塔商品体验分 | official | 新灯塔 AI 页面 | 每日/每周 | 中 | 商品质量、品质退款 |
| `buyer_protection_setup_status` | 买家保障配置状态 | official | 商品编辑页/服务保障页 | 商品新增时/月度 | 低 | 一次性配置状态，不作为日常任务 |
| `buyer_protection_breach_count` | 买家保障承诺异常数 | official/business | 新灯塔/售后/物流 | 每周/异常触发 | 中 | 保障开通后的风险监控 |
| `purchase_index_score` | 商品采购指数 | official | 商品成长后台 | 商品级/每日或每周 | 中 | 商品成长、搜索/推荐扶持、镇店之宝 |
| `purchase_index_4_product_count` | 采购指数4.0商品数 | official | 商品成长后台 | 每周 | 中 | 替代长期金冠品目标，衡量优质商品资产 |
| `new_purchase_index_score` | 新品采购指数 | official | 商品成长后台 | 商品级/新品期 | 中 | 新品成长、人气新品、超级新品 |
| `treasure_product_quota` | 镇店之宝配额 | official | 商品成长/商品中心 | 每周 | 中 | 镇店之宝配置资源 |
| `sop_count_weekly` | 本周 SOP 沉淀数 | capability | 周复盘 | 每周 | 高 | 员工能力 |

## 数据新鲜度原则

| 指标类型 | 建议有效期 | 说明 |
| --- | --- | --- |
| 每日经营指标 | 1 天 | 用于今日作战单，过期则只能参考。 |
| 近 7 天趋势 | 3 天 | 用于 BI 趋势，不适合直接派当天动作。 |
| 近 30 天官方指标 | 7 天 | 官方后台一般滚动变化，可用于目标差距。 |
| 月度指标 | 当月 | 用于阶段判断和牌级冲刺。 |
| 内部毛利 | 7 天 | 毛利口径变动大，不能长期沿用旧值。 |

## 指标使用原则

1. 指标只能表达现象，不能直接等于原因。
2. 官方指标用于判断平台目标，经营指标用于判断生意质量。
3. 指标缺失时，系统优先生成补数据动作。
4. 百分比指标最好保留分子和分母，避免样本量误导。
5. 员工不可短期影响的指标，不应该直接派给员工作为今日任务。
6. `gold_crown_product_count` 仅作为历史/过渡字段保留，长期商品成长目标应转向 `purchase_index_4_product_count` 和商品级 `purchase_index_score`。
