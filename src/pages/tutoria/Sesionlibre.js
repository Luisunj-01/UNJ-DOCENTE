import { useState, useEffect, useMemo } from "react";
import { Table, Button, Spinner, ProgressBar, Badge } from "react-bootstrap";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../context/UserContext";
import Swal from "sweetalert2";
import config from "../../config";
import "./SesionesCiclo.css";

import {
  obtenerSesionesLibres,
  obtenerSesionesLibresDisponibles,
  guardarSesionLibre,
  obtenerSesionLibre,
  actualizarSesionLibre,
  eliminarSesionLibre,
} from "./logica/DatosTutoria";

import AsistenciaSesion from "./componentes/AsistenciaSesion";

function SesionesLibres({ semestreValue }) {
  const { usuario } = useUsuario();
  const [semestre, setSemestre] = useState(semestreValue || "202502");
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accion, setAccion] = useState(null);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);

  // ✅ Formatear fecha (YYYY-MM-DD → DD/MM/YYYY)
  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    if (fecha.includes("/")) return fecha; // ya viene dd/mm/yyyy
    const partes = fecha.split("-");
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return fecha;
  };

  // ✅ Cargar sesiones
  const cargarSesiones = async () => {
    if (!usuario || !usuario.docente) return;
    setLoading(true);

    const token = usuario?.codigotokenautenticadorunj;
    const persona = usuario.docente.persona;

    try {
      const url = `${config.apiUrl}api/Tutoria/sesiones-libres/${persona}/${semestre}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSesiones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error al obtener sesiones libres:", error);
      Swal.fire("Error", "No se pudo obtener la lista de sesiones libres.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSesiones();
  }, [semestre, usuario]);

  const handleChange = (value) => setSemestre(value);

  // ✅ Normalizar fecha (acepta formatos DD/MM/YYYY o YYYY-MM-DD)
  const normalizarFecha = (fecha) => {
    if (!fecha) return "";
    if (fecha.includes("T")) return fecha.split("T")[0]; // ISO completo
    if (/^\d{4}-\d{2}-\d{2}/.test(fecha)) return fecha; // yyyy-mm-dd
    if (/^\d{2}\/\d{2}\/\d{4}/.test(fecha)) {
      const [d, m, y] = fecha.split("/");
      return `${y}-${m}-${d}`;
    }
    return "";
  };

  // 📊 Porcentaje de sesiones concluidas
  const { total, concluidas, porcentaje, cumple75 } = useMemo(() => {
    const total = sesiones?.length || 0;
    const concluidas = (sesiones || []).filter((s) => Number(s.activo) === 1).length;
    const porcentaje = total === 0 ? 0 : Math.round((concluidas * 100) / total);
    const cumple75 = porcentaje >= 75;
    return { total, concluidas, porcentaje, cumple75 };
  }, [sesiones]);

  
  // ✅ Acción: asistencia, editar o eliminar
  const handleAccion = async (tipo, sesion) => {
    const persona = usuario.docente.persona;
    const token = usuario?.codigotokenautenticadorunj;

    if (tipo === "asis") {
      setAccion("asis");
      setSesionSeleccionada(sesion);
      return;
    }

    if (tipo === "edit") {
      try {
        const data = await obtenerSesionLibre(persona, semestre, sesion.sesion, token);

        if (!data.success) {
          Swal.fire("Error", data.message || "No se pudo obtener la sesión.", "error");
          return;
        }

        const s = data.data || {};
        const fechaISO = normalizarFecha(s.fecha);

        Swal.fire({
          title: "✏️ Editar sesión libre",
          width: "650px",
          html: `
            <table style="width:100%; text-align:left; border-collapse:collapse;">
              <tr>
                <td style="width:30%; padding:6px;"><label>Sesión:</label></td>
                <td style="padding:6px;">
                  <input id="sesion" class="swal2-input" style="width:90%; background:#f3f3f3;" value="${s.sesion || ""}" disabled>
                </td>
              </tr>
              <tr>
                <td style="padding:6px;"><label>Descripción:</label></td>
                <td style="padding:6px;">
                  <input id="descripcion" class="swal2-input" style="width:90%;" value="${s.descripcion || ""}">
                </td>
              </tr>
              <tr>
                <td style="padding:6px;"><label>Link:</label></td>
                <td style="padding:6px;">
                  <input id="link" class="swal2-input" style="width:90%;" value="${s.link || ""}">
                </td>
              </tr>
              <tr>
                <td style="padding:6px;"><label>Fecha:</label></td>
                <td style="padding:6px;">
                  <input id="fecha" type="date" class="swal2-input" style="width:60%;" value="${fechaISO}">
                </td>
              </tr>
              <tr>
                <td style="padding:6px;"><label>Concluida:</label></td>
                <td style="padding:6px;">
                  <input type="checkbox" id="concluida" ${Number(s.activo) === 1 ? "checked" : ""}>
                </td>
              </tr>
            </table>
          `,
          showCancelButton: true,
          confirmButtonText: "Guardar cambios",
          cancelButtonText: "Cancelar",
          focusConfirm: false,
          preConfirm: () => {
            const descripcion = document.getElementById("descripcion")?.value?.trim() || "";
            const link = document.getElementById("link")?.value?.trim() || "";
            const fecha = document.getElementById("fecha")?.value?.trim() || "";
            const concluida = document.getElementById("concluida")?.checked ? 1 : 0;

            if (!descripcion || !fecha) {
              Swal.showValidationMessage("Complete los campos obligatorios (Descripción, Fecha).");
              return false;
            }
            return { descripcion, link, fecha, concluida };
          },
        }).then(async (result) => {
          if (!result.isConfirmed) return;

          const { descripcion, link, fecha, concluida } = result.value;

          const res = await actualizarSesionLibre(
            persona,
            semestre,
            sesion.sesion,
            descripcion,
            fecha,
            concluida,
            link,
            token
          );

          if (res.success) {
            Swal.fire("✅ Guardado", res.message, "success");
            cargarSesiones();
          } else {
            Swal.fire("⚠️", res.message || "Error al guardar la sesión", "warning");
          }
        });
      } catch (err) {
        console.error("❌ Error al editar sesión:", err);
        Swal.fire("Error", "No se pudo cargar la sesión.", "error");
      }
      return;
    }

    if (tipo === "elim") {
      const confirm = await Swal.fire({
        title: "¿Eliminar sesión?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });
      if (!confirm.isConfirmed) return;

      const res = await eliminarSesionLibre(persona, semestre, sesion.sesion, token);
      if (res.success) {
        Swal.fire("✅ Eliminada", res.message, "success");
        cargarSesiones();
      } else {
        Swal.fire("⚠️ Aviso", res.message || "No se pudo eliminar.", "warning");
      }
    }
  };

  // ✅ Modo asistencia
  if (accion === "asis" && sesionSeleccionada) {
    return (
      <AsistenciaSesion
        persona={usuario?.docente?.persona}
        semestre={semestre}
        sesion={sesionSeleccionada.sesion}
        descripcion={sesionSeleccionada.descripcion}
        onVolver={() => {
          setAccion(null);
          setSesionSeleccionada(null);
        }}
      />
    );
  }

  // ✅ Vista principal
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

      {/* 📊 Resumen de avance sesiones libres */}
      <div className="mb-3 p-3 border rounded bg-light">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <strong>Avance sesiones libres:</strong>{" "}
            <Badge bg={cumple75 ? "success" : "secondary"}>
              {concluidas}/{total} concluidas
            </Badge>
          </div>
          <div>
            {cumple75 ? (
              <Badge bg="success">✅ Cumple 75%</Badge>
            ) : (
              <Badge bg="warning" text="dark">
                ⚠️ Aún no cumple 75%
              </Badge>
            )}
          </div>
        </div>
        <ProgressBar now={porcentaje} label={`${porcentaje}%`} style={{ height: 22 }} animated striped />
      </div>

      {/* Leyenda */}
      <div className="alert alert-info py-2">
        <strong>Leyenda:</strong>&nbsp;
        <i className="fa fa-male"></i> Asistencia&nbsp;
        <i className="fa fa-edit"></i> Editar&nbsp;
        <i className="fa fa-trash"></i> Eliminar
      </div>



      <div className="d-flex justify-content-between mb-2">
        <div>
          <strong>Docente Tutor:</strong> {usuario?.docente?.nombrecompleto || "Sin nombre"}
        </div>
        <div>


          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => Swal.fire("🖨", "Función de impresión en desarrollo.")}
          >
            <i className="fa fa-print"></i> Registro de reuniones
          </Button>
        </div>
      </div>


      {/* Botón: Nueva Sesión */}
      <div className="d-flex justify-content-end mb-3">
        <Button
          variant="success"
          size="sm"
          style={{ fontWeight: "bold" }}
          onClick={async () => {
            const persona = usuario.docente.persona;
            const token = usuario?.codigotokenautenticadorunj;

            Swal.fire({ title: "Cargando...", didOpen: () => Swal.showLoading() });

            const disponibles = await obtenerSesionesLibresDisponibles(persona, semestre, token);
            Swal.close();

            if (!Array.isArray(disponibles) || disponibles.length === 0) {
              Swal.fire("⚠️", "No hay sesiones libres disponibles.", "warning");
              return;
            }

            Swal.fire({
              title: "Nueva Sesión Libre",
              width: "650px",
              html: `
                <table style="width:100%; text-align:left;">
                  <tr>
                    <td><b>Semana:</b></td>
                    <td>
                      <select id="sesion" class="swal2-input">
                        <option value="">-- Seleccione --</option>
                        ${disponibles.map((d) => `<option value="${d.semana}">${d.semana}</option>`).join("")}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td><b>Descripción:</b></td>
                    <td><input id="descripcion" class="swal2-input"></td>
                  </tr>
                  <tr>
                    <td><b>Link:</b></td>
                    <td><input id="link" class="swal2-input"></td>
                  </tr>
                  <tr>
                    <td><b>Fecha:</b></td>
                    <td><input id="fecha" type="date" class="swal2-input"></td>
                  </tr>
                </table>
              `,
              showCancelButton: true,
              confirmButtonText: "Guardar",
              preConfirm: () => {
                const sesion = document.getElementById("sesion").value;
                const descripcion = document.getElementById("descripcion").value.trim();
                const link = document.getElementById("link").value.trim();
                const fecha = document.getElementById("fecha").value.trim();

                if (!sesion || !descripcion || !fecha) {
                  Swal.showValidationMessage("Complete los campos obligatorios.");
                  return false;
                }

                return { sesion, descripcion, link, fecha };
              },
            }).then(async (result) => {
              if (!result.isConfirmed) return;

              const { sesion, descripcion, link, fecha } = result.value;

              const res = await guardarSesionLibre(
                persona,
                semestre,
                sesion,
                descripcion,
                fecha,
                0,
                link,
                token
              );

              if (res.success) {
                Swal.fire("✅ Guardado", res.message, "success");
                cargarSesiones();
              } else {
                Swal.fire("⚠️", res.message || "Error al guardar.", "warning");
              }
            });
          }}
        >
          <i className="fa fa-plus"></i> Nueva Sesión
        </Button>
      </div>

      {/* ========= MENSAJE SI NO HAY SESIONES ========= */}
      {!loading && sesiones.length === 0 && (
        <div className="alert alert-secondary text-center my-3">
          <strong>Sin sesiones libres registradas.</strong>
          <br />
          <small>Usa el botón “Nueva Sesión” para comenzar.</small>
        </div>
      )}

      {/* ========= TABLA ========= */}
      {!loading && sesiones.length > 0 && (
        <Table bordered hover size="sm" responsive className="table-tutoria">
          <thead className="table-light">
            <tr>
              <th style={{ textAlign: "center", width: "5%" }}>Nro.</th>
              <th>Descripción</th>
              <th style={{ textAlign: "center", width: "10%" }}>Fecha</th>
              <th style={{ textAlign: "center", width: "10%" }}>Estado</th>
              <th style={{ textAlign: "center", width: "15%" }}>Opciones</th>
            </tr>
          </thead>

          <tbody>
            {sesiones.map((s, index) => (
              <tr key={index}>
                <td style={{ textAlign: "center" }}>{index + 1}</td>
                <td>{s.descripcion}</td>
                <td style={{ textAlign: "center" }}>{formatearFecha(s.fecha)}</td>
                <td style={{ textAlign: "center" }}>
                  {Number(s.activo) === 1 ? (
                    <span className="badge bg-primary">Concluida</span>
                  ) : (
                    <span className="badge bg-danger">Pendiente</span>
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="me-1 btn-icon"
                    onClick={() => handleAccion("asis", s)}
                  >
                    <i className="fa fa-male icono-azul"></i>
                  </Button>

                  <Button
                    variant="outline-light"
                    size="sm"
                    className="me-1 btn-icon"
                    onClick={() => handleAccion("edit", s)}
                  >
                    <i className="fa fa-edit icono-negro"></i>
                  </Button>

                  <Button
                    variant="outline-light"
                    size="sm"
                    className="me-1 btn-icon"
                    onClick={() => handleAccion("elim", s)}
                  >
                    <i className="fa fa-trash icono-rojo"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {loading && <Spinner animation="border" variant="primary" />}
    </div>
  );
}

export default SesionesLibres;
