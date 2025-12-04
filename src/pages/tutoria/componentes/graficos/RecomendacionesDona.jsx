import { Doughnut } from "react-chartjs-2";

export default function RecomendacionesDona({ data }) {

  // 🔒 Normalizar datos: siempre array de 4 valores
  const valores = Array.isArray(data)
    ? data
    : [data.emitidas || 0, 0, 0, 0];   // 👈 Provisión segura

  const chartData = {
    labels: ["Académicas", "Emocionales", "Vocacionales", "Administrativas"],
    datasets: [
      {
        label: "Recomendaciones",
        data: valores,
        backgroundColor: ["#0d6efd", "#dc3545", "#198754", "#f0ad4e"],
        borderWidth: 1
      }
    ]
  };

  return <Doughnut data={chartData} height={90} />;
}
