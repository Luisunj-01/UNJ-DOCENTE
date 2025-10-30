// ./componentes/EstadoBadge.jsx
import { Badge } from "react-bootstrap";

const EstadoBadge = ({ estado }) => {
  const e = (estado || "").toString().trim().toUpperCase();

  const palette = {
    PENDIENTE: {
      backgroundColor: "#fbff01ff", // amarillo suave
      color: "#664d03",
      border: "1px solid #ffe69c",
    },
    PROGRAMADO: {
      backgroundColor: "#2e3033ff", // azul suave
      color: "#2754b4ff",
      border: "1px solid #536580ff",
    },
    ATENDIDO: {
      backgroundColor: "#d1e7dd", // verde suave
      color: "#1fa064ff",
      border: "1px solid #a3cfbb",
    },
  };

  const base = {
    padding: "4px 10px",
    borderRadius: "999px",
    fontWeight: 600,
    display: "inline-block",
    lineHeight: 1.2,
    fontSize: "0.85rem",
    whiteSpace: "nowrap",
  };

  const style = { ...base, ...(palette[e] || {
    backgroundColor: "#e2e3e5", // gris fallback
    color: "#3687d8ff",
    border: "1px solid #cfd1d3",
  })};

  return <span style={style}>{estado || "—"}</span>;
};

export default EstadoBadge;
