export type RoadmapItem = {
  phase: string;
  goal: string;
  actions: string[];
  checks: string[];
};

export type ReviewModule = {
  name: string;
  watch: string;
  fallback: string;
};

export type Playbook = {
  title: string;
  principle: string;
  steps: string[];
};

export type FactoryBenchmark = {
  category: string;
  factoryName: string;
  city: string;
  level: string;
  repeatRate: string;
  responseRate: string;
  trustSignals: string[];
};

export const roadmap: RoadmapItem[] = [
  {
    phase: "第 1 周",
    goal: "搭出可信店铺底座和项目边界",
    actions: ["确定主类目和买家画像", "设计标题矩阵", "准备详情页、报价和客服模板", "明确负责人、周期和止损线"],
    checks: ["买家能看懂你卖什么", "团队知道这是 90 天实验", "Leon 不做日常操盘"]
  },
  {
    phase: "第 2-4 周",
    goal: "跑通询盘到样品或小单",
    actions: ["优化主图标题", "记录所有询盘问题", "测试样品流程", "完善阶梯报价"],
    checks: ["有有效询盘", "能标准化报价", "能完成样品或小单闭环"]
  },
  {
    phase: "第 2-3 个月",
    goal: "找出主推款、利润款和可复制 SOP",
    actions: ["按询盘和成交筛主推款", "补齐相关场景款", "小预算测试站内流量", "建立客户表、SKU 表和利润表"],
    checks: ["主推款有稳定询盘", "报价转化提升", "交付问题可控", "员工能按 SOP 独立执行"]
  },
  {
    phase: "3 个月以后",
    goal: "判断继续、加码、升级或止损",
    actions: ["固化交付 SOP", "建立老客表", "扩定制款和利润款", "控制广告、库存、售后风险"],
    checks: ["老客开始复购", "单品毛利清晰", "广告和库存不吞利润", "留下客户、数据、SOP、团队能力"]
  }
];

export const weeklyReviewModules: ReviewModule[] = [
  { name: "战略边界", watch: "1688 是否开始占用 Leon 日常注意力", fallback: "降低 Leon 参与深度，只保留关键判断和周复盘" },
  { name: "资产沉淀", watch: "是否留下客户、数据、SOP、话术、利润表", fallback: "把临场经验写成模板" },
  { name: "选品", watch: "哪些款有询盘，哪些款没人问", fallback: "下架无效款，补相邻场景款" },
  { name: "标题", watch: "买家用什么词进来", fallback: "调整核心词、材质词、人群词、场景词" },
  { name: "询盘", watch: "首响速度、有效询盘占比", fallback: "改快捷回复和需求提问模板" },
  { name: "报价", watch: "报价后是否继续沟通", fallback: "改阶梯价、样品政策、含税含运说明" },
  { name: "交付", watch: "延期、错发、售后问题", fallback: "改确认流程、质检流程、供应链配合" },
  { name: "利润", watch: "单品毛利、样品成本、售后成本", fallback: "调价，停推低毛利高风险款" },
  { name: "复购", watch: "老客二次询盘和补货", fallback: "建采购周期提醒和新品推荐" }
];

export const stableProfitRules = [
  "1688 先定义为 90 天现金流实验，不默认升级为主线",
  "只选一个主类目，围绕一个明确买家群做垂直供应店",
  "每个商品页写清楚起订量、阶梯价、拿样、定制、开票、交期、售后边界",
  "客服先问用途、数量、预算、交期，再给三档方案",
  "每周用询盘反馈淘汰无效 SKU，保留能引流、能赚钱、能复购的款",
  "每个成交客户进入老客表，成交后回访，按采购周期提醒补货",
  "每周必须沉淀客户表、SKU 表、关键词表、话术、报价模板、交付 SOP 和利润表",
  "先验证询盘、报价、交付、毛利和组织可执行性，再加大站内投放"
];

export const playbooks: Playbook[] = [
  {
    title: "定位和货盘",
    principle: "不做泛货店，做一个主类目、两到三个相邻场景的垂直供应店。",
    steps: ["定义目标买家", "给 SKU 标注引流、利润、定制、复购角色", "无询盘无毛利的款一周后进入淘汰观察"]
  },
  {
    title: "询盘转化",
    principle: "快速响应只是门槛，关键是用问题把需求问清，再给三档报价。",
    steps: ["先问用途、数量、预算、交期", "报价区分样品价、阶梯价、定制价、含税含运", "把常见问题沉淀为快捷回复"]
  },
  {
    title: "交付控损",
    principle: "成交越快，越要用确认流程保护毛利。",
    steps: ["订单分现货、样品、定制、大货", "确认材质、容量、颜色、印刷、包装和交期", "大单先打样，确认稿留痕"]
  },
  {
    title: "利润和复购",
    principle: "稳定赚钱的分水岭不是有单，而是毛利清楚且老客会回来。",
    steps: ["核算产品、包装、运费、样品、售后、广告成本", "成交后 7 天回访", "30 天和旺季前提醒补货或推荐新品"]
  }
];

export const factoryBenchmarks: FactoryBenchmark[] = [
  {
    category: "保温杯",
    factoryName: "永康市鸿康工贸有限公司",
    city: "金华",
    level: "铜牌工厂",
    repeatRate: "35%",
    responseRate: "63%",
    trustSignals: ["支持来图加工", "支持拿样", "AA诚信等级"]
  },
  {
    category: "保温杯",
    factoryName: "永康市欣俊工贸有限公司",
    city: "金华",
    level: "金牌制造",
    repeatRate: "69%",
    responseRate: "89%",
    trustSignals: ["可开专票", "支持来图加工", "清加工"]
  },
  {
    category: "保温杯",
    factoryName: "武义腾鹰工贸有限公司",
    city: "金华",
    level: "样本店铺",
    repeatRate: "样本标题强",
    responseRate: "90 款商品",
    trustSignals: ["316不锈钢", "大容量", "礼品定制", "跨境户外"]
  },
  {
    category: "保温杯",
    factoryName: "永康市诗妙家居用品有限公司",
    city: "金华",
    level: "样本店铺",
    repeatRate: "相邻类目强",
    responseRate: "150 款商品",
    trustSignals: ["塑料水杯", "咖啡杯", "包装定制", "户外便携"]
  }
];
