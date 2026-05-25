import { describe, expect, it } from "vitest";
import { trafficBattleMap } from "./trafficBattleMap";

describe("traffic battle map", () => {
  it("defines battle nodes with required operating metadata", () => {
    expect(trafficBattleMap.nodes.length).toBeGreaterThanOrEqual(10);

    for (const node of trafficBattleMap.nodes) {
      expect(node.id).toBeTruthy();
      expect(node.title).toBeTruthy();
      expect(node.stage).toBeTruthy();
      expect(node.relatedMetricIds.length + node.relatedGoalIds.length).toBeGreaterThan(0);
      expect(node.recommendedActions.length).toBeGreaterThan(0);
      expect(node.evidenceRequired.length).toBeGreaterThan(0);
    }
  });

  it("only references existing upstream and downstream node ids", () => {
    const ids = new Set(trafficBattleMap.nodes.map((node) => node.id));

    for (const node of trafficBattleMap.nodes) {
      for (const upstreamId of node.upstreamNodeIds) {
        expect(ids.has(upstreamId), `${node.id} upstream ${upstreamId}`).toBe(true);
      }
      for (const downstreamId of node.downstreamNodeIds) {
        expect(ids.has(downstreamId), `${node.id} downstream ${downstreamId}`).toBe(true);
      }
    }
  });
});
