import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useUsuario } from "../../../context/UserContext";
import { TablaSkeleton } from "../../reutilizables/componentes/TablaSkeleton";
import { FaPrint } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { obtenerFichaMatricula } from "../logica/DatosTutoria";

const fecha = new Date();
const fechaTexto = fecha.toLocaleDateString("es-PE");
const horaTexto = fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

const ImprimirFichaMatricula = () => {
  const { usuario } = useUsuario();
  const { search } = useLocation();

  const queryParams = new URLSearchParams(search);
  const codigoParam = queryParams.get("codigo");

  let alumno = "", escuela = "", curricula = "", semestre = "";

  try {
    if (codigoParam) {
      const decoded = atob(codigoParam);
      [alumno, escuela, curricula, semestre] = decoded.split("|");
      // console.log("📦 Parámetros decodificados:", { alumno, escuela, curricula, semestre });
    }
  } catch (error) {
    console.error("❌ Error al decodificar parámetros:", error);
  }

  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [infoCabecera, setInfoCabecera] = useState({});
  const urlActual = window.location.href;

  useEffect(() => {
    const cargar = async () => {
      const token = usuario?.codigotokenautenticadorunj;

      const alumnoGuardado = JSON.parse(
        sessionStorage.getItem("alumnoSeleccionado") ||
        localStorage.getItem("alumnoSeleccionado") ||
        "{}"
      );

      if (!alumno) {
        console.warn("⚠️ Código de alumno no encontrado");
        setLoading(false);
        return;
      }

      let cursos = [];
      try {
        const resp = await obtenerFichaMatricula(alumno, escuela, curricula, semestre, token);
        cursos = resp.data || [];
          console.log("📌 RESP COMPLETO:", resp); // <-- AQUÍ
      } catch (error) {
        console.error("❌ Error al obtener cursos:", error);
      }

      setInfoCabecera({
        carrera: alumnoGuardado.nombreescuela || "No registrado",
        semestre: semestre || alumnoGuardado.semestre,
        alumno: alumnoGuardado.nombrecompleto || "Sin nombre",
        codigo: alumno || alumnoGuardado.alumno,
        numerodocumento: alumnoGuardado.numerodocumento || "", // 👈 agregado
      });

      setDatos(cursos);
      setLoading(false);
    };

    cargar();
  }, []);

  return (
    <>
      <button className="print-button" onClick={() => window.print()}>
        <FaPrint />
      </button>

      <div className="container mt-4 ficha-container">
        {loading ? (
          <TablaSkeleton filas={4} columnas={6} />
        ) : (
          <>
            {/* 🔹 Cabecera */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <img src="/image/logo/logo-unj-v1.svg" alt="logo" width="120" />
              <div className="text-center">
                <h5><strong>UNIVERSIDAD NACIONAL DE JAÉN</strong></h5>
                <h6><strong>MATRÍCULA</strong></h6>
                <p style={{ fontSize: "0.8rem" }}>
                  Fecha: {fechaTexto} | Hora: {horaTexto}
                </p>
              </div>
              <QRCodeSVG value={urlActual} size={80} level="L" />
            </div>

            {/* 🔹 Info del alumno */}
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
              <p><strong>Semestre:</strong> {infoCabecera.semestre}</p>
              <p><strong>Carrera:</strong> {infoCabecera.carrera}</p>
              <p><strong>Código:</strong> {infoCabecera.codigo}</p>
              <p><strong>Alumno:</strong> {infoCabecera.alumno}</p>
            </div>

            {/* 🔹 Tabla de cursos */}
            {datos.length === 0 ? (
              <p className="text-center text-muted mt-3">
                No se encontraron cursos matriculados.
              </p>
            ) : (
              <table className="table table-bordered text-center tabla-cursos">
                <thead style={{ background: "#f5f5f5" }}>
                  <tr>
                    <th>Curso</th>
                    <th>Sec</th>
                    <th>Nombre del Curso</th>
                    <th>Cic.</th>
                    <th>Créd.</th>
                    <th>Tip.</th>
                    <th>Vez</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.map((d, i) => (
                    <tr key={i}>
                      <td>{d.curso}</td>
                      <td>{d.seccion}</td>
                      <td style={{ textAlign: "left" }}>{d.nombrecurso}</td>
                      <td>{d.ciclo}</td>
                      <td>{d.creditos}</td>
                      <td>{d.tipocurso}</td>
                      <td>{d.vez}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 🔹 Totales (izquierda) */}
            <div className="mt-3 text-start">
              <strong>Total de Cursos Matriculados:</strong> {datos.length}<br />
              <strong>Total de Créditos Matriculados:</strong>{" "}
              {datos.reduce((acc, d) => acc + Number(d.creditos || 0), 0)}
            </div>

            {/* 🔹 Firmas centradas */}
            <div
              className="mt-5"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "180px",
                marginTop: "50px",
                textAlign: "center",
              }}
            >
              <div>
                ..............................................<br />
                {infoCabecera.alumno}<br />
                <small>DNI: {infoCabecera.numerodocumento || "------"}</small><br />
                
              </div>
              <div>
                ..............................................<br />
                <small>Responsable</small>
              </div>
            </div>

          </>
        )}
      </div>
    </>
  );
};

export default ImprimirFichaMatricula;
