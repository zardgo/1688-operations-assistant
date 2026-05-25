import type { V2GoalId, V2MetricId } from "../operations";

export type OfficialKnowledgeCategory =
  | "vertical_business"
  | "member_service"
  | "operating_tools"
  | "search_operation"
  | "rules"
  | "advertising"
  | "factory"
  | "product_growth"
  | "fulfillment"
  | "skipped_or_incomplete";

export type TrafficStage =
  | "market_positioning"
  | "product_supply"
  | "search_exposure"
  | "recommendation_exposure"
  | "image_search"
  | "ad_traffic"
  | "visitor_click"
  | "inquiry_conversion"
  | "quote_conversion"
  | "payment_conversion"
  | "fulfillment_service"
  | "repeat_purchase"
  | "membership_rights"
  | "factory_level"
  | "tooling_efficiency";

export type KnowledgeConfidence =
  | "official"
  | "official_interpreted"
  | "weak_reference"
  | "incomplete"
  | "deprecated";

export type OfficialArticleSource = {
  id: string;
  title: string;
  filePath?: string;
  sourceUrl?: string;
  category: OfficialKnowledgeCategory;
  crawledAt?: string;
  importedAt: string;
  isComplete: boolean;
};

export type OfficialKnowledgeCard = {
  id: string;
  title: string;
  sourceArticleId: string;
  category: OfficialKnowledgeCategory;
  trafficStages: TrafficStage[];
  relatedGoals: V2GoalId[];
  relatedMetricIds: V2MetricId[];
  relatedBattleNodeIds: string[];
  summary: string;
  officialBasis: string;
  actionGuides: string[];
  warningRules: string[];
  evidenceRequired: string[];
  confidence: KnowledgeConfidence;
  tags: string[];
};

export type TrafficBattleMapNode = {
  id: string;
  title: string;
  stage: TrafficStage;
  description: string;
  roleInTrafficSystem: string;
  relatedMetricIds: V2MetricId[];
  relatedGoalIds: V2GoalId[];
  upstreamNodeIds: string[];
  downstreamNodeIds: string[];
  officialKnowledgeCardIds: string[];
  commonSymptoms: string[];
  recommendedActions: string[];
  evidenceRequired: string[];
};

export type TrafficBattleMap = {
  nodes: TrafficBattleMapNode[];
};
