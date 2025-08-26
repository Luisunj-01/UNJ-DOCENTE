import { useContext, useEffect, useState } from "react";
import TablaCursos from "../../reutilizables/componentes/TablaCursos";
import { useParams } from "react-router-dom";
import { obtenerDatosAsistencia, obtenerDatosAsistencianuevo } from "../logica/Curso";
import { Form, Modal, Button } from "react-bootstrap";
import { ToastContext } from "../../../cuerpos/Layout";
import { useUsuario } from "../../../context/UserContext";
import { TablaSkeleton } from "../../reutilizables/componentes/TablaSkeleton";
import config from "../../../config";
import axios from "axios";
import Swal from "sweetalert2";
function ParticipantesCurso({ datoscurso }) {
  
  
  const [datos, setDatos] = useState([]);
  const [datos2, setDatos2] = useState([]);
  const [asistencias, setAsistencias] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [showModalConfirmar, setShowModalConfirmar] = useState(false);
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;

  // Modal de justificación
  const [showModalJustificacion, setShowModalJustificacion] = useState(false);
  const [justificacion, setJustificacion] = useState({
    archivo: null,
    observacion: "",
    alumno: null,
    nombrecompleto: "",
  });

  // Modal de validación de fecha
  const [showModalFecha, setShowModalFecha] = useState(false);

  const { id } = useParams();
  const decoded = atob(atob(id));
  const [sede, semestre, escuela, curricula, curso, seccion] =
    decoded.split("|");

  const { mostrarToast } = useContext(ToastContext);

  const parametrosaenviar = {
    sede,
    semestre,
    escuela,
    curricula,
    curso,
    seccion,
    sesion: datoscurso.sesion,
  };

  const formatearFecha = (fecha) => {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    const dd = String(fecha.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
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
      // limpiar antes de cada carga
      setDatos([]);
      setDatos2([]);

      const respuestaAsistencia = await obtenerDatosAsistencia(parametrosaenviar, fecha);
      const respuestaAsistencianuevo = await obtenerDatosAsistencianuevo(parametrosaenviar, fecha);

      if (!respuestaAsistencia?.datos || !respuestaAsistencianuevo?.datos) {
        setMensajeApi("No se pudo obtener el detalle de la Asistencia.");
        setLoading(false);
        return;
      }

      // Extraer fechas únicas
      const fechasUnicas = [
        ...new Set(respuestaAsistencia.datos.map((item) => item.fecha)),
      ];
      setFechasDisponibles(fechasUnicas);

      if (fecha) {
      // unir ambas listas
      const alumnosCompletos = respuestaAsistencianuevo.datos.map((nuevo) => {
        const encontrado = respuestaAsistencia.datos.find((a) => a.alumno === nuevo.alumno);
        return {
          ...nuevo,
          asistencia: encontrado ? (encontrado.condicion || "0") : "0",
          observacion: encontrado ? encontrado.observaciones : "",
          persona: encontrado ? encontrado.persona : nuevo.persona,
        };
      });

      setDatos(alumnosCompletos); // 👈 aquí siempre tendrás TODOS los alumnos
      setDatos2([]); // ya no lo necesitas en modo edición
    }


      setMensajeApi(respuestaAsistencia.mensaje);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setMensajeApi("Ocurrió un error al obtener los datos.");
      setDatos([]);
      setDatos2([]);
    }

    setLoading(false);
  };

  console.log(datos);
  const marcarTodosComoAsistencia = () => {
    if (datos.length === 0) {
      // Caso nuevo registro (trabaja sobre datos2)
      const nuevosDatos = datos2.map((item) => {
        const asistencia = "A";
        actualizarAsistenciaLocal(
          item.alumno,
          item.nombrecompleto,
          asistencia,
          item.observacion || "",
          item.archivo || null
        );
        return { ...item, asistencia };
      });
      setDatos2(nuevosDatos);
    } else {
      // Caso modificación (trabaja sobre datos)
      const nuevosDatos = datos.map((item) => {
        const asistencia = "A";
        actualizarAsistenciaLocal(
          item.alumno,
          item.persona,
          item.nombrecompleto,
          asistencia,
          item.observacion || "",
          item.archivo || null
        );
        return { ...item, asistencia };
      });
      setDatos(nuevosDatos);
    }

    mostrarToast("Todos los alumnos fueron marcados como Asistencia.", "success");
  };


  const actualizarAsistenciaLocal = (
  alumno,
  persona,
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
      asistencias.push({ alumno, persona, nombrecompleto, asistencia, observacion, archivo });
    }
  }

  localStorage.setItem(claveStorage, JSON.stringify(asistencias));

  // 🔹 actualizar datos existentes
  if (datos.length > 0) {
    setDatos((prevDatos) =>
      prevDatos.map((item) =>
        item.alumno === alumno ? { ...item, asistencia, observacion } : item
      )
    );
  } else {
    setDatos2((prevDatos2) =>
      prevDatos2.map((item) =>
        item.alumno === alumno ? { ...item, asistencia, observacion } : item
      )
    );
  }
};

  const guardarAsistenciaFinal = async () => {
  const claveStorage = "asistenciasSeleccionadas";
  const asistencias = JSON.parse(localStorage.getItem(claveStorage)) || [];
 

  if (asistencias.length === 0) {
    mostrarToast("No hay asistencias seleccionadas para guardar.", "info");
    return;
  }

  let fechaFormateada = fechaSeleccionada;
  if (!fechaFormateada) {
    fechaFormateada = formatearFecha(new Date());
  }

  console.log(asistencias);
  

  const payload = {// el mismo base64 que recibes en useParams()
    clave: "01", // aquí defines la sesión item (podría ser dinámico)
    txtFecha: fechaFormateada,
    txtTipo: datos.length === 0 ? "N" : "U",
    sede,
    semestre,
    escuela,
    curricula,
    curso,
    seccion,
    semana: datoscurso.sesion,
    asistencias: asistencias.map((a) => ({
      alumno: `${a.alumno}`,
      persona: a.persona, // o como lo generas en tu BD
      asistencia: a.asistencia,
      observacion: a.observacion || "",
      usuarioregistro: `${usuario.docente.numerodocumento}`,
    })),
  };

  console.log(payload);
  try {

    const response = await axios.post(`${config.apiUrl}api/curso/GrabarAsistencia`, payload, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.data.error) {
        Swal.fire("✅ Éxito", response.data.mensaje, "success");
      } else {
        Swal.fire("⚠️ Error", response.data.mensaje, "error");
      }

    /*const response = await fetch(`${config.apiUrl}api/curso/GrabarAsistencia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("Respuesta de API:", data);

    if (data.error === 0) {
      data.detalles.forEach(item => {
        console.log(`Alumno ${item.alumno} → ${item.accion.toUpperCase()} (${item.condicion})`);
      });
    } else {
      console.error("Error en API:", data.mensaje);
    }
 */

    /*if (!response.ok || data.error) {
      mostrarToast(data.mensaje || "Error al guardar asistencia", "danger");
    } else {
      mostrarToast(data.mensaje, "success");
      localStorage.removeItem(claveStorage);
      setAsistencias(asistencias);
    }*/
  } catch (error) {
    console.error("Error en guardarAsistenciaFinal:", error);
    mostrarToast("Ocurrió un error al guardar", "danger");
  }
};


  const handleAbrirModal = (alumno, nombrecompleto) => {
    setJustificacion({ archivo: null, observacion: "", alumno, nombrecompleto });
    setShowModalJustificacion(true);
  };

  const handleGuardarJustificacion = () => {
    if (!justificacion.archivo && !justificacion.observacion) {
      mostrarToast("Debes subir un archivo o escribir una observación", "warning");
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
          {(datos.length === 0) && (
            <Button variant="primary" size="sm" onClick={marcarTodosComoAsistencia}>
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
                  fila.persona,
                  fila.nombrecompleto,
                  valor,
                  fila.observacion || ""
                );
              }
            }}
          >
            <option value="A">Asistencia</option>
            <option value="F">Falta Just.</option>
            <option value="I">Falta</option>
            <option value="T">Tardanza Just.</option>
            <option value="J">Tardanza</option>
          </Form.Select>
        </Form.Group>
      ),
    },
  ];

  return (
    <div>
      <div className="alert alert-info text-center">
        <strong style={{ color: "#085a9b" }}>PARTICIPANTES</strong>
      </div>

      <div className="row mb-3">
        <div className="col-lg-6">
          <label><strong>Seleccionar fecha:</strong></label>
          <Form.Control
            type="date"
            value={fechaSeleccionada || ""}
            onChange={(e) => {
              const nuevaFecha = e.target.value;
              setFechaSeleccionada(nuevaFecha);
              localStorage.removeItem("asistenciasSeleccionadas"); // limpiar memoria
              cargarDatos(nuevaFecha);
            }}
          />
        </div>

        <div className="col-lg-6">
          <div style={{ float: "right" }}>
            {datos.length === 0 ? (
              <Button variant="success" size="sm" onClick={handleGuardarClick}>
                Nueva Asistencia
              </Button>
            ) : (
              <Button variant="success" size="sm" onClick={handleGuardarClick}>
                Modificar Asistencia
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <TablaSkeleton filas={9} columnas={4} />
      ) : datos.length === 0 ? (
        <TablaCursos datos={datos2} columnas={columnas} />
      ) : (
        <TablaCursos datos={datos} columnas={columnas} />
      )}

      {/* Modal Justificación */}
      <Modal show={showModalJustificacion} onHide={() => setShowModalJustificacion(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Falta Justificada</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Subir archivo</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) =>
                setJustificacion({ ...justificacion, archivo: e.target.files[0] })
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
                setJustificacion({ ...justificacion, observacion: e.target.value })
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalJustificacion(false)}>
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
          <p>¿Deseas grabar con la fecha de la guía <b>{datoscurso?.fecha}</b>?</p>
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
      <Modal show={showModalConfirmar} onHide={() => setShowModalConfirmar(false)}>
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
            </b>.
          </p>
          <p>¿Deseas continuar?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalConfirmar(false)}>
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
