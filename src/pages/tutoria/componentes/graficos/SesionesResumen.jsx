import { Bar } from "react-chartjs-2";

export default function SesionesResumen({ data }) {

  if (!data) {
    return <div className="text-center text-muted">Sin datos</div>;
  }

  const chartData = {
    labels: ["Sesiones ciclo", "Sesiones libres"],
    datasets: [
      {
        label: "Concluidas",
        data: [
          data.ciclo.concluidas,
          data.libres.concluidas
        ],
        backgroundColor: "#0d6efd"
      },
      {
        label: "Pendientes",
        data: [
          data.ciclo.pendientes,
          data.libres.pendientes
        ],
        backgroundColor: "#dc3545"
      }
    ]
  };

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" }
  },
  scales: {
    x: { stacked: true },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: { stepSize: 1 }
    }
  },
  layout: {
    padding: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 0
    }
  }
};


  return (
    <div style={{ height: 270, width: "90%" }}>
  <Bar data={chartData} options={options} />
</div>

  );
}
