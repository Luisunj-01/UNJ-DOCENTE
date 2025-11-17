import React, { useEffect, useState } from "react";
import { useUsuario } from "../../../context/UserContext";
import { QRCodeSVG } from "qrcode.react";
import { obtenerRecordCurricular } from "../logica/DatosTutoria";
import { TablaSkeleton } from "../../reutilizables/componentes/TablaSkeleton";
import { FaPrint } from "react-icons/fa";
import "./RecordCurricular.css";
 
const fecha = new Date();
const fechaTexto = fecha.toLocaleDateString("es-PE");
const horaTexto = fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

const ImprimirRecordCurricular = () => {
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;

  // ================
  // LEER PARÁMETROS
  // ================
  const search = new URLSearchParams(window.location.search);
  const codigo = search.get("codigo");

  const raw = atob(atob(codigo));         // decodificación doble base64
  const [alumno, sede, estructura, curricula] = raw.split("|");

  // datos del alumno desde sessionStorage
  const datosAlumno = JSON.parse(sessionStorage.getItem("alumnoSeleccionado"));

  // ================
  // ESTADOS
  // ================
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================
  // CARGAR DATOS
  // ================
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const r = await obtenerRecordCurricular(alumno, sede, estructura, curricula, token);

    console.log("📌 DATA COMPLETA DEL SP:", r.data);

    setCursos(Array.isArray(r.data) ? r.data : []);
    setLoading(false);
  };

  if (loading) return <TablaSkeleton />;

  // ======================
  // AGRUPAR POR CICLO
  // ======================
  const grupos = cursos.reduce((acc, c) => {
    if (!acc[c.ciclo]) acc[c.ciclo] = [];
    acc[c.ciclo].push(c);
    return acc;
  }, {});

  const totales = cursos?.[0] || {};

  // ======================
  // RENDER PRINCIPAL
  // ======================
  return (
    <>
      {/* BOTÓN IMPRIMIR */}
      <button className="print-button" onClick={() => window.print()}>
        <FaPrint />
      </button>

      <div className="container-fluid p-4" style={{ fontFamily: "Arial", fontSize: "13px" }}>

        {/* CABECERA */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <img src="/image/logo/logo-unj-v1.svg" width="120" alt="logo" />

          <div className="text-center">
            <h5><strong>UNIVERSIDAD NACIONAL DE JAÉN</strong></h5>
            <h6 style={{ marginTop: "20px" }}>
              <strong>RECORD CURRICULAR INTEGRAL</strong>
            </h6>

            <p style={{ fontSize: "11px" }}>
              Fecha: {fechaTexto} | Hora: {horaTexto}
            </p>
          </div>

          <QRCodeSVG value={window.location.href} size={80} level="L" />
        </div>

        {/* DATOS SUPERIORES */}
        <table style={{ width: "600px", lineHeight: "1.8" }}>
          <tbody>
            <tr>
              <td><strong>Carrera:</strong></td>
              <td>{datosAlumno?.nombreescuela || "Carrera no registrada"}</td>
            </tr>
            <tr>
              <td><strong>Alumno:</strong></td>
              <td>{datosAlumno?.nombrecompleto}</td>
            </tr>
            <tr>
              <td><strong>Código:</strong></td>
              <td>{alumno}</td>
            </tr>
            <tr>
              <td><strong>Semestre:</strong></td>
              <td>{datosAlumno?.semestre}</td>
            </tr>
            <tr>
              <td><strong>Currícula:</strong></td>
              <td>{curricula}</td>
            </tr>
          </tbody>
        </table>


        {/* TABLA PRINCIPAL */}
        <table className="table table-bordered mt-3" style={{ fontSize: "12px" }}>
          <thead>
            <tr>
                <th>Curso</th>
                <th>Nombre del Curso</th>
                <th className="text-center">Ti</th>
                <th className="text-center">Cr</th>
                <th className="text-center">Vz</th>
                <th className="text-center">Cd</th>
                <th className="text-center">Sem.</th>
                <th className="text-center">Pr</th>
                <th className="text-center">TA</th>
            </tr>
            </thead>


          <tbody>
            {Object.keys(grupos).map((ciclo) => (
                <React.Fragment key={ciclo}>

                {/* ENCABEZADO DE CICLO – SIN BOOTSTRAP */}
                <tr className="ciclo-header">

                    <td colSpan="9"><strong>CICLO {ciclo}</strong></td>
                </tr>

                {/* CURSOS */}
                {grupos[ciclo].map((c, i) => {
                const cond = (c.condicion || "").trim();

                return (
                    <tr
                    key={i}
                    data-color={
                        cond === "D"
                        ? "amarillo"
                        : cond === "[X]"
                        ? "rosado"
                        : "blanco"
                    }
                    >
                    <td>{c.curso}</td>
                    <td>{c.nombre}</td>
                    <td className="text-center">{c.tipocurso}</td>
                    <td className="text-center">{c.creditos}</td>
                    <td className="text-center">{c.vez}</td>
                    <td className="text-center">{c.condicion}</td>
                    <td className="text-center">{c.semestre}</td>
                    <td className="text-center">{c.promedio}</td>
                    <td className="text-center">{c.tipoaprobado}</td>
                    </tr>
                );
                })}
                </React.Fragment>
            ))}
            </tbody>

        </table>
{/* TOTALES FINALES */}
<div style={{ width: "350px", marginTop: "20px", fontSize: "13px" }}>
  <p>
    <strong>Créditos obligatorios aprobados:</strong>
    <strong style={{ marginLeft: "20px" }}>
      {totales.coa} de {totales.coc}
    </strong>
  </p>

  <p>
    <strong>Créditos electivos aprobados:</strong>
    <strong style={{ marginLeft: "37px" }}>
      {totales.cea} de {totales.cec}
    </strong>
  </p>

  <p>
    <strong>Promedio ponderado acumulado:</strong>
    <strong style={{ marginLeft: "20px" }}>
      {totales.promedioponderado}
    </strong>
  </p>
</div>



      </div>
    </>
  );
};

export default ImprimirRecordCurricular;
