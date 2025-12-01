import { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { useUsuario } from "../../../context/UserContext";
import { guardarAsistenciaLibre, obtenerAsistenciaSesionesLibre } from "../logica/DatosTutoria";

function AsistenciaSesion({ persona, semestre, sesion, descripcion, onVolver }) {

  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;

  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState(""); // 🔹 Nuevo: para filtrar
useEffect(() => {
    const cargarDatos = async () => {
        if (!token) {
            Swal.fire("Error", "Token no disponible. Inicie sesión nuevamente.", "error");
            setLoading(false);
            return;
        }

        const resp = await obtenerAsistenciaSesionesLibre(persona, semestre, sesion, token);

        if (resp.success) {
            setAlumnos(resp.data.map((a) => ({ ...a, visible: true })));
        } else {
            Swal.fire("Error", resp.message || "No se pudieron cargar los alumnos.", "error");
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

    const detalles = alumnos.map((a) => ({
        personaalumno: a.personaalumno,
        alumno: a.alumno,
        estructura: a.estructura,
        observacion: a.observacion || "",
        asistencia: a.asistencia || 0,
    }));

    const resp = await guardarAsistenciaLibre(persona, semestre, sesion, detalles, token);

    if (resp.success) {
        Swal.fire("✅ Éxito", resp.message, "success");
    } else {
        Swal.fire("❌ Error", resp.message || "No se pudo guardar.", "error");
    }

    setGuardando(false);
};

  // 🔹 Filtrar alumnos según búsqueda
  const alumnosFiltrados = alumnos.filter(
    (a) =>
      a.nombrecompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.alumno.toLowerCase().includes(busqueda.toLowerCase())
  );

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
      {/* 🔹 Botón de regresar */}
      <Button
        variant="secondary"
        size="sm"
        className="mb-3"
        onClick={onVolver}
      >
        ⬅ Regresar
      </Button>

      <h5 className="mb-3 text-primary fw-bold">📋 Asistencia de Sesión</h5>


     {/* 🔹 Información del docente y la sesión (solo texto) */}
<div className="mb-3">
  <p className="mb-1">
    <strong>👩‍🏫 Docente:</strong>{" "}
    {usuario?.docente?.nombrecompleto || "Sin nombre"}
  </p>
  <p className="mb-0">
    <strong>🗓️ Sesión:</strong> {descripcion || "Sin descripción"}
  </p>
</div>



      {/* 🔎 Campo de búsqueda */}
      <div className="d-flex justify-content-between align-items-center mb-3">


       

                



        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Buscar alumno o código..."
          style={{ width: "250px" }}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
<Table
  className="table table-sm table-hover shadow-sm text-center align-middle"
  responsive
  style={{
    backgroundColor: "white",
    borderRadius: "10px",
    overflow: "hidden",
  }}
>
  <thead
    style={{
      backgroundColor: "#f1f3f4",
      color: "#333",
      fontWeight: "bold",
      borderBottom: "2px solid #dee2e6",
    }}
  >
    <tr>
      <th style={{ width: "50px", padding: "6px" }}>#</th>
      <th style={{ width: "90px", padding: "6px" }}>Código</th>
      <th style={{ width: "250px", padding: "6px" }}>Nombre</th>
      <th style={{ width: "90px", padding: "6px" }}>
        <div className="form-check d-flex justify-content-center align-items-center mb-1">
          <input
            type="checkbox"
            className="form-check-input"
            id="check-todos"
            checked={
              alumnos.length > 0 &&
              alumnos.every((a) => Number(a.asistencia) === 1)
            }
            onChange={(e) => {
              const checked = e.target.checked;
              setAlumnos((prev) =>
                prev.map((a) => ({ ...a, asistencia: checked ? 1 : 0 }))
              );
            }}
          />
        </div>
        <div style={{ fontSize: "0.85rem" }}>Asistencia</div>
      </th>
      <th style={{ width: "220px", padding: "6px" }}>Observación</th>
    </tr>
  </thead>

  <tbody>
    {alumnosFiltrados.map((a, i) => (
      <tr
        key={a.codigo ?? i}
        style={{
          transition: "background-color 0.2s ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#f8f9fa")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "white")
        }
      >
        <td style={{ padding: "6px" }}>{i + 1}</td>
        <td style={{ padding: "6px" }}>{a.alumno}</td>

        <td
        style={{
          padding: "6px",
          maxWidth: "260px",
          whiteSpace: "normal",
          lineHeight: "1.2",
        }}
      >
        <div style={{ fontWeight: "500", color: "#212529" }}>
          {a.nombrecompleto}
        </div>
        <div style={{ fontSize: "0.8em", color: "#6c757d" }}>
          {a.email_institucional || "Sin correo"}
        </div>
        <div style={{ fontSize: "0.8em", color: "#6c757d" }}>
          {a.celular || "Sin teléfono"}
        </div>
      </td>



        <td style={{ padding: "6px" }}>
          <input
            type="checkbox"
            id={`chk-${i}`}
            checked={Number(a.asistencia) === 1}
            onChange={(e) => {
              const checked = e.target.checked;
              setAlumnos((prev) =>
                prev.map((al, idx) =>
                  idx === i ? { ...al, asistencia: checked ? 1 : 0 } : al
                )
              );
            }}
          />
        </td>
        <td style={{ padding: "6px" }}>
          <input
            type="text"
            className="form-control form-control-sm text-center"
            value={a.observacion || ""}
            onChange={(e) =>
              setAlumnos((prev) =>
                prev.map((al, idx) =>
                  idx === i ? { ...al, observacion: e.target.value } : al
                )
              )
            }
            placeholder="Escriba una observación..."
          />
        </td>
      </tr>
    ))}
  </tbody>
</Table>




      <div className="text-end mt-3">
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
