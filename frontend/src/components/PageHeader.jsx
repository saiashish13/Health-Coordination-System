export default function PageHeader({ title, subtitle, icon: Icon, actions }) {
  return (
    <div className="page-header-banner">
      <div className="page-header-title-group">
        <h1>
          {Icon && <Icon size={26} color="var(--primary)" />}
          <span>{title}</span>
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}
