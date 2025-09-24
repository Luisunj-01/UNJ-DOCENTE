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
  const [actividades, setActividades] = useState([]); // 👈 estado único
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
                                    color: "#000", // o "#fff" si quieres texto blanco
                                    fontWeight: "bold",
                                    textAlign: "center"
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

              {/* Fila total */}
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





        </div>
      </div>
    </>
  );
}

export default Horarios;
