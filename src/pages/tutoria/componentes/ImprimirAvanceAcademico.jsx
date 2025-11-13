import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLocation } from "react-router-dom";
import { TablaSkeleton } from "../../reutilizables/componentes/TablaSkeleton";
import { useUsuario } from "../../../context/UserContext";
import { obtenerAvanceAcademico } from "../logica/DatosTutoria";
import { FaPrint } from "react-icons/fa";



const fecha = new Date();
const fechaTexto = fecha.toLocaleDateString("es-PE");
const horaTexto = fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

const ImprimirAvanceAcademico = () => {
  const { usuario } = useUsuario();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const codigo = searchParams.get("codigo"); // viene concatenado alumno+escuela+curricula+semestre
  const token = usuario?.codigotokenautenticadorunj;

  const [datos, setDatos] = useState([]);
  const [cabecera, setCabecera] = useState({});
  const [loading, setLoading] = useState(true);

  // 🔹 Obtener y decodificar el código desde la URL

const codigoParam = searchParams.get("codigo");

let alumno = "", escuela = "", curricula = "", semestre = "";

try {
  if (codigoParam) {
    // Si el código viene en base64 → decodificamos
    const decoded = atob(codigoParam);
    [alumno, escuela, curricula, semestre] = decoded.split("|");
    console.log("📦 Parámetros decodificados:", { alumno, escuela, curricula, semestre });
  }
} catch (error) {
  console.error("❌ Error al decodificar parámetros:", error);
}


useEffect(() => {
  const cargarDatos = async () => {
    try {
      // 🔹 Obtener datos del alumno guardado
      const alumnoGuardado = JSON.parse(
        sessionStorage.getItem("alumnoSeleccionado") ||
        localStorage.getItem("alumnoSeleccionado") ||
        "{}"
      );

      const respuesta = await obtenerAvanceAcademico(alumno, escuela, curricula, semestre, token);
      console.log("📥 Datos Avance:", respuesta);

      if (respuesta?.success) {
        // 🔹 Unimos datos del SP con datos guardados
        setCabecera({
          carrera: alumnoGuardado.nombreescuela || respuesta.cabecera?.carrera || "No registrado",
          alumno: alumnoGuardado.nombrecompleto || respuesta.cabecera?.alumno || "Sin nombre",
          codigo: respuesta.cabecera?.codigo || alumno,
          documento: alumnoGuardado.numerodocumento || respuesta.cabecera?.documento || "",
          semestre: respuesta.cabecera?.semestre || semestre,
          totalCursos: respuesta.cabecera?.totalCursos || 0,
          creditos: respuesta.cabecera?.creditos || 0,
          promedioPonderado: respuesta.cabecera?.promedioPonderado || 0,
        });

        setDatos(respuesta.data);
      }
    } catch (error) {
      console.error("❌ Error cargando Avance Académico:", error);
    } finally {
      setLoading(false);
    }
  };

  cargarDatos();
}, [codigo]);


  if (loading) return <TablaSkeleton />;

  return (
   <>
     {/* 🔘 Botón de imprimir */}
      <button className="print-button" onClick={() => window.print()}>
        <FaPrint />
      </button>
    <div className="container-fluid p-4" style={{ fontFamily: "Arial", fontSize: "13px" }}>


                {/* 🔹 Cabecera institucional estilo Ficha de Matrícula */}
            <div className="d-flex justify-content-between align-items-center mb-3">

            <img
            src="/image/logo/logo-unj-v1.svg"
            alt="logo"
            width="120"
            style={{ marginTop: "20px" }} // 👈 baja el logo unos píxeles
            />

            <div className="text-center">
                <h5><strong>UNIVERSIDAD NACIONAL DE JAÉN</strong></h5>
                <h6 style={{ marginTop: "20px" }}>
            <strong>AVANCE ACADÉMICO</strong>
            </h6>
                <p style={{ fontSize: "0.8rem" }}>
                Fecha: {fechaTexto} | Hora: {horaTexto}
                </p>
            </div>

            <QRCodeSVG
            value={window.location.href}
            size={80}
            level="L"
            style={{ marginTop: "10px" }} // 👈 baja el QR igual que el logo
            />
            </div>

        {/* 🔹 Datos del Alumno estilo Ficha de Matrícula */}
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
        <p><strong>Semestre:</strong> {cabecera?.semestre}</p>
        <p><strong>Carrera:</strong> {cabecera?.carrera}</p>
        <p><strong>Código:</strong> {cabecera?.codigo}</p>
        <p><strong>Alumno:</strong> {cabecera?.alumno}</p>
        </div>


      {/* 🔹 Tabla principal */}
        <table className="table table-sm table-bordered text-center align-middle" style={{ fontSize: "12px" }}>
        <thead className="table-light align-middle">
            <tr>
            <th rowSpan={2}>Curso</th>
            <th rowSpan={2}>Sec</th>
            <th rowSpan={2}>Nombre del curso</th>
            <th rowSpan={2}>Ci</th>
            <th rowSpan={2}>Cr</th>
            <th colSpan={4}>Primera Nota</th>
            <th colSpan={4}>Segunda Nota</th>
            <th colSpan={4}>Tercera Nota</th>
            <th rowSpan={2}>NF</th>
            <th rowSpan={2}>Sust</th>
            <th rowSpan={2}>Apla</th>
            <th rowSpan={2}>NF</th>
            </tr>
            <tr>
            <th>EC</th><th>EP</th><th>EA</th><th>Pr</th>
            <th>EC</th><th>EP</th><th>EA</th><th>Pr</th>
            <th>EC</th><th>EP</th><th>EA</th><th>Pr</th>
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

                {/* U1 */}
                <td>{fila.u01ec}</td>
                <td>{fila.u01ep}</td>
                <td>{fila.u01ea}</td>
                <td>{fila.u01pr}</td>

                {/* U2 */}
                <td>{fila.u02ec}</td>
                <td>{fila.u02ep}</td>
                <td>{fila.u02ea}</td>
                <td>{fila.u02pr}</td>

                {/* U3 */}
                <td>{fila.u03ec}</td>
                <td>{fila.u03ep}</td>
                <td>{fila.u03ea}</td>
                <td>{fila.u03pr}</td>

                {/* 🔹 Notas finales en rojo */}
                <td style={{ color: "red", fontWeight: "bold" }}>{fila.promedio}</td>
                <td>{fila.sustitutorio ?? ""}</td>
                <td>{fila.aplazado ?? ""}</td>
                <td style={{ color: "red", fontWeight: "bold" }}>{fila.promediomascara}</td>
            </tr>
            ))}
        </tbody>
        </table>


                {/* 🔹 Totales tipo tablas */}
            <div className="d-flex justify-content-between mt-3" style={{ fontSize: "13px" }}>
            {/* 🔸 Tabla de cursos */}
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
                    <td>
                    {datos.filter(d => parseFloat(d.promediomascara) >= 11).length}
                    </td>
                </tr>
                </tbody>
            </table>

            {/* 🔸 Tabla de créditos */}
            <table className="table table-bordered text-center mb-0" style={{ width: "33%" }}>
                <thead>
                <tr className="table-light">
                    <th colSpan="2">CRÉDITOS</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>Inscritos</td>
                    <td>{cabecera?.creditos || 0}</td>
                </tr>
                <tr>
                    <td>Aprobados</td>
                    <td>
                    {
                        datos
                        .filter(d => parseFloat(d.promediomascara) >= 11)
                        .reduce((acc, d) => acc + Number(d.creditos || 0), 0)
                    }
                    </td>
                </tr>
                </tbody>
            </table>

            {/* 🔸 Promedio Ponderado */}
            <table className="table table-bordered text-center mb-0" style={{ width: "33%" }}>
                <thead>
                <tr className="table-light">
                    <th>PROMEDIO PONDERADO</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td style={{ fontWeight: "bold", color: "red" }}>
                    {cabecera?.promedioPonderado || 0}
                    </td>
                </tr>
                </tbody>
            </table>
            </div>

        {/* 🔹 Firma ajustada */}
        <div
        className="text-center"
        style={{
            marginTop: "80px", // 👈 en lugar de mt-5 (que equivale a 3rem ≈ 48px)
            lineHeight: "1.2",
        }}
        >
        <p className="m-0">____________________________________</p>
        <p className="m-0">{cabecera?.alumno}</p>
        <small>DNI: {cabecera?.documento}</small>
        </div>

        {/* 🔹 Pie de página institucional dinámico */}
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
            <strong>Impreso por el:</strong>{" "}
            {usuario?.docente?.nombre || usuario?.nombre || "TUTOR"}
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

export default ImprimirAvanceAcademico;
