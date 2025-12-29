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
  const [archivosAsistencia, setArchivosAsistencia] = useState({});
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
    //actualizarAsistenciaLocal(justificacion.alumno, "", justificacion.nombrecompleto, "F", justificacion.observacion, justificacion.archivo);

    const alumnoCompleto = datos.find((d) => d.alumno === justificacion.alumno);
    const persona = alumnoCompleto?.persona || "SIN_PERSONA"; // o lanza un error si falta

    actualizarAsistenciaLocal(
      justificacion.alumno,
      persona,
      justificacion.nombrecompleto,
      "F",
      justificacion.observacion,
      justificacion.archivo
    );

    setShowModalJustificacion(false);
  };

  // --- Guardar asistencia final ---
  // --- Guardar asistencia final ---
  // --- Guardar asistencia final ---
const guardarAsistenciaFinal = async () => {
  try {
    // 🔹 Recuperar todas las asistencias que guardaste en localStorage
    const asistencias = JSON.parse(localStorage.getItem("asistenciasSeleccionadas")) || [];

    // 🔹 Separar las que tienen archivo de las que no
    const conArchivo = asistencias.filter((a) => archivosAsistencia[a.alumno]);
    const sinArchivo = asistencias.filter((a) => !archivosAsistencia[a.alumno]);

    // 👉 1. Armamos el payload SIN archivos (se mandan todas)
    const payload = {
      clave: "01",
      txtFecha: fechaSeleccionada,
      sede,
      semestre,
      escuela,
      curricula,
      curso,
      seccion,
      semana: datoscurso.sesion,
      asistencias: asistencias.map((a) => ({
        alumno: a.alumno,
        persona: a.persona || "SIN_PERSONA",
        asistencia: a.asistencia,
        observacion: a.observacion || "",
        usuarioregistro: usuario.docente.numerodocumento,
        txttipo: datos.find((d) => d.alumno === a.alumno)?.existe ? "U" : "N",
        // 🚫 aquí NO enviamos archivo
      })),
    };

    // 👉 2. Enviamos el payload JSON
    const response = await axios.post(
      `${config.apiUrl}api/curso/GrabarAsistencia2`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = response.data;

    if (data.error === 0) {
    Swal.fire("✅ Éxito", data.mensaje, "success");

    // 🔹 Limpias localStorage
    localStorage.removeItem("asistenciasSeleccionadas");

    // 🔹 Actualizas el estado local con asistencia, observación y faltas
    setDatos((prev) =>
      prev.map((d) => {
        const actualizado = asistencias.find((a) => a.alumno === d.alumno);
        if (actualizado) {
          return {
            ...d,
            asistencia: actualizado.asistencia,
            observacion: actualizado.observacion,
            existe: true, // ahora ya tiene asistencia registrada
            totalFechas:
              actualizado.asistencia === "F"
                ? d.totalFechas + 1 // suma 1 si es falta
                : d.totalFechas,
          };
        }
        return d;
      })
    );

    setDatosFiltrados((prev) =>
      prev.map((d) => {
        const actualizado = asistencias.find((a) => a.alumno === d.alumno);
        if (actualizado) {
          return {
            ...d,
            asistencia: actualizado.asistencia,
            observacion: actualizado.observacion,
            existe: true,
            totalFechas:
              actualizado.asistencia === "F"
                ? d.totalFechas + 1
                : d.totalFechas,
          };
        }
        return d;
      })
    );
  } else {
      Swal.fire("⚠️ Error", data.mensaje, "error");
      localStorage.removeItem("asistenciasSeleccionadas");
    }

    // 👉 3. Subimos solo los archivos si existen
    if (conArchivo.length > 0) {
  const formData = new FormData();
  
  formData.append("clave", "01");
  formData.append("txtFecha", fechaSeleccionada);
  formData.append("sede", sede);
  formData.append("semestre", semestre);
  formData.append("escuela", escuela);
  formData.append("curricula", curricula);
  formData.append("curso", curso);
  formData.append("seccion", seccion);
  formData.append("semana", datoscurso.sesion);

  // 📂 Asistencias con archivos
  conArchivo.forEach((a, index) => {
    formData.append(`asistencias[${index}][alumno]`, a.alumno);
    formData.append(`asistencias[${index}][persona]`, a.persona || "");
    formData.append(`asistencias[${index}][asistencia]`, a.asistencia);
    formData.append(`asistencias[${index}][observacion]`, a.observacion || "");
    formData.append(`asistencias[${index}][usuarioregistro]`, usuario.docente.numerodocumento);
    
    const file = archivosAsistencia[a.alumno];
    if (file) {
      formData.append(`asistencias[${index}][archivo]`, file);
    }
  });

  
  try {
    const respArchivos = await fetch(
      `${config.apiUrl}api/curso/GrabarAsistencia`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // NO poner Content-Type
        },
        body: formData,
      }
    ); 

   

    console.log("Status:", respArchivos.status);

    const data = await respArchivos.json();
    console.log("Respuesta completa:", data);

      if (!respArchivos.ok || data.error) {
        Swal.fire("⚠️ Error", data.mensaje || "Error al guardar asistencia", "error");
        localStorage.removeItem("asistenciasSeleccionadas");
      } else {
        Swal.fire("✅ Éxito", data.mensaje, "success");
        localStorage.removeItem("asistenciasSeleccionadas");
        cargarDatos(fechaSeleccionada);
      }
    } catch (err) {
      console.error("Excepción al guardar asistencia:", err);
      localStorage.removeItem("asistenciasSeleccionadas");
      Swal.fire("⚠️ Error", "No se pudo conectar con el servidor.", "error");
      localStorage.removeItem("asistenciasSeleccionadas");
    }
  }




  } catch (error) {
    console.error(error);
    Swal.fire("❌ Error", "Ocurrió un error al guardar la asistencia", "error");
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
      
    },
   {
  clave: "archivo",
  titulo: "Justificación",
  render: (fila) => {

    // 1️⃣ Si el archivo fue subido pero aún NO guardado (local)
    if (archivosAsistencia[fila.alumno]) {
      return <VerPDFLocal file={archivosAsistencia[fila.alumno]} />;
    }

    // 2️⃣ Si ya existe asistencia (puede tener PDF en backend)
    if (fila.existe) {
      const url = `${config.apiUrl}api/asistencia/justificacion/${fila.alumno}/${semestre}/${datoscurso.sesion}`;

      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-danger btn-sm"
        >
          📄 Ver PDF
        </a>
      );
    }

    // 3️⃣ Nada
    return <span className="text-muted">Sin archivo</span>;
  },
},


  ];

  const VerPDFLocal = ({ file }) => {
    const abrirPDF = () => {
      const url = URL.createObjectURL(file);
      window.open(url, "_blank");
    };

    return (
      <Button
        variant="outline-primary"
        size="sm"
        onClick={abrirPDF}
      >
        📄 Ver archivo
      </Button>
    );
  };

  

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

          <Button
            variant="success"
            size="sm"
            onClick={() => {
              const asistencias = JSON.parse(localStorage.getItem("asistenciasSeleccionadas")) || [];
              if (asistencias.length === 0) {
                Swal.fire("⚠️ Alto", "Debe seleccionar al menos una asistencia", "warning");
                //mostrarToast("Debe seleccionar al menos una asistencia", "error");
                return;
              }
              setShowModalConfirmar(true);
            }}
          >
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
            
              <Form.Control
                type="file"
                onChange={(e) =>
                  setArchivosAsistencia(prev => ({
                    ...prev,
                    [justificacion.alumno]: e.target.files[0] // guardamos el File real por alumno
                  }))
                }
              />
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
