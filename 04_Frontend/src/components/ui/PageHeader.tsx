import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export default function PageHeader({ title, description, eyebrow, icon, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-heading">
        {icon ? <div className="page-heading-icon" aria-hidden="true">{icon}</div> : null}
        <div>
          {eyebrow ? <div className="dashboard-eyebrow">{eyebrow}</div> : null}
          <h1 className="page-title">{title}</h1>
          {description ? <p className="page-description">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}
