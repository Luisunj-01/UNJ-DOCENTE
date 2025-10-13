import { useState, useEffect } from "react";
import BreadcrumbUNJ from "../../cuerpos/BreadcrumbUNJ";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../context/UserContext";
import { obtenerDatosHorario, validarFechas } from "./logica/Actividades";

import FormNoLectiva from "./componentes/formulario";
import axios from "axios";
import Swal from "sweetalert2";
import { Accordion, Table } from "react-bootstrap";
import config from "../../config";
import { TablaSkeleton } from "../reutilizables/componentes/TablaSkeleton";
import { Button } from "react-bootstrap";
import { Trash } from "lucide-react"; // o cualquier ícono
import { FaPrint } from "react-icons/fa"; 


function Horarios() {
  const { usuario } = useUsuario();
  const [semestre, setSemestre] = useState("202501");
  const persona = usuario.docente?.persona;  
  const sede = "01";
  const [datos, setDatos] = useState(null);
  


  const [cargaNoLectiva, setCargaNoLectiva] = useState([]);
  const [docente, setDocente] = useState(null);
  const [cargaLectiva, setCargaLectiva] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [horario, setHorario] = useState([]); // ✅ estado para el horario
  const [horasDeclaradas, setHorasDeclaradas] = useState([]); // ✅ estado para horas declaradas
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [formHabilitado, setFormHabilitado] = useState(false);
  const token = usuario?.codigotokenautenticadorunj;
  console.log(usuario);

  // 🔹 FUNCIÓN ELIMINAR CARGA NO LECTIVA
  const eliminarCargaNoLectiva = async (fila) => {
  
  Swal.fire({
    title: "¿Estás seguro?",
    text: `Se eliminará la actividad`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await axios.post(
  `${config.apiUrl}api/horario/eliminarActividad`,
  {
    semestre: fila.semestre,
    per: fila.persona,
    actividad: fila.actividad,
    detalle: fila.detalle,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  }
);
        if (response.data.error === 0) {
          Swal.fire("Eliminado", response.data.mensaje, "success");
          cargarDatos();
        } else {
          Swal.fire("Error", response.data.mensaje, "error");
        }
      } catch (error) {
        console.error("Error al eliminar:", error.response?.data || error.message);
        Swal.fire("Error", "No se pudo eliminar la Actividad.", "error");
      }
    }
  });
};

  // 🔹 FUNCIÓN GUARDAR CARGA NO LECTIVA
  const guardarCargaNoLectiva = async (nueva) => {
    try {
      const response = await axios.post(
        `${config.apiUrl}api/horario/guardarActividad`,
        {
          semestre,
          persona,
          actividad: nueva.actividad,
          dia: nueva.dia,
          inicio: nueva.inicio,
          fin: nueva.fin,
          horas: nueva.horas,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.data.error === 0) {
        Swal.fire("Éxito", response.data.mensaje, "success");
        cargarDatos(); // refresca la tabla
      } else {
        Swal.fire("Error", response.data.mensaje, "error");
      }
    } catch (error) {
      console.error("Error al guardar:", error.response?.data || error.message);
      Swal.fire("Error", "No se pudo guardar la Actividad.", "error");
    }
  };

// 🔹 CARGAR DATOS
  const cargarDatos = async () => {
    if (!usuario) return;
    setLoading(true);

    const result = await obtenerDatosHorario(
      sede,
      semestre,
      persona,
      token
    );

    if (result.datos) {
      setDocente(result.datos.docente);
      setCargaLectiva(result.datos.cargaLectiva || []);
      setCargaNoLectiva(result.datos.cargaNoLectiva || []);
      const acts = (result.datos.actividades || []).map((a) => ({
        ...a,
        descripcion2: a.descripcion2 || "",
        horas: a.horas ?? 0,
      }));
      setActividades(acts);
      setHorario(result.datos.horario || []);
      setHorasDeclaradas(result.datos.horasDeclaradas || []);
    } else {
      setDocente(null);
      setCargaLectiva([]);
      setCargaNoLectiva([]);
      setActividades([]);
      setHorario([]);
      setHorasDeclaradas([]);
      setMensaje(result.mensaje);
    }

    setLoading(false);
  };

  // 🔹 VALIDAR FECHAS PARA HABILITAR FORMULARIO
useEffect(() => {
  const cargarYValidar = async () => {
    if (!usuario?.docente?.persona) return;

    const sede = "01";
    const semestreActual = semestre;
    const persona = usuario.docente.persona;

    console.log("Cargando datos del docente:", { sede, semestre: semestreActual, persona });

    // 🔹 1. Siempre carga las tablas (aunque luego se bloquee el formulario)
    await cargarDatos();

    // 🔹 2. Luego valida las fechas
    console.log("Validando fechas con:", { sede, semestre: semestreActual, persona });
    const resp = await validarFechas(sede, semestreActual, persona);
    console.log("Respuesta validación:", resp);

    if (resp.success) {
      const hoy = new Date(resp.hoy);
      const inicio = new Date(resp.inicio);
      const fin = new Date(resp.fin);

      if (hoy >= inicio && hoy <= fin) {
        setFormHabilitado(true);
        console.log("✅ Formulario habilitado");
      } else {
        setFormHabilitado(false);
        Swal.fire(
          "Formulario cerrado",
          `Solo se puede registrar entre ${resp.inicio} y ${resp.fin}`,
          "warning"
        );
      }
    } else {
      setFormHabilitado(false);
      Swal.fire("Fechas no válidas", resp.message, "warning");
    }
  };

  cargarYValidar();
}, [semestre, usuario]);



  
  // ================== Cálculos de carga ==================
  const totalHT = cargaLectiva.reduce((sum, c) => sum + Number(c.ht), 0);
  const prepEval = Math.round(totalHT / 2);
  const totalCargaLectiva = totalHT + prepEval;
  const totalNoLectiva = actividades.reduce((acc, a) => acc + (a.horas ?? 0), 0);
  const totalGeneral = totalCargaLectiva + totalNoLectiva;

  // ================== Cálculos de totales del horario ==================
  const diasHorario = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

  const totalesPorDiaHorario = diasHorario.map((dia) =>
    (horario || []).reduce((acc, fila) => {
      const valor = fila?.[dia];
      if (typeof valor === "string" && !valor.startsWith("#FFFFFF")) {
        return acc + 1; // cuenta bloques ocupados
      }
      return acc;
    }, 0)
  );

  const totalBloquesHorario = totalesPorDiaHorario.reduce((a, b) => a + b, 0);


  // ================== Render ==================
  return (
    <>
      <BreadcrumbUNJ />
      <div className="container mt-4">
        <div className="containerunj mt-3">
          {/* Selección de semestre */}
          <form className="mb-3">
            <div className="row">
              <div className="col-md-1">
                <label className="form-label">
                  <strong>Semestre:</strong>
                </label>
              </div>
              <div className="col-md-3">
                <SemestreSelect value={semestre} onChange={setSemestre} name="cboSemestre" />
              </div>
            </div>
          </form>

          {loading && <TablaSkeleton filas={20} columnas={9} />}
          {mensaje && <p className="text-danger">{mensaje}</p>}

          {/* Datos docente */}
          {docente && (
            <div className="mb-4">
              <Accordion defaultActiveKey="0" className="mb-3">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>🧑‍🏫 Datos del Docente</Accordion.Header>
                  <Accordion.Body>
                    <Table bordered size="sm">
                      <tbody>
                        <tr>
                          <td><strong>DNI</strong></td>
                          <td>{docente.numerodocumento}</td>
                        </tr>
                        <tr>
                          <td><strong>Apellidos y Nombres</strong></td>
                          <td>{docente.nombrecompleto}</td>
                        </tr>
                        <tr>
                          <td><strong>Categoría</strong></td>
                          <td>{docente.descripcioncategoria}</td>
                        </tr>
                        <tr>
                          <td><strong>Condición</strong></td>
                          <td>{docente.descripcioncondicion}</td>
                        </tr>
                        <tr>
                          <td><strong>Dedicación</strong></td>
                          <td>{docente.descripciondedicacion}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          )}

          {/* Texto aviso */}
          <div className="alert alert-warning" role="alert">
            Se pueden programar como máximo <strong>10 horas por día</strong>.
          </div>

          {/* Carga Lectiva */}
        {cargaLectiva.length > 0 && (
        <div className="mb-4">
            <Accordion defaultActiveKey="0" className="mb-3">
            <Accordion.Item eventKey="1">
                <Accordion.Header>📘 Carga Lectiva</Accordion.Header>
                <Accordion.Body>

                    
              <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        const opciones = "width=900,height=700,scrollbars=yes,resizable=yes";
                        const cadena = `${sede}|${semestre}|${persona}`; // ✅ sede ya no es undefined
                        const codigo = btoa(btoa(cadena));
                        window.open(`/Imprimirhorariodocente?codigo=${codigo}`, "HorarioDocente", opciones);
                      }}
                    >
                      <FaPrint className="me-2" /> Imprimir horario
                    </button>


          <Table bordered hover size="sm" responsive>
            <thead className="table-light">
              <tr>
                <th>N°</th>
                <th>Código</th>
                <th>Curso</th>
                <th>Tipo</th>
                <th>Escuela</th>
                <th>Ciclo</th>
                <th>Sec</th>
                <th>Tipo</th>
                <th>Gru</th>
                <th>Ht</th>
                <th>Hp</th>
                <th>HT</th>
              </tr>
            </thead>
            <tbody>
              {cargaLectiva.map((c, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td
                    style={{
                      backgroundColor: c.codigo,
                      color: "#000",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {c.curso}
                  </td>
                  <td>{c.nombrecurso}</td>
                  <td>{c.tipocurso}</td>
                  <td>{c.nombreescuela}</td>
                  <td>{c.ciclo}</td>
                  <td>{c.seccion}</td>
                  <td>{c.tipo}</td>
                  <td>{c.practica}</td>
                  <td>{c.horasteoria}</td>
                  <td>{c.horaspractica}</td>
                  <td>{c.ht}</td>
                </tr>
              ))}
              <tr className="fw-bold">
                <td colSpan={9} className="text-end">TOTAL</td>
                <td>
                  {cargaLectiva.reduce((sum, c) => sum + Number(c.horasteoria), 0)}
                </td>
                <td>
                  {cargaLectiva.reduce((sum, c) => sum + Number(c.horaspractica), 0)}
                </td>
                <td>
                  {cargaLectiva.reduce((sum, c) => sum + Number(c.ht), 0)}
                </td>
              </tr>
            </tbody>
          </Table>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  </div>
)}

          <Accordion defaultActiveKey="0" alwaysOpen>
            {/* Horario Semanal */}
            <Accordion.Item eventKey="0">
              <Accordion.Header>🗓️ Horario Semanal</Accordion.Header>
              <Accordion.Body>
                <Table bordered hover responsive size="sm" className="text-center align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>Hora</th>
                      <th>Lunes</th>
                      <th>Martes</th>
                      <th>Miércoles</th>
                      <th>Jueves</th>
                      <th>Viernes</th>
                      <th>Sábado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horario.map((fila, i) => (
                      <tr key={i}>
                        <td className="fw-bold">{fila.horario}</td>
                        {diasHorario.map((dia, j) => {
                          const valor = fila[dia];
                          const match = valor.match(/(#[0-9A-Fa-f]{6})(\[.*\])?/);
                          const color = match ? match[1] : "#FFFFFF";
                          const texto = match && match[2] ? match[2].replace(/[\[\]]/g, "") : "";
                          return (
                            <td
                              key={j}
                              style={{
                                backgroundColor: color,
                                color: "#000",
                                fontWeight: texto ? "bold" : "normal",
                              }}
                            >
                              {texto}
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                    {/* Totales dinámicos */}
                    <tr className="fw-bold">
                      <td>Total</td>
                      {totalesPorDiaHorario.map((t, i) => (
                        <td key={i}>{t}</td>
                      ))}
                    </tr>
                    <tr className="fw-bold table-secondary">
                      <td>General</td>
                      <td colSpan={6}>{totalBloquesHorario}</td>
                    </tr>
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* Texto aviso */}
          <div className="alert alert-warning" role="alert">
            Horas Declaradas por <strong>Actividad</strong>.
          </div>

          <Accordion defaultActiveKey="0" alwaysOpen>
            <Accordion.Item eventKey="1">
              <Accordion.Header>📋 Actividades</Accordion.Header>
              <Accordion.Body>
                <Table bordered hover responsive size="sm" className="text-center align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>Nro</th>
                      <th>Cod.</th>
                      <th>Descripción</th>
                      <th>Horas Dec.</th>
                      <th>Horas Pro.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horasDeclaradas.map((item, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{item.actividad}</td>
                        <td className="text-start">{item.descripcion}</td>
                        <td>{item.total_d}</td>
                        <td>{item.total}</td>
                      </tr>
                    ))}

                    {/* Totales */}
                    <tr className="fw-bold">
                      <td colSpan={3} className="text-end">TOTAL</td>
                      <td>
                        {horasDeclaradas.reduce((acc, a) => acc + (typeof a.total_d === "number" ? a.total_d : 0), 0)}
                      </td>
                      <td>
                        {horasDeclaradas.reduce((acc, a) => acc + (typeof a.total === "number" ? a.total : 0), 0)}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* Texto aviso */}
          <div className="alert alert-warning" role="alert">
            Horario de carga no lectiva y preparación de clases y evaluación.
          </div>

          <Accordion defaultActiveKey="0" alwaysOpen>
            <Accordion.Item eventKey="2">
              <Accordion.Header>📑 Carga No Lectiva</Accordion.Header>
              <Accordion.Body>
                <Table bordered hover responsive size="sm" className="text-center align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>Nro</th>
                      <th>Actividad</th>
                      <th>Día</th>
                      <th>Inicio</th>
                      <th>Fin</th>
                      <th>Horas</th>
                      <th>Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargaNoLectiva.map((item, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td className="text-start">{item.descripcion}</td>
                        <td>{item.dia}</td>
                        <td>{item.inicio}</td>
                        <td>{item.fin}</td>
                        <td>{item.horas}</td>
                        <td>

                          <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => eliminarCargaNoLectiva(item)}
                          disabled={!formHabilitado} // 🔒 deshabilita si está fuera de rango
                          title={
                            formHabilitado
                              ? "Eliminar actividad"
                              : "Fuera de rango de fechas — no se puede eliminar"
                          }
                        >
                          <Trash size={16} />
                        </Button>


                        </td>
                      </tr>
                    ))}

                    {/* TOTAL */}
                    <tr className="fw-bold">
                      <td colSpan={5} className="text-end">TOTAL</td>
                      <td>
                        {cargaNoLectiva.reduce((acc, item) => acc + (item.horas ?? 0), 0)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* Texto aviso */}
          <div className="alert alert-warning" role="alert">
            Programar horarios.
          </div>

          {/* ⬅️ Aquí va el formulario, pero se bloquea si no está habilitado */}
         
           {/* FORMULARIO DE CARGA NO LECTIVA */}
          <div className="mt-4">
            <FormNoLectiva
              actividades={actividades}
              onAgregar={guardarCargaNoLectiva}
              disabled={!formHabilitado}
            />
          </div>
          
        </div>
      </div>
    </>
  );
}

export default Horarios;
