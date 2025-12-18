import { Doughnut } from "react-chartjs-2";

export default function DerivacionesServiciosDona({ data }) {

  const datos = Array.isArray(data) ? data : data?.datos || [];

  if (datos.length === 0) {
    return <p className="text-center">Sin derivaciones registradas</p>;
  }

  const labels = datos.map(d => d.servicio);
  const valores = datos.map(d => d.total);

const abreviarServicio = (nombre) => {
  return nombre
    .replace("Servicio ", "Serv. ")
    .replace("asistencia social", "asist. social")
    .replace("odontológico", "odontológico")
    .replace("psicopedagógico", "psicopedagógico")
    .replace("psicológico", "psicológico");
};


  const colores = [
    "#0d6efd",
    "#dc3545",
    "#198754",
    "#f0ad4e",
    "#6f42c1",
    "#20c997"
  ];

  const chartData = {
    labels,
    datasets: [
      {
        data: valores,
        backgroundColor: colores.slice(0, valores.length),
        borderWidth: 1
      }
    ]
  };

const options = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      align: "center",
      labels: {
        usePointStyle: true,
        boxWidth: 30,
        padding: 10,

        generateLabels: (chart) => {
          const datasets = chart.data.datasets[0];
          const labels = chart.data.labels;

          return labels.map((label, i) => ({
            text:
              i < labels.length - 6
                ? `${abreviarServicio(label)}  `
                : abreviarServicio(label), // 👈 último sin guión
            fillStyle: datasets.backgroundColor[i],
            strokeStyle: datasets.backgroundColor[i],
            pointStyle: "rect",
            hidden: false,
            index: i
          }));
        }
      }
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const d = datos[context.dataIndex];
          return [
            `Total: ${d.total}`,
            `Atendido: ${d.atendido}`,
            `Programado: ${d.programado}`,
            `Pendiente: ${d.pendiente}`
          ];
        }
      }
    }
  }
};



  return (
    <div style={{ height: 260 }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
