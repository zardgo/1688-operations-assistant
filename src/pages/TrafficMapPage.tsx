import { useMemo, useState } from "react";
import { ArrowDown, BadgeCheck, FileText, Flag, Map, Target } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { KnowledgeSearch } from "../components/knowledge/KnowledgeSearch";
import { trafficBattleMap } from "../data/knowledge/trafficBattleMap";
import { officialKnowledgeCards } from "../data/knowledge/officialKnowledgeCards";
import { getArticleById, getKnowledgeCardsForBattleNode } from "../lib/knowledge/selectors";
import { getV2MetricLabel, type V2GoalId } from "../lib/operations";
import type { TrafficBattleMapNode } from "../lib/knowledge/types";

type TrafficMapPageProps = {
  currentGoalId: V2GoalId;
};

type TrafficMapView = "funnel" | "battlefield" | "goal";

const funnelNodeIds = [
  "product_supply",
  "search_exposure",
  "recommendation_exposure",
  "image_search",
  "ad_traffic",
  "visitor_click",
  "inquiry_conversion",
  "quote_conversion",
  "factory_level",
  "payment_conversion",
  "fulfillment_service",
  "repeat_purchase",
  "membership_rights"
];

export function TrafficMapPage({ currentGoalId }: TrafficMapPageProps) {
  const [view, setView] = useState<TrafficMapView>("funnel");
  const [query, setQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState("search_exposure");
  const selectedNode = trafficBattleMap.nodes.find((node) => node.id === selectedNodeId) ?? trafficBattleMap.nodes[0];
  const goalNodes = useMemo(
    () => trafficBattleMap.nodes.filter((node) => node.relatedGoalIds.includes(currentGoalId)),
    [currentGoalId]
  );

  return (
    <>
      <PageHeader
        title="1688 流量作战地图"
        description="把官方运营知识拆成流量战场、指标、动作和官方依据。"
      />

      <section className="traffic-map-toolbar">
        <div className="view-switch" aria-label="流量地图视图">
          <button className={view === "funnel" ? "active" : ""} type="button" onClick={() => setView("funnel")}>
            漏斗视图
          </button>
          <button className={view === "battlefield" ? "active" : ""} type="button" onClick={() => setView("battlefield")}>
            战场视图
          </button>
          <button className={view === "goal" ? "active" : ""} type="button" onClick={() => setView("goal")}>
            目标视图
          </button>
        </div>
        <KnowledgeSearch query={query} onQueryChange={setQuery} />
      </section>

      <section className="traffic-map-layout">
        <div className="traffic-map-main">
          {view === "funnel" ? (
            <FunnelView selectedNodeId={selectedNode.id} onSelectNode={setSelectedNodeId} />
          ) : null}
          {view === "battlefield" ? (
            <BattlefieldView selectedNodeId={selectedNode.id} nodes={trafficBattleMap.nodes} onSelectNode={setSelectedNodeId} />
          ) : null}
          {view === "goal" ? (
            <GoalView selectedNodeId={selectedNode.id} nodes={goalNodes} onSelectNode={setSelectedNodeId} />
          ) : null}
        </div>
        <NodeDetail node={selectedNode} />
      </section>
    </>
  );
}

function FunnelView({
  selectedNodeId,
  onSelectNode
}: {
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}) {
  const nodes = funnelNodeIds.map((id) => trafficBattleMap.nodes.find((node) => node.id === id)).filter(isDefined);
  return (
    <div className="funnel-map" aria-label="流量漏斗地图">
      {nodes.map((node, index) => (
        <div className="funnel-node-row" key={node.id}>
          <MapNodeCard node={node} selected={node.id === selectedNodeId} onSelectNode={onSelectNode} />
          {index < nodes.length - 1 ? <ArrowDown aria-hidden="true" className="funnel-arrow" /> : null}
        </div>
      ))}
    </div>
  );
}

function BattlefieldView({
  nodes,
  selectedNodeId,
  onSelectNode
}: {
  nodes: TrafficBattleMapNode[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}) {
  return (
    <div className="battlefield-grid">
      {nodes.map((node) => (
        <MapNodeCard key={node.id} node={node} selected={node.id === selectedNodeId} onSelectNode={onSelectNode} />
      ))}
    </div>
  );
}

function GoalView({
  nodes,
  selectedNodeId,
  onSelectNode
}: {
  nodes: TrafficBattleMapNode[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}) {
  return (
    <div className="goal-map-view">
      <div className="goal-map-summary">
        <Flag aria-hidden="true" />
        <div>
          <h2>当前目标相关战场</h2>
          <p>只显示和当前目标直接绑定的关键战场、指标和官方知识。</p>
        </div>
      </div>
      <div className="battlefield-grid">
        {nodes.map((node) => (
          <MapNodeCard key={node.id} node={node} selected={node.id === selectedNodeId} onSelectNode={onSelectNode} />
        ))}
      </div>
    </div>
  );
}

function MapNodeCard({
  node,
  selected,
  onSelectNode
}: {
  node: TrafficBattleMapNode;
  selected: boolean;
  onSelectNode: (nodeId: string) => void;
}) {
  const cards = getKnowledgeCardsForBattleNode(node.id, { includeIncomplete: true });

  return (
    <article className={`map-node-card ${selected ? "active" : ""}`}>
      <div>
        <span>{formatTrafficStage(node.stage)}</span>
        <strong className="map-node-title">{node.title}</strong>
        <p>{node.roleInTrafficSystem}</p>
      </div>
      <dl>
        <dt>影响指标</dt>
        <dd>{node.relatedMetricIds.slice(0, 4).map(getV2MetricLabel).join("、")}</dd>
        <dt>官方知识</dt>
        <dd>{cards.length} 条</dd>
      </dl>
      <div className="map-node-actions">
        <button type="button" aria-label={`查看 ${node.title}`} onClick={() => onSelectNode(node.id)}>
          查看
        </button>
      </div>
    </article>
  );
}

function NodeDetail({ node }: { node: TrafficBattleMapNode }) {
  const cards = getKnowledgeCardsForBattleNode(node.id, { includeIncomplete: true });
  const upstreamNodes = node.upstreamNodeIds.map((id) => trafficBattleMap.nodes.find((item) => item.id === id)).filter(isDefined);
  const downstreamNodes = node.downstreamNodeIds.map((id) => trafficBattleMap.nodes.find((item) => item.id === id)).filter(isDefined);

  return (
    <aside className="map-detail-panel">
      <div className="map-detail-head">
        <Target aria-hidden="true" />
        <div>
          <span>{formatTrafficStage(node.stage)}</span>
          <h2>{node.title}</h2>
        </div>
      </div>
      <p>{node.description}</p>
      <div className="map-detail-section">
        <h3>影响指标</h3>
        <div className="knowledge-chip-list">
          {node.relatedMetricIds.map((metricId) => (
            <span key={metricId}>{getV2MetricLabel(metricId)}</span>
          ))}
        </div>
      </div>
      <div className="map-detail-section">
        <h3>上下游影响</h3>
        <p><strong>上游：</strong>{upstreamNodes.length > 0 ? upstreamNodes.map((item) => item.title).join("、") : "无"}</p>
        <p><strong>下游：</strong>{downstreamNodes.length > 0 ? downstreamNodes.map((item) => item.title).join("、") : "无"}</p>
      </div>
      <div className="map-detail-section">
        <h3>常见问题</h3>
        <ul>
          {node.commonSymptoms.map((symptom) => (
            <li key={symptom}>{symptom}</li>
          ))}
        </ul>
      </div>
      <div className="map-detail-section">
        <h3>推荐动作</h3>
        <ul>
          {node.recommendedActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </div>
      <div className="map-detail-section">
        <h3>相关官方知识</h3>
        <div className="knowledge-card-list">
          {cards.map((card) => {
            const article = getArticleById(card.sourceArticleId);
            return (
              <article key={card.id}>
                <div>
                  <FileText aria-hidden="true" />
                  <strong>{displayArticleTitle(article?.title ?? card.title)}</strong>
                </div>
                <p>{card.summary}</p>
                <StatusBadge tone={card.confidence === "incomplete" ? "warning" : "success"}>
                  {card.confidence === "incomplete" ? "弱参考" : "官方依据"}
                </StatusBadge>
              </article>
            );
          })}
        </div>
      </div>
      <div className="map-detail-section">
        <h3>需要的证据</h3>
        <div className="knowledge-chip-list">
          {node.evidenceRequired.map((item) => (
            <span key={item}>
              <BadgeCheck aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function displayArticleTitle(title: string): string {
  return title.replace(/^\d+[、.]\s*/, "");
}

function formatTrafficStage(stage: TrafficBattleMapNode["stage"]): string {
  const labels: Record<TrafficBattleMapNode["stage"], string> = {
    market_positioning: "市场定位",
    product_supply: "商品供给",
    search_exposure: "搜索曝光",
    recommendation_exposure: "推荐曝光",
    image_search: "图搜承接",
    ad_traffic: "广告投放",
    visitor_click: "访客点击",
    inquiry_conversion: "询盘转化",
    quote_conversion: "报价成交",
    payment_conversion: "支付成交",
    fulfillment_service: "履约服务",
    repeat_purchase: "复购沉淀",
    membership_rights: "会员权益",
    factory_level: "找工厂冲级",
    tooling_efficiency: "工具效率"
  };
  return labels[stage];
}
