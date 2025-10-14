import { useState, useEffect } from "react";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { obtenerAlumnosTutor } from "./logica/DatosTutoria";
import Swal from "sweetalert2";

function ObsRendimiento({ semestreValue, persona, docente, escuela, vperfil }) {
  const [semestre, setSemestre] = useState(semestreValue || "202501");
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (semestre && persona && docente) {
      cargarAlumnos();
    }
  }, [semestre, persona, docente]);

  const cargarAlumnos = async () => {
    setLoading(true);
    const { datos, mensaje } = await obtenerAlumnosTutor(
      semestre,
      persona,
      docente,
      escuela,
      vperfil
    );
    if (datos) setAlumnos(datos);
    else setAlumnos([]);
    setMensaje(mensaje);
    setLoading(false);
  };

  const handleChange = (value) => {
    setSemestre(value);
  };

  // 🔹 Función para abrir el modal de observación
  const handleObservacion = async (alumno) => {
    const { value: nuevaObs } = await Swal.fire({
      title: `Observación - ${alumno.nombrecompleto}`,
      input: "textarea",
      inputLabel: "Escribe tu observación:",
      inputValue: alumno.obs || "",
      inputPlaceholder: "Ingrese la observación...",
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      inputAttributes: {
        "aria-label": "Ingrese la observación",
      },
    });

    if (nuevaObs !== undefined) {
      // Aquí podrías hacer un fetch o axios.post para guardar en backend
      const actualizados = alumnos.map((a) =>
        a.alumno === alumno.alumno ? { ...a, obs: nuevaObs } : a
      );
      setAlumnos(actualizados);

      Swal.fire({
        icon: "success",
        title: "Guardado",
        text: "La observación fue registrada correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div>
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

      {loading && <p>Cargando alumnos...</p>}
      {!loading && mensaje && <p>{mensaje}</p>}

      {!loading && alumnos.length > 0 && (
        <table className="table table-striped">
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
                <td>{alumno.nombrecompleto}</td>
                <td>{alumno.telefono}</td>
                <td>{alumno.estructura}</td>
                <td>{alumno.segunda}</td>
                <td>{alumno.tercera}</td>
                <td>{alumno.cuarta}</td>
                <td>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleObservacion(alumno)}
                  >
                    📝
                  </button>
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
        </table>
      )}
    </div>
  );
}

export default ObsRendimiento;
