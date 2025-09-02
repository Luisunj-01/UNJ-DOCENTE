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
import { FaChalkboardTeacher, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function ParticipantesCurso({ datoscurso, totalFechas, todasLasAsistencias }) {
  //console.log(todasLasAsistencias);
  const [datos, setDatos] = useState([]);
  const [datosFiltrados, setDatosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [practicaSeleccionada, setPracticaSeleccionada] = useState("");
  const [practicasDisponibles, setPracticasDisponibles] = useState([]);
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;
  const { mostrarToast } = useContext(ToastContext);

  const [showModalJustificacion, setShowModalJustificacion] = useState(false);
  const [justificacion, setJustificacion] = useState({ archivo: null, observacion: "", alumno: null, nombrecompleto: "" });
  const [showModalConfirmar, setShowModalConfirmar] = useState(false);

  const { id } = useParams();
  const decoded = atob(atob(id));
  const [sede, semestre, escuela, curricula, curso, seccion] = decoded.split("|");

  const parametrosaenviar = { sede, semestre, escuela, curricula, curso, seccion, sesion: datoscurso.sesion };

  // 🔹 límite de faltas = 30% del total de sesiones
  const maxFaltasPermitidas = Math.round((totalFechas || 0) * 0.3);
  //console.log();
  // --- Cargar datos ---
  const cargarDatos = async (fecha = null) => {
    setLoading(true);
    try {
      const resAsistencia = await obtenerDatosAsistencia(parametrosaenviar, fecha);      // histórico
      const resAsistNuevo = await obtenerDatosAsistencianuevo(parametrosaenviar, fecha); // lista de alumnos

      if (!resAsistencia?.datos || !resAsistNuevo?.datos) {
        setDatos([]); setDatosFiltrados([]); setPracticasDisponibles([]); setLoading(false);
        return;
      }

      // 🔹 Mapear alumnos y calcular cuántas faltas acumula cada uno en TODO el curso
      // 🔹 Mapear alumnos y usar total_faltas desde backend
      const alumnosCompletos = resAsistNuevo.datos.map((nuevo) => {
        const encontrado = resAsistencia.datos.find(a => a.alumno === nuevo.alumno);

        const asistencia = encontrado ? (encontrado.condicion || "0") : "0";
        const observacion = encontrado ? encontrado.observaciones : "";
        const persona = encontrado ? encontrado.persona : nuevo.persona;

        // ⚡ ya no calculamos en frontend, usamos total_faltas de la BD
        const faltasHistoricas = nuevo.total_faltas || 0;

        return {
          ...nuevo,
          asistencia,
          observacion,
          persona,
          existe: !!encontrado,
          totalFaltas: faltasHistoricas
        };
      });


      const alumnosUnicos = Array.from(new Map(alumnosCompletos.map(a => [a.alumno, a])).values());

      setDatos(alumnosUnicos);
      setDatosFiltrados([]);
      setPracticasDisponibles([...new Set(alumnosUnicos.map(a => a.practica))].sort());
      setPracticaSeleccionada("");
    } catch (error) {
      console.error(error);
      setDatos([]); setDatosFiltrados([]); setPracticasDisponibles([]);
    }
    setLoading(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  //console.log(datos);
  // --- Filtrar por práctica ---
  const filtrarPorPractica = (practica) => {
    setPracticaSeleccionada(practica);
    const filtrados = datos.filter(a => a.practica === practica);
    setDatosFiltrados(filtrados);
  };

  // --- Marcar todos como Asistencia (excepto los que superaron el límite) ---
  const marcarTodosComoAsistencia = () => {
    setDatosFiltrados(prev => {
      const nuevos = prev.map(d => {
        if (d.totalFaltas >= maxFaltasPermitidas) return d; // 🔴 no marcar inhabilitados
        actualizarAsistenciaLocal(
          d.alumno,
          d.persona,
          d.nombrecompleto,
          "A",
          d.observacion || ""
        );
        return { ...d, asistencia: "A" };
      });
      return nuevos;
    });
    mostrarToast(
      "Todos los alumnos fueron marcados como Asistencia (excepto los inhabilitados).",
      "success"
    );
  };

  // --- Actualizar asistencia local ---
  const actualizarAsistenciaLocal = (alumno, persona, nombrecompleto, asistencia, observacion = "", archivo = null) => {
    const clave = "asistenciasSeleccionadas";
    let asistencias = JSON.parse(localStorage.getItem(clave)) || [];

    if (asistencia === "0") {
      asistencias = asistencias.filter(a => a.alumno !== alumno);
    } else {
      const index = asistencias.findIndex(a => a.alumno === alumno);
      if (index !== -1) {
        asistencias[index] = { ...asistencias[index], asistencia, observacion, archivo };
      } else {
        asistencias.push({ alumno, persona, nombrecompleto, asistencia, observacion, archivo });
      }
    }
    localStorage.setItem(clave, JSON.stringify(asistencias));

    setDatos(prev => prev.map(d => d.alumno === alumno ? { ...d, asistencia, observacion } : d));
    setDatosFiltrados(prev => prev.map(d => d.alumno === alumno ? { ...d, asistencia, observacion } : d));
  };

  // --- Abrir modal justificación ---
  const handleAbrirModal = (alumno, nombrecompleto) => {
    setJustificacion({ alumno, nombrecompleto, observacion: "", archivo: null });
    setShowModalJustificacion(true);
  };

  const handleGuardarJustificacion = () => {
    if (!justificacion.archivo && !justificacion.observacion) {
      mostrarToast("Debes subir un archivo o escribir una observación", "warning");
      return;
    }
    actualizarAsistenciaLocal(justificacion.alumno, "", justificacion.nombrecompleto, "F", justificacion.observacion, justificacion.archivo);
    setShowModalJustificacion(false);
  };

  // --- Guardar asistencia final ---
  // --- Guardar asistencia final ---
  const guardarAsistenciaFinal = async () => {
    const asistencias = JSON.parse(localStorage.getItem("asistenciasSeleccionadas")) || [];
    if (asistencias.length === 0) {
      mostrarToast("No hay asistencias seleccionadas.", "info");
      return;
    }

    const asistenciasConTipo = asistencias.map(a => {
      const alumnoEncontrado = datos.find(d => d.alumno === a.alumno);
      return {
        alumno: a.alumno,
        persona: a.persona,
        asistencia: a.asistencia,
        observacion: a.observacion || "",
        usuarioregistro: usuario.docente.numerodocumento,
        txttipo: alumnoEncontrado?.existe ? "U" : "N"
      };
    });

    const payload = {
      clave: "01",
      txtFecha: fechaSeleccionada,
      sede, semestre, escuela, curricula, curso, seccion,
      semana: datoscurso.sesion,
      asistencias: asistenciasConTipo
    };

    console.log("Payload final 👉", payload);

    try {
      const response = await axios.post(
        `${config.apiUrl}api/curso/GrabarAsistencia`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );


      //console.log(response)
      if (!response.data.error) {
        Swal.fire("Éxito", response.data.mensaje, "success");
      } else {
        Swal.fire("Error", response.data.mensaje, "error");
      }

      // ✅ limpiar siempre, pase lo que pase
      localStorage.removeItem("asistenciasSeleccionadas");
      cargarDatos(fechaSeleccionada);

    } catch (error) {
      console.error(error);
      mostrarToast("Ocurrió un error al guardar.", "danger");

      // ✅ también limpiar en error
      localStorage.removeItem("asistenciasSeleccionadas");
    }
  };


  const columnas = [
    { clave: "alumno", titulo: "Código" },
    { clave: "nombrecompleto", titulo: "Nombres Completos" },
    {
      clave: "asistencia",
      titulo: "Asistencia",
      render: (fila) => {
        if (fila.totalFaltas >= maxFaltasPermitidas) {
          // 🔴 Inhabilitado
          return (
            <Form.Select value="INHABILITADO" disabled>
              <option value="INHABILITADO">Inhabilitado</option>
            </Form.Select>
          );
        }

        return (
          <Form.Select
            value={fila.asistencia || "0"}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "F")
                handleAbrirModal(fila.alumno, fila.nombrecompleto);
              else
                actualizarAsistenciaLocal(
                  fila.alumno,
                  fila.persona,
                  fila.nombrecompleto,
                  val,
                  fila.observacion || ""
                );
            }}
          >
            <option value="0">Seleccione</option>
            <option value="A">Asistencia</option>
            <option value="F">Falta Just.</option>
            <option value="I">Falta</option>
            <option value="T">Tardanza Just.</option>
            <option value="J">Tardanza</option>
          </Form.Select>
        );
      },
      exportar: (row) => {
        if (row.totalFaltas >= maxFaltasPermitidas) return "Inhabilitado";

        switch (row.asistencia) {
          case "A": return "Asistencia";
          case "F": return "Falta Justificada";
          case "I": return "Falta";
          case "T": return "Tardanza Justificada";
          case "J": return "Tardanza";
          case "0": 
          default: return "Sin seleccionar";
        }
      },
    },

    {
      clave: "totalFaltas",
      titulo: "Faltas acumuladas",
      render: (fila) => (
        <span style={{ color: fila.totalFaltas >= maxFaltasPermitidas ? "red" : "black" }}>
          {fila.totalFaltas} / {maxFaltasPermitidas}
        </span>
      )
    },
    {
      clave: "existe",
      titulo: "Asistencia Existente",
      render: (fila) => fila.existe ? <FaCheckCircle style={{ color: "green" }} /> : <FaTimesCircle style={{ color: "red" }} />
      
    }
  ];

  return (
    <div>
      <div className="alert alert-info text-center">
        <strong style={{ color: "#085a9b" }}>PARTICIPANTES</strong>
        <br />
        <small>Máx. faltas permitidas: {maxFaltasPermitidas}</small>
      </div>

      <div className="row mb-3">
        <div className="col-lg-4">
          <label><strong>Seleccionar fecha:</strong></label>
          <Form.Select
            value={fechaSeleccionada}
            onChange={(e) => {
              const nuevaFecha = e.target.value;
              setFechaSeleccionada(nuevaFecha);
              setPracticaSeleccionada("");
              cargarDatos(nuevaFecha);
            }}
          >
            <option value="">Seleccione una fecha</option>
            {datoscurso?.fechasGuia?.map((f, i) => (
              <option key={i} value={f}>{f}</option>
            ))}
          </Form.Select>
        </div>

        <div className="col-lg-4">
          <label><strong>Seleccionar Grupo:</strong></label>
          <Form.Select
            value={practicaSeleccionada}
            onChange={(e) => filtrarPorPractica(e.target.value)}
            disabled={!fechaSeleccionada}
          >
            <option value="">Seleccione un Grupo</option>
            {practicasDisponibles.map((p, i) => (
              <option key={i} value={p}>{p}</option>
            ))}
          </Form.Select>
        </div>

         <div className="col-lg-4 d-flex align-items-end justify-content-end gap-2">
          {/* 🔹 Nuevo botón para marcar todos */}
          <Button variant="primary" size="sm" onClick={marcarTodosComoAsistencia}>
            <FaChalkboardTeacher /> Marcar todos
          </Button>

          <Button variant="success" size="sm" onClick={() => setShowModalConfirmar(true)}>
            {datos.length === 0 ? "Nueva Asistencia" : "Modificar Asistencia"}
          </Button>
        </div>

        {/*<div className="col-lg-4 d-flex align-items-end justify-content-end">
          <Button variant="success" size="sm" onClick={() => setShowModalConfirmar(true)}>
            {datos.length === 0 ? "Nueva Asistencia" : "Modificar Asistencia"}
          </Button>
        </div> */}
      </div>

      {loading ? <TablaSkeleton filas={5} columnas={5} /> : <TablaCursos datos={datosFiltrados} columnas={columnas} />}

      {/* Modal Justificación */}
      <Modal show={showModalJustificacion} onHide={() => setShowModalJustificacion(false)}>
        <Modal.Header closeButton><Modal.Title>Falta Justificada</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Subir archivo</Form.Label>
            <Form.Control type="file" onChange={(e) => setJustificacion({ ...justificacion, archivo: e.target.files[0] })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Observación</Form.Label>
            <Form.Control as="textarea" rows={3} value={justificacion.observacion} onChange={(e) => setJustificacion({ ...justificacion, observacion: e.target.value })} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalJustificacion(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleGuardarJustificacion}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Confirmar */}
      <Modal show={showModalConfirmar} onHide={() => setShowModalConfirmar(false)}>
        <Modal.Header closeButton><Modal.Title>Confirmar guardado</Modal.Title></Modal.Header>
        <Modal.Body>¿Deseas guardar las asistencias seleccionadas?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalConfirmar(false)}>Cancelar</Button>
          <Button variant="success" onClick={() => { setShowModalConfirmar(false); guardarAsistenciaFinal(); }}>Sí, guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ParticipantesCurso;
