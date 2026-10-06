import Breadcrumbs from "./Breadcrumbs";

export default function PageHeader({ title, subtitle, icon: Icon, actions, badgeText }) {
  return (
    <div style={{ marginBottom: "28px" }} className="animate-fade-in">
      <Breadcrumbs />
      <div className="page-header-banner">
        <div className="page-header-title-group">
          <h1>
            {Icon && (
              <div 
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "var(--primary-light)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                  boxShadow: "0 0 15px var(--primary-light)"
                }}
              >
                <Icon size={24} />
              </div>
            )}
            <span className="gradient-text">{title}</span>
            {badgeText && <span className="badge-pill badge-info">{badgeText}</span>}
          </h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  );
}
