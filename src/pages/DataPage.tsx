import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Factory,
  FileSpreadsheet,
  PackageCheck,
  Target,
  Upload
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { DataQualityReport } from "../lib/dataQuality";
import { type V2MetricId, type V4DailyFactInput, type buildV4DailyOperatingReview } from "../lib/operations";
import type { SycmCoreBoardImport } from "../lib/sycmImport";

type EditableMetric = {
  id: V2MetricId;
  label: string;
  helper: string;
  unit: "%" | "款" | "分";
  period: string;
};

type DailyField = {
  id: keyof V4DailyFactInput;
  label: string;
  helper: string;
  unit: "次" | "元" | "%";
};

type SycmImportStatus = {
  fileName: string;
  result: SycmCoreBoardImport | null;
  error: string | null;
};

type DataPageProps = {
  editableMetrics: EditableMetric[];
  values: Record<V2MetricId, number>;
  dailyFields: DailyField[];
  dailyFacts: V4DailyFactInput;
  dataQualityReport: DataQualityReport;
  sycmImportStatus: SycmImportStatus | null;
  v4Review: ReturnType<typeof buildV4DailyOperatingReview>;
  onUpdateMetric: (metric: EditableMetric, rawValue: string) => void;
  onUpdateDailyFact: (field: DailyField, rawValue: string) => void;
  onImportSycmCoreBoard: (file: File) => void;
  onOpenCommand: () => void;
  onOpenAnalysis: () => void;
};

export function DataPage({
  editableMetrics,
  values,
  dailyFields,
  dailyFacts,
  dataQualityReport,
  sycmImportStatus,
  v4Review,
  onUpdateMetric,
  onUpdateDailyFact,
  onImportSycmCoreBoard,
  onOpenCommand,
  onOpenAnalysis
}: DataPageProps) {
  const hasImportedData = Boolean(sycmImportStatus?.result);

  return (
    <>
      <PageHeader title="录入今天的数据" description="先导入，再补录，最后让系统生成今日任务。" />
      <section className="data-quality-banner" aria-label="数据可信度">
        <div>
          <span>数据源状态</span>
          <strong>{dataQualityReport.label}</strong>
          <p>
            {hasImportedData
              ? `已识别 ${dataQualityReport.importedFields.length} 个字段，缺失 ${dataQualityReport.missingFields.length} 个字段。`
              : "先导入生意参谋核心看板，再补充平台没有导出的询盘和毛利字段。"}
          </p>
        </div>
        <StatusBadge tone={dataQualityReport.canGenerateMission ? "success" : "danger"}>
          {dataQualityReport.canGenerateMission ? "可生成诊断" : "先补齐关键字段"}
        </StatusBadge>
      </section>

      <section className="page-grid entry-grid">
        <div className="panel task-panel">
          <div className="section-title">
            <ClipboardList aria-hidden="true" />
            <h2>补充缺失字段</h2>
          </div>
          <div className="entry-list">
            {editableMetrics.map((metric) => (
              <label className="metric-input-row" key={metric.id}>
                <span>
                  <strong>{metric.label}</strong>
                  <small>{metric.helper}</small>
                </span>
                <div>
                  <input
                    aria-label={metric.label}
                    inputMode="decimal"
                    type="number"
                    value={formatInputValue(values[metric.id], metric.unit)}
                    onChange={(event) => onUpdateMetric(metric, event.target.value)}
                  />
                  <em>{metric.unit}</em>
                </div>
              </label>
            ))}
          </div>
        </div>
        <aside className="panel method-panel">
          <div className="section-title">
            <Factory aria-hidden="true" />
            <h2>录入节奏</h2>
          </div>
          <div className="cadence-list">
            <p><strong>每日</strong> 响应率、履约率、积分、合约支付。</p>
            <p><strong>每周</strong> 毛利、售后归因、有效动作。</p>
            <p><strong>每月</strong> 小单定制动销商品数和牌级进度。</p>
          </div>
        </aside>
      </section>

      <section className="page-grid import-grid">
        <div className="panel task-panel">
          <div className="section-title">
            <Upload aria-hidden="true" />
            <h2>数据导入</h2>
          </div>

          <div className="import-card primary-import-card">
            <div className="import-card-head">
              <FileSpreadsheet aria-hidden="true" />
              <div>
                <strong>生意参谋首页核心看板导入</strong>
                <p>支持日 / 周 / 月下载的 xls、xlsx，把店铺整体数据导入每日经营事实表。</p>
              </div>
            </div>
            <label className="file-upload">
              <span>上传生意参谋核心看板 xls</span>
              <input
                accept=".xls,.xlsx"
                aria-label="上传生意参谋核心看板 xls"
                type="file"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  if (file) onImportSycmCoreBoard(file);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            <div className="import-field-grid">
              <span>展现次数</span>
              <span>广告展现</span>
              <span>访客数</span>
              <span>支付金额</span>
              <span>支付订单</span>
              <span>推广消耗</span>
            </div>
          </div>

          <div className="import-card">
            <div className="import-card-head">
              <PackageCheck aria-hidden="true" />
              <div>
                <strong>商品列表导入</strong>
                <p>下一版本接 Excel / 复制表格；截图 OCR 不在当前版本。</p>
              </div>
            </div>
            <div className="import-field-grid">
              <span>商品 ID</span>
              <span>商品名称</span>
              <span>价格</span>
              <span>库存</span>
              <span>7 天曝光</span>
              <span>30 天访客</span>
              <span>咨询数</span>
              <span>30 天 GMV</span>
              <span>AI 诊断</span>
            </div>
          </div>
        </div>

        <aside className="panel method-panel">
          <div className="section-title">
            <BarChart3 aria-hidden="true" />
            <h2>导入结果</h2>
          </div>
          {sycmImportStatus?.result ? (
            <div className="import-result">
              <span>已导入</span>
              <strong>{sycmImportStatus.fileName}</strong>
              <p>
                识别 {sycmImportStatus.result.rowCount} 行数据，最新日期 {sycmImportStatus.result.fact.date}。
              </p>
              <dl>
                <dt>总曝光</dt>
                <dd>{sycmImportStatus.result.fact.totalExposure}</dd>
                <dt>广告消耗</dt>
                <dd>{formatMoney(sycmImportStatus.result.fact.adSpend)}</dd>
                <dt>支付金额</dt>
                <dd>{formatMoney(sycmImportStatus.result.fact.paymentAmount)}</dd>
                <dt>保留手填字段</dt>
                <dd>{formatMissingImportFields(sycmImportStatus.result.missingFields)}</dd>
                <dt>数据可信度</dt>
                <dd>{dataQualityReport.label}</dd>
              </dl>
              <div className="import-actions">
                <button className="primary-action" type="button" onClick={onOpenCommand}>
                  返回今日任务
                </button>
                <button className="secondary-action" type="button" onClick={onOpenAnalysis}>
                  查看卡点诊断
                </button>
              </div>
            </div>
          ) : sycmImportStatus?.error ? (
            <div className="import-result error">
              <span>导入失败</span>
              <strong>{sycmImportStatus.fileName}</strong>
              <p>{sycmImportStatus.error}</p>
            </div>
          ) : (
            <p className="empty-copy">
              上传生意参谋首页核心看板后，系统会自动更新每日经营事实表，并用现有异常归因逻辑生成卡点。
            </p>
          )}

          <div className="section-title stacked-title">
            <ClipboardList aria-hidden="true" />
            <h2>导入节奏</h2>
          </div>
          <div className="cadence-list">
            <p><strong>每日</strong> 导入昨天数据，生成今天 checklist。</p>
            <p><strong>每周</strong> 看趋势和动作是否有效。</p>
            <p><strong>每月</strong> 校准目标、预算和商品结构。</p>
          </div>
        </aside>
      </section>

      <details className="soft-details daily-facts-details">
        <summary>每日经营事实表</summary>
        <section className="page-grid daily-grid">
        <div className="panel task-panel">
          <div className="section-title">
            <BarChart3 aria-hidden="true" />
            <h2>每日经营事实表</h2>
          </div>
          <div className="entry-list daily-entry-list">
            {dailyFields.map((field) => (
              <label className="metric-input-row" key={field.id}>
                <span>
                  <strong>{field.label}</strong>
                  <small>{field.helper}</small>
                </span>
                <div>
                  <input
                    aria-label={field.label}
                    inputMode="decimal"
                    type="number"
                    value={formatDailyInputValue(Number(dailyFacts[field.id] ?? 0), field.unit)}
                    onChange={(event) => onUpdateDailyFact(field, event.target.value)}
                  />
                  <em>{field.unit}</em>
                </div>
              </label>
            ))}
          </div>

          <div className="section-title stacked-title">
            <Activity aria-hidden="true" />
            <h2>自动计算</h2>
          </div>
          <div className="daily-metric-grid">
            <DailyMetric label="自然曝光占比" value={formatPercent(v4Review.derivedMetrics.naturalExposureShare)} />
            <DailyMetric label="广告曝光占比" value={formatPercent(v4Review.derivedMetrics.adExposureShare)} />
            <DailyMetric label="曝光访客率" value={formatPercent(v4Review.derivedMetrics.exposureVisitorRate)} />
            <DailyMetric label="访客询盘率" value={formatPercent(v4Review.derivedMetrics.visitorInquiryRate)} />
            <DailyMetric label="询盘支付率" value={formatPercent(v4Review.derivedMetrics.inquiryPaymentRate)} />
            <DailyMetric label="单询盘广告成本" value={formatMoney(v4Review.derivedMetrics.adCostPerInquiry)} />
            <DailyMetric label="单支付广告成本" value={formatMoney(v4Review.derivedMetrics.adCostPerPayment)} />
            <DailyMetric label="客单价" value={formatMoney(v4Review.derivedMetrics.paymentAverageOrderValue)} />
            <DailyMetric label="广告费率" value={formatPercent(v4Review.derivedMetrics.adSpendShare)} />
          </div>
        </div>

        <aside className="panel method-panel">
          <div className="section-title">
            <Target aria-hidden="true" />
            <h2>异常归因</h2>
          </div>
          {v4Review.primaryAnomaly ? (
            <article className={`decision-card daily-anomaly ${v4Review.primaryAnomaly.priority.toLowerCase()}`}>
              <span>{v4Review.primaryAnomaly.priority}</span>
              <strong>{v4Review.primaryAnomaly.metricLabel}</strong>
              <p>{v4Review.primaryAnomaly.currentLabel} / 目标 {v4Review.primaryAnomaly.targetLabel}</p>
              <small>{v4Review.primaryAnomaly.hypothesis}</small>
            </article>
          ) : (
            <p className="empty-copy">今日核心链路未触发异常阈值，适合沉淀动作和继续观察。</p>
          )}

          <div className="section-title stacked-title">
            <CheckCircle2 aria-hidden="true" />
            <h2>异常实验卡</h2>
          </div>
          <article className="experiment-card">
            <span>{formatReviewCadence(v4Review.experimentCard.reviewCadence)}</span>
            <strong>{v4Review.experimentCard.title}</strong>
            <p>{v4Review.experimentCard.hypothesis}</p>
            <dl>
              <dt>动作</dt>
              <dd>{v4Review.experimentCard.action}</dd>
              <dt>预期</dt>
              <dd>{v4Review.experimentCard.expectedChange}</dd>
              <dt>成功</dt>
              <dd>{v4Review.experimentCard.successCriteria}</dd>
              <dt>停止条件</dt>
              <dd>{v4Review.experimentCard.stopCondition}</dd>
            </dl>
          </article>

          <div className="section-title stacked-title">
            <Factory aria-hidden="true" />
            <h2>官方侧栏</h2>
          </div>
          <div className="official-list">
            <p><strong>店铺层级</strong>{dailyFacts.storeLayerRank}</p>
            <p><strong>现货商品数</strong>{dailyFacts.spotProductCount} 款</p>
            <p><strong>潜力品数</strong>{dailyFacts.potentialProductCount} 款</p>
            <p><strong>金冠品数</strong>{dailyFacts.crownProductCount} 款</p>
            <p><strong>补单买家数</strong>{dailyFacts.replenishmentBuyerCount} 人</p>
          </div>
        </aside>
        </section>
      </details>
    </>
  );
}

function DailyMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="daily-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function formatInputValue(value: number, unit: EditableMetric["unit"]): string {
  if (unit === "%") return String(Math.round(value * 100));
  return String(value);
}

function formatDailyInputValue(value: number, unit: DailyField["unit"]): string {
  if (unit === "%") return String(Math.round(value * 100));
  return String(value);
}

function formatPercent(value: number): string {
  return `${Number((value * 100).toFixed(1))}%`;
}

function formatMoney(value: number): string {
  return `¥${Number(value.toFixed(1)).toLocaleString("zh-CN")}`;
}

function formatMissingImportFields(fields: SycmCoreBoardImport["missingFields"]): string {
  if (fields.length === 0) return "无";
  const labels: Record<SycmCoreBoardImport["missingFields"][number], string> = {
    inquiries: "询盘",
    grossMarginRate: "毛利率"
  };
  return fields.map((field) => labels[field]).join("、");
}

function formatReviewCadence(cadence: "daily" | "three_days" | "weekly"): string {
  if (cadence === "daily") return "每日";
  if (cadence === "three_days") return "3 天";
  return "每周";
}
