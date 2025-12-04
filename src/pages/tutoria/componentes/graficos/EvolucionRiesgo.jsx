import { Bar } from "react-chartjs-2";

export default function EvolucionRiesgo({ data }) {

  const bajo = Array.isArray(data.bajo) ? data.bajo : [data.bajo || 0];
  const medio = Array.isArray(data.medio) ? data.medio : [data.medio || 0];
  const alto = Array.isArray(data.alto) ? data.alto : [data.alto || 0];

  const meses = ["Total"];


  const chartData = {
    labels: meses,
    datasets: [
      {
        label: "Bajo riesgo",
        data: bajo,
        backgroundColor: "#0d6efd",
      },
      {
        label: "Riesgo medio",
        data: medio,
        backgroundColor: "#f0ad4e",
      },
      {
        label: "Alto riesgo",
        data: alto,
        backgroundColor: "#dc3545",
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "rectRounded"
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div style={{ height: "260px", width: "100%" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
