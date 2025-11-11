import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLocation } from "react-router-dom";
import { TablaSkeleton } from "../../reutilizables/componentes/TablaSkeleton";
import { useUsuario } from "../../../context/UserContext";
import { FaPrint } from "react-icons/fa";
import { obtenerConstanciaNotas } from "../logica/DatosTutoria"; // 🔹 debes crear esta función

const fecha = new Date();
const fechaTexto = fecha.toLocaleDateString("es-PE");
const horaTexto = fecha.toLocaleTimeString("es-PE", {
  hour: "2-digit",
  minute: "2-digit",
});

const ImprimirConstanciaNotas = () => {
  const { usuario } = useUsuario();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const codigoParam = searchParams.get("codigo");
  const token = usuario?.codigotokenautenticadorunj;

  const [datos, setDatos] = useState([]);
  const [cabecera, setCabecera] = useState({});
  const [loading, setLoading] = useState(true);

  let alumno = "",
    escuela = "",
    curricula = "",
    semestre = "";

  try {
    if (codigoParam) {
      const decoded = atob(codigoParam);
      [alumno, escuela, curricula, semestre] = decoded.split("|");
      console.log("📦 Parámetros decodificados:", {
        alumno,
        escuela,
        curricula,
        semestre,
      });
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

        const respuesta = await obtenerConstanciaNotas(
          alumno,
          escuela,
          curricula,
          semestre,
          token
        );
        console.log("📥 Datos Constancia:", respuesta);

        if (respuesta?.success) {
          setCabecera({
            carrera:
              alumnoGuardado.nombreescuela ||
              respuesta.cabecera?.carrera ||
              "No registrado",
            alumno:
              alumnoGuardado.nombrecompleto ||
              respuesta.cabecera?.alumno ||
              "Sin nombre",
            codigo: respuesta.cabecera?.codigo || alumno,
            documento:
              alumnoGuardado.numerodocumento ||
              respuesta.cabecera?.documento ||
              "",
            semestre: respuesta.cabecera?.semestre || semestre,
            curricula: respuesta.cabecera?.curricula || curricula,
            totalCursos: respuesta.cabecera?.totalCursos || 0,
            creditos: respuesta.cabecera?.creditos || 0,
            promedioPonderado: respuesta.cabecera?.promedioPonderado || 0,
            creditosMatriculados: respuesta.cabecera?.creditosmatriculados || respuesta.data?.[0]?.creditosmatriculados || 0,
              promedioSemestre: 
                respuesta.cabecera?.promediosemestre || 
                respuesta.data?.[0]?.promediosemestre || 0,
          });

          setDatos(respuesta.data);
        }
      } catch (error) {
        console.error("❌ Error cargando Constancia de Notas:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [codigoParam]);

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
        {/* 🔹 Cabecera institucional estilo Avance Académico */}
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
              <strong>CONSTANCIA DE NOTAS</strong>
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
            <strong>Carrera:</strong> {cabecera?.carrera}
          </p>
          <p>
            <strong>Alumno:</strong> {cabecera?.alumno}
          </p>
          <p>
            <strong>Código:</strong> {cabecera?.codigo}
          </p>
          <p>
            <strong>Currícula:</strong> {cabecera?.curricula}
          </p>
          <p>
            <strong>Semestre:</strong> {cabecera?.semestre}
          </p>
        </div>

        {/* 🔹 Tabla de notas */}
        <table
          className="table table-sm table-bordered text-center align-middle"
          style={{ fontSize: "12px" }}
        >
          <thead className="table-light align-middle">
            <tr>
              <th>Curso</th>
              <th>Sec.</th>
              <th>Nombre del Curso</th>
              <th>Cic.</th>
              <th>Créd.</th>
              <th>Nota</th>
              <th>Puntaje</th>
              <th>Tip.</th>
              <th>Vez</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((fila, i) => (
              <tr key={i}>
                <td>{fila.curso}</td>
                <td>{fila.seccion}</td>
                <td className="text-start">{fila.nombrecurso}</td>
                <td>{fila.ciclo}</td>
                <td>{fila.creditos}</td>
                <td style={{ color: "red", fontWeight: "bold" }}>
                  {fila.promediomascara}
                </td>
                <td>{fila.puntaje}</td>
                <td>{fila.tipocurso}</td>
                <td>{fila.vez}</td>
              </tr>
            ))}
          </tbody>
        </table>

{/* 🔹 Puntaje total debajo de la tabla principal, alineado mejor */}
<div
  style={{
    textAlign: "right",
    fontSize: "13px",
    fontWeight: "bold",
    marginTop: "5px",
    marginRight: "410px", // 👈 mueve hacia la izquierda (ajusta este valor)
  }}
>
  Puntaje:{" "}
  {datos
    .reduce((acc, item) => acc + parseFloat(item.puntaje || 0), 0)
    .toFixed(2)}
</div>


        {/* 🔹 Totales tipo tablas */}
        <div className="d-flex justify-content-between mt-3" style={{ fontSize: "13px" }}>
          {/* CURSOS */}
          <table className="table table-bordered text-center mb-0" style={{ width: "33%" }}>
            <thead>
              <tr className="table-light">
                <th colSpan="2">CURSOS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Inscritos</td>
                <td>{cabecera?.totalCursos || 0}</td>
              </tr>
              <tr>
                <td>Aprobados</td>
                <td>{datos.filter(d => parseFloat(d.promediomascara) >= 11).length}</td>
              </tr>
            </tbody>
          </table>

          {/* CRÉDITOS */}
          <table className="table table-bordered text-center mb-0" style={{ width: "33%" }}>
            <thead>
              <tr className="table-light">
                <th colSpan="2">CRÉDITOS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Inscritos</td>
                <td>{cabecera?.creditosMatriculados || cabecera?.creditos || 0}</td>

              </tr>
              <tr>
                <td>Aprobados</td>
                <td>
                  {datos
                    .filter(d => parseFloat(d.promediomascara) >= 11)
                    .reduce((acc, d) => acc + Number(d.creditos || 0), 0)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* PROMEDIO */}
          <table className="table table-bordered text-center mb-0" style={{ width: "33%" }}>
            <thead>
              <tr className="table-light">
                <th>PROMEDIO PONDERADO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: "bold", color: "red" }}>
                {cabecera?.promedioSemestre || cabecera?.promedioPonderado || 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

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

export default ImprimirConstanciaNotas;
