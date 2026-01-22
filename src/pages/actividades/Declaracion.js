import { useState, useEffect } from "react";
import BreadcrumbUNJ from "../../cuerpos/BreadcrumbUNJ";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../context/UserContext";
import { obtenerDatosDocente, validarFechas } from "./logica/Actividades";
import Swal from "sweetalert2";
import { Accordion, Table, Modal } from "react-bootstrap";

import config from "../../config";
import { TablaSkeleton } from "../reutilizables/componentes/TablaSkeleton";

function Declaracion() {
  const [semestre, setSemestre] = useState("202502");
  const { usuario } = useUsuario();
  const [docente, setDocente] = useState(null);
  const [cargaLectiva, setCargaLectiva] = useState([]);
  const [actividades, setActividades] = useState([]); // 👈 estado único
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [formHabilitado, setFormHabilitado] = useState(false);
  const [mensajeFecha, setMensajeFecha] = useState("");
  const token = usuario?.codigotokenautenticadorunj;
  const [mostrarPdf, setMostrarPdf] = useState(false);
  const [urlPdf, setUrlPdf] = useState("");

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
  // ✅ Validar fechas para habilitar el botón de Guardar
  useEffect(() => {
  if (!usuario) return;

  const validarFecha = async () => {
    try {
      const data = await validarFechas("01", semestre, usuario.docente.persona);

      if (data.success) {
        setFormHabilitado(true);
        setMensajeFecha("");
      } else {
        setFormHabilitado(false);
        setMensajeFecha(`⚠️ ${data.message || "El registro está cerrado."}`);
      }

    } catch (error) {
      console.error("Error validando fecha:", error);
      setFormHabilitado(false);
      setMensajeFecha("❌ No se pudo verificar la fecha.");
    }
  };

  validarFecha();
}, [semestre, usuario]);

useEffect(() => {
  if (!usuario) return;

  const cargarDatos = async () => {
    setLoading(true);

    const result = await obtenerDatosDocente(
      "01",
      semestre,
      usuario.docente.persona
    );

    if (result.datos) {
      setDocente(result.datos.docente);
      setCargaLectiva(result.datos.cargaLectiva || []);

      // 1️⃣ Inicializa actividades
      const acts = (result.datos.actividades || []).map(a => ({
        ...a,
        descripcion2: a.descripcion2 || "",
        horas: a.horas ?? 0,
        rutaArchivo: null, // 👈 IMPORTANTE
      }));

      // 2️⃣ Verificar archivos EN PARALELO
     const actsConArchivo = await Promise.all(
        acts.map(async (act) => {
          const url = `${config.apiUrl}api/actividades/ver-archivo/${semestre}/${usuario.docente.docente}/${usuario.docente.persona}/${act.actividad}`;

          try {
            const resp = await fetch(url, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (resp.ok) {
              return {
                ...act,
                rutaArchivo: url, // ✅ existe
              };
            }

            return act;
          } catch {
            return act;
          }
        })
      );
      // 3️⃣ SETEAR UNA SOLA VEZ
      setActividades(actsConArchivo);
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

  const handleArchivoChange = (index, file) => {
  setActividades(prev =>
    prev.map((a, i) =>
      i === index ? { ...a, archivo: file } : a
    )
  );
};

const subirArchivo = async (index) => {
  const actividad = actividades[index];

  if (!actividad.archivo) {
    Swal.fire({
      icon: "warning",
      title: "Archivo no seleccionado",
      text: "Selecciona un archivo primero",
    });
    return;
  }

  const formData = new FormData();
  formData.append("archivo", actividad.archivo);

  // 🔥 CAMPOS QUE FALTABAN
  formData.append("semestre", semestre);
  formData.append("docente", usuario.docente.docente);   // ajusta si el nombre es otro
  formData.append("persona", usuario.docente.persona);
  formData.append("actividad", actividad.actividad);

  try {
    const resp = await fetch(
      `${config.apiUrl}api/actividades/subir-archivo`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ NO pongas Content-Type
        },
        body: formData,
      }
    );

    const data = await resp.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    Swal.fire({
      icon: "success",
      title: "Archivo subido",
      timer: 1500,
      showConfirmButton: false,
    });

    // Guardar la ruta SOLO para mostrar el link
    setActividades(prev =>
      prev.map((a, i) =>
        i === index ? { ...a, rutaArchivo: data.ruta } : a
      )
    );

  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "No se pudo subir el archivo",
    });
  }
};
const abrirPdf = async (actividad) => {
  try {
    if (!actividad.rutaArchivo) {
      throw new Error("No se encontró la ruta del archivo");
    }

    // 🔧 Descargar a través de la API backend (con CORS configurado)
    const resp = await fetch(
      `${config.apiUrl}api/actividades/ver-archivo/${semestre}/${usuario.docente.docente}/${usuario.docente.persona}/${actividad.actividad}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!resp.ok) {
      throw new Error(`Error ${resp.status}: ${resp.statusText}`);
    }

    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);

    setUrlPdf(url);
    setMostrarPdf(true);
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error al abrir el archivo",
      text: error.message || "No se pudo descargar el archivo",
    });
  }
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
                  onChange={setSemestre}   // ✅ recibe directamente el value
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
                <Accordion defaultActiveKey="0" className="mb-3">
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>📘 1. TRABAJO LECTIVO</Accordion.Header>
                    <Accordion.Body>
                      <table className="table table-sm table-bordered">
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
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </div>
            )}


          {/* Actividades no lectivas */}
        {actividades.length > 0 && (
          <div className="mb-4">
            <Accordion defaultActiveKey="0" className="mb-3">
              <Accordion.Item eventKey="0">
                <Accordion.Header>📋 2. ACTIVIDADES NO LECTIVAS</Accordion.Header>
                <Accordion.Body>
          <table className="table table-sm table-bordered">
              <thead>
                <tr>
                  <th style={{ width: "35%" }}>Actividad</th>
                  <th style={{ width: "45%" }}>Descripción</th>
                  <th style={{ width: "8%" }}>Hrs.</th>
                  <th style={{ width: "12%" }}>Subir Archivo</th> {/* 🆕 */}
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
                      <textarea
                        className="form-control descripcion-textarea"
                        rows={2}
                        value={a.descripcion_tema}
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

                    {/* 🆕 ARCHIVO */}
                  <td className="text-center align-middle">
                  <div className="d-flex flex-column gap-1">

                    {/* Seleccionar archivo */}
                    <label className="btn btn-outline-secondary btn-sm">
                      📎 Seleccionar
                      <input
                        type="file"
                        hidden
                        onChange={(e) =>
                          handleArchivoChange(i, e.target.files[0])
                        }
                      />
                    </label>

                    {/* Subir */}
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => subirArchivo(i)}
                      disabled={!a.archivo}
                    >
                      ⬆ Subir
                    </button>

                    {/* Ver */}
                    {a.rutaArchivo && (
                      <button
                        className="btn btn-link btn-sm p-0"
                        onClick={() => abrirPdf(a)}
                      >
                        📄 Ver archivo
                      </button>
                    )}
                   </div>
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

          {/* ✅ Botón guardar dentro del acordeón */}
          <div className="text-center mt-3">
             <button
                        className="btn btn-primary"
                        onClick={handleGuardar}
                        disabled={!formHabilitado}
                      >
                        Guardar Declaración
                      </button>

                      {mensajeFecha && (
                        <p
                          style={{
                            color: "red",
                            fontSize: "0.85rem",
                            marginTop: "8px",
                          }}
                        >
                          {mensajeFecha}
                        </p>
                      )}
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        )}



        </div>
      </div>

        <Modal
          show={mostrarPdf}
          onHide={() => setMostrarPdf(false)}
          size="xl"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>📄 Documento de la actividad</Modal.Title>
          </Modal.Header>

          <Modal.Body style={{ height: "80vh", padding: 0 }}>
            <iframe
              src={urlPdf}
              title="PDF"
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          </Modal.Body>
        </Modal>


    </>
  );
}

export default Declaracion;
