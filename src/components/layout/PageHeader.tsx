type PageHeaderProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

export function PageHeader({ title, description, eyebrow }: PageHeaderProps) {
  return (
    <header className="page-header">
      {eyebrow ? <span>{eyebrow}</span> : null}
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
