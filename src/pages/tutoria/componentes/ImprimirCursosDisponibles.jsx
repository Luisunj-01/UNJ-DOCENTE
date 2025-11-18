import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLocation } from "react-router-dom";
import { TablaSkeleton } from "../../reutilizables/componentes/TablaSkeleton";
import { useUsuario } from "../../../context/UserContext";
import { FaPrint } from "react-icons/fa";
import { obtenerCursosDisponibles } from "../logica/DatosTutoria";

const fecha = new Date();
const fechaTexto = fecha.toLocaleDateString("es-PE");
const horaTexto = fecha.toLocaleTimeString("es-PE", {
  hour: "2-digit",
  minute: "2-digit",
});

const ImprimirCursosDisponibles = () => {
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // DECODIFICAR
  const codigoParam = params.get("codigo");

  let alumno = "", sede = "", escuela = "", curricula = "";
  try {
    if (codigoParam) {
      const d1 = atob(codigoParam);
      const d2 = atob(d1);
      [alumno, sede, escuela, curricula] = d2.split("|");
    }
  } catch (e) {}

  const alumnoGuardado = JSON.parse(
    sessionStorage.getItem("alumnoSeleccionado") ||
      localStorage.getItem("alumnoSeleccionado") ||
      "{}"
  );

  const [cursos, setCursos] = useState([]);
  const [cabecera, setCabecera] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const resp = await obtenerCursosDisponibles(
      alumno,
      sede,
      escuela,
      curricula,
      token
    );

    if (resp.success) {
      setCabecera(resp.cabecera);
      setCursos(resp.cursos);
    }

    setLoading(false);
  };

  const imprimir = () => window.print();

  if (loading) return <TablaSkeleton filas={12} />;

  return (
    <>
      <button className="print-button" onClick={imprimir}>
        <FaPrint />
      </button>

      <div className="container mt-4 ficha-container">

        {/* CABECERA UNJ */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <img src="/image/logo/logo-unj-v1.svg" alt="logo" width="120" />

          <div className="text-center">
            <h5><strong>UNIVERSIDAD NACIONAL DE JAÉN</strong></h5>
            <h6><strong>CURSOS DISPONIBLES</strong></h6>
            <p style={{ fontSize: "0.8rem" }}>
              Fecha: {fechaTexto} | Hora: {horaTexto}
            </p>
          </div>

          <QRCodeSVG value={window.location.href} size={80} />
        </div>

        {/* INFORMACIÓN DEL ALUMNO */}
        <div
          style={{
            lineHeight: "1.6",
            fontSize: "0.95rem",
            border: "1px solid #ccc",
            borderRadius: "6px",
            padding: "10px 15px",
          }}
        >
          <p><strong>Carrera:</strong> {alumnoGuardado.nombreescuela}</p>
          <p><strong>Código:</strong> {alumnoGuardado.alumno}</p>
          <p><strong>Alumno:</strong> {alumnoGuardado.nombrecompleto}</p>
          <p><strong>Currícula:</strong> {curricula}</p>
        </div>

        {/* TABLA */}
        <table className="table table-bordered text-center mt-3">
          <thead style={{ background: "#f8f8f8" }}>
            <tr>
              <th>Curso</th>
              <th style={{ textAlign: "left" }}>Nombre del Curso</th>
              <th>Ti</th>
              <th>Cr</th>
              <th>Vz</th>
            </tr>
          </thead>

          <tbody>
            {cursos.map((c, i) => {
              const mostrarLinea = i > 0 && c.ciclo !== cursos[i - 1].ciclo;

              return (
                <React.Fragment key={i}>
                  {mostrarLinea && (
                    <tr>
                      <td colSpan="5">
                        <hr style={{ borderTop: "2px dashed #999", margin: 0 }} />
                      </td>
                    </tr>
                  )}

                  <tr>
                    <td>{c.curso}</td>
                    <td className="text-start">{c.nombre}</td>
                    <td>{c.tipocurso}</td>
                    <td>{c.creditos}</td>
                    <td>{c.vez}</td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* TOTALES */}
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

export default ImprimirCursosDisponibles;
