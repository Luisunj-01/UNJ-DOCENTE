import { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../context/UserContext";
import { obtenerAlumnosTutor, guardarObservacion } from "./logica/DatosTutoria";
import Swal from "sweetalert2";
import config from "../../config"; // Ajusta la ruta según tu proyecto



function ObsRendimiento({ semestreValue }) {
  const { usuario } = useUsuario();
  const [semestre, setSemestre] = useState(semestreValue || "202501");
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!usuario || !usuario.docente) return;

    const cargar = async () => {
      setLoading(true);

      const token = usuario?.codigotokenautenticadorunj;
      if (!token) {
        setMensaje("Token no disponible. Inicie sesión nuevamente.");
        setAlumnos([]);
        setLoading(false);
        return;
      }

      try {
        const escuela = usuario.docente.escuela ?? "P02";
        const vperfil = usuario.docente.vperfil ?? "G";
        const docenteDni = usuario.docente.numerodocumento || usuario.docente.usuario;
        const persona = usuario.docente.persona;

        const { datos, mensaje } = await obtenerAlumnosTutor(
          semestre,
          persona,
          docenteDni,
          escuela,
          vperfil,
          token
        );

        if (datos && datos.length > 0) {
          setAlumnos(datos);
          setMensaje("");
        } else {
          setAlumnos([]);
          setMensaje(mensaje || "No se encontraron resultados.");
        }
      } catch (error) {
        console.error("❌ Error al cargar alumnos:", error);
        setAlumnos([]);
        setMensaje("Error al obtener datos del servidor.");
      }

      setLoading(false);
    };

    cargar();
  }, [semestre, usuario]);

  const handleChange = (value) => setSemestre(value);

  const handleObservacion = async (alumno, alumnos, setAlumnos, token) => {
  const { value: formValues } = await Swal.fire({
    title: `Observación`,
    html: `
      <div style="font-weight:bold; font-size:1em;">${alumno.nombrecompleto}</div>
      <div style="font-size:0.85em; color:#0d6efd; margin-bottom:10px;">
        ${alumno.nombreescuela || ""}
      </div>

      <label for="swal-comentario" style="font-weight:bold;">Comentario:</label>
      <textarea id="swal-comentario" class="swal2-textarea" placeholder="Ingrese el comentario">${alumno.obs || ""}</textarea>
      
      <label for="swal-recomendacion" style="font-weight:bold; margin-top:10px;">Recomendación:</label>
      <textarea id="swal-recomendacion" class="swal2-textarea" placeholder="Ingrese la recomendación">${alumno.recomendacion || ""}</textarea>
    `,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    cancelButtonText: "Cancelar",
    focusConfirm: false,
    width: '600px',
    preConfirm: () => {
      const comentario = document.getElementById("swal-comentario").value;
      const recomendacion = document.getElementById("swal-recomendacion").value;
      return { comentario, recomendacion };
    },
  });

  if (formValues) {
    try {
      const payload = {
        codigo: alumno.codigo, // identificador único
        comentario: formValues.comentario,
        recomendacion: formValues.recomendacion
      };

      const respuesta = await fetch(`${config.apiUrl}api/Tutoria/grabar-observacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (respuesta.status === 422) {
        const errorData = await respuesta.json();
        console.error("Errores de validación:", errorData.errors);
        Swal.fire("Error", "Errores de validación: " + JSON.stringify(errorData.errors), "error");
        return;
      }

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        Swal.fire("Error", errorData.message || "Error desconocido en el servidor.", "error");
        return;
      }

      const data = await respuesta.json();

      if (data.success) {
        // Actualizar estado local
        const actualizados = alumnos.map((a) =>
          a.alumno === alumno.alumno
            ? { ...a, obs: formValues.comentario, recomendacion: formValues.recomendacion }
            : a
        );
        setAlumnos(actualizados);

        Swal.fire({
          icon: "success",
          title: "Guardado",
          text: "La observación y recomendación fueron registradas correctamente.",
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", data.message || "No se pudo guardar la observación", "error");
      }

    } catch (error) {
      console.error("Error al conectar con la API:", error);
      Swal.fire("Error", "Error al conectar con la API.", "error");
    }
  }
};



  return (
    <div className="container mt-3">
      {/* Selector de semestre */}
      <div className="mb-3 row align-items-center">
        <div className="col-md-1">
          <label className="form-label">
            <strong>Semestre:</strong>
          </label>
        </div>
        <div className="col-md-3">
          <SemestreSelect
            value={semestre}
            onChange={handleChange}
            name="cboSemestre"
          />
        </div>
      </div>

      {loading && <Spinner animation="border" variant="primary" />}

      {!loading && mensaje && <p>{mensaje}</p>}

      {!loading && alumnos.length > 0 && (
        <Table bordered hover size="sm" responsive>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Escuela</th>
              <th>Segunda</th>
              <th>Tercera</th>
              <th>Cuarta</th>
              <th>Obs</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((alumno, index) => (
                <tr key={index}>
                <td>{alumno.alumno}</td>
                <td>
                    {alumno.nombrecompleto}
                    <div style={{ fontSize: "0.8em", color: "#0d6efd" }}>
                    {alumno.nombreescuela}
                    </div>
                </td>
                <td>{alumno.telefono}</td>
                <td>{alumno.estructura}</td>
                <td>{alumno.segunda}</td>
                <td>{alumno.tercera}</td>
                <td>{alumno.cuarta}</td>
                <td>
                    <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleObservacion(alumno)}
                    >
                    📝
                    </Button>
                    <span className="ms-2">
                    {alumno.obs ? (
                        <small className="text-success">✔</small>
                    ) : (
                        <small className="text-muted">Sin obs.</small>
                    )}
                    </span>
                </td>
                </tr>
            ))}
            </tbody>

        </Table>
      )}
    </div>
  );
}

export default ObsRendimiento;
