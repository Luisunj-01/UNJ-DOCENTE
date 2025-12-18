// ==========================
// IMPORTS REACT Y COMPONENTES
// ==========================
import { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { useUsuario } from "../../../context/UserContext";
import SemestreSelect from "../../reutilizables/componentes/SemestreSelect";
import config from "../../../config";
import "./dashboard.css";

import CardMetric from "./CardMetric";
import CardRiesgo from "./CardRiesgo";
import EvolucionRiesgo from "./graficos/EvolucionRiesgo";
import AsistenciaSesiones from "./graficos/AsistenciaSesiones";
import DerivacionesServiciosDona from "./graficos/DerivacionesServiciosDona";

import CursosCriticos from "./graficos/CursosCriticos";
import RendimientoRadar from "./graficos/RendimientoRadar";
import AlertasCard from "./graficos/AlertasCard";
import { Modal, Table, Button } from "react-bootstrap";



// ==========================
// ICONOS
// ==========================
import {
  FaUsers,
  FaCheckCircle,
  FaUserClock,
  FaUserShield,
  FaBook,
  FaUser
} from "react-icons/fa";


// ==========================
// CHART.JS IMPORTS
// ==========================
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Tooltip,
  Legend
} from "chart.js";

import { Doughnut } from "react-chartjs-2";


// ==========================
// REGISTRO CHART.JS
// ==========================
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Tooltip,
  Legend
);


function DashboardDocente() {
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;

  const persona = usuario?.docente?.persona;
  const docente = usuario?.docente?.numerodocumento;   // ✔ CORRECTO
  const [semestre, setSemestre] = useState("202502");

  const headers = { Authorization: `Bearer ${token}` };
  

  const [stats, setStats] = useState({
    tutorados: 0,
    sesionesTotal: 0,
    sesionesReal: 0,
    libres: 0,
    atenciones: 0,
    recomendaciones: 0,
    bajo: 0,
    medio: 0,
    alto: 0
  });

// 📌 Gráficos
const [datosRiesgo, setDatosRiesgo] = useState({
  bajo: 0,
  medio: 0,
  alto: 0,
});

const [datosAsistencia, setDatosAsistencia] = useState([]);

// 📌 Alumnos clasificados por riesgo
const [alumnosRiesgo, setAlumnosRiesgo] = useState({
  bajo: [],
  medio: [],
  alto: []
});



const [cursosCriticos, setCursosCriticos] = useState([]);
const [rendimiento, setRendimiento] = useState([]);
const [alertas, setAlertas] = useState({
  riesgoAlto: 0,
  riesgoMedio: 0,
  riesgoBajo: 0,
});

// 📌 Derivaciones (dashboard)
const [derivaciones, setDerivaciones] = useState([]);
const [totalDerivaciones, setTotalDerivaciones] = useState(0);


//  Para los alumons en riego
const [mostrarModal, setMostrarModal] = useState(false);
const [listaModal, setListaModal] = useState([]);
const [tituloModal, setTituloModal] = useState("");



  useEffect(() => {
    if (persona && docente) {
      cargarDashboard();
    }
  }, [semestre]);

  // ⭐ Función de categorización oficial
  function obtenerCategoriaRiesgo(a) {
    if (a.tercera !== null || a.cuarta !== null) return "Alto riesgo";
    if (a.segunda !== null) return "Riesgo medio";
    return "Bajo riesgo";
  }

  // ===================================================================================
  // 🔵 CARGAR TODOS LOS DATOS DEL DASHBOARD
  // ===================================================================================
  const cargarDashboard = async () => {
  try {
    // =================================================
    // 1️⃣ RENDIMIENTO - TUTORADOS + RIESGO (TM/G)
    // =================================================
    const rRend = await fetch(
      `${config.apiUrl}api/Tutoria/rendimiento/${semestre}/${persona}/${docente}/TM/G`,
      { headers }
    );

    const dRend = await rRend.json();

    const tutorados = Array.isArray(dRend) ? dRend.length : 0;

    // Tus riesgos (usando obtenerCategoriaRiesgo)
        const bajo = [];
      const medio = [];
      const alto = [];

      if (Array.isArray(dRend)) {
        dRend.forEach(al => {
          const cat = obtenerCategoriaRiesgo(al);

          if (cat === "Bajo riesgo") bajo.push(al);
          if (cat === "Riesgo medio") medio.push(al);
          if (cat === "Alto riesgo") alto.push(al);
        });
      }

      // 🔹 Para el gráfico
      setDatosRiesgo({
        bajo: bajo.length,
        medio: medio.length,
        alto: alto.length
      });

      // 🔹 Para el modal
      setAlumnosRiesgo({
        bajo,
        medio,
        alto
      });

      // 🔹 Para alertas
      setAlertas({
        riesgoBajo: bajo.length,
        riesgoMedio: medio.length,
        riesgoAlto: alto.length
      });

  

    // =================================================
    // 2️⃣ SESIONES DEL CICLO
    // =================================================
    const rCiclo = await fetch(
      `${config.apiUrl}api/Tutoria/sesCiclo/${persona}/${semestre}`,
      { headers }
    );
    const dCiclo = await rCiclo.json();

    const sesionesTotal = dCiclo?.sesiones?.length || 0;
    const sesionesReal =
      dCiclo?.sesiones?.filter(s => s.activo === 1).length || 0;

   setDatosAsistencia([
  { label: "Realizadas", value: sesionesReal },
  { label: "Pendientes", value: sesionesTotal - sesionesReal },
]);

    // =================================================
    // 3️⃣ SESIONES LIBRES
    // =================================================
    const rLibres = await fetch(
      `${config.apiUrl}api/Tutoria/sesiones-libres/${persona}/${semestre}`,
      { headers }
    );
    const libresData = await rLibres.json();
    const libres = libresData.filter(s => s.activo === 1).length;


   // =================================================
// 4️⃣ DERIVACIONES (Dashboard)
// =================================================
const rDer = await fetch(
  `${config.apiUrl}api/Tutoria/dashboard-derivaciones/${semestre}/${persona}`,
  { headers }
);

const dDer = await rDer.json();

setDerivaciones(dDer?.datos || []);
setTotalDerivaciones(dDer?.total_derivaciones || 0);





    // =================================================
    // 5️⃣ CURSOS CRÍTICOS (mock de momento)
    // =================================================
    setCursosCriticos([
      { curso: "Matemática I", desaprobados: 12 },
      { curso: "Cálculo II", desaprobados: 9 },
      { curso: "Física I", desaprobados: 7 },
    ]);

    // =================================================
// 🔥 5️⃣ CURSOS CRÍTICOS DESDE OBS. RENDIMIENTO
// =================================================

const rObs = await fetch(
  `${config.apiUrl}api/Tutoria/rendimiento/${semestre}/${persona}/${docente}/xx/G`,
  { headers }
);

const dObs = await rObs.json();

// Diccionario para contar repitencias
let conteo = {};

dObs.forEach(al => {
  ["segunda", "tercera", "cuarta"].forEach(col => {
    if (al[col]) {
      al[col]
        .split(",")
        .map(c => c.trim().toUpperCase())
        .filter(c => c !== "")
        .forEach(curso => {
          conteo[curso] = (conteo[curso] || 0) + 1;
        });
    }
  });
});

// Convertir en array para el gráfico
const listaCursos = Object.entries(conteo).map(([curso, repitentes]) => ({
  curso,
  repitentes
}));

setCursosCriticos(listaCursos);


    // =================================================
    // 7️⃣ GUARDAR EN ESTADO PRINCIPAL
    // =================================================
    setStats({
        tutorados,
        sesionesTotal,
        sesionesReal,
        libres,
        atenciones: dDer?.total_derivaciones || 0,
        recomendaciones: dDer?.total_derivaciones || 0,
        bajo: bajo.length,
        medio: medio.length,
        alto: alto.length
    });

  } catch (error) {
    console.error("Error en dashboard:", error);
  }
};


  // ===================================================================================
  // (CATEGORÍAS DE RIESGO)
  // ===================================================================================
  const dataDona = {
    labels: ["Bajo riesgo", "Riesgo medio", "Alto riesgo"],
    datasets: [
      {
        data: [stats.riesgoBajo, stats.riesgoMedio, stats.riesgoAlto],
        backgroundColor: ["#0d6efd", "#ffc107", "#dc3545"],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="container mt-4">

      {/* Selector */}
      <div className="col-md-3">
        <SemestreSelect
          value={semestre}
          onChange={setSemestre}
          name="cboSemestre"
        />
      </div>

      <h3 className="mt-3">Dashboard de Tutoría</h3>

      {/* ==================================== */}
      {/* CARDS PEQUEÑAS */}
      {/* ==================================== */}
      <Row className="g-3 mt-2">
        <Col md={2}><CardMetric title="Tutorados" value={stats.tutorados} color="#007bff" icon={<FaUsers />} /></Col>
        <Col md={2}><CardMetric title="Sesiones ciclo" value={`${stats.sesionesReal}/${stats.sesionesTotal}`} color="#17a2b8" icon={<FaCheckCircle />} /></Col>
        <Col md={2}><CardMetric title="Sesiones libres" value={stats.libres} color="#20c997" icon={<FaUserClock />} /></Col>
        <Col md={2}><CardMetric title="Derivaciones" value={stats.atenciones} color="#ffc107" icon={<FaBook />} /></Col>
        <Col md={3}>
            <CardRiesgo 
            bajo={stats.bajo} 
            medio={stats.medio} 
            alto={stats.alto} 
          />

            </Col>
        </Row>

        {/* =============================== */}
{/* GRÁFICOS ORDENADOS */}
{/* =============================== */}

<Row className="mt-4 g-4">

  <Col md={4}>
    <Card className="shadow-sm p-3 grafico-card">
      <h6 className="mb-3 text-center">Evolución del riesgo</h6>
      <EvolucionRiesgo
  data={datosRiesgo}
  onBarClick={(index) => {
    if (index === 0) {
      setListaModal(alumnosRiesgo.bajo);
      setTituloModal("Alumnos en Bajo Riesgo");
    }
    if (index === 1) {
      setListaModal(alumnosRiesgo.medio);
      setTituloModal("Alumnos en Riesgo Medio");
    }
    if (index === 2) {
      setListaModal(alumnosRiesgo.alto);
      setTituloModal("Alumnos en Alto Riesgo");
    }
    setMostrarModal(true);
  }}
/>

    </Card>
  </Col>

  <Col md={4}>
    <Card className="shadow-sm p-3 grafico-card">
      <h6 className="mb-3 text-center">Asistencia a sesiones</h6>
      <AsistenciaSesiones data={datosAsistencia} />
    </Card>
  </Col>

  <Col md={4}>
    <Card className="shadow-sm p-3 grafico-card">
      <h6 className="mb-3 text-center">Derivaciones Emitidas</h6>
      <DerivacionesServiciosDona data={derivaciones} />

    </Card>
  </Col>

</Row>

<Row className="mt-4 g-4">

  <Col md={4}>
    <Card className="shadow-sm p-3 grafico-card">
      <h6 className="mb-3 text-center">Cursos críticos</h6>
      <CursosCriticos data={cursosCriticos} />
    </Card>
  </Col>

  <Col md={4}>
    <Card className="shadow-sm p-3 grafico-card">
      <h6 className="mb-3 text-center">Rendimiento por área</h6>
      <RendimientoRadar data={rendimiento} />
    </Card>
  </Col>

  <Col md={4}>
    <Card className="shadow-sm p-3 grafico-card">
      <h6 className="mb-3 text-center">Alertas importantes</h6>
      <AlertasCard alertas={alertas} />
    </Card>
  </Col>

</Row>


{/* =============================== */}
{/* MODAL ALUMNOS POR RIESGO */}
{/* =============================== */}
<Modal
  show={mostrarModal}
  onHide={() => setMostrarModal(false)}
  size="lg"
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>{tituloModal}</Modal.Title>
  </Modal.Header>

    <Modal.Body>
  {listaModal.length === 0 ? (
    <p className="text-center">No hay alumnos en esta categoría</p>
  ) : (
    <div className="tabla-modal-contenedor">
      <table className="tabla-modal">
        <thead>
          <tr>
            <th>Código</th>
            <th>Alumno</th>
            <th>Carrera</th>
          </tr>
        </thead>
        <tbody>
          {listaModal.map((al, idx) => (
            <tr key={idx}>
              <td>
                <span className="badge-codigo">
                  {al.alumno}
                </span>
              </td>
              <td className="alumno-nombre">
                {al.nombrecompleto}
              </td>
              <td className="alumno-carrera">
                {al.nombreescuela}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</Modal.Body>


  <Modal.Footer>
    <Button variant="secondary" onClick={() => setMostrarModal(false)}>
      Cerrar
    </Button>
  </Modal.Footer>
</Modal>




      
    </div>
  );
}

export default DashboardDocente;
