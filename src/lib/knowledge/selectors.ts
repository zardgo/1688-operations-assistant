import { officialArticles } from "../../data/knowledge/officialArticles";
import { officialKnowledgeCards } from "../../data/knowledge/officialKnowledgeCards";
import { trafficBattleMap } from "../../data/knowledge/trafficBattleMap";
import type { V2GoalId, V2MetricId } from "../operations";
import type { KnowledgeConfidence, OfficialArticleSource, OfficialKnowledgeCard, TrafficBattleMapNode } from "./types";

export type MetricKnowledgeContext = {
  metricId: V2MetricId;
  battleNodes: TrafficBattleMapNode[];
  knowledgeCards: OfficialKnowledgeCard[];
  articles: OfficialArticleSource[];
};

export type KnowledgeSearchResult = {
  articles: OfficialArticleSource[];
  cards: OfficialKnowledgeCard[];
};

const autoTaskConfidences: KnowledgeConfidence[] = ["official", "official_interpreted"];

export function isKnowledgeCardAutoTaskEligible(card: OfficialKnowledgeCard): boolean {
  const article = getArticleById(card.sourceArticleId);
  return autoTaskConfidences.includes(card.confidence) && Boolean(article?.isComplete);
}

export function getArticleById(articleId: string): OfficialArticleSource | undefined {
  return officialArticles.find((article) => article.id === articleId);
}

export function getBattleNodeById(nodeId: string): TrafficBattleMapNode | undefined {
  return trafficBattleMap.nodes.find((node) => node.id === nodeId);
}

export function getBattleNodesForMetric(metricId: V2MetricId): TrafficBattleMapNode[] {
  return trafficBattleMap.nodes.filter((node) => node.relatedMetricIds.includes(metricId));
}

export function getKnowledgeCardsForMetric(metricId: V2MetricId, options: { includeIncomplete?: boolean } = {}): OfficialKnowledgeCard[] {
  return officialKnowledgeCards.filter((card) => {
    if (!card.relatedMetricIds.includes(metricId)) return false;
    return options.includeIncomplete || isKnowledgeCardAutoTaskEligible(card);
  });
}

export function getKnowledgeCardsForGoal(goalId: V2GoalId, options: { includeIncomplete?: boolean } = {}): OfficialKnowledgeCard[] {
  return officialKnowledgeCards.filter((card) => {
    if (!card.relatedGoals.includes(goalId)) return false;
    return options.includeIncomplete || isKnowledgeCardAutoTaskEligible(card);
  });
}

export function getKnowledgeContextForMetric(metricId: V2MetricId): MetricKnowledgeContext {
  const knowledgeCards = getKnowledgeCardsForMetric(metricId);
  const battleNodes = uniqueById([
    ...getBattleNodesForMetric(metricId),
    ...knowledgeCards.flatMap((card) => card.relatedBattleNodeIds.map((id) => getBattleNodeById(id)).filter(isDefined))
  ]);
  const articles = uniqueById(knowledgeCards.map((card) => getArticleById(card.sourceArticleId)).filter(isDefined));

  return {
    metricId,
    battleNodes,
    knowledgeCards,
    articles
  };
}

export function getKnowledgeCardsForBattleNode(nodeId: string, options: { includeIncomplete?: boolean } = {}): OfficialKnowledgeCard[] {
  const node = getBattleNodeById(nodeId);
  if (!node) return [];
  return node.officialKnowledgeCardIds
    .map((cardId) => officialKnowledgeCards.find((card) => card.id === cardId))
    .filter(isDefined)
    .filter((card) => options.includeIncomplete || isKnowledgeCardAutoTaskEligible(card));
}

export function searchKnowledge(query: string): KnowledgeSearchResult {
  const normalized = normalize(query);
  if (!normalized) {
    return { articles: [], cards: [] };
  }

  return {
    articles: officialArticles.filter((article) =>
      [article.title, article.category].some((value) => normalize(value).includes(normalized))
    ),
    cards: officialKnowledgeCards.filter((card) =>
      [
        card.title,
        card.category,
        ...card.tags,
        ...card.trafficStages,
        ...card.relatedMetricIds,
        ...card.relatedGoals
      ].some((value) => normalize(value).includes(normalized))
    )
  };
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
