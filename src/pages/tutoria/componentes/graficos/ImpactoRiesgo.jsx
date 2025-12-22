import { Bar } from "react-chartjs-2";

export default function ImpactoRiesgo({ datos }) {
  const data = {
    labels: ["Bajo riesgo", "Riesgo medio", "Alto riesgo"],
    datasets: [
      {
        label: "Semestre anterior",
        data: [
          datos.antes.bajo,
          datos.antes.medio,
          datos.antes.alto
        ],
        backgroundColor: "#adb5bd"
      },
      {
        label: "Semestre actual",
        data: [
          datos.despues.bajo,
          datos.despues.medio,
          datos.despues.alto
        ],
        backgroundColor: "#0d6efd"
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" }
    }
  };

  return (
    <div style={{ width: "100%", height: 260 }}>
      <Bar data={data} options={options} />
    </div>
  );
}
