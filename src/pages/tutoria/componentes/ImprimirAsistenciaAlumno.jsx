import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { FaPrint } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useUsuario } from "../../../context/UserContext";
import { TablaSkeleton } from "../../reutilizables/componentes/TablaSkeleton";
import { obtenerAsistenciaAlumno } from "../logica/DatosTutoria";

const fecha = new Date();
const fechaTexto = fecha.toLocaleDateString("es-PE");
const horaTexto = fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

const ImprimirAsistenciaAlumno = () => {
  const { usuario } = useUsuario();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const codigoParam = searchParams.get("codigo");
  const token = usuario?.codigotokenautenticadorunj;

  const [cabecera, setCabecera] = useState({});
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Decodificar código base64 doble: alumno|escuela|currícula|semestre
let alumno = "", escuela = "", curricula = "", semestre = "";
try {
  if (codigoParam) {
    const decoded = atob(atob(codigoParam));
    const partes = decoded.split("|");

    // 👇 Evitamos error si vienen 3 o 4 parámetros
    [alumno, escuela, curricula, semestre] =
      partes.length === 4
        ? partes
        : [partes[0], partes[1], "", partes[2]]; // fallback: sin currícula explícita

    console.log("📦 Parámetros decodificados:", { alumno, escuela, curricula, semestre });
  }
} catch (error) {
  console.error("❌ Error al decodificar parámetros:", error);
}



  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const alumnoGuardado = JSON.parse(
          sessionStorage.getItem("alumnoSeleccionado") ||
          localStorage.getItem("alumnoSeleccionado") ||
          "{}"
        );

        const data = await obtenerAsistenciaAlumno(alumno, escuela, semestre, token);
        console.log("📥 Datos recibidos:", data);

        if (data?.success) {
          setCabecera({
            nombrecompleto: alumnoGuardado.nombrecompleto || "Alumno no identificado",
            codigo: alumnoGuardado.codigo || alumno,
            escuela: alumnoGuardado.nombreescuela || "",
            semestre,
            curricula, // 👈 la mostramos, no la usamos en la consulta
           
          });
          
          setAsistencias(data.data || []);
        }
      } catch (error) {
        console.error("❌ Error cargando asistencia:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [alumno, escuela, semestre, token]);

  if (loading) return <TablaSkeleton />;

  return (
    <>
      <button className="print-button" onClick={() => window.print()}>
        <FaPrint />
      </button>

      <div className="container-fluid p-4" style={{ fontFamily: "Arial", fontSize: "13px" }}>
        {/* Cabecera institucional */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <img src="/image/logo/logo-unj-v1.svg" alt="logo" width="120" />
          <div className="text-center">
            <h5><strong>UNIVERSIDAD NACIONAL DE JAÉN</strong></h5>
            <h6 style={{ marginTop: "20px" }}>
              <strong>ASISTENCIA ESTUDIANTE</strong>
            </h6>
            <p style={{ fontSize: "0.8rem" }}>Fecha: {fechaTexto} | Hora: {horaTexto}</p>
          </div>
          <QRCodeSVG value={window.location.href} size={80} level="L" />
        </div>

        {/* Datos alumno */}
        <div className="mb-3" style={{ border: "1px solid #ccc", borderRadius: "6px", padding: "10px 15px" }}>
          <p><strong>Carrera:</strong> {cabecera.escuela}</p>
          <p><strong>Alumno:</strong> {cabecera.nombrecompleto}</p>
          <p><strong>Código:</strong> {cabecera.codigo}</p>
          <p><strong>Semestre:</strong> {cabecera.semestre}</p>
          
        </div>

        {/* Tabla asistencia */}
        <table className="table table-sm table-bordered text-center align-middle" style={{ fontSize: "12px" }}>
          <thead className="table-light">
            <tr>
              <th rowSpan="2">N°</th>
              <th rowSpan="2">Código</th>
              <th rowSpan="2">Sec</th>
              <th rowSpan="2">Curso</th>
              <th rowSpan="2">Docente</th>
              <th colSpan="17">SESIONES (Total de asistencias)</th>
            </tr>
            <tr>
              {Array.from({ length: 16 }, (_, i) => (
                <th key={i}>{(i + 1).toString().padStart(2, "0")}</th>
              ))}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {asistencias.map((fila, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                ({fila.curricula}) {fila.curso}
                </td>
                <td>{fila.seccion}</td>
                <td className="text-start">{fila.nombrecurso}</td>
                <td className="text-start">{fila.nombredocente}</td>
                {Array.from({ length: 16 }, (_, j) => (
                  <td key={j}>{fila[`s${(j + 1).toString().padStart(2, "0")}_asis`] ?? 0}</td>

                ))}
                <td>{fila.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pie institucional */}
        <div className="text-center mt-5" style={{
          fontSize: "11px",
          color: "#444",
          borderTop: "1px solid #ccc",
          paddingTop: "10px",
          marginTop: "50px"
        }}>
          <p className="mb-1"><strong>Impreso por:</strong> {usuario?.nombre || "DOCENTE TUTOR"}</p>
          <p className="mb-1">
            <strong>DNI:</strong>{" "}
            {usuario?.docente?.numerodocumento || usuario?.dni || "------"}
          </p>
          <p style={{ fontSize: "9px", marginTop: "6px", color: "#777" }}>Universidad Nacional de Jaén</p>
        </div>
      </div>
    </>
  );
};

export default ImprimirAsistenciaAlumno;
