import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Table } from "react-bootstrap";
import { obtenerhorariodocente } from "../logica/Actividades";
import { QRCodeSVG } from "qrcode.react";
import { FaPrint } from "react-icons/fa";
import Swal from "sweetalert2";

function ImprimirHorarioDocente() {
  const { search } = useLocation();
  const [cargaLectiva, setCargaLectiva] = useState([]);
  const [horario, setHorario] = useState([]);
  const [semestre, setSemestre] = useState("");
  const [sede, setSede] = useState("");
  const [persona, setPersona] = useState("");

  // Fecha y hora
  const fecha = new Date();
  const fechaFormateada = `${String(fecha.getDate()).padStart(2, "0")}-${String(
    fecha.getMonth() + 1
  ).padStart(2, "0")}-${fecha.getFullYear()}`;
  const horaActual = fecha.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const urlActual = window.location.href;

  // 🔹 Decodificar parámetros
  useEffect(() => {
    const queryParams = new URLSearchParams(search);
    const codigoParam = queryParams.get("codigo");

    if (codigoParam) {
      try {
        const decoded = atob(atob(codigoParam));
        const [sedeDec, semestreDec, personaDec] = decoded.split("|");
        setSede(sedeDec);
        setSemestre(semestreDec);
        setPersona(personaDec);

        // Cargar datos API
        cargarDatos(sedeDec, semestreDec, personaDec);
      } catch (error) {
        Swal.fire("Error", "Código inválido en la URL", "error");
      }
    }
  }, [search]);

  // 🔹 Llamar al API
  const cargarDatos = async (sede, semestre, persona) => {
    try {
      const token = localStorage.getItem("token"); // 👈 trae el token de sesión
      const resultado = await obtenerhorariodocente(sede, semestre, persona, token);

      if (resultado.mensaje) {
        Swal.fire("Error", resultado.mensaje, "error");
      }

      setCargaLectiva(resultado.cargaLectiva || []);
      setHorario(resultado.horario || []);
    } catch (error) {
      Swal.fire("Error", "No se pudo cargar la información", "error");
    }
  };

  return (
    <div className="container mt-4">
      {/* Botón imprimir */}
      <button className="btn btn-outline-primary mb-3" onClick={() => window.print()}>
        <FaPrint className="me-2" /> Imprimir
      </button>

      {/* Logo y QR */}
      <div className="row mb-3">
        <div className="col-6 text-start">
          <img src="/image/logo/logo-unj-v1.svg" alt="Logo" width="120" />
        </div>
        <div className="col-6 text-end">
          <QRCodeSVG value={urlActual} size={96} level="L" includeMargin={true} />
          <p style={{ fontSize: "0.8rem", marginTop: "5px" }}>
            <strong>{fechaFormateada} {horaActual}</strong>
          </p>
        </div>
      </div>

      {/* --- TABLA DE CARGA LECTIVA --- */}
      <h5 className="text-center mt-4">Carga Lectiva</h5>
      <Table striped bordered hover size="sm" className="mb-5">
        <thead>
          <tr>
            <th>Curso</th>
            <th>Escuela</th>
            <th>Créditos</th>
            <th>HT</th>
            <th>HP</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {cargaLectiva.length > 0 ? (
            cargaLectiva.map((item, index) => (
              <tr key={index}>
                <td>{item.curso}</td>
                <td>{item.escuela}</td>
                <td>{item.creditos}</td>
                <td>{item.ht}</td>
                <td>{item.hp}</td>
                <td>{item.total}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No hay datos de carga lectiva
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* --- TABLA DE HORARIO --- */}
      <h5 className="text-center">Horario</h5>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Día</th>
            <th>Hora Inicio</th>
            <th>Hora Fin</th>
            <th>Curso</th>
            <th>Aula</th>
          </tr>
        </thead>
        <tbody>
          {horario.length > 0 ? (
            horario.map((item, index) => (
              <tr key={index}>
                <td>{item.dia}</td>
                <td>{item.horaInicio}</td>
                <td>{item.horaFin}</td>
                <td>{item.curso}</td>
                <td>{item.aula}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No hay datos de horario
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default ImprimirHorarioDocente;
