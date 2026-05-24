import type { CardTone } from "./Card";

type StatusBadgeProps = {
  children: string;
  tone?: CardTone;
};

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  return <span className={`status-badge tone-${tone}`}>{children}</span>;
}
