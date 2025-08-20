import { useContext, useEffect, useState } from "react";
import TablaCursos from "../../reutilizables/componentes/TablaCursos";
import { useParams } from "react-router-dom";
import { obtenerDatosAsistencia } from "../logica/Curso";
import { Form, Modal, Button, Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContext } from "../../../cuerpos/Layout";
import { useUsuario } from "../../../context/UserContext";
import { TablaSkeleton } from "../../reutilizables/componentes/TablaSkeleton";

function ParticipantesCurso({ datoscurso }) {
  const [datos, setDatos] = useState([]);
  const [asistencias, setAsistencias] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [showModalConfirmar, setShowModalConfirmar] = useState(false);
  const { usuario } = useUsuario();

  // Modal de justificación
  const [showModalJustificacion, setShowModalJustificacion] = useState(false);
  const [justificacion, setJustificacion] = useState({
    archivo: null,
    observacion: "",
    alumno: null,
    nombrecompleto: "",
  });

  const formatearFecha = (fecha) => {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    const dd = String(fecha.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Modal de validación de fecha
  const [showModalFecha, setShowModalFecha] = useState(false);

  const { id } = useParams();
  const decoded = atob(atob(id));
  const [sede, semestre, escuela, curricula, curso, seccion] =
    decoded.split("|");

  const { mostrarToast } = useContext(ToastContext);

  const parametrosaenviar = {
    sede: sede,
    semestre: semestre,
    escuela: escuela,
    curricula: curricula,
    curso: curso,
    seccion: seccion,
    sesion: datoscurso.sesion,
    //usuario: usuario.docente.numerodocumento,
  };

  useEffect(() => {
    if (!datoscurso?.modoEdicion) {
      localStorage.removeItem("asistenciasSeleccionadas");
    }

    // Validar fecha contra la guía
    if (datoscurso?.fecha) {
      const [dia, mes, anio] = datoscurso.fecha.split("/").map(Number);
      const fechaGuia = new Date(anio, mes - 1, dia);
      const hoy = new Date();

      if (fechaGuia.toDateString() !== hoy.toDateString()) {
        setShowModalFecha(true);
      }
    }

    cargarDatos();
  }, []);

  const handleGuardarClick = () => {
    const claveStorage = "asistenciasSeleccionadas";
    const asistencias = JSON.parse(localStorage.getItem(claveStorage)) || [];

    if (asistencias.length === 0) {
      mostrarToast("No hay asistencias seleccionadas para guardar.", "info");
      return;
    }

    setShowModalConfirmar(true);
  };

  const cargarDatos = async (fecha = null) => {
    setLoading(true);
    try {
      const respuestaAsistencia = await obtenerDatosAsistencia(
        parametrosaenviar,
        fecha
      );

      if (!respuestaAsistencia || !respuestaAsistencia.datos) {
        setMensajeApi("No se pudo obtener el detalle de la Asistencia.");
        setDatos([]);
        setLoading(false);
        return;
      }

      // Extraemos fechas únicas del resultado
      const fechasUnicas = [
        ...new Set(respuestaAsistencia.datos.map((item) => item.fecha)),
      ];

      setFechasDisponibles(fechasUnicas);

      if (fecha) {
        // 🔥 aquí precargamos asistencia desde "condicion"
        const datosConAsistencia = respuestaAsistencia.datos.map((item) => ({
          ...item,
          asistencia: item.condicion || "0",
        }));
        setDatos(datosConAsistencia);
      } else {
        setDatos([]);
      }

      setMensajeApi(respuestaAsistencia.mensaje);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setMensajeApi("Ocurrió un error al obtener los datos.");
    }

    setLoading(false);
  };

  const marcarTodosComoAsistencia = () => {
  // 🔥 Clave de almacenamiento
  const claveStorage = "asistenciasSeleccionadas";

  // Creamos una copia de todos los alumnos con asistencia "A"
  const nuevosDatos = datos.map((item) => {
    const asistencia = "A";
    // Actualizamos también en el storage
    actualizarAsistenciaLocal(
      item.alumno,
      item.nombrecompleto,
      asistencia,
      item.observacion || "",
      item.archivo || null
    );
    return { ...item, asistencia };
  });

  // Actualizamos estado local para que los selects cambien en UI
  setDatos(nuevosDatos);

  mostrarToast("Todos los alumnos fueron marcados como Asistencia.", "success");
};



  const actualizarAsistenciaLocal = (
    alumno,
    nombrecompleto,
    asistencia,
    observacion = "",
    archivo = null
  ) => {
    const claveStorage = "asistenciasSeleccionadas";
    let asistencias = JSON.parse(localStorage.getItem(claveStorage)) || [];

    if (asistencia === "0") {
      asistencias = asistencias.filter((item) => item.alumno !== alumno);
    } else {
      const index = asistencias.findIndex((item) => item.alumno === alumno);
      if (index !== -1) {
        asistencias[index].asistencia = asistencia;
        asistencias[index].observacion = observacion;
        asistencias[index].archivo = archivo;
      } else {
        asistencias.push({
          alumno,
          nombrecompleto,
          asistencia,
          observacion,
          archivo,
        });
      }
    }

    localStorage.setItem(claveStorage, JSON.stringify(asistencias));

    setDatos((prevDatos) =>
      prevDatos.map((item) =>
        item.alumno === alumno ? { ...item, asistencia, observacion } : item
      )
    );
  };

  const guardarAsistenciaFinal = () => {
    const claveStorage = "asistenciasSeleccionadas";
    const asistencias = JSON.parse(localStorage.getItem(claveStorage)) || [];

    if (asistencias.length === 0) {
      mostrarToast("No hay asistencias seleccionadas para guardar.", "info");
      return;
    }

    let fechaFormateada = fechaSeleccionada;
    if (!fechaFormateada) {
      const yyyy = new Date().getFullYear();
      const mm = String(new Date().getMonth() + 1).padStart(2, "0");
      const dd = String(new Date().getDate()).padStart(2, "0");
      fechaFormateada = `${yyyy}-${mm}-${dd}`;
    }

    console.log("📅 Fecha seleccionada:", fechaFormateada);
    console.log("📤 Asistencias a guardar/modificar:", asistencias);

    mostrarToast(
      fechaSeleccionada
        ? "Asistencias modificadas correctamente."
        : "Asistencias guardadas correctamente.",
      "success"
    );

    localStorage.removeItem(claveStorage);
    setAsistencias(asistencias);
  };

  const handleAbrirModal = (alumno, nombrecompleto) => {
    setJustificacion({
      archivo: null,
      observacion: "",
      alumno,
      nombrecompleto,
    });
    setShowModalJustificacion(true);
  };

  const handleGuardarJustificacion = () => {
    if (!justificacion.archivo && !justificacion.observacion) {
      mostrarToast(
        "Debes subir un archivo o escribir una observación",
        "warning"
      );
      return;
    }

    actualizarAsistenciaLocal(
      justificacion.alumno,
      justificacion.nombrecompleto,
      "F",
      justificacion.observacion,
      justificacion.archivo
    );
    setShowModalJustificacion(false);
  };

  const columnas = [
    { clave: "alumno", titulo: "Código" },
    { clave: "nombrecompleto", titulo: "Nombres Completos" },
    {
      clave: "asistencia",
      titulo: (
        <div className="d-flex align-items-center justify-content-between">
          <span>Asistencia &nbsp;&nbsp;</span>
          {datos.length === 22 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => marcarTodosComoAsistencia()}
            >
              Marcar todos
            </Button>
          )}
        </div>
      ),
      render: (fila, index) => (
        <Form.Group controlId={`asistencia${index + 1}`}>
          <Form.Select
            value={fila.asistencia || "0"}
            onChange={(e) => {
              const valor = e.target.value;
              if (valor === "F") {
                handleAbrirModal(fila.alumno, fila.nombrecompleto);
              } else {
                actualizarAsistenciaLocal(
                  fila.alumno,
                  fila.nombrecompleto,
                  valor,
                  fila.observacion || ""
                );
              }
            }}
          >
            <option value="0">Seleccione Asistencia</option>
            <option value="A">Asistencia</option>
            <option value="F">Falta Just.</option>
            <option value="I">Falta</option>
            <option value="T">Tardanza Just.</option>
            <option value="J">Tardanza</option>
          </Form.Select>
        </Form.Group>
      ),
    }

  ];

  return (
    <div>
      <div className="alert alert-info text-center">
        <strong style={{ color: "#085a9b" }}>PARTICIPANTES</strong>
      </div>

      <div className="row mb-3">
        <div className="col-lg-6">
          <label>
            <strong>Seleccionar fecha:</strong>
          </label>
          <Form.Control
            type="date"
            value={fechaSeleccionada || ""}
            onChange={(e) => {
              const nuevaFecha = e.target.value;
              setFechaSeleccionada(nuevaFecha);
              cargarDatos(nuevaFecha);
            }}
          />
        </div>

        <div className="col-lg-6">
          <div style={{ float: "right" }}>
            {datos.length === 0 ? (
              <Button
                variant="success"
                size="sm"
                onClick={handleGuardarClick}
              >
                Guardar Asistencia
              </Button>
            ) : (
              <Button
                variant="success"
                size="sm"
                onClick={handleGuardarClick}
              >
                Modificar Asistencia
              </Button>
            )}
            
          </div>
        </div>
      </div>

      {loading ? (
        <TablaSkeleton filas={9} columnas={4} />
      ) : datos.length === 0 ? (
        <Alert variant="warning" className="text-center">
          No se encontraron registros para la fecha <strong>{fechaSeleccionada}</strong>.
      </Alert>
      ) : (
        <TablaCursos datos={datos} columnas={columnas} />
      )}

      {/* Modal Justificación */}
      <Modal
        show={showModalJustificacion}
        onHide={() => setShowModalJustificacion(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Falta Justificada</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Subir archivo</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) =>
                setJustificacion({
                  ...justificacion,
                  archivo: e.target.files[0],
                })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Observación</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={justificacion.observacion}
              onChange={(e) =>
                setJustificacion({
                  ...justificacion,
                  observacion: e.target.value,
                })
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModalJustificacion(false)}
          >
            Cancelar
          </Button>
          <Button variant="success" onClick={handleGuardarJustificacion}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Fecha */}
      <Modal show={showModalFecha} onHide={() => setShowModalFecha(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Fecha distinta a la guía</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tu rango de fecha es distinta a la de la guía.</p>
          <p>
            ¿Deseas grabar con la fecha de la guía <b>{datoscurso?.fecha}</b>?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModalFecha(false);
              const hoy = formatearFecha(new Date());
              setFechaSeleccionada(hoy);
              cargarDatos(hoy);
            }}
          >
            No
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowModalFecha(false);
              if (datoscurso?.fecha) {
                const [dia, mes, anio] = datoscurso.fecha.split("/").map(Number);
                const fechaGuia = formatearFecha(new Date(anio, mes - 1, dia));
                setFechaSeleccionada(fechaGuia);
                cargarDatos(fechaGuia);
              }
            }}
          >
            Sí
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Confirmación */}
      <Modal
        show={showModalConfirmar}
        onHide={() => setShowModalConfirmar(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar guardado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Se guardarán las asistencias del día{" "}
            <b>
              {fechaSeleccionada
                ? new Date(fechaSeleccionada).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "Sin fecha"}
            </b>
            .
          </p>
          <p>¿Deseas continuar?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModalConfirmar(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={() => {
              setShowModalConfirmar(false);
              guardarAsistenciaFinal();
            }}
          >
            Sí, guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ParticipantesCurso;
