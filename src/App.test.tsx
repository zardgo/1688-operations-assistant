import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as XLSX from "xlsx";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

function createTestLocalStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => Array.from(data.keys())[index] ?? null,
    removeItem: (key) => data.delete(key),
    setItem: (key, value) => data.set(key, String(value))
  };
}

describe("1688 operations assistant UI", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: createTestLocalStorage(),
      configurable: true
    });
  });

  it("uses an operations workspace shell inspired by focused productivity dashboards", () => {
    render(<App />);

    expect(screen.getByRole("complementary", { name: "工作区导航" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "1688 运营助手" })).toBeInTheDocument();
    expect(screen.getByText("运营情报看板")).toBeInTheDocument();
    expect(screen.getByText("今日优先")).toBeInTheDocument();
    expect(screen.getByText("执行闭环")).toBeInTheDocument();
    expect(screen.getByText("数据 → 诊断 → 动作 → 复盘")).toBeInTheDocument();
  });

  it("renders a quieter operations shell without dashboard chrome overload", () => {
    render(<App />);

    expect(screen.getByText("运营情报看板")).toBeInTheDocument();
    expect(screen.queryByRole("toolbar", { name: "情报控制栏" })).not.toBeInTheDocument();
    expect(screen.queryByText("METRIC")).not.toBeInTheDocument();
    expect(screen.queryByText("BRIEFING NOTE")).not.toBeInTheDocument();
  });

  it("opens on a readable today task page with one primary goal, checklist, and collapsed context", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("button", { name: "今日任务" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "今天先处理：旺旺 3 分钟响应率" })).toBeInTheDocument();
    expect(screen.getByText("当前 52%，目标 60%，差 8 个百分点")).toBeInTheDocument();
    expect(screen.getByText("原因：低于底线会伤害咨询体验，并可能触发平台接待降权风险。")).toBeInTheDocument();
    expect(screen.getByText("已完成 0/2")).toBeInTheDocument();
    expect(screen.getByText("最大卡点")).toBeInTheDocument();
    expect(screen.getByText("明日验证指标")).toBeInTheDocument();
    expect(screen.getAllByText("旺旺 3 分钟响应率").length).toBeGreaterThan(1);
    expect(screen.getByText("今天只处理 2 件事")).toBeInTheDocument();
    expect(screen.getByText("补齐 09:00-21:00 首响值班和快捷回复")).toBeInTheDocument();
    expect(screen.getByText("追踪找工厂近 30 天未响应咨询")).toBeInTheDocument();
    expect(screen.getAllByText("负责人：客服员工").length).toBeGreaterThan(0);
    expect(screen.getByRole("checkbox", { name: "完成：补齐 09:00-21:00 首响值班和快捷回复" })).toBeInTheDocument();
    expect(screen.getByText("规则依据")).toBeInTheDocument();
    expect(screen.getByText("昨日复盘")).toBeInTheDocument();
    expect(screen.queryByText("来源待补")).not.toBeInTheDocument();
    expect(screen.getAllByText("明天验证：旺旺 3 分钟响应率是否从 52% 回升到 60% 以上。").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("checkbox", { name: "完成：补齐 09:00-21:00 首响值班和快捷回复" }));

    expect(screen.getByText("已完成 1/2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "录入今日数据" }));

    expect(screen.getByRole("heading", { name: "录入今天的数据" })).toBeInTheDocument();
  });

  it("shows response-rate peer benchmarks without catch-up calculation clutter", () => {
    render(<App />);

    expect(screen.getByText("同行基准")).toBeInTheDocument();
    expect(screen.getByText("当前 52%")).toBeInTheDocument();
    expect(screen.getByText("同行平均 69.5%")).toBeInTheDocument();
    expect(screen.getByText("同行优秀 97.1%")).toBeInTheDocument();
    expect(screen.queryByText(/还需/)).not.toBeInTheDocument();
    expect(screen.queryByText(/小号刷回复/)).not.toBeInTheDocument();
  });

  it("shows only six primary navigation items", () => {
    render(<App />);

    const nav = screen.getByRole("navigation", { name: "主导航" });
    expect(nav.querySelectorAll("button")).toHaveLength(6);
    expect(screen.getByRole("button", { name: "今日任务" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "数据录入" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "卡点诊断" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "商品诊断" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "动作复盘" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "规则维护" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "路径拆解" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "动作回测" })).not.toBeInTheDocument();
  });

  it("persists completed today actions after remounting", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole("checkbox", { name: "完成：补齐 09:00-21:00 首响值班和快捷回复" }));
    expect(screen.getByText("已完成 1/2")).toBeInTheDocument();

    unmount();
    render(<App />);

    expect(screen.getByText("已完成 1/2")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "完成：补齐 09:00-21:00 首响值班和快捷回复" })).toBeChecked();
  });

  it("shows the V2 operating loop and updates goal gaps from entered data", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("heading", { name: "1688 运营助手" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "今日任务" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "数据录入" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "数据录入" }));

    const responseInput = screen.getByLabelText("旺旺 3 分钟响应率");
    await user.clear(responseInput);
    await user.type(responseInput, "61");
    await user.click(screen.getByRole("button", { name: "卡点诊断" }));

    expect(screen.queryByText("旺旺 3 分钟响应率差 8 个百分点")).not.toBeInTheDocument();
    expect(screen.getByText("找工厂服务响应率差 5 个百分点")).toBeInTheDocument();
    expect(screen.getByText("适用规则版本")).toBeInTheDocument();
    expect(screen.getByText("找工厂铜牌规则")).toBeInTheDocument();
  });

  it("shows a data import workspace for 生意参谋 xls and product list data", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "数据录入" }));

    expect(screen.getByRole("heading", { name: "录入今天的数据" })).toBeInTheDocument();
    expect(screen.getByText("先导入，再补录，最后让系统生成今日任务。")).toBeInTheDocument();
    expect(screen.getByText("1. 导入数据")).toBeInTheDocument();
    expect(screen.getByText("2. 补充缺失字段")).toBeInTheDocument();
    expect(screen.getByText("3. 查看系统诊断")).toBeInTheDocument();
    expect(screen.getByText("生意参谋首页核心看板导入")).toBeInTheDocument();
    expect(screen.getByLabelText("上传生意参谋核心看板 xls")).toBeInTheDocument();
    expect(screen.getByText("商品列表导入")).toBeInTheDocument();
    expect(screen.getByText("先接 Excel / 复制表格，截图 OCR 放到下一轮。")).toBeInTheDocument();
  });

  it("imports a 生意参谋 workbook and updates the daily operating fact form", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "数据录入" }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["数据说明：以下数据为您所选时间周期的相关指标"],
      ["日期", "展现次数", "广告展现次数", "访客数", "支付金额", "支付订单数", "网销宝推广消耗金额"],
      ["2026-05-23", "2059", "1960", "29", "0", "0", "34"]
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "所有终端指标");
    const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new File([bytes], "生意参谋核心看板.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    await user.upload(screen.getByLabelText("上传生意参谋核心看板 xls"), file);

    await waitFor(() => expect(screen.getByRole("heading", { name: "每日经营事实表" })).toBeInTheDocument());
    expect(screen.getByLabelText("总曝光")).toHaveValue(2059);
    expect(screen.getByLabelText("广告曝光")).toHaveValue(1960);
    expect(screen.getByLabelText("自然曝光")).toHaveValue(99);
    expect(screen.getByLabelText("访客")).toHaveValue(29);
    expect(screen.getByLabelText("支付金额")).toHaveValue(0);
    expect(screen.getByLabelText("广告消耗")).toHaveValue(34);
  });

  it("shows rule version metadata and source confidence status", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "规则维护" }));

    expect(screen.getByRole("heading", { name: "维护判断规则" })).toBeInTheDocument();
    expect(screen.getByText("找工厂铜牌规则")).toBeInTheDocument();
    expect(screen.getAllByText("发布日期").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2026-05-01").length).toBeGreaterThan(0);
    expect(screen.getAllByText("适用范围").length).toBeGreaterThan(0);
    expect(screen.getByText("保温杯 / 找工厂 / 铜牌升级")).toBeInTheDocument();
    expect(screen.getAllByText("官方链接").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "打开规则" })[0]).toHaveAttribute(
      "href",
      "https://factory.1688.com/rules/factory-level"
    );
    expect(screen.getAllByText("来源待补").length).toBeGreaterThan(0);
    expect(screen.getAllByText("来源可信度").length).toBeGreaterThan(0);
  });

  it("lets a manager add a source-found rule and adopt it without blocking employees", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "规则维护" }));

    expect(screen.getByRole("heading", { name: "规则运营后台" })).toBeInTheDocument();
    expect(screen.getByText("当前采用规则 0 条")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("规则名称"));
    await user.type(screen.getByLabelText("规则名称"), "找工厂铜牌 6 月规则");
    await user.clear(screen.getByLabelText("发布日期"));
    await user.type(screen.getByLabelText("发布日期"), "2026-06-01");
    await user.clear(screen.getByLabelText("官方链接"));
    await user.type(screen.getByLabelText("官方链接"), "https://factory.1688.com/rules/factory-level-june");
    await user.clear(screen.getByLabelText("适用范围"));
    await user.type(screen.getByLabelText("适用范围"), "保温杯 / 找工厂 / 铜牌 6 月规则");
    await user.click(screen.getByRole("button", { name: "新增规则草案" }));

    expect(screen.getByText("找工厂铜牌 6 月规则")).toBeInTheDocument();
    expect(screen.getAllByText("来源待补").length).toBeGreaterThan(0);
    expect(screen.getByText("当前采用规则 0 条")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "采用规则" })[0]);

    expect(screen.getByText("当前采用规则 1 条")).toBeInTheDocument();
    expect(screen.getAllByText("已采用").length).toBeGreaterThan(0);
  });

  it("backtests the first V2 action into a validated SOP", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "卡点诊断" }));

    expect(screen.getByText("补齐 09:00-21:00 首响值班和快捷回复")).toBeInTheDocument();
    expect(screen.getByText("当日旺旺 3 分钟响应率截图")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "动作复盘" }));
    const afterInput = screen.getByLabelText("回测后 旺旺 3 分钟响应率");
    await user.clear(afterInput);
    await user.type(afterInput, "62");
    await user.click(screen.getByRole("button", { name: "记录回测" }));

    expect(screen.getByText("已验证")).toBeInTheDocument();
    expect(screen.getByText(/52% -> 62%/)).toBeInTheDocument();
  });

  it("shows V3 reasoning, experiments, SKU portfolio, and capability training", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "卡点诊断" }));

    expect(screen.getByRole("heading", { name: "店铺哪里掉了？" })).toBeInTheDocument();
    expect(screen.getByText("先看最大掉点，再决定今天试什么动作。")).toBeInTheDocument();
    expect(screen.getByText("优先级裁判")).toBeInTheDocument();
    expect(screen.getByText("先修利润健康")).toBeInTheDocument();
    expect(screen.getByText("暂停冲定制交易积分和 GMV")).toBeInTheDocument();
    expect(screen.getAllByText("原因假设").length).toBeGreaterThan(0);
    expect(screen.getByText("低价引流和定制报价没有覆盖真实成本")).toBeInTheDocument();
    expect(screen.getByText("7 天内毛利率回到 18% 以上")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "商品诊断" }));

    expect(screen.getByRole("heading", { name: "哪些商品该加力，哪些该停？" })).toBeInTheDocument();
    expect(screen.getByText("316 商务礼品杯")).toBeInTheDocument();
    expect(screen.getAllByText("定制款").length).toBeGreaterThan(0);
    expect(screen.getAllByText("风险款").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "动作复盘" }));

    expect(screen.getByRole("heading", { name: "这个动作有没有用？" })).toBeInTheDocument();
    expect(screen.getByText("员工仍偏任务执行，需要训练归因、停止和 SOP。")).toBeInTheDocument();
    expect(screen.getByText("本周至少沉淀 1 条有效动作 SOP")).toBeInTheDocument();
  });

  it("shows V4 daily operating facts and calculated ratios", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "数据录入" }));

    expect(screen.getByRole("heading", { name: "每日经营事实表" })).toBeInTheDocument();
    expect(screen.getByLabelText("总曝光")).toBeInTheDocument();
    expect(screen.getByLabelText("广告曝光")).toBeInTheDocument();
    expect(screen.getByLabelText("自然曝光")).toBeInTheDocument();
    expect(screen.getByLabelText("广告消耗")).toBeInTheDocument();
    expect(screen.getByLabelText("访客")).toBeInTheDocument();
    expect(screen.getByLabelText("询盘")).toBeInTheDocument();
    expect(screen.getByLabelText("支付金额")).toBeInTheDocument();
    expect(screen.getByLabelText("毛利率")).toBeInTheDocument();
    expect(screen.getByText("广告费率")).toBeInTheDocument();
    expect(screen.getByText("14.6%")).toBeInTheDocument();
  });

  it("updates V4 anomaly judgment after editing daily facts", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "数据录入" }));
    await user.clear(screen.getByLabelText("毛利率"));
    await user.type(screen.getByLabelText("毛利率"), "22");
    await user.clear(screen.getByLabelText("广告消耗"));
    await user.type(screen.getByLabelText("广告消耗"), "260");
    await user.clear(screen.getByLabelText("支付金额"));
    await user.type(screen.getByLabelText("支付金额"), "1000");

    expect(screen.getByText("广告费率过高")).toBeInTheDocument();
    expect(screen.getByText("异常实验卡")).toBeInTheDocument();
    expect(screen.getByText("停止条件")).toBeInTheDocument();
  });

  it("shows the V5 BI funnel, checklist, action backtest, and SOP candidate areas", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "卡点诊断" }));

    expect(screen.getByRole("heading", { name: "店铺哪里掉了？" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "卡点漏斗" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "今日 Checklist" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "动作回测" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "SOP 候选" })).toBeInTheDocument();
    expect(screen.getByText("访客询盘率")).toBeInTheDocument();
    expect(screen.getByText("访客到询盘")).toBeInTheDocument();
    expect(screen.getByText("重做 3 个主推商品的定制承诺")).toBeInTheDocument();
  });

  it("backtests a checked V5 checklist item into an SOP candidate", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "卡点诊断" }));
    await user.click(screen.getByRole("checkbox", { name: "已检查 MOQ、拿样、定制、开票、交期是否前置" }));
    await user.clear(screen.getByLabelText("回测后 访客询盘率"));
    await user.type(screen.getByLabelText("回测后 访客询盘率"), "6.1");
    await user.click(screen.getByRole("button", { name: "记录 V5 回测" }));

    expect(screen.getByText("有效")).toBeInTheDocument();
    expect(screen.getByText("SOP 候选：重做 3 个主推商品的定制承诺")).toBeInTheDocument();
  });
});
