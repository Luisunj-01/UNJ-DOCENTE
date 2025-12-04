import { Card } from "react-bootstrap";
import { FaUserShield } from "react-icons/fa";

function CardRiesgo({ bajo, medio, alto }) {
  return (
    <Card className="metric-card shadow-sm" style={{ padding: "14px" }}>
      
      {/* ICONO + TÍTULO AL COSTADO */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "8px"
        }}
      >
        <FaUserShield size={26} color="#0d6efd" style={{ marginRight: "8px" }} />

        <span
          style={{
            fontSize: "1rem",
            fontWeight: "600",
            color: "#333"
          }}
        >
          Riesgo académico
        </span>
      </div>

      {/* BAJO - MEDIO - ALTO EN FILA */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          paddingRight: "10px",
          fontSize: "0.95rem"
        }}
      >
        <span style={{ color: "#0d6efd" }}>
          Bajo Riesgo: <b>{bajo}</b>
        </span>

        <span style={{ color: "#fda605ff" }}>
          Riesgo Medio: <b>{medio}</b>
        </span>

        <span style={{ color: "#dc3545" }}>
          Alto Riego: <b>{alto}</b>
        </span>
      </div>
    </Card>
  );
}

export default CardRiesgo;
