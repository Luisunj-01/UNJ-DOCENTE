import { Bar } from "react-chartjs-2";

export default function CursosCriticos({ data }) {
  const chartData = {
    labels: data.map(c => c.curso),
    datasets: [
      {
        label: "Repitencias",
        data: data.map(c => c.repitentes),
        backgroundColor: "#dc3545"
      }
    ]
  };

  return <Bar data={chartData} height={100} />;
}
