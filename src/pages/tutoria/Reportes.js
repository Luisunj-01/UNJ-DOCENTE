import { useState, useEffect } from "react";
import { useUsuario } from "../../context/UserContext";
import { Card, Button } from "react-bootstrap";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import config from "../../config";
import axios from "axios";
import {
  FaFileAlt,
  FaListOl,
  FaUsers,
  FaChartLine,
  FaStar,
  FaTable
} from "react-icons/fa";

import { obtenerEscuelasTutor } from "./logica/DatosTutoria";   // <-- FALTA ESTO

function Reportes() {
  const { usuario } = useUsuario();

  const [semestre, setSemestre] = useState("202502");
  const handleChange = (value) => setSemestre(value);

  const [escuelas, setEscuelas] = useState([]);  // <-- FALTA ESTO

  const token = usuario?.codigotokenautenticadorunj;

  // ✔ Código doble base64
  const generarCodigo = () => {
    const persona = usuario.docente.persona;
    const codigo = `${persona}${semestre}`;
    return btoa(btoa(codigo));
  };

const abrirDatosGenerales = async () => {
  try {
    const persona = usuario?.docente?.persona;

    const url = `${config.apiUrl}api/Tutoria/DatosTutor/${semestre}/${persona}`;

    const resp = await axios.get(url, {
      responseType: "blob"
    });

    const file = new Blob([resp.data], { type: "application/pdf" });
    const fileURL = URL.createObjectURL(file);

    window.open(
      fileURL,
      "_blank",
      "width=900,height=1100,scrollbars=yes,resizable=yes"
    );

  } catch (error) {
    console.error("Error al abrir Datos Generales:", error);
    alert("No se pudo generar el reporte. Intente nuevamente.");
  }
};

const abrirActividades = async () => {
  try {
    const persona = usuario?.docente?.persona;

    const url = `${config.apiUrl}api/Tutoria/Actividades/${semestre}/${persona}`;

    const resp = await axios.get(url, {
      responseType: "blob"
    });

    const file = new Blob([resp.data], { type: "application/pdf" });
    const fileURL = URL.createObjectURL(file);

    window.open(
      fileURL,
      "_blank",
      "width=900,height=1100,scrollbars=yes,resizable=yes"
    );

  } catch (error) {
    console.error("Error al abrir Datos Generales:", error);
    alert("No se pudo generar el reporte. Intente nuevamente.");
  }
};

const abrirTutoriaGrupales = async () => {
  try {
    const persona = usuario?.docente?.persona;

    const url = `${config.apiUrl}api/Tutoria/TutoriasGrupales/${semestre}/${persona}`;

    const resp = await axios.get(url, {
      responseType: "blob"
    });

    const file = new Blob([resp.data], { type: "application/pdf" });
    const fileURL = URL.createObjectURL(file);

    window.open(
      fileURL,
      "_blank",
      "width=900,height=1100,scrollbars=yes,resizable=yes"
    );

  } catch (error) {
    console.error("Error al abrir Datos Generales:", error);
    alert("No se pudo generar el reporte. Intente nuevamente.");
  }
};



  // ==========================================
  //  CARGAR ESCUELAS DEL TUTOR (CONSOLIDADO)
  // ==========================================
 useEffect(() => {
  if (!usuario || !usuario.docente) return; // evitar ejecutarse antes

  const cargar = async () => {
    const resp = await obtenerEscuelasTutor(semestre, token);

    console.log("ESCUELAS DESDE API:", resp);

    if (resp.success) {
      setEscuelas(resp.data);
    }
  };

  cargar();
}, [semestre, usuario, token]);



  // ==========================================
  //  REPORTES FIJOS (7)
  // ==========================================
const items = [
  { icon: <FaFileAlt size={20} />, titulo: "Datos generales", accion: abrirDatosGenerales },
  { icon: <FaListOl size={20} />, titulo: "Actividades realizadas", accion: abrirActividades },
  { icon: <FaUsers size={20} />, titulo: "Ejecución tutorías grupales", accion: abrirTutoriaGrupales },
  { icon: <FaChartLine size={20} />, titulo: "Seguimiento 2da, 3ra y 4ta", ruta: "/tutoria/rpt-seguimiento" },
  { icon: <FaChartLine size={20} />, titulo: "Rendimiento estudiante", ruta: "/tutoria/rpt-rendimiento" },
  { icon: <FaStar size={20} />, titulo: "Logros y recomendaciones", ruta: "/tutoria/rpt-logros" },
];

  const abrirReporte = (ruta, extra = "") => {
    const codigo = generarCodigo();
    window.open(`${ruta}?codigo=${codigo}&semestre=${semestre}${extra}`, "_blank");
  };

  return (
    <div className="container mt-4">

      <h4 className="mb-3 titulozet">Reportes de Tutoría</h4>

      {/* Selector de semestre */}
      <div className="mb-4" style={{ width: "260px" }}>
        <label className="form-label"><strong>Semestre:</strong></label>
        <SemestreSelect value={semestre} onChange={handleChange} name="cboSemestre" />
      </div>

      {/* 4 REPORTES ARRIBA + 3 ABAJO */}
      <div
        className="grid-reportes"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          rowGap: "25px"
        }}
      >
        {items.map((item, index) => (
          <Card key={index} className="shadow-sm" style={{ borderRadius: "14px" }}>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div
                  style={{
                    background: "#e9f3ff",
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "15px"
                  }}
                >
                  {item.icon}
                </div>

                <div>
                  <h6 style={{ margin: 0, fontSize: "15px" }}>
                    {item.titulo}
                  </h6>
<Button
  size="sm"
  variant="primary"
  className="mt-2"
  onClick={() => item.accion ? item.accion() : abrirReporte(item.ruta)}
>
  Ver reporte
</Button>

                </div>
              </div>
            </Card.Body>
          </Card>
        ))}

        {/* ========================================== */}
        {/*  CONSOLIDADO DINÁMICO (AL, TM, P02, etc.)   */}
        {/* ========================================== */}
        {escuelas.map((e, i) => (
          <Card key={`cons-${i}`} className="shadow-sm" style={{ borderRadius: "14px" }}>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div
                  style={{
                    background: "#e9f3ff",
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "15px"
                  }}
                >
                  <FaTable size={20} />
                </div>

                <div>
                  <h6 style={{ margin: 0, fontSize: "15px" }}>
                    Consolidado {e.nombreescuela}
                  </h6>

                  <Button
                    size="sm"
                    variant="success"
                    className="mt-2"
                    onClick={() =>
                      abrirReporte("/tutoria/rpt-consolidado", `&estru=${e.estructura}`)
                    }
                  >
                    Ver consolidado
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Reportes;
