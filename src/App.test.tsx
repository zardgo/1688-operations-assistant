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
    expect(screen.getByRole("button", { name: "动作回测" })).toBeInTheDocument();

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
});
