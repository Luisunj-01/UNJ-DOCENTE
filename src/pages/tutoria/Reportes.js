import { useState, useEffect } from "react";
import { useUsuario } from "../../context/UserContext";
import { Card, Button } from "react-bootstrap";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import config from "../../config";
import axios from "axios";
import ModalLogros from "./componentes/ModalLogros";

import {
  FaFileAlt,
  FaListOl,
  FaUsers,
  FaChartLine,
  FaStar,
  FaTable
} from "react-icons/fa";

import { obtenerEscuelasTutor } from "./logica/DatosTutoria";
import ReporteRendimientoModal from "./componentes/ReporteRendimientoModal";

function Reportes() {
  const { usuario } = useUsuario();

  const [semestre, setSemestre] = useState("202502");
  const handleChange = (value) => setSemestre(value);

  const [escuelas, setEscuelas] = useState([]);
  const [cargandoRend, setCargandoRend] = useState(false);
  const [showLogros, setShowLogros] = useState(false);

  const token = usuario?.codigotokenautenticadorunj;

  // ===============================
  // ESTADOS PARA MODAL RENDIMIENTO
  // ===============================
  const [showRendimiento, setShowRendimiento] = useState(false);
  const [alumnosRend, setAlumnosRend] = useState([]);
  const [tutorNombre, setTutorNombre] = useState("");

  // ---------------------------------------------
  // Cargar escuelas asignadas al tutor
  // ---------------------------------------------
  useEffect(() => {
    if (!usuario || !usuario.docente) return;

    const cargar = async () => {
      const resp = await obtenerEscuelasTutor(semestre, token);

      console.log("ESCUELAS DESDE API:", resp);

      if (resp.success) setEscuelas(resp.data);
    };

    cargar();
  }, [semestre, usuario, token]);

  // --------------------------------------------------
  // FUNCIONES PARA LOS REPORTES PDF DIRECTOS DEL BACKEND
  // --------------------------------------------------

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
      "reportePDF",
      "width=900,height=800,left=250,top=90,resizable=yes,scrollbars=yes"
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
      "reportePDF",
      "width=900,height=800,left=250,top=90,resizable=yes,scrollbars=yes"
    );


    } catch (error) {
      console.error("Error al abrir Actividades:", error);
      alert("No se pudo generar el reporte.");
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
      "reportePDF",
      "width=900,height=800,left=250,top=90,resizable=yes,scrollbars=yes"
    );
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo generar el reporte.");
    }
  };


  const abrirSeguimiento = async () => {
    try {
      const persona = usuario?.docente?.persona;

      const url = `${config.apiUrl}api/Tutoria/seguimiento234/${semestre}/${persona}`;

      const resp = await axios.get(url, {
        responseType: "blob"
      });

      const file = new Blob([resp.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
       window.open(
      fileURL,
      "reportePDF",
      "width=900,height=800,left=250,top=90,resizable=yes,scrollbars=yes"
    );
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo generar el reporte.");
    }
  };




  // --------------------------------------------------
  // RENDIMIENTO ESTUDIANTES (ABRE MODAL, NO PDF DIRECTO)
  // --------------------------------------------------
  const abrirRendimiento = async () => {
  try {
    setCargandoRend(true);

    const persona = usuario?.docente?.persona;
    const docente = usuario?.docente?.persona;
    const vperfil = usuario?.perfil || "T";

    const url = `${config.apiUrl}api/Tutoria/reporte-rendimiento/${semestre}/${persona}/${docente}/${vperfil}`;

    const resp = await axios.get(url);

    if (resp.data.success) {
      setAlumnosRend(resp.data.data);
      setTutorNombre(usuario.docente.nombrecompleto);
      setShowRendimiento(true);
    } else {
      alert("No se pudo obtener los datos de rendimiento.");
    }

  } catch (error) {
    console.error("Error al obtener rendimiento:", error);
    alert("Error al cargar los datos de rendimiento.");
  } finally {
    setCargandoRend(false);
  }
};

const abrirConsolidado = async (estructura) => {
  try {
    const persona = usuario.docente.persona;
    const token = usuario.codigotokenautenticadorunj;

    const codigo = btoa(btoa(`${persona}${semestre}`));

    const url = `${config.apiUrl}api/Tutoria/rpt-consolidado/${semestre}/${persona}`;

    const resp = await axios.get(url, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const file = new Blob([resp.data], { type: "application/pdf" });
    const fileURL = URL.createObjectURL(file);

    window.open(
      fileURL,
      "consolidadoPDF",
      "width=900,height=800,left=250,top=90,resizable=yes,scrollbars=yes"
    );

  } catch (error) {
    console.error("Error consolidado:", error);
    alert("No se pudo generar el reporte.");
  }
};





  // ----------------------------------------------
  // Reportes fijos
  // ----------------------------------------------
  const items = [
    { icon: <FaFileAlt size={20} />, titulo: "Datos generales", accion: abrirDatosGenerales },
    { icon: <FaListOl size={20} />, titulo: "Actividades realizadas", accion: abrirActividades },
    { icon: <FaUsers size={20} />, titulo: "Ejecución tutorías grupales", accion: abrirTutoriaGrupales },
     { icon: <FaChartLine size={20} />, titulo: "Seguimiento 2da, 3ra y 4ta", accion: abrirSeguimiento  },
    { icon: <FaChartLine size={20} />, titulo: "Rendimiento estudiante", accion: abrirRendimiento },
    { icon: <FaStar size={20} />, titulo: "Logros, dificultades y recomendaciones", accion: () => setShowLogros(true) },

  ];

  const abrirReporte = (ruta, extra = "") => {
  const persona = usuario.docente.persona;
  const codigo = btoa(btoa(`${persona}${semestre}`));
  const token = usuario.codigotokenautenticadorunj;

  const url =
    `${config.apiUrl}api${ruta}` +
    `?codigo=${codigo}` +
    `&semestre=${semestre}` +
    `&estru=${extra.replace("&estru=", "")}` +
    `&token=${token}`;

  window.open(url, "_blank");
};


  return (
    <div className="container mt-4">

      <h4 className="mb-3 titulozet">Reportes de Tutoría</h4>

      <div className="mb-4" style={{ width: "260px" }}>
        <label className="form-label"><strong>Semestre:</strong></label>
        <SemestreSelect value={semestre} onChange={handleChange} name="cboSemestre" />
      </div>

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
                  disabled={item.titulo === "Rendimiento estudiante" && cargandoRend}
                  onClick={() =>
                    item.titulo === "Rendimiento estudiante"
                      ? abrirRendimiento()
                      : item.accion
                      ? item.accion()
                      : abrirReporte(item.ruta)
                  }
                >
                  {item.titulo === "Rendimiento estudiante" && cargandoRend
                    ? "Cargando..."
                    : "Ver reporte"}
                </Button>

                </div>
              </div>
            </Card.Body>
          </Card>
        ))}

        {/* CONSOLIDADOS DINÁMICOS */}
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
                  onClick={() => abrirConsolidado(e.estructura)}
                >
                  Ver consolidado
                </Button>


                </div>
              </div>
            </Card.Body>
          </Card>
        ))}

      </div>

      {/* ======================= */}
      {/*    MODAL RENDIMIENTO    */}
      {/* ======================= */}
      <ReporteRendimientoModal
        show={showRendimiento}
        onHide={() => setShowRendimiento(false)}
        semestre={semestre}
        tutor={tutorNombre}
        alumnos={alumnosRend}
      />

          <ModalLogros
          show={showLogros}
          onHide={() => setShowLogros(false)}
          semestre={semestre}
          persona={usuario.docente.persona}
          vperfil={usuario.perfil || "P02"}
        />





    </div>
  );
}

export default Reportes;
