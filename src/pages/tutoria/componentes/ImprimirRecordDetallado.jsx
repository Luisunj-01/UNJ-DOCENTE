import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLocation } from "react-router-dom";
import { TablaSkeleton } from "../../reutilizables/componentes/TablaSkeleton";
import { useUsuario } from "../../../context/UserContext";
import { FaPrint } from "react-icons/fa";
import { obtenerRecordDetallado } from "../logica/DatosTutoria";

// Fecha y hora
const fecha = new Date();
const fechaTexto = fecha.toLocaleDateString("es-PE");
const horaTexto = fecha.toLocaleTimeString("es-PE", {
  hour: "2-digit",
  minute: "2-digit",
});

const ImprimirRecordDetallado = () => {
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;

  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // ===============================
  // DECODIFICAR CODIGO DOBLE BASE64
  // ===============================
  const codigoParam = params.get("codigo");

  let alumno = "",
    escuela = "",
    curricula = "";

  try {
    if (codigoParam) {
      const d1 = atob(codigoParam);
      const d2 = atob(d1);
      [alumno, escuela, curricula] = d2.split("|");
    }
  } catch (e) {
    console.error("❌ Error al decodificar:", e);
  }

  // ===============================
  // ALUMNO GUARDADO (para encabezado)
  // ===============================
  const alumnoGuardado = JSON.parse(
    sessionStorage.getItem("alumnoSeleccionado") ||
      localStorage.getItem("alumnoSeleccionado") ||
      "{}"
  );

  // ===============================
  // ESTADOS
  // ===============================
  const [cursos, setCursos] = useState([]);
  const [cabecera, setCabecera] = useState({});
  const [loading, setLoading] = useState(true);

  const urlActual = window.location.href;

  // ===============================
  // CARGA DE DATOS
  // ===============================
  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const resp = await obtenerRecordDetallado(alumno, escuela, curricula, token);

    if (resp.success) {
      setCabecera(resp.cabecera || {});
      setCursos(resp.cursos || []);
    }

    setLoading(false);
  };

  const imprimir = () => window.print();

  if (loading) return <TablaSkeleton filas={12} />;

  // ===============================
  // RENDER
  // ===============================
  return (
    <>
      {/* Botón imprimir */}
      <button className="print-button" onClick={imprimir}>
        <FaPrint />
      </button>

      <div className="container mt-4 ficha-container">

        {/* ================================
            ENCABEZADO INSTITUCIONAL 
            (Exacto al de Constancia de Notas)
        ================================= */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <img src="/image/logo/logo-unj-v1.svg" alt="logo" width="120" />

          <div className="text-center">
            <h5><strong>UNIVERSIDAD NACIONAL DE JAÉN</strong></h5>
            <h6><strong>RECORD DETALLADO</strong></h6>
            <p style={{ fontSize: "0.8rem" }}>
              Fecha: {fechaTexto} | Hora: {horaTexto}
            </p>
          </div>

          <QRCodeSVG value={urlActual} size={80} level="L" />
        </div>

        {/* ================================
            DATOS DEL ALUMNO (igual a Constancia)
        ================================= */}
        <div
          className="mb-3"
          style={{
            lineHeight: "1.6",
            fontSize: "0.95rem",
            border: "1px solid #ccc",
            borderRadius: "6px",
            padding: "10px 15px",
          }}
        >
          <p><strong>Carrera:</strong> {alumnoGuardado.nombreescuela}</p>
          <p><strong>Alumno:</strong> {alumnoGuardado.nombrecompleto}</p>
          <p><strong>Código:</strong> {alumnoGuardado.alumno}</p>
          <p><strong>Currícula:</strong> {alumnoGuardado.curricula}</p>
          <p><strong>Semestre:</strong> {alumnoGuardado.semestre}</p>
        </div>

        {/* ================================
            TABLA PRINCIPAL CON SEPARACIÓN POR CICLO
        ================================= */}
        <table className="table table-bordered text-center tabla-cursos">
          <thead style={{ background: "#f5f5f5" }}>
            <tr>
              <th>Curso</th>
              <th>Ti</th>
              <th>Nombre del Curso</th>
              <th>Créd.</th>
              <th>N1</th>
              <th>N2</th>
              <th>N3</th>
              <th>N4</th>
              <th>Sem.1</th>
              <th>Sem.2</th>
              <th>Sem.3</th>
              <th>Sem.4</th>
            </tr>
          </thead>

          <tbody>
            {cursos.map((c, i) => {
              const mostrarSeparador =
                i > 0 && c.ciclo !== cursos[i - 1].ciclo;

              return (
                <React.Fragment key={i}>

                  {/* ---- Línea separadora por ciclo ---- */}
                  {mostrarSeparador && (
                    <tr>
                      <td colSpan="12" style={{ padding: 0 }}>
                        <hr style={{ borderTop: "2px dashed #aaa", margin: 0 }} />
                      </td>
                    </tr>
                  )}

                  {/* ---- Fila normal ---- */}
                  <tr>
                    <td>{c.curso}</td>
                    <td>{c.tipocurso}</td>
                    <td style={{ textAlign: "left" }}>{c.nombre}</td>
                    <td>{c.creditos}</td>

                    {["n1", "n2", "n3", "n4"].map((n) => (
                      <td
                        key={n}
                        style={{
                          fontWeight: "bold",
                          color: c[n] >= 11 ? "#003399" : "#A80000",
                        }}
                      >
                        {c[n]}
                      </td>
                    ))}

                    <td>{c.semestre1}</td>
                    <td>{c.semestre2}</td>
                    <td>{c.semestre3}</td>
                    <td>{c.semestre4}</td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* ================================
            PIE DE REPORTE
        ================================= */}
       <div style={{ width: "350px", marginTop: "20px", fontSize: "13px" }}>
  <p>
    <strong>Créditos obligatorios aprobados:</strong>
    <strong style={{ marginLeft: "20px" }}>
      {cabecera.coa} de {cabecera.coc}
    </strong>
  </p>

  <p>
    <strong>Créditos electivos aprobados:</strong>
    <strong style={{ marginLeft: "37px" }}>
      {cabecera.cea} de {cabecera.cec}
    </strong>
  </p>

  <p>
    <strong>Promedio ponderado acumulado:</strong>
    <strong style={{ marginLeft: "20px" }}>
      {cabecera.promedio}
    </strong>
  </p>
</div>



      </div>
    </>
  );
};

export default ImprimirRecordDetallado;
