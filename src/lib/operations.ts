export type WeeklyMetrics = {
  week: number;
  inquiries: number;
  validInquiryRate: number;
  responseRate: number;
  quoteFollowupRate: number;
  sampleOrders: number;
  grossMarginRate: number;
  repeatPurchaseRate: number;
  deliveryIssueRate: number;
  assetsCompleted: number;
  leonDailyHours: number;
  adSpendShare: number;
};

export type Gap = {
  metric: keyof WeeklyMetrics;
  label: string;
  target: string;
  actual: string;
  severity: "low" | "medium" | "high";
  advice: string;
};

export type Evaluation = {
  score: number;
  level: "healthy" | "watch" | "critical";
  label: "运营健康" | "需要关注" | "需降级";
  summary: string;
  gaps: Gap[];
};

export type RoadmapPhase = {
  name: string;
  focus: string;
  checks: string[];
};

export type KeywordMatrix = {
  category: string;
  columns: Array<{ name: string; words: string[] }>;
  exampleTitles: string[];
};

export type SkuFeedback = {
  name: string;
  inquiries: number;
  grossMarginRate: number;
  repeatOrders: number;
  customizationRequests: number;
};

export type SkuRoleRecommendation = SkuFeedback & {
  role: "引流款" | "利润款" | "定制款" | "复购款" | "淘汰观察";
  reason: string;
};

export type ActionItem = {
  title: string;
  owner: "运营员工" | "客服员工" | "负责人";
  priority: "P0" | "P1" | "P2";
  detail: string;
};

export type MvpGoal =
  | "protect_service"
  | "factory_bronze"
  | "factory_silver"
  | "factory_gold"
  | "l_growth"
  | "lighthouse_repair";

export type MvpMetricInput = {
  goal: MvpGoal;
  shopCategory: "保温杯";
  categoryType: "consumer_goods";
  isFactoryJoined: boolean;
  grossMarginFloor: number;
  ww3MinResponseRate?: number;
  serviceResponseRate30d?: number;
  lateResponseMessages?: number;
  pickupRiskOrders?: number;
  pendingShipmentOrders?: number;
  afterSalesCount?: number;
  factoryFulfillmentRate?: number;
  monthlyActiveSmallCustomSkuCount?: number;
  customTradePoints30d?: number;
  contractPaymentRate?: number;
  qualityRefundRisk?: "normal" | "high";
  problemSkuCount?: number;
  gmvTrend?: "flat" | "up";
  grossMarginRate?: number;
  lowMarginOrderCount?: number;
  weeklySopCount?: number;
};

export type MvpSeedScenario = {
  id: "S1" | "S2" | "S3" | "S4" | "S5";
  title: string;
  input: MvpMetricInput;
};

export type MvpRisk = {
  metricName: string;
  priority: "P0" | "P1" | "P2" | "P3";
  current: string;
  target: string;
  gap: string;
  impact: string;
};

export type MvpTask = {
  id: string;
  title: string;
  priority: "P0" | "P1" | "P2" | "P3";
  metricNames: string[];
  ruleIds: string[];
  todayAction: string;
  evidence: string[];
  reviewQuestion: string;
};

export type MvpDiagnosis = {
  goal: MvpGoal;
  highestRisk: MvpRisk;
  blockers: string[];
  tasks: MvpTask[];
};

export type MvpTaskOutcome = {
  taskId: string;
  result: "effective" | "ineffective" | "watch";
  note: string;
};

export type MvpWeeklyReview = {
  improvedMetrics: string[];
  regressedMetrics: string[];
  effectiveTasks: string[];
  stopActions: string[];
  nextGoals: string[];
  sopCandidate: { title: string; sourceTaskId: string } | null;
};

export type V2GoalId = MvpGoal;

export type V2Cadence = "daily" | "weekly" | "monthly";

export type V2MetricId =
  | "ww_3min_response_rate"
  | "factory_service_response_rate_30d"
  | "pickup_48h_rate_30d"
  | "factory_fulfillment_rate_30d"
  | "monthly_active_small_custom_sku_count"
  | "custom_trade_points_30d"
  | "contract_payment_rate"
  | "gross_margin_rate"
  | "quality_refund_rate"
  | "weekly_sop_count";

export type V2MetricReadingInput = {
  id: V2MetricId;
  value: number;
  period: string;
};

export type V2MetricSnapshot = V2MetricReadingInput & {
  label: string;
  cadence: V2Cadence;
  source: string;
  currentLabel: string;
  target: number | null;
  targetLabel: string;
};

export type V2MetricGap = {
  metricId: V2MetricId;
  metricLabel: string;
  priority: MvpRisk["priority"];
  cadence: V2Cadence;
  current: number;
  target: number;
  currentLabel: string;
  targetLabel: string;
  gapLabel: string;
  source: string;
  whyItMatters: string;
};

export type V2GoalDashboard = {
  goalId: V2GoalId;
  goalLabel: string;
  summary: string;
  readings: V2MetricSnapshot[];
  gaps: V2MetricGap[];
};

export type V2PathStep = {
  id: string;
  title: string;
  metricIds: V2MetricId[];
  formula: string;
  checkpoint: string;
};

export type V2Action = {
  id: string;
  title: string;
  priority: MvpRisk["priority"];
  targetMetricId: V2MetricId;
  cadence: V2Cadence;
  method: string;
  evidence: string[];
  reviewQuestion: string;
  sopState: "candidate" | "validated" | "stopped";
};

export type V2ActionPlan = {
  goalId: V2GoalId;
  pathSteps: V2PathStep[];
  actions: V2Action[];
};

export type V2BacktestResult = {
  actionId: string;
  effect: "effective" | "watch" | "ineffective";
  sopState: V2Action["sopState"];
  beforeLabel: string;
  afterLabel: string;
  summary: string;
};

type MetricRule = {
  metric: keyof WeeklyMetrics;
  label: string;
  target: number;
  direction: "min" | "max";
  weight: number;
  format: "percent" | "number" | "hours";
  advice: string;
};

type V2MetricDefinition = {
  id: V2MetricId;
  label: string;
  cadence: V2Cadence;
  source: string;
  format: "percent" | "count" | "points";
  direction: "min" | "max";
  priority: MvpRisk["priority"];
  sort: number;
  whyItMatters: string;
  targets: Partial<Record<V2GoalId, number>>;
  pathTitle: string;
  checkpoint: string;
  actionTitle: string;
  method: string;
  evidence: string[];
  reviewQuestion: string;
};

const v2GoalLabels: Record<V2GoalId, string> = {
  protect_service: "保基础服务分",
  factory_bronze: "冲找工厂铜牌",
  factory_silver: "冲找工厂银牌",
  factory_gold: "冲找工厂金牌",
  l_growth: "提升 L 等级",
  lighthouse_repair: "修复新灯塔短板"
};

const v2MetricDefinitions: V2MetricDefinition[] = [
  {
    id: "ww_3min_response_rate",
    label: "旺旺 3 分钟响应率",
    cadence: "daily",
    source: "客服接待数据，统计 09:00-21:00 人工或有效 AI 回复",
    format: "percent",
    direction: "min",
    priority: "P0",
    sort: 10,
    whyItMatters: "低于底线会伤害咨询体验，并可能触发平台接待降权风险。",
    targets: {
      protect_service: 0.6,
      factory_bronze: 0.6,
      factory_silver: 0.65,
      factory_gold: 0.7,
      l_growth: 0.6,
      lighthouse_repair: 0.6
    },
    pathTitle: "先保 09:00-21:00 首响",
    checkpoint: "每天收工前看当日 3 分钟响应率和未响应原因。",
    actionTitle: "补齐 09:00-21:00 首响值班和快捷回复",
    method: "把晚回消息按时间段、询盘类型、责任原因归类，补保温杯拿样、定制、现货、发票、交期快捷回复。",
    evidence: ["当日旺旺 3 分钟响应率截图", "未响应原因表", "快捷回复截图"],
    reviewQuestion: "响应慢是提醒、人手、话术，还是低质量询盘占用时间？"
  },
  {
    id: "factory_service_response_rate_30d",
    label: "找工厂服务响应率",
    cadence: "daily",
    source: "找工厂近 30 天服务响应数据",
    format: "percent",
    direction: "min",
    priority: "P0",
    sort: 20,
    whyItMatters: "这是找工厂牌级门槛，响应没过线时冲牌级动作会被卡住。",
    targets: { factory_bronze: 0.6, factory_silver: 0.65, factory_gold: 0.7 },
    pathTitle: "把找工厂响应口径拉回牌级线",
    checkpoint: "每天追近 30 天滚动响应率，不只看当天体感。",
    actionTitle: "追踪找工厂近 30 天未响应咨询",
    method: "把近 30 天未及时响应的找工厂询盘导出，分现货、定制、小单、无效询盘处理。",
    evidence: ["近 30 天服务响应率截图", "未响应询盘清单", "次日补救结果"],
    reviewQuestion: "哪类找工厂询盘最容易漏接？"
  },
  {
    id: "monthly_active_small_custom_sku_count",
    label: "月动销小单定制商品数",
    cadence: "monthly",
    source: "商品与定制成交数据",
    format: "count",
    direction: "min",
    priority: "P1",
    sort: 30,
    whyItMatters: "保温杯冲找工厂需要稳定的小单定制入口，入口不足会拖慢积分和合约支付。",
    targets: { factory_bronze: 3, factory_silver: 3, factory_gold: 3 },
    pathTitle: "补足 3 个可成交的小单定制入口",
    checkpoint: "每周看每个入口是否有询盘、报价、成交或失败原因。",
    actionTitle: "上架或重做 3 个小单定制保温杯入口",
    method: "优先选刻字、LOGO、礼品包装三个方向，写清 MOQ、拿样、打样周期和阶梯价。",
    evidence: ["商品链接", "定制入口截图", "定制询盘数"],
    reviewQuestion: "哪个入口带来真实报价和成交，而不是只带来问价？"
  },
  {
    id: "custom_trade_points_30d",
    label: "定制交易积分",
    cadence: "daily",
    source: "找工厂定制交易积分近 30 天数据",
    format: "points",
    direction: "min",
    priority: "P1",
    sort: 40,
    whyItMatters: "定制交易积分是找工厂牌级升级的规模证明，但不能用亏损订单硬冲。",
    targets: { factory_bronze: 100000, factory_silver: 800000, factory_gold: 1500000 },
    pathTitle: "用合格毛利订单积累定制交易积分",
    checkpoint: "每周核对积分增长是否来自毛利合格订单。",
    actionTitle: "筛选可承接定制积分的订单线索",
    method: "只跟进毛利达标、交期可控、确认稿清楚的定制线索，低毛利订单进入止损池。",
    evidence: ["定制积分截图", "订单毛利表", "有效定制线索清单"],
    reviewQuestion: "积分增长是不是牺牲毛利换来的？"
  },
  {
    id: "factory_fulfillment_rate_30d",
    label: "找工厂履约率",
    cadence: "daily",
    source: "找工厂近 30 天履约数据",
    format: "percent",
    direction: "min",
    priority: "P1",
    sort: 50,
    whyItMatters: "履约率是牌级门槛，也会影响定制买家的可信判断。",
    targets: { factory_bronze: 0.7, factory_silver: 0.75, factory_gold: 0.8 },
    pathTitle: "把定制履约从承诺前置到订单前",
    checkpoint: "每天检查确认稿、物料、交期和物流四个节点。",
    actionTitle: "排查定制订单确认稿和交期风险",
    method: "按材质、容量、颜色、印刷、包装、交期、确认稿七项检查每个定制订单。",
    evidence: ["风险订单清单", "确认稿状态", "预计交付日期"],
    reviewQuestion: "履约风险来自客服乱承诺、库存不准，还是供应链产能不稳？"
  },
  {
    id: "contract_payment_rate",
    label: "合约支付率",
    cadence: "daily",
    source: "找工厂合约支付数据",
    format: "percent",
    direction: "min",
    priority: "P1",
    sort: 60,
    whyItMatters: "合约支付率说明定制成交规范度，影响找工厂升级。",
    targets: { factory_bronze: 0.5, factory_silver: 0.6, factory_gold: 0.7 },
    pathTitle: "把定制成交引导到合约支付",
    checkpoint: "每周复盘未走合约支付的原因。",
    actionTitle: "建立定制报价到合约支付话术",
    method: "报价时同步说明确认稿、交期、售后和合约支付流程，减少线下口头承诺。",
    evidence: ["合约支付率截图", "未走合约订单原因", "报价话术"],
    reviewQuestion: "客户为什么绕开合约支付？"
  },
  {
    id: "pickup_48h_rate_30d",
    label: "近 30 天 48 小时揽收率",
    cadence: "daily",
    source: "物流履约数据",
    format: "percent",
    direction: "min",
    priority: "P0",
    sort: 70,
    whyItMatters: "保温杯属于消费品，物流体验会直接影响服务分、复购和活动权益。",
    targets: { protect_service: 0.95, lighthouse_repair: 0.95, l_growth: 0.95 },
    pathTitle: "物流风险订单日清",
    checkpoint: "每天 16:00 前处理 48 小时内应揽收订单。",
    actionTitle: "完成 48 小时揽收风险订单日清",
    method: "按缺货、待确认、物流异常、承诺错误拆分风险订单，并补当天处理记录。",
    evidence: ["风险订单清单", "已处理订单数", "未处理原因"],
    reviewQuestion: "揽收问题来自库存、承诺、打单，还是物流配合？"
  },
  {
    id: "gross_margin_rate",
    label: "毛利率",
    cadence: "weekly",
    source: "单品毛利表",
    format: "percent",
    direction: "min",
    priority: "P3",
    sort: 80,
    whyItMatters: "增长不能越做越亏，所有冲级和提 L 动作都要守住毛利底线。",
    targets: {
      protect_service: 0.18,
      factory_bronze: 0.18,
      factory_silver: 0.18,
      factory_gold: 0.18,
      l_growth: 0.18,
      lighthouse_repair: 0.18
    },
    pathTitle: "把增长先过毛利底线",
    checkpoint: "每周按 SKU 和订单复核真实毛利。",
    actionTitle: "补单品毛利表并标记低毛利订单",
    method: "拆产品、包装、运费、样品、售后和广告成本，低毛利来源单独标记。",
    evidence: ["单品毛利表", "低毛利订单清单", "调价或停推建议"],
    reviewQuestion: "哪些订单是在用利润换规模？"
  },
  {
    id: "quality_refund_rate",
    label: "品质退款率",
    cadence: "weekly",
    source: "退款与售后原因数据",
    format: "percent",
    direction: "max",
    priority: "P0",
    sort: 90,
    whyItMatters: "品质退款会破坏商品体验、评价、复购和新灯塔表现。",
    targets: { protect_service: 0.02, lighthouse_repair: 0.02, l_growth: 0.02 },
    pathTitle: "先归因品质退款再放大流量",
    checkpoint: "每周按漏水、保温、掉漆、容量、包装、错发归因。",
    actionTitle: "分类品质退款并处理问题 SKU",
    method: "对问题 SKU 做停推、详情页预期修正、供应链整改或售后话术调整。",
    evidence: ["问题 SKU 清单", "售后原因分类", "停推或整改动作"],
    reviewQuestion: "是真品质问题，还是详情页预期管理问题？"
  },
  {
    id: "weekly_sop_count",
    label: "本周 SOP 新增数",
    cadence: "weekly",
    source: "周复盘记录",
    format: "count",
    direction: "min",
    priority: "P3",
    sort: 100,
    whyItMatters: "动作不沉淀，员工下周会继续重复救火。",
    targets: {
      protect_service: 1,
      factory_bronze: 1,
      factory_silver: 1,
      factory_gold: 1,
      l_growth: 1,
      lighthouse_repair: 1
    },
    pathTitle: "把有效动作沉淀成 SOP",
    checkpoint: "每周只沉淀 1 条真正被数据验证过的动作。",
    actionTitle: "从有效动作中沉淀 1 条 SOP",
    method: "写清适用场景、操作步骤、所需截图、失败停止条件和复盘频率。",
    evidence: ["SOP 标题", "适用场景", "操作步骤"],
    reviewQuestion: "这条 SOP 下周换人执行还会有效吗？"
  }
];

const rules: MetricRule[] = [
  {
    metric: "leonDailyHours",
    label: "Leon 日常介入",
    target: 1,
    direction: "max",
    weight: 30,
    format: "hours",
    advice: "把 Leon 从客服、上架、跟单中移出，只保留关键判断和周复盘。"
  },
  {
    metric: "grossMarginRate",
    label: "单品毛利率",
    target: 0.18,
    direction: "min",
    weight: 20,
    format: "percent",
    advice: "重新核算产品、包装、运费、样品、售后和广告成本，低毛利款调价或停推。"
  },
  {
    metric: "deliveryIssueRate",
    label: "交付问题率",
    target: 0.08,
    direction: "max",
    weight: 18,
    format: "percent",
    advice: "现货、样品、定制、大货分流程管理，大单先打样，确认稿留痕。"
  },
  {
    metric: "validInquiryRate",
    label: "有效询盘占比",
    target: 0.45,
    direction: "min",
    weight: 14,
    format: "percent",
    advice: "重做标题、主图和详情页，把起订量、拿样、定制、开票、交期前置。"
  },
  {
    metric: "quoteFollowupRate",
    label: "报价后继续沟通率",
    target: 0.35,
    direction: "min",
    weight: 12,
    format: "percent",
    advice: "客服先问用途、数量、预算、交期，再给三档方案和清楚的阶梯价。"
  },
  {
    metric: "assetsCompleted",
    label: "资产沉淀数量",
    target: 5,
    direction: "min",
    weight: 10,
    format: "number",
    advice: "补齐客户表、SKU 表、关键词表、报价模板、客服话术、交付 SOP 和利润表。"
  },
  {
    metric: "repeatPurchaseRate",
    label: "老客复购率",
    target: 0.15,
    direction: "min",
    weight: 8,
    format: "percent",
    advice: "成交后 7 天回访，30 天提醒补货，旺季前做备货提醒。"
  },
  {
    metric: "adSpendShare",
    label: "广告占销售比",
    target: 0.12,
    direction: "max",
    weight: 8,
    format: "percent",
    advice: "先验证询盘、报价、交付和毛利，再放大站内投放。"
  },
  {
    metric: "responseRate",
    label: "客服响应率",
    target: 0.9,
    direction: "min",
    weight: 6,
    format: "percent",
    advice: "设置首响值班和快捷回复，优先保障有效询盘。"
  }
];

export function buildV2GoalDashboard(goalId: V2GoalId, readings: V2MetricReadingInput[]): V2GoalDashboard {
  const snapshots = readings
    .map((reading) => {
      const definition = getV2MetricDefinition(reading.id);
      const target = definition.targets[goalId] ?? null;
      return {
        ...reading,
        label: definition.label,
        cadence: definition.cadence,
        source: definition.source,
        currentLabel: formatV2MetricValue(reading.value, definition.format),
        target,
        targetLabel: target === null ? "不适用" : formatV2MetricValue(target, definition.format)
      };
    })
    .sort((left, right) => getV2MetricDefinition(left.id).sort - getV2MetricDefinition(right.id).sort);

  const gaps = snapshots
    .map((snapshot) => {
      if (snapshot.target === null) return null;
      const definition = getV2MetricDefinition(snapshot.id);
      const isGap =
        definition.direction === "min" ? snapshot.value < snapshot.target : snapshot.value > snapshot.target;
      if (!isGap) return null;

      return {
        metricId: snapshot.id,
        metricLabel: definition.label,
        priority: definition.priority,
        cadence: definition.cadence,
        current: snapshot.value,
        target: snapshot.target,
        currentLabel: snapshot.currentLabel,
        targetLabel: snapshot.targetLabel,
        gapLabel: formatV2Gap(snapshot.value, snapshot.target, definition),
        source: definition.source,
        whyItMatters: definition.whyItMatters
      };
    })
    .filter((gap): gap is V2MetricGap => gap !== null)
    .sort(
      (left, right) =>
        priorityRank(right.priority) - priorityRank(left.priority) ||
        getV2MetricDefinition(left.metricId).sort - getV2MetricDefinition(right.metricId).sort
    );

  return {
    goalId,
    goalLabel: v2GoalLabels[goalId],
    summary:
      gaps.length === 0
        ? "当前录入数据未发现目标缺口，适合进入周复盘和 SOP 固化。"
        : `当前有 ${gaps.length} 个目标缺口，先处理 ${gaps[0].metricLabel}。`,
    readings: snapshots,
    gaps
  };
}

export function buildV2ActionPlan(dashboard: V2GoalDashboard): V2ActionPlan {
  const gapsForAction = dashboard.gaps.slice(0, 5);
  return {
    goalId: dashboard.goalId,
    pathSteps: gapsForAction.map((gap) => {
      const definition = getV2MetricDefinition(gap.metricId);
      return {
        id: `path-${definition.id}`,
        title: definition.pathTitle,
        metricIds: [definition.id],
        formula: `目标 ${dashboard.goalLabel} = 数据 ${definition.label}${gap.currentLabel}/${gap.targetLabel} + 路径 ${definition.pathTitle} + 证据回测`,
        checkpoint: definition.checkpoint
      };
    }),
    actions: gapsForAction.map((gap) => {
      const definition = getV2MetricDefinition(gap.metricId);
      return {
        id: `action-${definition.id}`,
        title: definition.actionTitle,
        priority: definition.priority,
        targetMetricId: definition.id,
        cadence: definition.cadence,
        method: definition.method,
        evidence: definition.evidence,
        reviewQuestion: definition.reviewQuestion,
        sopState: "candidate"
      };
    })
  };
}

export function backtestV2Action(action: V2Action, before: number, after: number): V2BacktestResult {
  const definition = getV2MetricDefinition(action.targetMetricId);
  const delta = definition.direction === "min" ? after - before : before - after;
  const effect: V2BacktestResult["effect"] = delta >= 0.05 ? "effective" : delta > 0 ? "watch" : "ineffective";
  const sopState: V2Action["sopState"] =
    effect === "effective" ? "validated" : effect === "ineffective" ? "stopped" : "candidate";
  const beforeLabel = formatV2MetricValue(before, definition.format);
  const afterLabel = formatV2MetricValue(after, definition.format);

  return {
    actionId: action.id,
    effect,
    sopState,
    beforeLabel,
    afterLabel,
    summary: `${definition.label} ${beforeLabel} -> ${afterLabel}，${formatV2Effect(effect)}。`
  };
}

export function evaluateOperations(metrics: WeeklyMetrics): Evaluation {
  const gaps = rules
    .map((rule) => buildGap(rule, metrics[rule.metric]))
    .filter((gap): gap is Gap & { penalty: number } => gap !== null)
    .sort((left, right) => severityRank(right.severity) - severityRank(left.severity) || right.penalty - left.penalty);

  const penalty = gaps.reduce((sum, gap) => sum + gap.penalty, 0);
  const boundaryRisk = metrics.leonDailyHours > 2;
  const profitRisk = metrics.grossMarginRate < 0.12 || metrics.deliveryIssueRate > 0.16;
  const score = Math.max(0, Math.round(100 - penalty - (boundaryRisk ? 18 : 0) - (profitRisk ? 12 : 0)));
  const level = score < 60 || boundaryRisk || profitRisk ? "critical" : score < 75 ? "watch" : "healthy";

  return {
    score,
    level,
    label: level === "critical" ? "需降级" : level === "watch" ? "需要关注" : "运营健康",
    summary: buildSummary(level),
    gaps: gaps.map(({ penalty: _penalty, ...gap }) => gap)
  };
}

function buildGap(rule: MetricRule, actual: number): (Gap & { penalty: number }) | null {
  const ratio = rule.direction === "min" ? actual / rule.target : rule.target / Math.max(actual, 0.01);
  if (ratio >= 1) return null;

  const miss = 1 - ratio;
  const severity = miss > 0.55 ? "high" : miss > 0.25 ? "medium" : "low";

  return {
    metric: rule.metric,
    label: rule.label,
    target: formatValue(rule.target, rule.format),
    actual: formatValue(actual, rule.format),
    severity,
    advice: rule.advice,
    penalty: rule.weight * miss
  };
}

function formatValue(value: number, format: MetricRule["format"]): string {
  if (format === "percent") return `${Math.round(value * 100)}%`;
  if (format === "hours") return `${value} 小时/天`;
  return `${value}`;
}

function getV2MetricDefinition(id: V2MetricId): V2MetricDefinition {
  const definition = v2MetricDefinitions.find((item) => item.id === id);
  if (!definition) throw new Error(`Unknown V2 metric: ${id}`);
  return definition;
}

function formatV2MetricValue(value: number, format: V2MetricDefinition["format"]): string {
  if (format === "percent") return `${Math.round(value * 100)}%`;
  if (format === "points") return `${Math.round(value).toLocaleString("zh-CN")}`;
  return `${value}`;
}

function formatV2Gap(current: number, target: number, definition: V2MetricDefinition): string {
  const rawGap = definition.direction === "min" ? target - current : current - target;
  if (definition.format === "percent") return `差 ${Math.round(rawGap * 100)} 个百分点`;
  if (definition.format === "points") return `差 ${Math.round(rawGap).toLocaleString("zh-CN")} 分`;
  return `差 ${rawGap}`;
}

function formatV2Effect(effect: V2BacktestResult["effect"]): string {
  if (effect === "effective") return "动作有效，可进入 SOP 验证";
  if (effect === "watch") return "有改善但证据不足，继续观察";
  return "未改善，应停止或换打法";
}

function severityRank(severity: Gap["severity"]): number {
  return severity === "high" ? 3 : severity === "medium" ? 2 : 1;
}

function buildSummary(level: Evaluation["level"]): string {
  if (level === "critical") return "项目出现战略边界或利润交付风险，本周应考虑降级或止损，先保毛利和组织注意力。";
  if (level === "watch") return "项目有可跑数据，但至少一个关键链路拖慢稳定赚钱，需要本周纠偏。";
  return "询盘、报价、交付和毛利处于可继续实验状态，重点补齐复购和资产沉淀。";
}

export function getRoadmapPhase(week: number): RoadmapPhase {
  if (week <= 1) {
    return {
      name: "第 1 周：可信店铺底座",
      focus: "确定主类目、买家画像、项目边界、详情页和报价模板。",
      checks: ["买家能看懂供应能力", "负责人、周期、止损线清楚", "Leon 不日常操盘"]
    };
  }

  if (week <= 4) {
    return {
      name: "第 2-4 周：询盘到样品闭环",
      focus: "优化主图标题，记录询盘问题，跑通样品和小单流程。",
      checks: ["有有效询盘", "报价能标准化", "样品或小单能闭环"]
    };
  }

  if (week <= 12) {
    return {
      name: "第 2-3 个月：主推款和 SOP",
      focus: "筛主推款、利润款，建立客户表、SKU 表和利润表。",
      checks: ["主推款有稳定询盘", "报价转化提升", "员工能按 SOP 独立执行"]
    };
  }

  return {
    name: "3 个月以后：复购和战略判断",
    focus: "固化交付 SOP，扩定制款和利润款，判断继续、加码、升级或止损。",
    checks: ["老客开始复购", "单品毛利清晰", "留下客户、数据、SOP、团队能力"]
  };
}

export function buildKeywordMatrix(category: string): KeywordMatrix {
  const columns = [
    { name: "核心词", words: [category, "水杯", "保温壶"] },
    { name: "材质词", words: ["316不锈钢", "304不锈钢", "tritan"] },
    { name: "人群词", words: ["商务礼品", "学生", "儿童", "女士"] },
    { name: "场景词", words: ["户外", "车载", "跨境", "企业采购"] },
    { name: "功能词", words: ["大容量", "茶水分离", "可刻字", "批发"] }
  ];

  return {
    category,
    columns,
    exampleTitles: [
      `316不锈钢${category} 大容量 商务礼品定制 可刻字 批发`,
      `${category} 304不锈钢 茶水分离 车载户外 企业采购`,
      `儿童${category} 学生水杯 支持拿样 包装定制 批发`
    ]
  };
}

export function recommendSkuRoles(items: SkuFeedback[]): SkuRoleRecommendation[] {
  return items.map((item) => {
    if (item.customizationRequests >= 5 && item.grossMarginRate >= 0.18) {
      return { ...item, role: "定制款", reason: "定制需求高且毛利可承接大货报价。" };
    }

    if (item.repeatOrders >= 3) {
      return { ...item, role: "复购款", reason: "复购反馈更强，应稳定库存、规格和交期。" };
    }

    if (item.grossMarginRate >= 0.28) {
      return { ...item, role: "利润款", reason: "毛利空间好，适合承接报价转化。" };
    }

    if (item.inquiries >= 10) {
      return { ...item, role: "引流款", reason: "询盘强但利润有限，控制价格边界。" };
    }

    return { ...item, role: "淘汰观察", reason: "询盘、毛利和复购都不突出，继续观察一周。" };
  });
}

export function createActionQueue(evaluation: Evaluation): ActionItem[] {
  const actions = evaluation.gaps.map<ActionItem>((gap) => {
    if (gap.metric === "leonDailyHours") {
      return {
        title: "把 Leon 从日常客服、上架、跟单中移出",
        owner: "负责人",
        priority: "P0",
        detail: gap.advice
      };
    }

    if (gap.metric === "assetsCompleted") {
      return {
        title: "补齐客户、SKU、关键词、话术和利润表资产",
        owner: "运营员工",
        priority: "P1",
        detail: gap.advice
      };
    }

    if (gap.metric === "quoteFollowupRate" || gap.metric === "validInquiryRate") {
      return {
        title: "重写客服首响和三档报价模板",
        owner: "运营员工",
        priority: gap.severity === "high" ? "P0" : "P1",
        detail: gap.advice
      };
    }

    if (gap.metric === "deliveryIssueRate") {
      return {
        title: "按订单类型重建交付确认清单",
        owner: "客服员工",
        priority: "P0",
        detail: gap.advice
      };
    }

    if (gap.metric === "grossMarginRate" || gap.metric === "adSpendShare") {
      return {
        title: "重算单品毛利并暂停低质投放",
        owner: "负责人",
        priority: gap.severity === "high" ? "P0" : "P1",
        detail: gap.advice
      };
    }

    return {
      title: `${gap.label}纠偏`,
      owner: "运营员工",
      priority: "P2",
      detail: gap.advice
    };
  });

  return dedupeActions(actions);
}

export const mvpSeedScenarios: MvpSeedScenario[] = [
  {
    id: "S1",
    title: "响应率低",
    input: {
      goal: "factory_bronze",
      shopCategory: "保温杯",
      categoryType: "consumer_goods",
      isFactoryJoined: true,
      grossMarginFloor: 0.18,
      ww3MinResponseRate: 0.52,
      serviceResponseRate30d: 0.55,
      lateResponseMessages: 20,
      weeklySopCount: 0
    }
  },
  {
    id: "S2",
    title: "48 小时揽收风险",
    input: {
      goal: "protect_service",
      shopCategory: "保温杯",
      categoryType: "consumer_goods",
      isFactoryJoined: false,
      grossMarginFloor: 0.18,
      pickupRiskOrders: 8,
      pendingShipmentOrders: 23,
      afterSalesCount: 3
    }
  },
  {
    id: "S3",
    title: "小单定制不足",
    input: {
      goal: "factory_bronze",
      shopCategory: "保温杯",
      categoryType: "consumer_goods",
      isFactoryJoined: true,
      grossMarginFloor: 0.18,
      monthlyActiveSmallCustomSkuCount: 1,
      customTradePoints30d: 60000,
      contractPaymentRate: 0.45
    }
  },
  {
    id: "S4",
    title: "品质退款上升",
    input: {
      goal: "l_growth",
      shopCategory: "保温杯",
      categoryType: "consumer_goods",
      isFactoryJoined: true,
      grossMarginFloor: 0.18,
      qualityRefundRisk: "high",
      afterSalesCount: 6,
      problemSkuCount: 2
    }
  },
  {
    id: "S5",
    title: "GMV 增长但毛利低",
    input: {
      goal: "l_growth",
      shopCategory: "保温杯",
      categoryType: "consumer_goods",
      isFactoryJoined: true,
      grossMarginFloor: 0.18,
      gmvTrend: "up",
      grossMarginRate: 0.11,
      lowMarginOrderCount: 5
    }
  }
];

export function diagnoseMvp(input: MvpMetricInput): MvpDiagnosis {
  const findings = [
    diagnoseResponse(input),
    diagnosePickup(input),
    diagnoseFactoryFulfillment(input),
    diagnoseSmallCustomSku(input),
    diagnoseQualityRefund(input),
    diagnoseLowMargin(input),
    diagnoseSop(input)
  ].filter((diagnosis): diagnosis is MvpDiagnosis => diagnosis !== null);

  if (findings.length === 0) {
    return {
      goal: input.goal,
      highestRisk: {
        metricName: "本轮目标",
        priority: "P3",
        current: "达标",
        target: "保持",
        gap: "0",
        impact: "当前无高风险项，适合沉淀 SOP 或做周复盘。"
      },
      blockers: [],
      tasks: [
        {
          id: "T20",
          title: "从本周有效动作中沉淀 1 条 SOP",
          priority: "P3",
          metricNames: ["SOP 沉淀数"],
          ruleIds: ["R20"],
          todayAction: "选择 1 个有效动作，写清适用场景、操作步骤和证据要求。",
          evidence: ["SOP 标题", "适用场景", "操作步骤"],
          reviewQuestion: "这周留下了什么以后能复用的东西？"
        }
      ]
    };
  }

  return findings.reduce((winner, diagnosis) =>
    priorityRank(diagnosis.highestRisk.priority) > priorityRank(winner.highestRisk.priority) ? diagnosis : winner
  );
}

export function createMvpWeeklyReview(diagnosis: MvpDiagnosis, outcomes: MvpTaskOutcome[]): MvpWeeklyReview {
  const taskById = new Map(diagnosis.tasks.map((task) => [task.id, task]));
  const effectiveTasks = outcomes
    .filter((outcome) => outcome.result === "effective")
    .map((outcome) => taskById.get(outcome.taskId)?.title)
    .filter((title): title is string => Boolean(title));
  const stopActions = outcomes
    .filter((outcome) => outcome.result === "ineffective")
    .map((outcome) => taskById.get(outcome.taskId)?.title)
    .filter((title): title is string => Boolean(title));

  return {
    improvedMetrics: effectiveTasks.length > 0 ? diagnosis.tasks[0].metricNames : [],
    regressedMetrics: diagnosis.highestRisk.priority === "P0" ? [diagnosis.highestRisk.metricName] : [],
    effectiveTasks,
    stopActions,
    nextGoals: buildNextGoals(diagnosis),
    sopCandidate:
      effectiveTasks.length > 0
        ? {
            title: `${diagnosis.tasks[0].title} SOP`,
            sourceTaskId: diagnosis.tasks[0].id
          }
        : null
  };
}

function diagnoseResponse(input: MvpMetricInput): MvpDiagnosis | null {
  const responseRate = input.ww3MinResponseRate ?? 1;
  const serviceRate = input.serviceResponseRate30d ?? 1;
  if (responseRate >= 0.6 && serviceRate >= 0.6) return null;

  return {
    goal: input.goal,
    highestRisk: {
      metricName: "旺旺 3 分钟响应率",
      priority: "P0",
      current: `${Math.round(responseRate * 100)}%`,
      target: "60%",
      gap: `${Math.round((responseRate - 0.6) * 100)}%`,
      impact: "影响咨询体验、找工厂服务响应、搜索推荐、活动权益。"
    },
    blockers: ["响应率未回到目标前，不优先做商品标题优化。"],
    tasks: [
      {
        id: "T01",
        title: "补齐 09:00-21:00 客服响应机制",
        priority: "P0",
        metricNames: ["旺旺 3 分钟响应率", "找工厂服务响应率"],
        ruleIds: ["R01", "R02"],
        todayAction: "检查未响应消息，补 20 条保温杯快捷回复，开启手机提醒。",
        evidence: ["未响应原因清单", "快捷回复截图", "当日响应率"],
        reviewQuestion: "响应慢是人手问题、提醒问题、话术问题，还是低质量询盘过多？"
      },
      {
        id: "T02",
        title: "复盘低质量询盘占用客服时间",
        priority: "P1",
        metricNames: ["有效询盘率", "旺旺 3 分钟响应率"],
        ruleIds: ["R13"],
        todayAction: "把 20 条最近询盘按现货、拿样、定制、礼品、低质量分类。",
        evidence: ["询盘分类表", "低质量询盘来源商品"],
        reviewQuestion: "低质量询盘来自哪些标题或商品？"
      }
    ]
  };
}

function diagnosePickup(input: MvpMetricInput): MvpDiagnosis | null {
  if ((input.pickupRiskOrders ?? 0) <= 0 && (input.pendingShipmentOrders ?? 0) <= 12) return null;

  return {
    goal: input.goal,
    highestRisk: {
      metricName: "48 小时揽收风险订单",
      priority: "P0",
      current: `${input.pickupRiskOrders ?? 0} 单`,
      target: "0 单",
      gap: `+${input.pickupRiskOrders ?? 0} 单`,
      impact: "影响消费品物流体验、商品成长、活动权益和复购。"
    },
    blockers: ["揽收风险未解除前，不推复杂定制和大促动作。"],
    tasks: [
      {
        id: "T03",
        title: "完成 48 小时揽收风险订单日清",
        priority: "P0",
        metricNames: ["48 小时揽收率", "发货物流退款率"],
        ruleIds: ["R03"],
        todayAction: "排查 48 小时内需揽收订单，标记缺货、待确认、物流异常。",
        evidence: ["风险订单清单", "已处理订单数", "未处理原因"],
        reviewQuestion: "揽收问题来自库存不准、承诺不准，还是物流配合不准？"
      }
    ]
  };
}

function diagnoseFactoryFulfillment(input: MvpMetricInput): MvpDiagnosis | null {
  const target = factoryFulfillmentTarget(input.goal);
  if (!target || (input.factoryFulfillmentRate ?? 1) >= target) return null;

  return {
    goal: input.goal,
    highestRisk: {
      metricName: "找工厂履约率",
      priority: "P1",
      current: `${Math.round((input.factoryFulfillmentRate ?? 0) * 100)}%`,
      target: `${Math.round(target * 100)}%`,
      gap: `${Math.round(((input.factoryFulfillmentRate ?? 0) - target) * 100)}%`,
      impact: "影响找工厂牌级升级和定制订单交付可信度。"
    },
    blockers: ["未达铜牌履约底线时，不建议冲银牌或金牌。"],
    tasks: [
      {
        id: "T04",
        title: "排查定制订单交期和确认稿",
        priority: "P1",
        metricNames: ["找工厂履约率"],
        ruleIds: ["R04"],
        todayAction: "检查定制订单材质、容量、颜色、印刷、包装、交期和确认稿。",
        evidence: ["风险订单", "确认状态", "预计交付日期"],
        reviewQuestion: "履约问题来自前端乱承诺还是后端产能不稳？"
      }
    ]
  };
}

function diagnoseSmallCustomSku(input: MvpMetricInput): MvpDiagnosis | null {
  if (!input.goal.startsWith("factory") || (input.monthlyActiveSmallCustomSkuCount ?? 3) >= 3) return null;

  return {
    goal: input.goal,
    highestRisk: {
      metricName: "月动销小单定制商品数",
      priority: "P1",
      current: `${input.monthlyActiveSmallCustomSkuCount ?? 0} 款`,
      target: "3 款",
      gap: `${(input.monthlyActiveSmallCustomSkuCount ?? 0) - 3} 款`,
      impact: "找工厂冲级入口不足，定制交易积分和合约支付也会被拖慢。"
    },
    blockers: ["不足 3 款小单定制入口时，冲牌级任务优先级提升。"],
    tasks: [
      {
        id: "T09",
        title: "补齐 3 个小单定制保温杯入口",
        priority: "P1",
        metricNames: ["月动销小单定制商品数", "定制交易积分"],
        ruleIds: ["R09"],
        todayAction: "选择 3 个适合刻字或印 LOGO 的保温杯款，补 MOQ、拿样、打样周期。",
        evidence: ["商品链接", "定制入口截图", "今日定制询盘数"],
        reviewQuestion: "哪种定制入口最容易拿到小单？"
      }
    ]
  };
}

function diagnoseQualityRefund(input: MvpMetricInput): MvpDiagnosis | null {
  if (input.qualityRefundRisk !== "high") return null;

  return {
    goal: input.goal,
    highestRisk: {
      metricName: "品质退款率",
      priority: "P0",
      current: "高于警戒线",
      target: "回到警戒线内",
      gap: "待归因",
      impact: "影响商品体验、评价、复购和平台权益。"
    },
    blockers: ["品质退款未归因前，不建议扩大主推款流量。"],
    tasks: [
      {
        id: "T06",
        title: "分类品质退款并处理问题 SKU",
        priority: "P0",
        metricNames: ["品质退款率", "品质问题率"],
        ruleIds: ["R06"],
        todayAction: "按漏水、保温、掉漆、容量、包装、错发分类售后原因。",
        evidence: ["问题 SKU", "问题类型", "停推/补说明/换供应链动作"],
        reviewQuestion: "是产品真问题，还是详情页预期管理问题？"
      }
    ]
  };
}

function diagnoseLowMargin(input: MvpMetricInput): MvpDiagnosis | null {
  if (input.gmvTrend !== "up" || (input.grossMarginRate ?? 1) >= input.grossMarginFloor) return null;

  return {
    goal: input.goal,
    highestRisk: {
      metricName: "毛利率",
      priority: "P3",
      current: `${Math.round((input.grossMarginRate ?? 0) * 100)}%`,
      target: `${Math.round(input.grossMarginFloor * 100)}%`,
      gap: `${Math.round(((input.grossMarginRate ?? 0) - input.grossMarginFloor) * 100)}%`,
      impact: "增长质量不合格，GMV 越高可能亏得越多。"
    },
    blockers: ["毛利低于底线，不建议继续冲 GMV 或定制交易积分。"],
    tasks: [
      {
        id: "T15",
        title: "补单品毛利表并标记低毛利订单",
        priority: "P3",
        metricNames: ["毛利率"],
        ruleIds: ["R15"],
        todayAction: "拆产品、包装、运费、样品、售后、广告成本，标记低毛利订单来源。",
        evidence: ["单品毛利率", "低毛利原因", "调价或停推建议"],
        reviewQuestion: "哪些订单是在用利润换规模？"
      }
    ]
  };
}

function diagnoseSop(input: MvpMetricInput): MvpDiagnosis | null {
  if ((input.weeklySopCount ?? 1) >= 1) return null;

  return {
    goal: input.goal,
    highestRisk: {
      metricName: "SOP 沉淀数",
      priority: "P3",
      current: "0",
      target: "1",
      gap: "-1",
      impact: "经验没有沉淀，员工下周仍会重复救火。"
    },
    blockers: ["没有 SOP 的周复盘不算完成。"],
    tasks: [
      {
        id: "T20",
        title: "从本周有效动作中沉淀 1 条 SOP",
        priority: "P3",
        metricNames: ["SOP 沉淀数"],
        ruleIds: ["R20"],
        todayAction: "从本周有效动作中选择一个，写清适用场景、步骤和证据。",
        evidence: ["SOP 标题", "适用场景", "操作步骤"],
        reviewQuestion: "这周留下了什么以后能复用的东西？"
      }
    ]
  };
}

function buildNextGoals(diagnosis: MvpDiagnosis): string[] {
  if (diagnosis.highestRisk.priority === "P0") return ["修复 P0 服务风险", "完成今日阻断任务", "沉淀 1 条 SOP"];
  if (diagnosis.goal.startsWith("factory")) return ["补齐找工厂短板", "保护毛利底线", "沉淀定制 SOP"];
  return ["修复经营底线", "停止低效动作", "沉淀 1 条 SOP"];
}

function priorityRank(priority: MvpRisk["priority"]): number {
  if (priority === "P0") return 4;
  if (priority === "P1") return 3;
  if (priority === "P2") return 2;
  return 1;
}

function factoryFulfillmentTarget(goal: MvpGoal): number | null {
  if (goal === "factory_bronze") return 0.7;
  if (goal === "factory_silver") return 0.75;
  if (goal === "factory_gold") return 0.8;
  return null;
}

function dedupeActions(actions: ActionItem[]): ActionItem[] {
  const seen = new Set<string>();
  return actions.filter((action) => {
    if (seen.has(action.title)) return false;
    seen.add(action.title);
    return true;
  });
}
