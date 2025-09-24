import { useState, useEffect } from "react";
import BreadcrumbUNJ from "../../cuerpos/BreadcrumbUNJ";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../context/UserContext";
import { obtenerDatosDocente } from "./logica/Actividades";
import Swal from "sweetalert2";
import { Accordion, Table } from "react-bootstrap";
import config from "../../config";
import { TablaSkeleton } from "../reutilizables/componentes/TablaSkeleton";

function Declaracion() {
  const [semestre, setSemestre] = useState("202501");
  const { usuario } = useUsuario();

  const [docente, setDocente] = useState(null);
  const [cargaLectiva, setCargaLectiva] = useState([]);
  const [actividades, setActividades] = useState([]); // 👈 estado único
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const token = usuario?.codigotokenautenticadorunj;

  const maxHorasPorActividad = {
    "03": 2,
    "04": 6,
    "06": 4,
    "07": 15,
    "09": 10,
    "12": 5,
    "05": 4,
    "10": 10,
    "11": 19,
  };

  useEffect(() => {
    if (!usuario) return;

    const cargarDatos = async () => {
      setLoading(true);
      const result = await obtenerDatosDocente("01", semestre, usuario.docente.persona);
      if (result.datos) {
        setDocente(result.datos.docente);
        setCargaLectiva(result.datos.cargaLectiva || []);

        // 👇 inicializa estado con horas y descripcion ya mezcladas
        const acts = (result.datos.actividades || []).map((a) => ({
          ...a,
          descripcion2: a.descripcion2 || "",
          horas: a.horas ?? 0,
        }));
        setActividades(acts);

        setMensaje("");
      } else {
        setDocente(null);
        setCargaLectiva([]);
        setActividades([]);
        setMensaje(result.mensaje);
      }
      setLoading(false);
    };

    cargarDatos();
  }, [semestre, usuario]);

  const totalHt = cargaLectiva.reduce((sum, c) => sum + Number(c.horasteoria), 0);
  const totalHp = cargaLectiva.reduce((sum, c) => sum + Number(c.horaspractica), 0);
  const totalHT = cargaLectiva.reduce((sum, c) => sum + Number(c.ht), 0);
  const prepEval = Math.round(totalHT / 2);
  const totalCargaLectiva = totalHT + prepEval;

  const totalNoLectiva = actividades.reduce((acc, a) => acc + (a.horas ?? 0), 0);
  const totalGeneral = totalCargaLectiva + totalNoLectiva;

  // ✅ Cambiar descripcion
  const handleDescripcionChange = (i, value) => {
    const nuevas = [...actividades];
    nuevas[i].descripcion2 = value;
    setActividades(nuevas);
  };

  // ✅ Cambiar horas
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

  // ✅ Guardar todo
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
                <SemestreSelect
                  value={semestre}
                  onChange={(e) => setSemestre(e.target.value)}
                  name="cboSemestre"
                />
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

          {/* Carga lectiva */}
          {cargaLectiva.length > 0 && (
            <div className="mb-4">
              <h5 className="text-center">1. TRABAJO LECTIVO</h5>
              <table className="table table-sm  table-bordered">
                <thead>
                  <tr>
                    <th>N°.</th>
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
                      <td>{c.curso}</td>
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
                  <tr>
                    <td colSpan={9} className="text-end fw-bold">TOTAL</td>
                    <td className="fw-bold">{totalHt}</td>
                    <td className="fw-bold">{totalHp}</td>
                    <td className="fw-bold">{totalHT}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-2">
                <table className="table table-sm table-bordered">
                  <tbody>
                    <tr>
                      <td className="fw-bold">PREPARACIÓN Y EVALUACIÓN</td>
                      <td className="text-end fw-bold">{prepEval}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">TOTAL CARGA LECTIVA</td>
                      <td className="text-end fw-bold">{totalCargaLectiva}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actividades no lectivas */}
          {actividades.length > 0 && (
            <div className="mb-4">
              <h5 className="text-center">2. ACTIVIDADES NO LECTIVAS</h5>
              <table className="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th style={{ width: "40%" }}>Actividad</th>
                    <th style={{ width: "45%" }}>Descripción</th>
                    <th style={{ width: "15%" }}>Hrs.</th>
                  </tr>
                </thead>
                <tbody>
                  {actividades.map((a, i) => {
                    const maxHoras = maxHorasPorActividad[a.actividad] ?? 0;
                    return (
                      <tr key={i}>
                        <td>
                          <div><strong>{a.descripcion}</strong></div>
                          <small className="text-muted">{a.observa}</small>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={a.descripcion2}
                            onChange={(e) => handleDescripcionChange(i, e.target.value)}
                          />
                        </td>
                        <td>
                          <select
                            className="form-select"
                            value={a.horas}
                            onChange={(e) => handleHorasChange(i, Number(e.target.value))}
                          >
                            {Array.from({ length: maxHoras + 1 }, (_, h) => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}

                  <tr>
                    <td colSpan="2" className="text-end fw-bold">TOTAL CARGA NO LECTIVA</td>
                    <td className="fw-bold">{totalNoLectiva}</td>
                  </tr>
                  <tr>
                    <td colSpan="2" className="text-end fw-bold">TOTAL CARGA HORARIA</td>
                    <td className="fw-bold">{totalGeneral}</td>
                  </tr>
                </tbody>
              </table>

              {/* ✅ Botón guardar al final */}
              <div className="text-center mt-3">
                <button className="btn btn-primary" onClick={handleGuardar}>
                  Guardar Declaración
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Declaracion;
