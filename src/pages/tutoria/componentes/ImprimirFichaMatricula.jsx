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

  // 🔹 Decodificamos el parámetro "codigo" de la URL
  const queryParams = new URLSearchParams(search);
  const codigoParam = queryParams.get("codigo");

  let alumno = "", escuela = "", curricula = "", semestre = "";
  try {
    if (codigoParam) {
      const decoded = atob(atob(codigoParam)); // doble decodificación
      [alumno, escuela, curricula, semestre] = decoded.split("|");
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
      const token = usuario.codigotokenautenticadorunj;
      const resp = await obtenerFichaMatricula(alumno, escuela, curricula, semestre, token);
      if (resp.success) {
        setDatos(resp.datos || []);
        if (resp.datos.length > 0) {
          const d0 = resp.datos[0];
          setInfoCabecera({
            carrera: d0.nombrecurso || "",
            semestre,
            alumno: usuario?.nombrecompleto || "",
            codigo: alumno,
          });
        }
      }
      setLoading(false);
    };
    cargar();
  }, [alumno, escuela, curricula, semestre]);

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
                <p style={{ fontSize: "0.8rem" }}>Fecha: {fechaTexto} | Hora: {horaTexto}</p>
              </div>
              <QRCodeSVG value={urlActual} size={80} level="L" />
            </div>

            {/* 🔹 Datos generales */}
            <table className="table table-bordered tabla-datos">
              <tbody>
                <tr>
                  <td><strong>Carrera:</strong></td>
                  <td>{infoCabecera.carrera}</td>
                  <td><strong>Código:</strong></td>
                  <td>{infoCabecera.codigo}</td>
                </tr>
                <tr>
                  <td><strong>Alumno:</strong></td>
                  <td>{infoCabecera.alumno}</td>
                  <td><strong>Semestre:</strong></td>
                  <td>{infoCabecera.semestre}</td>
                </tr>
              </tbody>
            </table>

            {/* 🔹 Tabla de cursos */}
            <table className="table table-striped table-bordered text-center tabla-cursos">
              <thead>
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

            {/* 🔹 Totales */}
            <div className="mt-3 text-end">
              <strong>Total de Cursos Matriculados:</strong> {datos.length}<br />
              <strong>Total de Créditos Matriculados:</strong>{" "}
              {datos.reduce((acc, d) => acc + Number(d.creditos || 0), 0)}
            </div>

            {/* 🔹 Firmas */}
            <div className="mt-5 text-center">
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px" }}>
                <div>
                  ..............................................<br />
                  {infoCabecera.alumno}<br />
                  <small>Código {infoCabecera.codigo}</small>
                </div>
                <div>
                  ..............................................<br />
                  <small>Responsable</small>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ImprimirFichaMatricula;
