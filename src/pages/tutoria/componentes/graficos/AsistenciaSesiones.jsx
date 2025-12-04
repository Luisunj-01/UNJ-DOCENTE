import { Bar } from "react-chartjs-2";

export default function AsistenciaSesiones({ data }) {
  // 🚨 Protección total
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "#777" }}>
        No hay datos de asistencia
      </div>
    );
  }

  const labels = safeData.map(item => item.label);
  const values = safeData.map(item => item.value);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Sesiones",
        data: values,
        backgroundColor: ["#0d6efd", "#dc3545"],
        borderRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  return <Bar data={chartData} options={options} height={90} />;
}
