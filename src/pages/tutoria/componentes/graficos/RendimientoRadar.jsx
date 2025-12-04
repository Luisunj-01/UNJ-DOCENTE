import { Radar } from "react-chartjs-2";

export default function RendimientoRadar({ data }) {

  const safeData = Array.isArray(data) ? data : [];

  const labels = safeData.map(item => item.area);
  const values = safeData.map(item => item.score);

  const chartData = {
    labels: labels.length > 0 ? labels : ["Sin datos"],
    datasets: [
      {
        label: "Rendimiento por área",
        data: values.length > 0 ? values : [0],
        borderColor: "#6610f2",
        backgroundColor: "rgba(102,16,242,0.25)",
        borderWidth: 2,
        pointBackgroundColor: "#6610f2"
      }
    ]
  };

  return <Radar data={chartData} height={100} />;
}
