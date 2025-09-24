import { useState, useEffect } from "react";
import BreadcrumbUNJ from "../../cuerpos/BreadcrumbUNJ";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../context/UserContext";
import { obtenerDatosHorario } from "./logica/Actividades";

import Swal from "sweetalert2";
import { Accordion, Table } from "react-bootstrap";
import config from "../../config";
import { TablaSkeleton } from "../reutilizables/componentes/TablaSkeleton";

function Horarios() {
  const [semestre, setSemestre] = useState("202501");
  const { usuario } = useUsuario();

  const [docente, setDocente] = useState(null);
  const [cargaLectiva, setCargaLectiva] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [horario, setHorario] = useState([]); // ✅ estado para el horario
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const token = usuario?.codigotokenautenticadorunj;

  useEffect(() => {
    if (!usuario) return;

    const cargarDatos = async () => {
      setLoading(true);
      const result = await obtenerDatosHorario("01", semestre, usuario.docente.persona);
      console.log("📌 Datos crudos de la API:", result);

      if (result.datos) {
        setDocente(result.datos.docente);
        setCargaLectiva(result.datos.cargaLectiva || []);

        const acts = (result.datos.actividades || []).map((a) => ({
          ...a,
          descripcion2: a.descripcion2 || "",
          horas: a.horas ?? 0,
        }));
        setActividades(acts);

        setHorario(result.datos.horario || []); // ✅ guardamos horario
        setMensaje("");
      } else {
        setDocente(null);
        setCargaLectiva([]);
        setActividades([]);
        setHorario([]); // ✅ reset en caso de error
        setMensaje(result.mensaje);
      }
      setLoading(false);
    };

    cargarDatos();
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

  // ================== Handlers ==================
  const handleDescripcionChange = (i, value) => {
    const nuevas = [...actividades];
    nuevas[i].descripcion2 = value;
    setActividades(nuevas);
  };

  const handleHorasChange = (i, value) => {
    const nuevas = [...actividades];
    nuevas[i].horas = value;

    const nuevoTotalNoLectiva = nuevas.reduce((acc, act) => acc + (act.horas ?? 0), 0);
    const nuevoTotalGeneral = totalCargaLectiva + nuevoTotalNoLectiva;

    if (nuevoTotalGeneral > 40) {
      Swal.fire({
        icon: "warning",
        title: "Límite excedido",
        text: "La carga horaria total no puede superar 40 horas.",
      });
      return;
    }

    setActividades(nuevas);
  };

  const handleGuardar = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}api/actividades/docente/grabar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          persona: usuario.docente.persona,
          semestre,
          actividades: actividades.map((a) => ({
            actividad: a.actividad,
            descripcion: a.descripcion2 || "",
            horas: a.horas ?? 0,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Error al guardar");
      }

      Swal.fire({
        icon: "success",
        title: "Guardado",
        text: data.message,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

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

          {/* Horario Semanal */}
          <div className="mb-4">
            <h5 className="mb-3">🗓️ Horario Semanal</h5>
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
          </div>
        </div>
      </div>
    </>
  );
}

export default Horarios;
