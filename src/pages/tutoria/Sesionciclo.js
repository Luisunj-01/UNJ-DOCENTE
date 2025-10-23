import { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../context/UserContext";
import config from "../../config";
import confetti from "canvas-confetti";


import { 
  obtenerSesionesCiclo, 
  guardarSesion, 
  obtenerTemasDisponibles, 
  obtenerRecomendacion,
  guardarRecomendacion,
  eliminarSesion,
   obtenerSesion,        // 👈 Agrega esto
  actualizarSesion 

} from "./logica/DatosTutoria";

import AsistenciaSesion from './componentes/AsistenciaSesion';
import Swal from "sweetalert2";


function SesionesCiclo({ semestreValue }) {
  const { usuario } = useUsuario();
  const [semestre, setSemestre] = useState(semestreValue || "202501");
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [ciclo, setCiclo] = useState("No asignado");  
  const [accion, setAccion] = useState(null);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const [temasDisponibles, setTemasDisponibles] = useState([]);
  const [cargandoTemas, setCargandoTemas] = useState(false); 

  // 🧩 Aquí puedes colocar la función de formateo
  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const partes = fecha.split("-");
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return fecha;
  };

  // ✅ Nueva función: cargarSesiones (para que funcione el botón eliminar)
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
      const { ciclo, datos, mensaje } = await obtenerSesionesCiclo(persona, semestre, token);

      if (datos && datos.length > 0) {
        setSesiones(datos);
        setCiclo(ciclo || "No asignado");
        setMensaje("");
      } else {
        setSesiones([]);
        setCiclo(ciclo || "No asignado");
        setMensaje(mensaje || "No se encontraron sesiones de ciclo.");
      }
    } catch (error) {
      console.error("❌ Error al cargar sesiones:", error);
      setSesiones([]);
      setMensaje("Error al obtener datos del servidor.");
    }

    setLoading(false);
  };

  // ✅ useEffect independiente para cargar temas disponibles
  useEffect(() => {
    if (!usuario || !usuario.docente) return;

    const cargarTemas = async () => {
      try {
        setCargandoTemas(true);
        const token = usuario?.codigotokenautenticadorunj;
        const persona = usuario?.docente?.persona;
        const temas = await obtenerTemasDisponibles(semestre, persona, token);

        // 🔹 Filtrar los temas que ya tienen sesión registrada
        const temasNoRegistrados = (temas || []).filter(
          (t) => !sesiones.some((s) => s.sesion === t.tema)
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
  }, [usuario, semestre, sesiones]); // 🔹 importante agregar "sesiones" aquí

  // 🧩 Cargar sesiones
  useEffect(() => {
    cargarSesiones();
  }, [semestre, usuario]);

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

    // 👉 Editar sesión
if (tipo === "edit") {
  const token = usuario?.codigotokenautenticadorunj;
  const persona = usuario.docente.persona;

  try {
    const { success, data, message } = await obtenerSesion(persona, semestre, sesion.sesion, token);
    if (!success) {
      Swal.fire("❌ Error", message, "error");
      return;
    }

    // 🧠 Convertir fecha dd/mm/yyyy → yyyy-mm-dd
    let fechaFormateada = "";
    if (data.fecha) {
      const partes = data.fecha.split("/");
      if (partes.length === 3) {
        const [dia, mes, anio] = partes;
        fechaFormateada = `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
      } else if (data.fecha.includes("-")) {
        fechaFormateada = data.fecha.split(" ")[0];
      }
    }

    // 🧩 Mostrar modal de edición
    Swal.fire({
      title: "✏️ Modificar sesión",
      width: "600px",
      html: `
        <table style="width:100%; text-align:left; border-collapse:collapse;">
          <tr>
            <td style="width:35%; padding:6px;"><b>Sesión:</b></td>
            <td>${data.descripcion}</td>
          </tr>
          <tr>
            <td style="padding:6px;"><label>Escuela y Nro. aula:</label></td>
            <td style="padding:6px;">
              <input id="aula" class="swal2-input" style="width:90%;" value="${data.link || ''}">
            </td>
          </tr>
          <tr>
            <td style="padding:6px;"><label>Fecha:</label></td>
            <td style="padding:6px;">
              <input id="fecha" type="date" class="swal2-input" style="width:60%;" value="${fechaFormateada || ''}">
            </td>
          </tr>
          <tr>
            <td style="padding:6px;"><label>Concluida:</label></td>
            <td style="padding:6px;">
              <input type="checkbox" id="activo" ${data.activo === 1 ? "checked" : ""}>
            </td>
          </tr>
        </table>
      `,
      showCancelButton: true,
      confirmButtonText: "Grabar",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => {
        const aula = document.getElementById("aula").value.trim();
        const fecha = document.getElementById("fecha").value;
        const activo = document.getElementById("activo").checked;
        if (!aula || !fecha) {
          Swal.showValidationMessage("Por favor complete todos los campos.");
          return false;
        }
        return { aula, fecha, activo };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { aula, fecha, activo } = result.value;

        // 🚀 Llamar al backend para actualizar
        const respuesta = await actualizarSesion(persona, semestre, sesion.sesion, aula, fecha, activo, token);

        if (respuesta.success) {
          Swal.fire("✅ Éxito", respuesta.message, "success");
          cargarSesiones(); // 🔄 Refresca la tabla
        } else {
          Swal.fire("⚠️ Error", respuesta.message, "warning");
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
      descripcion={sesionSeleccionada.descripcion} // 👈 NUEVO: pasamos la descripción
      onVolver={() => {
        setAccion(null);
        setSesionSeleccionada(null);
      }}
    />
  );
}


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

      {/* Leyenda */}
      <div className="alert alert-info py-2">
        <strong>Leyenda:</strong>&nbsp;
        <i className="fa fa-book"></i> Logros, dificultades y observaciones &nbsp;
        <i className="far fa-smile"></i> Subir imagen &nbsp;
        <i className="fa fa-male"></i> Asistencia y observaciones &nbsp;
        <i className="fa fa-edit"></i> Editar &nbsp;
        <i className="fa fa-ban"></i> Eliminar
      </div>

      {/* Docente y ciclo */}
      <div className="d-flex justify-content-between mb-2">
        <div>
          <strong>Docente Tutor:</strong>{" "}
          {usuario?.docente?.nombrecompleto || "Sin nombre"}
          <br />
          <strong>Ciclo:</strong> {ciclo}
        </div>
        <div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => Swal.fire("🖨 Registro de reuniones", "Función en desarrollo.")}
          >
            <i className="fa fa-print"></i> Registro de reuniones
          </Button>
        </div>
      </div>

      {/* Tabla */}
      {loading && <Spinner animation="border" variant="primary" />}
      {!loading && mensaje && <p>{mensaje}</p>}
      {!loading && sesiones.length > 0 && (
        <Table bordered hover size="sm" responsive>
  <thead className="table-light">
    <tr>
      <th style={{ width: "5%", textAlign: "center" }}>Nro.</th>
      <th>Descripción</th>
      <th style={{ width: "10%", textAlign: "center" }}>Fecha</th>
      <th style={{ width: "10%", textAlign: "center" }}>Estado</th>

      {/* 🔹 Botón "Nueva Sesión" centrado y sin bordes raros */}
      <th
        style={{
          width: "20%",
          textAlign: "center",
          border: "none",
          backgroundColor: "transparent",
          verticalAlign: "middle",
        }}
      >
        <Button
          variant="success"
          size="sm"
          style={{
            fontWeight: "bold",
            border: "none",
            boxShadow: "none",
          }}


              onClick={async () => {
  if (cargandoTemas) {
    Swal.fire("⏳", "Cargando temas disponibles...", "info");
    return;
  }

  if (!temasDisponibles.length) {
    Swal.fire("⚠️", "Ya no hay sesiones disponibles para este semestre.", "warning");
    return;
  }

  // Generar las opciones del combo
  const opcionesHtml = temasDisponibles
    .map(
      (t) => `<option value="${t.tema}">${t.tema} - ${t.descripcion}</option>`
    )
    .join("");

  // Mostrar el modal
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
        <tr>
          <td style="padding:6px;"><label>Concluida:</label></td>
          <td style="padding:6px;"><input type="checkbox" id="concluida"></td>
        </tr>
      </table>
    `,
    showCancelButton: true,
    confirmButtonText: "Grabar",
    cancelButtonText: "Cancelar",
    focusConfirm: false,
    preConfirm: () => {
      const sesion = document.getElementById("sesion").value;
      const aula = document.getElementById("aula").value.trim();
      const fecha = document.getElementById("fecha").value;
      const concluida = document.getElementById("concluida").checked ? 1 : 0;

      if (!sesion || !aula || !fecha) {
        Swal.showValidationMessage("Por favor complete todos los campos obligatorios.");
        return false;
      }

      return { sesion, aula, fecha, concluida };
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

          // Agregar a la tabla
          const temaSeleccionado = temasDisponibles.find(t => t.tema === sesion);
          setSesiones([
            ...sesiones,
            { descripcion: temaSeleccionado.descripcion, fecha, activo: concluida, sesion }
          ]);

          // Eliminar ese tema del combo
          setTemasDisponibles(prev => prev.filter(t => t.tema !== sesion));
        } else {
          Swal.fire("⚠️ Aviso", res.mensaje, "warning");
        }
      } catch (err) {
        Swal.fire("❌ Error", "No se pudo conectar con la API.", "error");
        console.error("Error inesperado:", err);
      }
    }
  });
}}
        ><i className="fa fa-plus"></i> Nueva Sesión
        </Button>
      </th>
    </tr>
  </thead>

  <tbody>
    {sesiones.map((sesion, index) => (
      <tr key={index}>
        <td style={{ textAlign: "center" }}>{index + 1}</td>
        <td>{sesion.descripcion}</td>
        <td style={{ textAlign: "center" }}>{formatearFecha(sesion.fecha)}</td>

        <td style={{ textAlign: "center" }}>
          {sesion.activo === 1 ? (
            <span className="badge bg-primary">Concluida</span>
          ) : (
            <span className="badge bg-danger">Pendiente</span>
          )}
        </td>
        <td style={{ textAlign: "center" }}>

          <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={async () => {
                    const persona = usuario.docente.persona;
                    const semana = sesion.sesion;
                    const token = usuario?.codigotokenautenticadorunj;

                    try {
                      const datosReco = await obtenerRecomendacion(persona, semestre, semana, token);

                // ✅ Verifica que los datos llegaron
                console.log("🧪 Datos recibidos:", datosReco);

                // ✅ Escapa caracteres especiales para evitar errores en el HTML
                const escapeHtml = (text) =>
                  String(text || "")
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");

                const logroActual = escapeHtml(datosReco.logrozet);
                const dificultadActual = escapeHtml(datosReco.dificultadzet);
                const recomendacionActual = escapeHtml(datosReco.recomendacionzet);
                console.log("✅ Datos para el modal:", {
                  logroActual,
                  dificultadActual,
                  recomendacionActual
                });
                  Swal.fire({
                    title: "📘 Logros, dificultades y recomendaciones",
                    width: "650px",
                    html: `
                      <div style="text-align:left; font-size:15px; padding:5px;">
                        <p><b>Sesión:</b> ${escapeHtml(datosReco.descripcion)}</p>

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
                      const logro = document.getElementById("logro").value.trim();
                      const dificultad = document.getElementById("dificultad").value.trim();
                      const recomendacion = document.getElementById("recomendacion").value.trim();
                      return { logro, dificultad, recomendacion };
                    },

                        }).then(async (result) => {
                          if (result.isConfirmed) {
                            const { logro, dificultad, recomendacion } = result.value;
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
                    Swal.fire("⚠️ Aviso", res.mensaje || "No se pudo guardar la información", "warning");
                  }
                }
              });
            } catch (err) {
              Swal.fire("❌ Error", "No se pudo cargar la información previa", "error");
              console.error(err);
            }
          }}
        >
          <i className="fa fa-book"></i>
        </Button>

          <Button
  variant="outline-secondary"
  size="sm"
  onClick={() => {
    let vistaPrevia = ""; // para guardar el HTML de la imagen temporal

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

        // 🔹 Escucha cambios del input para mostrar vista previa
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
          Swal.showValidationMessage("Debe seleccionar una imagen antes de subir.");
          return false;
        }

        // Validar tamaño y tipo
        if (!["image/jpeg", "image/png", "image/heic"].includes(file.type)) {
          Swal.showValidationMessage("Formato no válido. Solo se permite JPG, PNG o HEIC.");
          return false;
        }
        if (file.size > 2 * 1024 * 1024) {
          Swal.showValidationMessage("La imagen supera los 2 MB permitidos.");
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

            // 🎉 Lanza el confeti apenas se guarda correctamente
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 },
              colors: ["#bb0000", "#ffffff", "#00bb00", "#FFD700"],
            });

            // 💬 Luego muestra el mensaje de confirmación
            Swal.fire({
              title: "✨ ¡Foto subida con éxito!",
              text: "Tu evidencia fue guardada correctamente.",
              icon: "success",
              confirmButtonText: "Aceptar",
              confirmButtonColor: "#3085d6",
              showClass: { popup: "animate__animated animate__fadeInDown" },
              hideClass: { popup: "animate__animated animate__fadeOutUp" },
            });

                    } else {
                      Swal.fire("⚠️ Error", data.message || "No se pudo subir la imagen.", "error");
                    }
                  })
                  .catch(() => Swal.fire("❌ Error", "Error de conexión con el servidor.", "error"));

                      }
              });
            }}
            className="me-1"
          >
            <i className="far fa-smile"></i>
          </Button>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => handleAccion("asis", sesion)}
            className="me-1"
          >
            <i className="fa fa-male"></i>
          </Button>


          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => handleAccion("edit", sesion)}
            className="me-1"
          >
            <i className="fa fa-edit"></i>
          </Button>


          {/* Botón eliminar corregido */}
          <Button
            variant="outline-danger"
            size="sm"
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
                const res = await eliminarSesion(persona, semestre, semana, token);

                if (res.error === 0) {
                  Swal.fire("✅ Eliminado", res.mensaje, "success");
                  await cargarSesiones(); // 🔄 refresca la tabla
                } else {
                  Swal.fire("⚠️ Aviso", res.mensaje, "warning");
                }
              }
            }}
          >
            <i className="fa fa-trash"></i>
          </Button>


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
