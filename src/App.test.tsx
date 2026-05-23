import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("1688 operations assistant UI", () => {
  it("shows the V2 operating loop and updates goal gaps from entered data", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("heading", { name: "1688 运营助手" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "数据录入" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "目标差距" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "路径拆解" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "经营推理" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "每日经营" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SKU 组合" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "员工能力" })).toBeInTheDocument();

    const responseInput = screen.getByLabelText("旺旺 3 分钟响应率");
    await user.clear(responseInput);
    await user.type(responseInput, "61");
    await user.click(screen.getByRole("button", { name: "目标差距" }));

    expect(screen.queryByText("旺旺 3 分钟响应率差 8 个百分点")).not.toBeInTheDocument();
    expect(screen.getByText("找工厂服务响应率差 5 个百分点")).toBeInTheDocument();
  });

  it("backtests the first V2 action into a validated SOP", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "路径拆解" }));

    expect(screen.getByText("补齐 09:00-21:00 首响值班和快捷回复")).toBeInTheDocument();
    expect(screen.getByText("当日旺旺 3 分钟响应率截图")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "动作回测" }));
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

    await user.click(screen.getByRole("button", { name: "经营推理" }));

    expect(screen.getByText("优先级裁判")).toBeInTheDocument();
    expect(screen.getByText("先修利润健康")).toBeInTheDocument();
    expect(screen.getByText("暂停冲定制交易积分和 GMV")).toBeInTheDocument();
    expect(screen.getAllByText("原因假设").length).toBeGreaterThan(0);
    expect(screen.getByText("低价引流和定制报价没有覆盖真实成本")).toBeInTheDocument();
    expect(screen.getByText("7 天内毛利率回到 18% 以上")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "SKU 组合" }));

    expect(screen.getByText("316 商务礼品杯")).toBeInTheDocument();
    expect(screen.getAllByText("定制款").length).toBeGreaterThan(0);
    expect(screen.getAllByText("风险款").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "员工能力" }));

    expect(screen.getByText("员工仍偏任务执行，需要训练归因、停止和 SOP。")).toBeInTheDocument();
    expect(screen.getByText("本周至少沉淀 1 条有效动作 SOP")).toBeInTheDocument();
  });

  it("shows V4 daily operating facts and calculated ratios", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "每日经营" }));

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

    await user.click(screen.getByRole("button", { name: "每日经营" }));
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
});
