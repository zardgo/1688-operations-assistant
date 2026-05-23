import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("1688 operations assistant UI", () => {
  it("shows the MVP cockpit and switches seed scenarios", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("heading", { name: "1688 运营助手" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "今日冲刺" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "官方目标" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "周复盘 / SOP" })).toBeInTheDocument();
    expect(screen.getByText("旺旺 3 分钟响应率")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("种子场景"), "S5");

    expect(screen.getAllByText("毛利率").length).toBeGreaterThan(0);
    expect(screen.getByText("毛利低于底线，不建议继续冲 GMV 或定制交易积分。")).toBeInTheDocument();
  });

  it("records task outcomes into the weekly review", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "标记有效" })[0]);
    await user.click(screen.getByRole("button", { name: "周复盘 / SOP" }));

    expect(screen.getByText("有效任务")).toBeInTheDocument();
    expect(screen.getAllByText(/客服响应机制/).length).toBeGreaterThan(0);
  });
});
