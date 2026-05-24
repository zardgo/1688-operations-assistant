import type { CardTone } from "./Card";

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: CardTone;
};

export function MetricCard({ label, value, helper, tone = "neutral" }: MetricCardProps) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper ? <small>{helper}</small> : null}
    </article>
  );
}
