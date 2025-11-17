import React, { useEffect, useState } from "react";
import { useUsuario } from "../../../context/UserContext";
import { QRCodeSVG } from "qrcode.react";
import { obtenerPlanCurricular } from "../logica/DatosTutoria";
import { TablaSkeleton } from "../../reutilizables/componentes/TablaSkeleton";
import { FaPrint } from "react-icons/fa";

const fecha = new Date();
const fechaTexto = fecha.toLocaleDateString("es-PE");
const horaTexto = fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

const ImprimirPlanCurricular = () => {
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;

  const estructura = "TM";   // Escuela
  const curricula = "03";    // Currícula

  const [cursos, setCursos] = useState([]);
  const [creditosMin, setCreditosMin] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
  try {
    const lista = await obtenerPlanCurricular(estructura, curricula, "A", token);
    const minimos = await obtenerPlanCurricular(estructura, curricula, "F", token);

    // ✔ lista.data es el array real
    setCursos(Array.isArray(lista.data) ? lista.data : []);

    // ✔ minimos.data[0] son los créditos mínimos
    setCreditosMin(
      Array.isArray(minimos.data) && minimos.data.length > 0
        ? minimos.data[0]
        : {}
    );

  } catch (error) {
    console.error("❌ Error cargando plan curricular", error);
  } finally {
    setLoading(false);
  }
};

  if (loading) return <TablaSkeleton />;

  // Agrupamos igual que PHP: por ciclo
  const grupos = cursos.reduce((acc, cur) => {
    if (!acc[cur.nombreciclo]) acc[cur.nombreciclo] = [];
    acc[cur.nombreciclo].push(cur);
    return acc;
  }, {});

  return (
    <>
      {/* Botón imprimir */}
      <button className="print-button" onClick={() => window.print()}>
        <FaPrint />
      </button>

      <div
        className="container-fluid p-4"
        style={{ fontFamily: "Arial", fontSize: "13px" }}
      >
        {/* CABECERA */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <img src="/image/logo/logo-unj-v1.svg" width="120" alt="logo" />

          <div className="text-center">
            <h5><strong>UNIVERSIDAD NACIONAL DE JAÉN</strong></h5>
            <h6 style={{ marginTop: "20px" }}>
              <strong>PLAN CURRICULAR</strong>
            </h6>

            <p style={{ fontSize: "11px" }}>
              Fecha: {fechaTexto} | Hora: {horaTexto}
            </p>
          </div>

          <QRCodeSVG value={window.location.href} size={80} level="L" />
        </div>

        {/* DATOS SUPERIORES */}
        <table style={{ width: "500px", lineHeight: "1.8" }}>
          <tbody>
            <tr>
              <td width="80"><strong>Carrera:</strong></td>
              <td>Tecnología Médica – Laboratorio Clínico</td>
            </tr>
            <tr>
              <td><strong>Currícula:</strong></td>
              <td>{curricula}</td>
            </tr>
          </tbody>
        </table>

        {/* TABLA PRINCIPAL IGUAL AL PHP */}
        <table
          className="table table-bordered mt-3"
          style={{ width: "100%", fontSize: "12px" }}
        >
          <thead>
            <tr>
              <th width="60" className="text-center">Curso</th>
              <th width="350">Nombre del Curso</th>
              <th width="40" className="text-center">Cre.</th>
              <th width="40" className="text-center">Tip.</th>
              <th width="40" className="text-center">Ht</th>
              <th width="40" className="text-center">Hp</th>
              <th width="40" className="text-center">HT</th>
              <th width="120">Pre-Requisitos</th>
            </tr>
          </thead>

          <tbody>
            {Object.keys(grupos).map((ciclo, idx) => {
              const items = grupos[ciclo];

              let sumCred = 0, sumHt = 0, sumHp = 0;

              return (
                <React.Fragment key={idx}>
                  {/* Encabezado del ciclo */}
                  <tr>
                    <td></td>
                    <td colSpan="7"><strong>{ciclo}</strong></td>
                  </tr>

                  {items.map((c, i) => {
                    sumCred += c.nrocreditos;
                    sumHt += c.horasteoria;
                    sumHp += c.horaspractica;

                    return (
                      <tr key={i}>
                        <td className="text-center">{c.curso}</td>
                        <td>{c.nombre}</td>
                        <td className="text-center">{c.nrocreditos}</td>
                        <td className="text-center">{c.tipocurso}</td>
                        <td className="text-center">{c.horasteoria}</td>
                        <td className="text-center">{c.horaspractica}</td>
                        <td className="text-center">{c.horasteoria + c.horaspractica}</td>
                        <td>{c.prerequisitos}</td>
                      </tr>
                    );
                  })}

                  {/* Total del ciclo */}
                  <tr>
                    <td colSpan="2" className="text-end"><strong>TOTAL</strong></td>
                    <td className="text-center"><strong>{sumCred}</strong></td>
                    <td></td>
                    <td className="text-center"><strong>{sumHt}</strong></td>
                    <td className="text-center"><strong>{sumHp}</strong></td>
                    <td></td>
                    <td></td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* TOTALES FINALES */}
        <table style={{ width: "300px", marginTop: "20px" }}>
          <tbody>
            <tr>
              <td><strong>Créditos Obligatorios:</strong></td>
              <td className="text-end">
                <strong>{creditosMin.creditosobligatoriosminimos}</strong>
              </td>
            </tr>
            <tr>
              <td><strong>Créditos Electivos Mínimos:</strong></td>
              <td className="text-end">
                <strong>{creditosMin.creditoselectivosminimos}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* PIE */}
        <div
          className="text-center mt-5"
          style={{ fontSize: "11px", color: "#444", borderTop: "1px solid #ccc", paddingTop: "10px" }}
        >
          <p className="mb-1">
            <strong>Impreso por:</strong> {usuario?.nombre || usuario?.docente?.nombre}
          </p>
          <p className="mb-1">
            <strong>DNI:</strong> {usuario?.dni || usuario?.docente?.numerodocumento}
          </p>
          <p style={{ fontSize: "9px", marginTop: "6px", color: "#777" }}>
            Universidad Nacional de Jaén
          </p>
        </div>

      </div>
    </>
  );
};

export default ImprimirPlanCurricular;
