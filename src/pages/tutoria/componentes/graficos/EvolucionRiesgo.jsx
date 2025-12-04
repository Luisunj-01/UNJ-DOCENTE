import { Line } from "react-chartjs-2";

export default function EvolucionRiesgo({ data }) {

  // Garantizar arrays válidos
  const bajo = Array.isArray(data.bajo) ? data.bajo : [data.bajo || 0];
  const medio = Array.isArray(data.medio) ? data.medio : [data.medio || 0];
  const alto = Array.isArray(data.alto) ? data.alto : [data.alto || 0];

  const meses = ["Marzo", "Abril", "Mayo", "Junio"].slice(0, bajo.length);

  const chartData = {
    labels: meses,
    datasets: [
      {
        label: "Bajo riesgo",
        data: bajo,
        borderColor: "#0d6efd",
        fill: false,
        tension: 0.4
      },
      {
        label: "Riesgo medio",
        data: medio,
        borderColor: "#f0ad4e",
        fill: false,
        tension: 0.4
      },
      {
        label: "Alto riesgo",
        data: alto,
        borderColor: "#dc3545",
        fill: false,
        tension: 0.4
      }
    ]
  };

  return <Line data={chartData} height={90} />;
}
