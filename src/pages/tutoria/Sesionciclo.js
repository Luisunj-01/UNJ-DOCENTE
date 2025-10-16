import { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../context/UserContext";
import { obtenerSesionesCiclo } from "./logica/DatosTutoria"; // función nueva
import Swal from "sweetalert2";


function SesionesCiclo({ semestreValue }) {
  const { usuario } = useUsuario();
  const [semestre, setSemestre] = useState(semestreValue || "202501");
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [ciclo, setCiclo] = useState("No asignado");


  // 🧩 Cargar sesiones
  useEffect(() => {
    if (!usuario || !usuario.docente) return;

    const cargar = async () => {
      setLoading(true);
      const token = usuario?.codigotokenautenticadorunj;

      if (!token) {
        setMensaje("Token no disponible. Inicie sesión nuevamente.");
        setSesiones([]);
        setLoading(false);
        return;
      }

      try {
        const persona = usuario.docente.persona;

        const { ciclo, datos, mensaje } = await obtenerSesionesCiclo(persona, semestre, token);

        console.log("🧩 Datos obtenidos desde la API /sesCiclo:", datos);

        if (datos && datos.length > 0) {
          setSesiones(datos);
          setCiclo(ciclo || "No asignado"); // ✅ nuevo
          setMensaje("");
        } else {
          setSesiones([]);
          setCiclo(ciclo || "No asignado"); // ✅ nuevo
          setMensaje(mensaje || "No se encontraron sesiones de ciclo.");
        }
      } catch (error) {
        console.error("❌ Error al cargar sesiones:", error);
        setSesiones([]);
        setMensaje("Error al obtener datos del servidor.");
      }

      setLoading(false);
    };

    cargar();
  }, [semestre, usuario]);

  const handleChange = (value) => setSemestre(value);

  const handleAccion = (tipo, sesion) => {
    const acciones = {
      reco: "📘 Logros, dificultades y observaciones",
      foto: "😄 Subir imagen",
      asis: "👨‍🏫 Asistencia y observaciones",
      edit: "✏️ Editar sesión",
      elim: "🚫 Eliminar sesión",
    };

    Swal.fire({
      title: `${acciones[tipo]}`,
      text: `Sesión: ${sesion.descripcion}`,
      icon: tipo === "elim" ? "warning" : "info",
      confirmButtonText: tipo === "elim" ? "Eliminar" : "Aceptar",
    });
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
          <SemestreSelect value={semestre} onChange={handleChange} name="cboSemestre" />
        </div>
      </div>

      {/* Leyenda */}
      <div className="alert alert-info py-2">
        <strong>Leyenda:</strong>&nbsp;
        <i className="fa fa-book"></i> Logros, dificultades y observaciones &nbsp;
        <i className="fa fa-smile-o"></i> Subir imagen &nbsp;
        <i className="fa fa-male"></i> Asistencia y observaciones &nbsp;
        <i className="fa fa-edit"></i> Editar &nbsp;
        <i className="fa fa-ban"></i> Eliminar
      </div>

      {/* Docente y ciclo */}
      <div className="d-flex justify-content-between mb-2">
        <div>
          <strong>Docente Tutor:</strong>{" "}
          {usuario?.docente?.nombrecompleto || "Sin nombre"}
          <br />
          Ciclo: {usuario?.docente?.estructura?.nombre || usuario?.docente?.ciclo || "No asignado"}

        </div>
        <div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => Swal.fire("🖨 Registro de reuniones", "Función en desarrollo.")}
          >
            <i className="fa fa-print"></i> Registro de reuniones
          </Button>
        </div>
      </div>

      {/* Tabla */}
      {loading && <Spinner animation="border" variant="primary" />}
      {!loading && mensaje && <p>{mensaje}</p>}
      {!loading && sesiones.length > 0 && (
        <Table bordered hover size="sm" responsive>
          <thead className="table-light">
            <tr>
              <th style={{ width: "5%", textAlign: "center" }}>Nro.</th>
              <th>Descripción</th>
              <th style={{ width: "10%", textAlign: "center" }}>Fecha</th>
              <th style={{ width: "10%", textAlign: "center" }}>Estado</th>
              <th style={{ width: "20%", textAlign: "center" }}>
                <Button variant="outline-primary" size="sm">
                  <i className="fa fa-file-o"></i>
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sesiones.map((sesion, index) => (
              <tr key={index}>
                <td style={{ textAlign: "center" }}>{index + 1}</td>
                <td>{sesion.descripcion}</td>
                <td style={{ textAlign: "center" }}>{sesion.fecha}</td>
                <td style={{ textAlign: "center" }}>
                  {sesion.estado === 1 ? (
                    <span className="badge bg-primary">Concluida</span>
                  ) : (
                    <span className="badge bg-danger">Pendiente</span>
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleAccion("reco", sesion)}
                    className="me-1"
                  >
                    <i className="fa fa-book"></i>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleAccion("foto", sesion)}
                    className="me-1"
                  >
                    <i className="fa fa-smile-o"></i>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleAccion("asis", sesion)}
                    className="me-1"
                  >
                    <i className="fa fa-male"></i>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleAccion("edit", sesion)}
                    className="me-1"
                  >
                    <i className="fa fa-edit"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleAccion("elim", sesion)}
                  >
                    <i className="fa fa-ban"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default SesionesCiclo;
