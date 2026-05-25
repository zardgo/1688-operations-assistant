import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TrafficMapPage } from "./TrafficMapPage";

describe("TrafficMapPage", () => {
  it("renders battle nodes as an operating map instead of an article list", () => {
    render(<TrafficMapPage currentGoalId="factory_bronze" />);

    expect(screen.getByRole("heading", { name: "1688 流量作战地图" })).toBeInTheDocument();
    expect(screen.getAllByText("商品供给战场").length).toBeGreaterThan(0);
    expect(screen.getAllByText("搜索流量战场").length).toBeGreaterThan(0);
    expect(screen.getAllByText("找工厂冲级战场").length).toBeGreaterThan(0);
    expect(screen.getAllByText("影响指标").length).toBeGreaterThan(0);
  });

  it("filters nodes by current goal in target view", async () => {
    const user = userEvent.setup();
    render(<TrafficMapPage currentGoalId="factory_bronze" />);

    await user.click(screen.getByRole("button", { name: "目标视图" }));

    expect(screen.getByText("当前目标相关战场")).toBeInTheDocument();
    expect(screen.getByText("找工厂冲级战场")).toBeInTheDocument();
    expect(screen.queryByText("会员与工具战场")).not.toBeInTheDocument();
  });

  it("searches knowledge cards by title and tags", async () => {
    const user = userEvent.setup();
    render(<TrafficMapPage currentGoalId="factory_bronze" />);

    await user.type(screen.getByLabelText("搜索官方知识"), "图搜");

    expect(screen.getByText("1688图搜运营方法")).toBeInTheDocument();
    expect(screen.getByText("图搜流量战场")).toBeInTheDocument();
  });

  it("opens node detail with related official knowledge", async () => {
    const user = userEvent.setup();
    render(<TrafficMapPage currentGoalId="factory_bronze" />);

    await user.click(screen.getByRole("button", { name: "查看 搜索流量战场" }));

    expect(screen.getByRole("heading", { name: "搜索流量战场" })).toBeInTheDocument();
    expect(screen.getByText("相关官方知识")).toBeInTheDocument();
    expect(screen.getByText("一文搞懂1688搜索运营")).toBeInTheDocument();
  });
});
