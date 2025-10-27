import { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../context/UserContext";
import Swal from "sweetalert2";
import {
  obtenerSesionesIndividuales,
  obtenerSesionIndividual,
} from "./logica/DatosTutoria";

function SesionesIndividuales({ semestreValue }) {
  const { usuario } = useUsuario();
  const [semestre, setSemestre] = useState(semestreValue || "202501");
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar alumnos tutorados
  const cargarDatos = async () => {
    if (!usuario || !usuario.docente) return;
    setLoading(true);

    const token = usuario.codigotokenautenticadorunj;

    // valores que vienen del usuario logueado
    const persona = usuario.docente.persona; // _persona en SP (ej. "00003694")
    const docente = usuario.docente.usuario; // _docente en SP (ej. "18104355")

    // 👇 ESTE ERA EL PROBLEMA DEL 404:
    // escuela estaba llegando "", entonces la URL tenía // y Laravel no encontraba la ruta.
    // Si no hay escuela en el contexto del usuario, mandamos "xx" (o cualquier string corto).
    const escuelaFromUser =
      usuario.docente.estructura ||
      usuario.docente.escuela ||
      usuario.docente.cod_escuela ||
      usuario.docente.codigoescuela;

    const escuela =
      escuelaFromUser && escuelaFromUser !== "" ? escuelaFromUser : "xx";

    const vperfil = "P02"; // esto lo estás usando fijo

    console.log("👉 Enviando a API sesiones-individuales:", {
      semestre,
      persona,
      docente,
      escuela,
      vperfil,
    });

    const data = await obtenerSesionesIndividuales(
      semestre,
      persona,
      docente,
      escuela,
      vperfil,
      token
    );

    console.log("📦 Respuesta API sesiones-individuales:", data);

    setAlumnos(data.success ? data.data : []);
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semestre]);

  // Ver detalle de alumno (antes era el icono de lupa / editar con base64)
  const handleVerDetalle = async (alumno, estructura) => {
    const token = usuario.codigotokenautenticadorunj;
    const persona = usuario.docente.persona;
    const docente = usuario.docente.usuario;
    const vperfil = "P02";

    const detalle = await obtenerSesionIndividual(
      semestre,
      persona,
      docente,
      alumno,
      estructura,
      vperfil,
      token
    );

    console.log("📄 Detalle del alumno:", detalle);

    if (!detalle.success || !detalle.data) {
      Swal.fire(
        "⚠️",
        "No se pudo obtener la información del tutorando.",
        "warning"
      );
      return;
    }

    const d = detalle.data;

    Swal.fire({
      title: "👨‍🎓 Detalle del Tutorando",
      html: `
        <p><b>Alumno:</b> ${alumno}</p>
        <p><b>Estructura:</b> ${estructura}</p>
        <p><b>Comentario:</b> ${d.comentario || "Sin comentario"}</p>
        <p><b>Recomendación:</b> ${d.recomendacion || "Sin recomendación"}</p>
      `,
      confirmButtonText: "Cerrar",
    });
  };

  return (
    <div className="container mt-3">
      {/* Selección semestre */}
      <div className="mb-3 row align-items-center">
        <div className="col-md-1">
          <label className="form-label">
            <strong>Semestre:</strong>
          </label>
        </div>
        <div className="col-md-3">
          <SemestreSelect
            value={semestre}
            onChange={(v) => setSemestre(v)}
            name="cboSemestre"
          />
        </div>
      </div>

      {/* Nombre del tutor */}
      <div className="d-flex justify-content-between mb-2">
        <div>
          <strong>Docente Tutor:</strong>{" "}
          {usuario?.docente?.nombrecompleto || "Sin nombre"}
        </div>

        <div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => Swal.fire("🖨", "Impresión en desarrollo")}
          >
            <i className="fa fa-print"></i> Registro de reuniones
          </Button>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <Spinner animation="border" variant="primary" />
      ) : (
        <Table bordered hover size="sm" responsive className="table-tutoria">
          <thead className="table-light text-center">
            <tr>
              <th style={{ width: "10%" }}>Código</th>
              <th>Apellidos y Nombres</th>
              <th style={{ width: "5%" }}>Esc.</th>
              <th style={{ width: "10%" }}>Teléfono</th>
              <th style={{ width: "20%" }}>Email</th>
              <th style={{ width: "10%" }}>Acción</th>
            </tr>
          </thead>

          <tbody>
            {alumnos.map((a, i) => (
              <tr key={i}>
                <td className="text-center">{a.alumno}</td>
                <td>{a.nombrecompletos}</td>
                <td className="text-center">{a.estructura}</td>
                <td className="text-center">{a.celular}</td>
                <td>{a.email_institucional}</td>
                <td className="text-center">
                  {/* Ver (lupa del PHP antiguo) */}
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="me-1 btn-icon"
                    onClick={() => handleVerDetalle(a.alumno, a.estructura)}
                  >
                    <i className="fa fa-search icono-azul"></i>
                  </Button>

                  {/* Editar (fa-edit del PHP antiguo) */}
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="me-1 btn-icon"
                    onClick={() =>
                      Swal.fire("🖋️", "Función editar en desarrollo", "info")
                    }
                  >
                    <i className="fa fa-edit icono-negro"></i>
                  </Button>
                </td>
              </tr>
            ))}

            {alumnos.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No hay alumnos asignados.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default SesionesIndividuales;
