import { describe, expect, it } from "vitest";
import appSource from "./App.tsx?raw";
import { MainNav } from "./components/layout/MainNav";
import { AnalysisPage } from "./pages/AnalysisPage";
import { CommandPage } from "./pages/CommandPage";
import { DataPage } from "./pages/DataPage";
import { ProductPage } from "./pages/ProductPage";
import { ReviewPage } from "./pages/ReviewPage";
import { RulesPage } from "./pages/RulesPage";
import { pageLabels } from "./pages/pageConfig";

describe("frontend module boundaries", () => {
  it("keeps navigation config and the today task page outside App.tsx", () => {
    expect(MainNav).toBeTypeOf("function");
    expect(CommandPage).toBeTypeOf("function");
    expect(DataPage).toBeTypeOf("function");
    expect(AnalysisPage).toBeTypeOf("function");
    expect(ProductPage).toBeTypeOf("function");
    expect(ReviewPage).toBeTypeOf("function");
    expect(RulesPage).toBeTypeOf("function");
    expect(pageLabels.command).toBe("今日任务");

    expect(appSource).not.toContain("const pageLabels");
    expect(appSource).not.toContain('page === "command" &&');
    expect(appSource).not.toContain("录入今天的数据");
    expect(appSource).not.toContain("生意参谋首页核心看板导入");
    expect(appSource).not.toContain("店铺哪里掉了？");
    expect(appSource).not.toContain("哪些商品该加力，哪些该停？");
    expect(appSource).not.toContain("这个动作有没有用？");
    expect(appSource).not.toContain("维护判断规则");
  });
});
