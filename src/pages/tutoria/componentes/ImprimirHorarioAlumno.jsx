import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { FaPrint } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useUsuario } from "../../../context/UserContext";
import { TablaSkeleton } from "../../reutilizables/componentes/TablaSkeleton";
import { obtenerHorarioAlumno } from "../logica/DatosTutoria";

const fecha = new Date();
const fechaTexto = fecha.toLocaleDateString("es-PE");
const horaTexto = fecha.toLocaleTimeString("es-PE", {
  hour: "2-digit",
  minute: "2-digit",
});

const ImprimirHorarioAlumno = () => {
  const { usuario } = useUsuario();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const codigoParam = searchParams.get("codigo");
  const token = usuario?.codigotokenautenticadorunj;

  const [cabecera, setCabecera] = useState({});
  const [detalle, setDetalle] = useState([]);
  const [horario, setHorario] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Decodificar código base64: alumno|semestre
  let alumno = "", semestre = "";
  try {
    if (codigoParam) {
      const decoded = atob(codigoParam);
      [alumno, semestre] = decoded.split("|");
      console.log("📦 Parámetros decodificados:", { alumno, semestre });
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

        const data = await obtenerHorarioAlumno(alumno, semestre, token);
        console.log("📥 Datos recibidos:", data);

        if (data?.success) {
          setCabecera({
            nombrecompleto:
              alumnoGuardado.nombrecompleto ||
              data.cabecera?.nombrecompleto ||
              "Alumno no identificado",
            codigo: alumnoGuardado.codigo || data.cabecera?.codigo || alumno,
            semestre: data.cabecera?.semestre || semestre,
          });

          setDetalle(data.detalle || []);
          setHorario(data.horario || []); // si la API separa el horario por horas
        }
      } catch (error) {
        console.error("❌ Error cargando horario:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [alumno, semestre, token]);

  if (loading) return <TablaSkeleton />;

  return (
    <>
      {/* 🔘 Botón de imprimir */}
      <button className="print-button" onClick={() => window.print()}>
        <FaPrint />
      </button>

      <div
        className="container-fluid p-4"
        style={{ fontFamily: "Arial", fontSize: "13px" }}
      >
        {/* 🔹 Cabecera institucional */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <img
            src="/image/logo/logo-unj-v1.svg"
            alt="logo"
            width="120"
            style={{ marginTop: "20px" }}
          />

          <div className="text-center">
            <h5>
              <strong>UNIVERSIDAD NACIONAL DE JAÉN</strong>
            </h5>
            <h6 style={{ marginTop: "20px" }}>
              <strong>REPORTE DE HORARIOS POR ALUMNO</strong>
            </h6>
            <p style={{ fontSize: "0.8rem" }}>
              Fecha: {fechaTexto} | Hora: {horaTexto}
            </p>
          </div>

          <QRCodeSVG
            value={window.location.href}
            size={80}
            level="L"
            style={{ marginTop: "10px" }}
          />
        </div>

        {/* 🔹 Datos del alumno */}
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
          <p>
            <strong>Alumno:</strong> {cabecera?.nombrecompleto}
          </p>
          <p>
            <strong>Código:</strong> {cabecera?.codigo}
          </p>
          <p>
            <strong>Semestre:</strong> {cabecera?.semestre}
          </p>
        </div>

        {/* 🔹 Tabla de cursos */}
        <table
          className="table table-sm table-bordered text-center align-middle"
          style={{ fontSize: "12px" }}
        >
          <thead className="table-light">
            <tr>
              <th>N°</th>
              <th>Código</th>
              <th>Curso</th>
              <th>Sec</th>
              <th>Docente</th>
              <th>Cr</th>
              <th>Ht</th>
              <th>Hp</th>
            </tr>
          </thead>
          <tbody>
            {detalle.map((fila, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{fila.curso}</td>
                <td className="text-start">{fila.nombrecurso}</td>
                <td>{fila.seccion}</td>
                <td className="text-start">{fila.nombrecompleto}</td>
                <td>{fila.creditos}</td>
                <td>{fila.horasteoria}</td>
                <td>{fila.horaspractica}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 🔹 Tabla de horario semanal */}
        <table
          className="table table-sm table-bordered text-center mt-3 align-middle"
          style={{ fontSize: "12px" }}
        >
          <thead className="table-light">
            <tr>
              <th>Hora</th>
              <th>Lunes</th>
              <th>Martes</th>
              <th>Miércoles</th>
              <th>Jueves</th>
              <th>Viernes</th>
              <th>Sábado</th>
              <th>Domingo</th>
            </tr>
          </thead>
          <tbody>
            {detalle.map((fila, i) => (
              <tr key={i}>
                <td>{fila.hora}</td>
                {[
                  fila.lunes,
                  fila.martes,
                  fila.miercoles,
                  fila.jueves,
                  fila.viernes,
                  fila.sabado,
                  fila.domingo,
                ].map((dia, idx) => {
                  const color = dia?.substring(0, 7);
                  const texto = dia?.substring(7);
                  return (
                    <td
                      key={idx}
                      style={{
                        backgroundColor:
                          color && color !== "#FFFFFF" ? color : "white",
                        fontWeight: "bold",
                        color: "#000",
                      }}
                    >
                      {color !== "#FFFFFF" ? texto : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* 🔹 Pie institucional */}
        <div
          className="text-center mt-5"
          style={{
            fontSize: "11px",
            color: "#444",
            borderTop: "1px solid #ccc",
            paddingTop: "10px",
            marginTop: "50px",
          }}
        >
          <p className="mb-1">
            <strong>Impreso por:</strong>{" "}
            {usuario?.docente?.nombre || usuario?.nombre || "DOCENTE TUTOR"}
          </p>
          <p className="mb-1">
            <strong>DNI:</strong>{" "}
            {usuario?.docente?.numerodocumento || usuario?.dni || "------"}
          </p>
          <p style={{ fontSize: "9px", marginTop: "6px", color: "#777" }}>
            Universidad Nacional de Jaén
          </p>
        </div>
      </div>
    </>
  );
};

export default ImprimirHorarioAlumno;
