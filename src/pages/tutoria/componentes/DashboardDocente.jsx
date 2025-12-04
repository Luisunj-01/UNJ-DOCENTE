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
import RecomendacionesDona from "./graficos/RecomendacionesDona";
import CursosCriticos from "./graficos/CursosCriticos";
import RendimientoRadar from "./graficos/RendimientoRadar";
import AlertasCard from "./graficos/AlertasCard";


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


const [datosRecomendaciones, setDatosRecomendaciones] = useState({
  emitidas: 0,
});

const [cursosCriticos, setCursosCriticos] = useState([]);
const [rendimiento, setRendimiento] = useState([]);
const [alertas, setAlertas] = useState({
  riesgoAlto: 0,
  riesgoMedio: 0,
  riesgoBajo: 0,
});




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
    let riesgoBajo = 0;
    let riesgoMedio = 0;
    let riesgoAlto = 0;

    if (Array.isArray(dRend)) {
      dRend.forEach(al => {
        const cat = obtenerCategoriaRiesgo(al);
        if (cat === "Bajo riesgo") riesgoBajo++;
        if (cat === "Riesgo medio") riesgoMedio++;
        if (cat === "Alto riesgo") riesgoAlto++;
      });
    }

    // Mis riesgos para gráficos
    setDatosRiesgo({
      bajo: riesgoBajo,
      medio: riesgoMedio,
      alto: riesgoAlto
    });

    // Alertas (tarjeta pequeña abajo)
    setAlertas({
      riesgoBajo,
      riesgoMedio,
      riesgoAlto,
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
    // 4️⃣ ATENCIONES + RECOMENDACIONES
    // =================================================
    const rDer = await fetch(
      `${config.apiUrl}api/Tutoria/derivaciones-tutor/${semestre}/${persona}`,
      { headers }
    );
    const dDer = await rDer.json();

    const atenciones = dDer?.derivaciones?.length || 0;
    const recomendaciones = atenciones;

    setDatosRecomendaciones({ emitidas: recomendaciones });

    // =================================================
    // 5️⃣ CURSOS CRÍTICOS (mock de momento)
    // =================================================
    setCursosCriticos([
      { curso: "Matemática I", desaprobados: 12 },
      { curso: "Cálculo II", desaprobados: 9 },
      { curso: "Física I", desaprobados: 7 },
    ]);

    // =================================================
    // 6️⃣ RENDIMIENTO RADAR (mock)
    // =================================================
    setRendimiento([
      { area: "Comunicación", score: 78 },
      { area: "Matemática", score: 65 },
      { area: "Ciencias", score: 72 },
      { area: "Humanidades", score: 80 },
    ]);

    // =================================================
    // 7️⃣ GUARDAR EN ESTADO PRINCIPAL
    // =================================================
    setStats({
      tutorados,
      sesionesTotal,
      sesionesReal,
      libres,
      atenciones,
      recomendaciones,
      riesgoBajo,
      riesgoMedio,
      riesgoAlto,
    });

  } catch (error) {
    console.error("Error en dashboard:", error);
  }
};


  // ===================================================================================
  // 🎨 GRAFICO DE DONA (CATEGORÍAS DE RIESGO)
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
        <Col md={2}><CardMetric title="Atenciones" value={stats.atenciones} color="#ffc107" icon={<FaBook />} /></Col>
        <Col md={3}>
            <CardRiesgo 
                bajo={stats.riesgoBajo} 
                medio={stats.riesgoMedio} 
                alto={stats.riesgoAlto} 
            />
            </Col>
        </Row>

{/* ⬇️ AQUÍ VA EXACTAMENTE LOS GRÁFICOS */}
      
      <Row className="mt-4 g-4">
        <Col md={4}><EvolucionRiesgo data={datosRiesgo} /></Col>
        <Col md={4}><AsistenciaSesiones data={datosAsistencia} /></Col>
        <Col md={4}><RecomendacionesDona data={datosRecomendaciones} /></Col>
      </Row>

      <Row className="mt-4 g-4">
        <Col md={4}><CursosCriticos data={cursosCriticos} /></Col>
        <Col md={4}><RendimientoRadar data={rendimiento} /></Col>
        <Col md={4}><AlertasCard alertas={alertas} /></Col>
      </Row>



      {/* ==================================== */}
      {/* GRÁFICO DONA */}
      {/* ==================================== */}
      <Row className="mt-4">
        <Col md={4}>
  <Card className="p-3 shadow-sm">
    <h6 className="text-center">Categorización de Riesgo</h6>

    <div style={{
      width: "260px",
      height: "260px",
      margin: "0 auto"
    }}>
      <Doughnut
        data={dataDona}
        options={{
          maintainAspectRatio: false,
        }}
      />
    </div>

  </Card>
</Col>



        {/* Espacios vacíos para más gráficos */}
        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <div style={{ width: "100%", height: "250px", background: "#0d5978" }}></div>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <div style={{ width: "100%", height: "250px", background: "#0d5978" }}></div>
          </Card>
        </Col>

      </Row>

      {/* ==================================== */}
      {/* FILA 2 - GRÁFICOS OPCIONALES */}
      {/* ==================================== */}
      <Row className="g-4 mt-3">

        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <div style={{ width: "100%", height: "250px", background: "#0d5978" }}></div>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <div style={{ width: "100%", height: "250px", background: "#0d5978" }}></div>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <div style={{ width: "100%", height: "250px", background: "#0d5978" }}></div>
          </Card>
        </Col>

      </Row>

    </div>
  );
}

export default DashboardDocente;
