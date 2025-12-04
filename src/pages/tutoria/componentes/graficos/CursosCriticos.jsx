import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function CursosCriticos({ data }) {
  // Ordenar cursos de mayor → menor repitencias
  const ordenados = [...data].sort((a, b) => b.repitentes - a.repitentes);

  const chartData = {
    labels: ordenados.map(c => c.curso),
    datasets: [
      {
        label: "Repitencias",
        data: ordenados.map(c => c.repitentes),
        backgroundColor: "#dc3545cc", // rojo con transparencia
        borderColor: "#dc3545",
        borderWidth: 1,
        hoverBackgroundColor: "#c82333",
      }
    ]
  };

  const opciones = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false // ocultar leyenda, más limpio
      },
      tooltip: {
        backgroundColor: "#343a40",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
        callbacks: {
  title: () => null, // 👈 desactiva el título duplicado
  label: (context) => {
    const curso = context.label;
    const cantidad = context.formattedValue;
    return `${curso}: ${cantidad} repitencias`;
  }
}
      }
    },

    scales: {
      x: {
        ticks: {
          display: false // ocultamos textos largos
        }
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  return (
    <div style={{ height: "260px", width: "100%" }}>
      {ordenados.length === 0 ? (
        <p className="text-center text-muted mt-4">No hay cursos repetidos</p>
      ) : (
        <Bar data={chartData} options={opciones} />
      )}
    </div>
  );
}
