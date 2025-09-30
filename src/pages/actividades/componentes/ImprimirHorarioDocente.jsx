import React, { useEffect, useState } from "react";
import { useUsuario } from "../../../context/UserContext";
import { useLocation } from "react-router-dom";
import { TablaSkeleton } from "../../reutilizables/componentes/TablaSkeleton";
import { FaPrint } from "react-icons/fa";
import Cabecerareporte from "./Cabecerareporte";
import {
  obtenerDatoshorariodocente,
  obtenerDatoshorariodocentecalendario,
  obtenerNombreConfiguracion,
} from "../logica/Actividades";

// 🔹 Cabecera de reporte
const CabeceraMatricula = ({ titulomat, sede, nombredocente, nombreEscuela, semestre }) => {
  const fecha = new Date();
  const fechaFormateada = `${String(fecha.getDate()).padStart(2, "0")}-${String(
    fecha.getMonth() + 1
  ).padStart(2, "0")}-${fecha.getFullYear()}`;

  return (
    <>
      <Cabecerareporte titulomat={titulomat} />
      <div style={{ border: "2px solid #035aa6", margin: "20px 0" }}></div>
      <table className="table">
        <tbody>
          <tr>
            <td><strong>Sede:</strong></td>
            <td>{sede}</td>
            <td><strong>Docente:</strong></td>
            <td>{nombredocente}</td>
          </tr>
          <tr>
            <td><strong>Semestre:</strong></td>
            <td>{semestre}</td>
            <td><strong>Fecha:</strong></td>
            <td>{fechaFormateada}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

// 🔹 Componente principal
const ImprimirHorarioDoc = () => {
  const [datos, setDatos] = useState([]);
  const [datoscalendario, setDatoscalendario] = useState([]);
  const [nombresede, setNombresede] = useState("No Definida");
  const [nombreescuela, setNombreescuela] = useState("No Definida");
  const { usuario } = useUsuario();
  const { search } = useLocation();
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(search);
  const codigo = queryParams.get("codigo");

  let sede = "", semestre = "", persona = "";
  try {
    if (codigo) {
      const decoded = atob(atob(codigo));
      [sede, semestre, persona] = decoded.split("|");
    }
  } catch (err) {
    console.error("Error al decodificar código:", err);
  }

  const nombredocente = usuario?.docente?.nombrecompleto || "";
  const departamentoacademico = usuario?.docente?.departamentoacademico || "";
  const [titulomat] = useState("REPORTE DE HORARIOS POR DOCENTE");

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const alumno = await obtenerDatoshorariodocente(sede, semestre, persona);
        setDatos(alumno?.datos || []);

        const calendario = await obtenerDatoshorariodocentecalendario(persona, semestre);
        setDatoscalendario(calendario?.datos || []);

        const nombresedeResp = await obtenerNombreConfiguracion("nombresede", { sede });
        const nombreescuelaResp = await obtenerNombreConfiguracion("departamentoacademico", { departamentoacademico });

        setNombresede(typeof nombresedeResp === "object" ? nombresedeResp?.valor : nombresedeResp);
        setNombreescuela(typeof nombreescuelaResp === "object" ? nombreescuelaResp?.valor : nombreescuelaResp);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setDatos([]);
      } finally {
        setLoading(false);
      }
    };

    if (sede && semestre && persona) {
      fetchDatos();
    }
  }, [sede, semestre, persona, departamentoacademico]);

  const totalHorasTeoria = datos.reduce((sum, fila) => sum + Number(fila.horasteoria || 0), 0);
  const totalHorasPractica = datos.reduce((sum, fila) => sum + Number(fila.horaspractica || 0), 0);

  if (loading) return <TablaSkeleton filas={15} columnas={8} />;

  return (
    <>
      <button className="print-button" onClick={() => window.print()}>
        <FaPrint />
      </button>

      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <CabeceraMatricula
              titulomat={titulomat}
              sede={nombresede}
              nombredocente={nombredocente}
              nombreEscuela={nombreescuela}
              semestre={semestre}
            />
          </div>
        </div>

        <div style={{ border: "2px solid #035aa6", margin: "20px 0" }}></div>

        {/* Tabla de cursos */}
        <table className="table table-bordered">
          <thead>
            <tr>
              <th style={{ background: "#004080", color: "white" }}>Curso</th>
              <th style={{ background: "#004080", color: "white" }}>Nombre del Curso</th>
              <th style={{ background: "#004080", color: "white" }}>Sec.</th>
              <th style={{ background: "#004080", color: "white" }}>Escuela</th>
              <th style={{ background: "#004080", color: "white" }}>Tipo</th>
              <th style={{ background: "#004080", color: "white" }}>Gru</th>
              <th style={{ background: "#004080", color: "white" }}>Ht</th>
              <th style={{ background: "#004080", color: "white" }}>Hp</th>
              <th style={{ background: "#004080", color: "white" }}>HT</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((curso, index) => (
              <tr key={index}>
                <td>{curso.curso}</td>
                <td>{curso.nombrecurso}</td>
                <td className="text-center">{curso.seccion}</td>
                <td>{curso.nombreescuela}</td>
                <td>{curso.tipo}</td>
                <td className="text-center">{curso.practica}</td>
                <td className="text-center">{curso.horasteoria}</td>
                <td className="text-center">{curso.horaspractica}</td>
                <td className="text-center">{curso.horastotal}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="6" style={{ textAlign: "right" }}>
                <strong>TOTAL</strong>
              </td>
              <td style={{ textAlign: "center" }}><strong>{totalHorasTeoria}</strong></td>
              <td style={{ textAlign: "center" }}><strong>{totalHorasPractica}</strong></td>
              <td style={{ textAlign: "center" }}><strong>{totalHorasTeoria + totalHorasPractica}</strong></td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: "2px solid #035aa6", margin: "20px 0" }}></div>

        {/* Calendario */}
        <div className="calendario mt-4">
          <table className="table table-bordered text-center align-middle">
            <thead>
              <tr>
                <th style={{ background: "#004080", color: "white" }}>Horario</th>
                {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].map((dia) => (
                  <th key={dia} style={{ background: "#004080", color: "white" }}>{dia}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datoscalendario.map((fila, index) => {
                const getCell = (valor) => {
                  const match = valor?.match(/(#[0-9A-Fa-f]{6})(?:\[(.*?)\])?/);
                  return {
                    color: match ? match[1] : "#FFFFFF",
                    text: match?.[2] || "",
                  };
                };

                return (
                  <tr key={index}>
                    <td><strong>{fila.horario}</strong></td>
                    {["lunes","martes","miercoles","jueves","viernes","sabado","domingo"].map((dia) => {
                      const cell = getCell(fila[dia]);
                      return (
                        <td key={dia} style={{ backgroundColor: cell.color, border: "1px solid #ccc" }}>
                          {cell.text}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ImprimirHorarioDoc;
