import { Line } from "react-chartjs-2";
import { Card } from "react-bootstrap";

export default function LineaDistribucionRiesgo({ alertas }) {
  if (!alertas) return null;

  const data = {
    labels: ["Bajo riesgo", "Riesgo medio", "Alto riesgo"],
    datasets: [
      {
        label: "Alumnos por nivel de riesgo",
        data: [
          alertas.riesgoBajo || 0,
          alertas.riesgoMedio || 0,
          alertas.riesgoAlto || 0,
        ],
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13,110,253,0.1)",
        tension: 0.4,

        // 🔹 Radio base
        pointRadius: ctx =>
          ctx.dataIndex === 2 ? 8 : 5,

        // 🔹 Animación SOLO para alto riesgo
        pointHoverRadius: ctx =>
          ctx.dataIndex === 2 ? 12 : 6,

        pointBackgroundColor: ctx => {
          if (ctx.dataIndex === 2) return "#dc3545"; // rojo
          if (ctx.dataIndex === 1) return "#ffc107"; // amarillo
          return "#0d6efd"; // azul
        }
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    animations: {
      radius: {
        duration: 1200,
        easing: "easeInOutQuad",
        loop: true
      }
    },

    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Distribución del riesgo académico (prioridad de intervención)"
      },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.parsed.y} alumnos`
        }
      }
    },

    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 2 }
      }
    }
  };

  return (
    <Card className="shadow-sm p-3" style={{  width: "100%" , height: 260 }}>
      <Line data={data} options={options} />
    </Card>
  );
}
