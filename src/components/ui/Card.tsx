import type { ReactNode } from "react";

export type CardTone = "neutral" | "danger" | "warning" | "success" | "action";

type CardProps = {
  title?: string;
  eyebrow?: string;
  footer?: ReactNode;
  tone?: CardTone;
  className?: string;
  children: ReactNode;
};

export function Card({ title, eyebrow, footer, tone = "neutral", className = "", children }: CardProps) {
  const classNames = ["ui-card", `tone-${tone}`, className].filter(Boolean).join(" ");

  return (
    <article className={classNames}>
      {eyebrow || title ? (
        <header className="ui-card-header">
          {eyebrow ? <span>{eyebrow}</span> : null}
          {title ? <h2>{title}</h2> : null}
        </header>
      ) : null}
      <div className="ui-card-body">{children}</div>
      {footer ? <footer className="ui-card-footer">{footer}</footer> : null}
    </article>
  );
}
