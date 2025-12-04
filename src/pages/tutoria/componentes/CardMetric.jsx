import { Card } from "react-bootstrap";

function CardMetric({ title, value, color = "#0d6efd", icon }) {
  return (
    <Card
      className="metric-card shadow-sm d-flex flex-row align-items-center"
      style={{
        borderLeft: `5px solid ${color}`,
        padding: "12px 16px",
        minHeight: "75px"
      }}
    >
      {/* Icono */}
      <div
        className="me-3"
        style={{ fontSize: "28px", color: color, display: "flex", alignItems: "center" }}
      >
        {icon}
      </div>

      {/* Texto */}
      <div>
        <small style={{ fontSize: "14px", opacity: 0.7 }}>{title}</small>
        <h4 style={{ margin: 0, fontWeight: "600" }}>{value}</h4>
      </div>
    </Card>
  );
}

export default CardMetric;
