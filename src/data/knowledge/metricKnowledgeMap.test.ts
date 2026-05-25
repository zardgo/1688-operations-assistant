import { describe, expect, it } from "vitest";
import { getBattleNodesForMetric, getKnowledgeCardsForMetric } from "../../lib/knowledge/selectors";

describe("metric to official knowledge mapping", () => {
  it("connects 旺旺 3 分钟响应率 to inquiry conversion and service response knowledge", () => {
    const nodes = getBattleNodesForMetric("ww_3min_response_rate").map((node) => node.id);
    const cards = getKnowledgeCardsForMetric("ww_3min_response_rate").map((card) => card.id);

    expect(nodes).toContain("inquiry_conversion");
    expect(cards).toContain("knowledge-customer-response");
  });

  it("connects 找工厂服务响应率 to factory level knowledge", () => {
    const nodes = getBattleNodesForMetric("factory_service_response_rate_30d").map((node) => node.id);
    const cards = getKnowledgeCardsForMetric("factory_service_response_rate_30d").map((card) => card.id);

    expect(nodes).toEqual(expect.arrayContaining(["factory_level", "inquiry_conversion"]));
    expect(cards).toContain("knowledge-factory-level");
  });

  it("connects 48 小时揽收率 to fulfillment and buyer protection knowledge", () => {
    const nodes = getBattleNodesForMetric("pickup_48h_rate_30d").map((node) => node.id);
    const cards = getKnowledgeCardsForMetric("pickup_48h_rate_30d").map((card) => card.id);

    expect(nodes).toContain("fulfillment_service");
    expect(cards).toEqual(expect.arrayContaining(["knowledge-official-logistics", "knowledge-buyer-protection"]));
  });
});
