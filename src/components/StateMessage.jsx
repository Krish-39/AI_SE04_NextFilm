import "./StateMessage.css";

export default function StateMessage({ icon: Icon, title, children, action }) {
  return (
    <div className="state-message">
      {Icon && <Icon size={28} aria-hidden="true" className="state-message__icon" />}
      <h2 className="section-title">{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
