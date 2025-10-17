import { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { useUsuario } from "../../../context/UserContext";
import { guardarAsistenciaSesiones, obtenerAsistenciaSesiones } from "../logica/DatosTutoria";




function AsistenciaSesion({ persona, semestre, sesion }) {
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;

  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!token) {
        Swal.fire("Error", "Token no disponible. Inicie sesión nuevamente.", "error");
        setLoading(false);
        return;
      }

      const { datos, mensaje } = await obtenerAsistenciaSesiones(persona, semestre, sesion, token);
      if (datos) {
        setAlumnos(datos);
      } else {
        Swal.fire("Error", mensaje, "error");
      }
      setLoading(false);
    };

    cargarDatos();
  }, [persona, semestre, sesion, token]);

  const handleAsistenciaChange = (codigo, checked) => {
    setAlumnos((prev) =>
      prev.map((alumno) =>
        alumno.codigo === codigo ? { ...alumno, asistencia: checked ? 1 : 0 } : alumno
      )
    );
  };

  const handleObservacionChange = (codigo, value) => {
    setAlumnos((prev) =>
      prev.map((alumno) =>
        alumno.codigo === codigo ? { ...alumno, observacion: value } : alumno
      )
    );
  };

  const handleGuardar = async () => {
    setGuardando(true);
    const { exito, mensaje } = await guardarAsistenciaSesiones(persona, semestre, sesion, alumnos, token);
    Swal.fire(exito ? "✅ Éxito" : "❌ Error", mensaje, exito ? "success" : "error");
    setGuardando(false);
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" />
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <h5 className="mb-3">📋 Asistencia de Sesión {sesion}</h5>

      <Table bordered hover responsive>
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Asistencia</th>
            <th>Observación</th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map((a, i) => (
            <tr key={a.codigo}>
              <td>{i + 1}</td>
              <td>{a.alumno}</td>
              <td>{a.nombrecompleto}</td>
              <td className="text-center">
                <input
                  type="checkbox"
                  checked={a.asistencia === 1}
                  onChange={(e) => handleAsistenciaChange(a.codigo, e.target.checked)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={a.observacion || ""}
                  onChange={(e) => handleObservacionChange(a.codigo, e.target.value)}
                  placeholder="Escriba una observación..."
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="text-end">
        <Button
          variant="primary"
          size="sm"
          onClick={handleGuardar}
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "💾 Guardar Asistencia"}
        </Button>
      </div>
    </div>
  );
}

export default AsistenciaSesion;
