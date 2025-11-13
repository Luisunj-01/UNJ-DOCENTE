import React, { useEffect, useState, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { FaPrint } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useUsuario } from "../../../context/UserContext";
import { TablaSkeleton } from "../../reutilizables/componentes/TablaSkeleton";
import { obtenerRecordNotas } from "../logica/DatosTutoria";

const fecha = new Date();
const fechaTexto = fecha.toLocaleDateString("es-PE");
const horaTexto = fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

const ImprimirRecordNotas = () => {
  const { usuario } = useUsuario();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const codigoParam = searchParams.get("codigo");
  const token = usuario?.codigotokenautenticadorunj;

  const [cabecera, setCabecera] = useState({});
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================================
  // 🔹 DECODIFICAR: alumno|escuela|currícula  (3 datos)
  // ================================
  const { alumno, escuela, curricula } = useMemo(() => {
  try {
    if (!codigoParam) return {};

    // 🔓 Decodificar doble Base64
    const decoded = atob(atob(codigoParam));

    // 🧩 Separar por "|"
    const partes = decoded.split("|");

    return {
      alumno: partes[0] || "",
      escuela: partes[1] || "",
      curricula: partes[2] || "",
    };
  } catch (err) {
    console.error("❌ Error decodificando:", err);
    return {};
  }
}, [codigoParam]);

  // ================================
  // 🔹 Cargar datos desde API
  // ================================
  useEffect(() => {
    const cargarDatos = async () => {
      try {

        // 🔹 Recuperar información del alumno ya guardada
      const alumnoGuardado = JSON.parse(
        sessionStorage.getItem("alumnoSeleccionado") ||
        localStorage.getItem("alumnoSeleccionado") ||
        "{}"
      );
        // 👌 Aquí ya no enviamos codigoParam, sino alumno – escuela – curricula
        const data = await obtenerRecordNotas(alumno, escuela, curricula, token);

        if (data?.success) {
          setCursos(data.filas);


        // 🔹 Combinar datos del SP con los datos del alumno guardado
        const primeraFila = data.filas[0] || {};

        setCabecera({
          nombrecompleto: alumnoGuardado.nombrecompleto || "",
          codigo: alumnoGuardado.alumno || alumno,
          escuela: alumnoGuardado.nombreescuela || primeraFila.estructura || "",
          curricula: alumnoGuardado.curricula || curricula,
          semestre: primeraFila.semestre || "",
          promedioponderado: primeraFila.promedioponderado || "",
          totalcursosaprobados: primeraFila.totalcursosaprobados || "",
          totalcreditos: primeraFila.totalcreditos || "",
        });
      }
        
      } catch (e) {
        console.error("❌ Error cargando:", e);
      } finally {
        setLoading(false);
      }
    };

    if (token && alumno) cargarDatos();
  }, [alumno, escuela, curricula, token]);

  if (loading) return <TablaSkeleton />;

  // ================================
  // 🔹 Agrupar por semestre
  // ================================
  const grupos = {};
  cursos.forEach((c) => {
    const sem = c.semestre || "SIN SEMESTRE";
    if (!grupos[sem]) grupos[sem] = [];
    grupos[sem].push(c);
  });

  return (
    <>
      <button className="print-button" onClick={() => window.print()}>
        <FaPrint />
      </button>

      <div className="container-fluid p-4" style={{ fontFamily: "Arial", fontSize: "13px" }}>
        {/* CABECERA */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <img src="/image/logo/logo-unj-v1.svg" alt="logo" width="120" />
          <div className="text-center">
            <h5><strong>UNIVERSIDAD NACIONAL DE JAÉN</strong></h5>
            <h6 style={{ marginTop: "20px" }}>
              <strong>RECORD DE NOTAS</strong>
            </h6>
            <p style={{ fontSize: "0.8rem" }}>Fecha: {fechaTexto} | Hora: {horaTexto}</p>
          </div>
          <QRCodeSVG value={window.location.href} size={80} level="L" />
        </div>

       {/* Datos alumno */}
        <div className="mb-3" style={{ border: "1px solid #ccc", borderRadius: "6px", padding: "10px 15px" }}>
          <p><strong>Carrera:</strong> {cabecera.escuela}</p>
          <p><strong>Código:</strong> {cabecera.codigo}</p>
          <p><strong>Alumno:</strong> {cabecera.nombrecompleto}</p>
          
          <p><strong>Curricula:</strong> {cabecera.curricula}</p>
          
        </div>

        {/* TABLA PRINCIPAL */}
        <table className="table table-sm table-bordered text-center align-middle" style={{ fontSize: "12px" }}>
          <thead className="table-light">
            <tr>
              <th>Curso</th>
              <th className="text-start">Nombre del Curso</th>
              <th>Cre.</th>
              <th>Vez</th>
              <th>Tipo</th>
              <th>Nota</th>
              <th>Obser.</th>
            </tr>
          </thead>

          <tbody>
            {Object.keys(grupos).map((sem) => (
              <React.Fragment key={sem}>
                <tr style={{ background: "#f0f0f0" }}>
                  <td colSpan="7" className="text-start px-3"><strong>{sem}</strong></td>
                </tr>

                {grupos[sem].map((c, i) => (
                  <tr key={i}>
                    <td>{c.curso}</td>
                    <td className="text-start">{c.nombrecurso}</td>
                    <td>{c.creditos}</td>
                    <td>{c.vez}</td>
                    <td>{c.tipocurso}</td>
                    <td style={{ color: c.promedio > 10 ? "#000099" : "#A80000", fontWeight: "bold" }}>
                      {c.promedio}
                    </td>
                    <td>{c.obs || ""}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* TOTALES */}
        <table style={{ width: "300px", marginTop: "10px", fontSize: "13px" }}>
          <tbody>
            <tr>
              <td><strong>Promedio ponderado:</strong></td>
              <td style={{ color: cabecera.promedioponderado > 10 ? "#000099" : "#A80000", fontWeight: "bold" }}>
                {cabecera.promedioponderado}
              </td>
            </tr>
            <tr>
              <td><strong>Cursos aprobados:</strong></td>
              <td><strong>{cabecera.totalcursosaprobados}</strong></td>
            </tr>
            <tr>
              <td><strong>Total créditos aprobados:</strong></td>
              <td><strong>{cabecera.totalcreditos}</strong></td>
            </tr>
          </tbody>
        </table>

        {/* FIRMA */}
        <div className="text-center mt-5">
          <p style={{ borderTop: "1px dotted #000", width: "300px", margin: "auto", paddingTop: "5px" }}>
            Responsable de Registros y Asuntos Académicos
          </p>
        </div>
      </div>
    </>
  );
};

export default ImprimirRecordNotas;
