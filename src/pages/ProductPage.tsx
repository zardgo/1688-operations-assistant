import { PackageCheck, Target } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import type { buildV3OperatingReview } from "../lib/operations";

type ProductPageProps = {
  v3Review: ReturnType<typeof buildV3OperatingReview>;
};

export function ProductPage({ v3Review }: ProductPageProps) {
  return (
    <>
      <PageHeader title="哪些商品该加力，哪些该停？" description="先看商品组合，再处理风险款和可放大的定制款。" />
      <section className="page-grid sku-grid">
        <div className="panel task-panel">
          <div className="section-title">
            <PackageCheck aria-hidden="true" />
            <h2>SKU 经营组合</h2>
          </div>
          <div className="sku-list">
            {v3Review.skuPortfolio.map((sku) => (
              <article className={`sku-card ${sku.role === "风险款" ? "risk" : ""}`} key={sku.name}>
                <span>{sku.role}</span>
                <strong>{sku.name}</strong>
                <p>{sku.recommendation}</p>
                <div className="sku-metrics">
                  <small>询盘 {sku.inquiries}</small>
                  <small>有效 {Math.round(sku.validInquiryRate * 100)}%</small>
                  <small>毛利 {Math.round(sku.grossMarginRate * 100)}%</small>
                  <small>售后 {Math.round(sku.afterSalesRate * 100)}%</small>
                </div>
              </article>
            ))}
          </div>
        </div>
        <aside className="panel method-panel">
          <div className="section-title">
            <Target aria-hidden="true" />
            <h2>组合原则</h2>
          </div>
          <div className="cadence-list">
            <p><strong>定制款</strong> 负责 LOGO、刻字、礼品包装和找工厂积分。</p>
            <p><strong>引流款</strong> 可以带询盘，但必须有毛利和低质量询盘警戒线。</p>
            <p><strong>风险款</strong> 先控售后、履约和毛利，不继续加流量。</p>
          </div>
        </aside>
      </section>
    </>
  );
}
