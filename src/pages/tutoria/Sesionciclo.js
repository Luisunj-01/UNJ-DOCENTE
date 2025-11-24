import { useState, useEffect, useMemo } from "react";
import { Table, Button, Spinner, ProgressBar, Badge } from "react-bootstrap";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../context/UserContext";
import config from "../../config";
import axios from "axios";
import confetti from "canvas-confetti";
import "./SesionesCiclo.css";

import {
  obtenerSesionesCiclo,
  guardarSesion,
  obtenerTemasDisponibles,
  obtenerRecomendacion,
  guardarRecomendacion,
  eliminarSesion,
  obtenerSesion,
  verificarSesion,
  actualizarSesion,
  obtenerEvidenciasSesion,
  concluirSesion,
} from "./logica/DatosTutoria";

import AsistenciaSesion from "./componentes/AsistenciaSesion";
import Swal from "sweetalert2";

function SesionesCiclo({ semestreValue }) {
  const { usuario } = useUsuario();
  const [semestre, setSemestre] = useState(semestreValue || "202502");
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [ciclo, setCiclo] = useState("No asignado");
  const [accion, setAccion] = useState(null);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const [temasDisponibles, setTemasDisponibles] = useState([]);
  const [cargandoTemas, setCargandoTemas] = useState(false);
  const [estadoSesiones, setEstadoSesiones] = useState({});

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    if (fecha.includes("/")) return fecha;
    const partes = fecha.split("-");
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return fecha;
  };

  // ==========================
  // CARGAR SESIONES
  // ==========================
  const cargarSesiones = async () => {
    if (!usuario || !usuario.docente) return;

    setLoading(true);
    const token = usuario?.codigotokenautenticadorunj;

    if (!token) {
      setMensaje("Token no disponible. Inicie sesión nuevamente.");
      setSesiones([]);
      setLoading(false);
      return;
    }

    try {
      const persona = usuario.docente.persona;
      const resp = await obtenerSesionesCiclo(persona, semestre, token);

      const { ciclo, datos } = resp;

      if (datos && datos.length > 0) {
        // Obtener evidencias en paralelo
        const toBool = (v) => Number(v) > 0;

        const conEvidencias = await Promise.all(
          datos.map(async (s) => {
            const sesion2 = String(s.sesion).padStart(2, "0");
            const ev = await obtenerEvidenciasSesion(persona, semestre, sesion2, token);

            return {
              ...s,
              sesion: sesion2,
              tieneAsistencia: toBool(ev?.asistencias),
              tieneFoto: toBool(ev?.fotos),
            };
          })
        );

        setSesiones(conEvidencias);
        setCiclo(ciclo || "No asignado");
        setMensaje("");
      } else {
        setSesiones([]);
        setMensaje("Sin registros disponibles.");
      }
    } catch (error) {
      console.error("❌ Error al cargar sesiones:", error);
      setSesiones([]);
      setMensaje("Sin registros disponibles.");
    }

    setLoading(false);
  };

  // ==========================
  // CARGAR TEMAS DISPONIBLES
  // ==========================
  useEffect(() => {
    if (!usuario || !usuario.docente) return;

    const cargarTemas = async () => {
      try {
        setCargandoTemas(true);
        const token = usuario?.codigotokenautenticadorunj;
        const persona = usuario?.docente?.persona;
        const temas = await obtenerTemasDisponibles(semestre, persona, token);

        const temasNoRegistrados = (temas || []).filter(
          (t) => !sesiones.some((s) => String(s.sesion) === String(t.tema))
        );

        setTemasDisponibles(temasNoRegistrados);
      } catch (err) {
        console.error("❌ Error al cargar temas:", err);
        setTemasDisponibles([]);
      } finally {
        setCargandoTemas(false);
      }
    };

    cargarTemas();
  }, [usuario, semestre, sesiones]);

  useEffect(() => {
    cargarSesiones();
  }, [semestre, usuario]);

  const verificarSesionCompleta = async (persona, semestre, sesion) => {
    try {
      const token = usuario?.codigotokenautenticadorunj;
      const data = await verificarSesion(persona, semestre, sesion, token);

      if (data.success) {
        setEstadoSesiones((prev) => ({
          ...prev,
          [sesion]: data.completa,
        }));
      }
    } catch (error) {
      console.error("⚠️ Error verificando sesión:", error);
    }
  };


  const abrirReporteReuniones = async () => {
  try {
    const persona = usuario?.docente?.persona;

    const url = `${config.apiUrl}api/Tutoria/reporte-reuniones/${semestre}/${persona}`;

    const resp = await axios.get(url, {
      responseType: "blob"
    });

    const file = new Blob([resp.data], { type: "application/pdf" });
    const fileURL = URL.createObjectURL(file);

    window.open(
      fileURL,
      "reporteReuniones",
      "width=900,height=800,left=250,top=90,resizable=yes,scrollbars=yes"
    );

  } catch (error) {
    console.error("Error al abrir reporte de reuniones:", error);
    Swal.fire("❌ Error", "No se pudo generar el reporte.", "error");
  }
};


  const { total, concluidas, porcentaje, cumple75 } = useMemo(() => {
    const total = sesiones?.length || 0;
    const concluidas = (sesiones || []).filter((s) => Number(s.activo) === 1).length;
    const porcentaje = total === 0 ? 0 : Math.round((concluidas * 100) / total);
    const cumple75 = porcentaje >= 75;
    return { total, concluidas, porcentaje, cumple75 };
  }, [sesiones]);

  const handleChange = (value) => setSemestre(value);

  const handleAccion = async (tipo, sesion) => {
    const acciones = {
      reco: "📘 Logros, dificultades y observaciones",
      foto: "😄 Subir imagen",
      asis: "👨‍🏫 Asistencia y observaciones",
      edit: "✏️ Editar sesión",
      elim: "🚫 Eliminar sesión",
    };

    if (tipo === "asis") {
      setAccion("asis");
      setSesionSeleccionada(sesion);
      return;
    }

    // EDITAR
    if (tipo === "edit") {
      const token = usuario?.codigotokenautenticadorunj;
      const persona = usuario.docente.persona;

      try {
        const { success, data, message } = await obtenerSesion(persona, semestre, sesion.sesion, token);
        if (!success) {
          Swal.fire("❌ Error", message, "error");
          return;
        }

        const activoOriginal = Number(data.activo) === 1 ? 1 : 0;

        let fechaFormateada = "";
        if (data.fecha) {
          if (data.fecha.includes("/")) {
            const [dia, mes, anio] = data.fecha.split("/");
            fechaFormateada = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          } else if (data.fecha.includes("-")) {
            fechaFormateada = data.fecha.split(" ")[0];
          }
        }

        Swal.fire({
          title: "✏️ Modificar sesión",
          width: "600px",
          html: `
            <table style="width:100%; text-align:left; border-collapse:collapse;">
              <tr>
                <td style="width:35%; padding:6px;"><b>Sesión:</b></td>
                <td>${data.descripcion || ""}</td>
              </tr>
              <tr>
                <td style="padding:6px;"><label>Escuela y Nro. aula:</label></td>
                <td style="padding:6px;">
                  <input id="aula" class="swal2-input" style="width:90%;" value="${data.link || ""}">
                </td>
              </tr>
              <tr>
                <td style="padding:6px;"><label>Fecha:</label></td>
                <td style="padding:6px;">
                  <input id="fecha" type="date" class="swal2-input" style="width:60%;" value="${fechaFormateada || ""}">
                </td>
              </tr>
            </table>
            <small style="color:#666;display:block;margin-top:6px;">
              * El estado Pendiente/Concluida no se modifica aquí.
            </small>
          `,
          showCancelButton: true,
          confirmButtonText: "Grabar",
          cancelButtonText: "Cancelar",
          focusConfirm: false,
          preConfirm: () => {
            const aula = document.getElementById("aula").value.trim();
            const fecha = document.getElementById("fecha").value;
            if (!aula || !fecha) {
              Swal.showValidationMessage("Complete todos los campos.");
              return false;
            }
            return { aula, fecha };
          },
        }).then(async (result) => {
          if (result.isConfirmed) {
            const { aula, fecha } = result.value;

            const respuesta = await actualizarSesion(
              persona,
              semestre,
              sesion.sesion,
              aula,
              fecha,
              activoOriginal,
              token
            );

            if (respuesta.success) {
              Swal.fire("✅ Éxito", respuesta.message, "success");
              cargarSesiones();
            } else {
              Swal.fire("⚠️ Error", respuesta.message || "No se pudo actualizar.", "warning");
            }
          }
        });
      } catch (error) {
        Swal.fire("❌ Error", "No se pudo cargar la sesión.", "error");
        console.error(error);
      }

      return;
    }

    Swal.fire({
      title: `${acciones[tipo]}`,
      text: `Sesión: ${sesion.descripcion}`,
      icon: tipo === "elim" ? "warning" : "info",
      confirmButtonText: tipo === "elim" ? "Eliminar" : "Aceptar",
    });
  };

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
          cargarSesiones();
        }}
      />
    );
  }

  return (
    <div className="container mt-3">
      {/* Selector semestre */}
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

      {/* Docente */}
      <div className="d-flex justify-content-between mb-2">
        <div>
          <strong>Docente Tutor:</strong> {usuario?.docente?.nombrecompleto || "Sin nombre"}
          <br />
          <strong>Ciclo:</strong> {ciclo}
        </div>
        <div>

          <Button
  variant="outline-primary"
  size="sm"
  onClick={abrirReporteReuniones}
>
  <i className="fa fa-print"></i> Registro de reuniones
</Button>


        </div>
      </div>

      {/* Avance */}
      <div className="mb-3 p-3 border rounded bg-light">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <strong>Avance sesiones del ciclo:</strong>{" "}
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
        <i className="fa fa-book"></i> Logros, dificultades y observaciones &nbsp;
        <i className="far fa-smile"></i> Subir imagen &nbsp;
        <i className="fa fa-male"></i> Asistencia y observaciones &nbsp;
        <i className="fa fa-edit"></i> Editar &nbsp;
        <i className="fa fa-ban"></i> Eliminar
      </div>
      

{/* ---------- BOTÓN NUEVA SESIÓN (SIEMPRE VISIBLE) ---------- */}
<div className="d-flex justify-content-end mb-3">
  <Button
    variant="success"
    size="sm"
    style={{ fontWeight: "bold", border: "none", boxShadow: "none" }}
    onClick={async () => {
      if (cargandoTemas) {
        Swal.fire("⏳", "Cargando temas disponibles...", "info");
        return;
      }
      if (!temasDisponibles.length) {
        Swal.fire("⚠️", "Ya no hay sesiones disponibles para este semestre.", "warning");
        return;
      }

      const opcionesHtml = temasDisponibles
        .map((t) => `<option value="${t.tema}">${t.tema} - ${t.descripcion}</option>`)
        .join("");

      Swal.fire({
        title: "Nueva Sesión",
        width: "600px",
        html: `
          <table style="width:100%; text-align:left; border-collapse:collapse;">
            <tr>
              <td style="width:30%; padding:6px;"><label>Sesión:</label></td>
              <td style="padding:6px;">
                <select id="sesion" class="swal2-input" style="width:90%;">
                  <option value="">-- Seleccione sesión --</option>
                  ${opcionesHtml}
                </select>
              </td>
            </tr>
            <tr>
              <td style="padding:6px;"><label>Escuela y Nro. aula:</label></td>
              <td style="padding:6px;"><input id="aula" class="swal2-input" style="width:90%;"></td>
            </tr>
            <tr>
              <td style="padding:6px;"><label>Fecha:</label></td>
              <td style="padding:6px;"><input id="fecha" type="date" class="swal2-input" style="width:50%;"></td>
            </tr>
          </table>
          <small style="color:#666;display:block;margin-top:6px;">
            * La sesión se registrará como <b>Pendiente</b> por defecto.
          </small>
        `,
        showCancelButton: true,
        confirmButtonText: "Grabar",
        cancelButtonText: "Cancelar",
        focusConfirm: false,
        preConfirm: () => {
          const sesion = (document.getElementById("sesion") || {}).value;
          const aula = (document.getElementById("aula") || {}).value?.trim();
          const fecha = (document.getElementById("fecha") || {}).value;

          if (!sesion || !aula || !fecha) {
            Swal.showValidationMessage("Por favor complete todos los campos.");
            return false;
          }

          return { sesion, aula, fecha, concluida: 0 };
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const { sesion, aula, fecha, concluida } = result.value;
          const codigo = btoa(btoa(usuario.docente.persona + semestre));
          const token = usuario?.codigotokenautenticadorunj;

          try {
            const res = await guardarSesion(codigo, sesion, aula, fecha, concluida, "N", token);

            if (res.exito) {
              Swal.fire("✅ Guardado", res.mensaje, "success");
              await cargarSesiones();
            } else {
              Swal.fire("⚠️ Aviso", res.mensaje || "No se pudo guardar.", "warning");
            }
          } catch (err) {
            Swal.fire("❌ Error", "No se pudo conectar con la API.", "error");
            console.error(err);
          }
        }
      });
    }}
  >
    <i className="fa fa-plus"></i> Nueva Sesión
  </Button>
</div>
{/* ========= MENSAJE CUANDO NO HAY SESIONES ========= */}
{!loading && sesiones.length === 0 && (
  <div className="alert alert-secondary text-center my-3">
    <strong>Sin sesiones registradas.</strong>
    <br />
    <small>Usa el botón “Nueva Sesión” para comenzar.</small>
  </div>
)}

    

      {loading && <Spinner animation="border" variant="primary" />}

      {/* ========= TABLA ========= */}
        {!loading && sesiones.length > 0 && (
        <Table bordered hover size="sm" responsive className="table-tutoria">
          <thead className="table-light">
            <tr>
              <th style={{ width: "5%", textAlign: "center" }}>Nro.</th>
              <th>Descripción</th>
              <th style={{ width: "10%", textAlign: "center" }}>Fecha</th>
              <th style={{ width: "10%", textAlign: "center" }}>
                Estado <small className="text-muted">({porcentaje}%)</small>
              </th>
              <th>Opciones</th>

              
            </tr>
          </thead>

          <tbody>
            {sesiones.map((sesion, index) => (
              <tr key={`ses-${semestre}-${sesion.sesion}`}>
                <td style={{ textAlign: "center" }}>{index + 1}</td>
                <td>{sesion.descripcion}</td>
                <td style={{ textAlign: "center" }}>{formatearFecha(sesion.fecha)}</td>

                <td style={{ textAlign: "center" }}>
                  {Number(sesion.activo) === 1 ? (
                    <span className="badge bg-primary">Concluida</span>
                  ) : (
                    <span className="badge bg-danger">Pendiente</span>
                  )}
                </td>

                <td style={{ textAlign: "center" }}>
              {/* 🔒 Si la sesión está concluida → mostrar mensaje y ocultar botones */}
              {Number(sesion.activo) === 1 ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 14px",
                    background: "#e9ecef",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    color: "#555",
                    fontSize: "14px",
                    border: "1px solid #ccc",
                  }}
                >
                  <i className="fa fa-lock"></i> Sesión cerrada
                </span>
              ) : (
                <>
                  {/* Libro */}
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="me-1 btn-icon"
                    onClick={async () => {
                      const persona = usuario.docente.persona;
                      const semana = sesion.sesion;
                      const token = usuario?.codigotokenautenticadorunj;

                      try {
                        const datosReco = await obtenerRecomendacion(
                          persona,
                          semestre,
                          semana,
                          token
                        );

                        const escapeHtml = (text) =>
                          String(text || "")
                            .replace(/&/g, "&amp;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")
                            .replace(/"/g, "&quot;")
                            .replace(/'/g, "&#039;");

                        const logroActual = escapeHtml(datosReco.logrozet);
                        const dificultadActual = escapeHtml(datosReco.dificultadzet);
                        const recomendacionActual =
                          escapeHtml(datosReco.recomendacionzet);

                        Swal.fire({
                          title: "📘 Logros, dificultades y recomendaciones",
                          width: "650px",
                          html: `
                              <div style="text-align:left; font-size:15px; padding:5px;">
                                <p><b>Sesión:</b> ${escapeHtml(
                                  datosReco.descripcion
                                )}</p>
                                <label><b>Logro:</b></label>
                                <textarea id="logro" style="width:100%; min-height:70px;">${logroActual}</textarea>
                                <label><b>Dificultad:</b></label>
                                <textarea id="dificultad" style="width:100%; min-height:70px;">${dificultadActual}</textarea>
                                <label><b>Recomendación:</b></label>
                                <textarea id="recomendacion" style="width:100%; min-height:70px;">${recomendacionActual}</textarea>
                              </div>
                            `,
                          showCancelButton: true,
                          confirmButtonText: "Guardar",
                          cancelButtonText: "Cancelar",
                          preConfirm: () => {
                            const logro = document
                              .getElementById("logro")
                              .value.trim();
                            const dificultad = document
                              .getElementById("dificultad")
                              .value.trim();
                            const recomendacion = document
                              .getElementById("recomendacion")
                              .value.trim();
                            return { logro, dificultad, recomendacion };
                          },
                        }).then(async (result) => {
                          if (result.isConfirmed) {
                            const { logro, dificultad, recomendacion } =
                              result.value;
                            const res = await guardarRecomendacion(
                              persona,
                              semestre,
                              semana,
                              logro,
                              dificultad,
                              recomendacion,
                              token
                            );
                            if (res.error === 0) {
                              Swal.fire("✅ Guardado", res.mensaje, "success");
                            } else {
                              Swal.fire(
                                "⚠️ Aviso",
                                res.mensaje ||
                                  "No se pudo guardar la información",
                                "warning"
                              );
                            }
                          }
                        });
                      } catch (err) {
                        Swal.fire(
                          "❌ Error",
                          "No se pudo cargar la información previa",
                          "error"
                        );
                        console.error(err);
                      }
                    }}
                  >
                    <i className="fa fa-book icono-verde"></i>
                  </Button>

                  {/* Foto */}
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="me-1 btn-icon"
                    onClick={() => {
                      let vistaPrevia = "";
                      Swal.fire({
                        title: "📸 Subir foto de la sesión",
                        html: `
                              <div style="text-align:left; font-size:15px;">
                                <p><b>Sesión:</b> ${sesion.descripcion}</p>
                                <input type="file" id="foto" accept="image/*"
                                  style="margin-top:10px; display:block; width:100%; border:1px solid #ccc; border-radius:6px; padding:8px;" />
                                <div id="preview" style="margin-top:10px; text-align:center;"></div>
                                <small style="color:#666;">Formatos permitidos: JPG, PNG, HEIC. Tamaño máx: 2 MB.</small>
                              </div>
                            `,
                        showCancelButton: true,
                        confirmButtonText: "Subir",
                        cancelButtonText: "Cancelar",
                        focusConfirm: false,
                        didOpen: () => {
                          const fileInput = document.getElementById("foto");
                          const preview = document.getElementById("preview");

                          fileInput.addEventListener("change", (event) => {
                            const file = event.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                vistaPrevia = `
                                        <img src="${e.target.result}"
                                            alt="Vista previa"
                                            style="max-width:100%; max-height:200px; border-radius:10px; margin-top:10px; box-shadow:0 0 6px rgba(0,0,0,0.2);" />
                                      `;
                                preview.innerHTML = vistaPrevia;
                              };
                              reader.readAsDataURL(file);
                            } else {
                              preview.innerHTML = "";
                            }
                          });
                        },
                        preConfirm: () => {
                          const fileInput = document.getElementById("foto");
                          const file = fileInput.files[0];
                          if (!file) {
                            Swal.showValidationMessage(
                              "Debe seleccionar una imagen antes de subir."
                            );
                            return false;
                          }
                          if (
                            !["image/jpeg", "image/png", "image/heic"].includes(
                              file.type
                            )
                          ) {
                            Swal.showValidationMessage(
                              "Formato no válido. Solo JPG, PNG o HEIC."
                            );
                            return false;
                          }
                          if (file.size > 2 * 1024 * 1024) {
                            Swal.showValidationMessage(
                              "La imagen supera los 2 MB permitidos."
                            );
                            return false;
                          }
                          return file;
                        },
                      }).then((result) => {
                        if (result.isConfirmed) {
                          const foto = result.value;
                          const token = usuario?.codigotokenautenticadorunj;
                          const formData = new FormData();
                          formData.append("foto", foto);
                          formData.append("persona", usuario.docente.persona);
                          formData.append("semestre", semestre);
                          formData.append("sesion", sesion.sesion);

                          fetch(`${config.apiUrl}api/Tutoria/subir-foto`, {
                            method: "POST",
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                            body: formData,
                          })
                            .then((res) => res.json())
                            .then((data) => {
                              if (data.success) {
                                confetti({
                                  particleCount: 150,
                                  spread: 80,
                                  origin: { y: 0.6 },
                                });

                                Swal.fire({
                                  title: "✨ ¡Foto subida con éxito!",
                                  text: "Evidencia guardada correctamente.",
                                  icon: "success",
                                  confirmButtonText: "Aceptar",
                                }).then(() => {
                                  cargarSesiones();
                                });
                              } else {
                                Swal.fire(
                                  "⚠️ Error",
                                  data.message ||
                                    "No se pudo subir la imagen.",
                                  "error"
                                );
                              }
                            })
                            .catch(() =>
                              Swal.fire(
                                "❌ Error",
                                "Error de conexión con el servidor.",
                                "error"
                              )
                            );
                        }
                      });
                    }}
                  >
                    <i className="far fa-smile icono-amarillo"></i>
                  </Button>

                  {/* Asistencia */}
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="me-1 btn-icon"
                    onClick={() => handleAccion("asis", sesion)}
                  >
                    <i className="fa fa-male icono-azul"></i>
                  </Button>

                  {/* Editar */}
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="me-1 btn-icon"
                    onClick={() => handleAccion("edit", sesion)}
                  >
                    <i className="fa fa-edit icono-negro"></i>
                  </Button>

                  {/* Depurador */}
                  {/* <span className="badge bg-light text-dark me-1">
                    A:{String(!!sesion.tieneAsistencia)} F:
                    {String(!!sesion.tieneFoto)} act:
                    {Number(sesion.activo)}
                  </span> */}

                  {/* Concluir sesión */}
                  {Number(sesion.activo) === 0 &&
                    sesion.tieneAsistencia &&
                    sesion.tieneFoto && (
                      <Button
                        variant="outline-light"
                        size="sm"
                        className="me-1 btn-icon"
                        onClick={async () => {
                          const persona = usuario.docente.persona;
                          const token = usuario?.codigotokenautenticadorunj;

                          const ok = await Swal.fire({
                            title: "¿Marcar como concluida?",
                            text: `Sesión: ${sesion.descripcion}`,
                            icon: "question",
                            showCancelButton: true,
                            confirmButtonText: "Sí, concluir",
                            cancelButtonText: "Cancelar",
                          });

                          if (!ok.isConfirmed) return;

                          try {
                            const resp = await concluirSesion(
                              persona,
                              semestre,
                              sesion.sesion,
                              token
                            );
                            if (resp?.success) {
                              Swal.fire(
                                "✅ Concluida",
                                resp.message ||
                                  "La sesión fue marcada como concluida.",
                                "success"
                              );
                              cargarSesiones();
                            } else {
                              Swal.fire(
                                "⚠️ No se pudo concluir",
                                resp?.message || "Verifique las evidencias.",
                                "warning"
                              );
                            }
                          } catch (e) {
                            console.error(e);
                            Swal.fire(
                              "❌ Error",
                              "No se pudo concluir la sesión.",
                              "error"
                            );
                          }
                        }}
                      >
                        <i className="fa fa-check-circle icono-verde"></i>
                      </Button>
                    )}

                  {/* Eliminar */}
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="me-1 btn-icon"
                    onClick={async () => {
                      const persona = usuario.docente.persona;
                      const token = usuario?.codigotokenautenticadorunj;
                      const semana = sesion.sesion;

                      const confirm = await Swal.fire({
                        title: "¿Eliminar sesión?",
                        text: "Esta acción eliminará la sesión permanentemente.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Sí, eliminar",
                        cancelButtonText: "Cancelar",
                      });

                      if (confirm.isConfirmed) {
                        const res = await eliminarSesion(
                          persona,
                          semestre,
                          semana,
                          token
                        );
                        if (res.error === 0) {
                          Swal.fire("✅ Eliminado", res.mensaje, "success");
                          await cargarSesiones();
                        } else {
                          Swal.fire(
                            "⚠️ Aviso",
                            res.mensaje || "No se pudo eliminar",
                            "warning"
                          );
                        }
                      }
                    }}
                  >
                    <i className="fa fa-trash icono-rojo"></i>
                  </Button>
                </>
              )}
            </td>



              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default SesionesCiclo;
