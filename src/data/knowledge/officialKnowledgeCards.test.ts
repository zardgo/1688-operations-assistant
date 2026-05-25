import { describe, expect, it } from "vitest";
import { officialArticles } from "./officialArticles";
import { officialKnowledgeCards } from "./officialKnowledgeCards";
import { isKnowledgeCardAutoTaskEligible } from "../../lib/knowledge/selectors";
import { getKnownV2MetricIds } from "../../lib/operations";

describe("official knowledge cards", () => {
  it("keeps every card tied to a registered official article source", () => {
    const articleIds = new Set(officialArticles.map((article) => article.id));

    for (const card of officialKnowledgeCards) {
      expect(articleIds.has(card.sourceArticleId), card.title).toBe(true);
      expect(card.summary).toBeTruthy();
      expect(card.officialBasis).toBeTruthy();
    }
  });

  it("does not allow incomplete knowledge to participate in automatic task evidence", () => {
    const incompleteCards = officialKnowledgeCards.filter((card) => card.confidence === "incomplete");

    expect(incompleteCards.length).toBeGreaterThan(0);
    for (const card of incompleteCards) {
      expect(isKnowledgeCardAutoTaskEligible(card)).toBe(false);
    }
  });

  it("uses legal V2 metric ids in knowledge mappings", () => {
    const metricIds = new Set(getKnownV2MetricIds());

    for (const card of officialKnowledgeCards) {
      for (const metricId of card.relatedMetricIds) {
        expect(metricIds.has(metricId), `${card.id} -> ${metricId}`).toBe(true);
      }
    }
  });
});
