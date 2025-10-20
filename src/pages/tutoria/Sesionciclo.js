import { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../context/UserContext";
import { obtenerSesionesCiclo, guardarSesion, obtenerTemasDisponibles   } from "./logica/DatosTutoria"; // función nueva
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



  // 🧩 Cargar sesiones
  useEffect(() => {
    if (!usuario || !usuario.docente) return;

    const cargar = async () => {
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
          setCiclo(ciclo || "No asignado"); // ✅ nuevo
          setMensaje("");
        } else {
          setSesiones([]);
          setCiclo(ciclo || "No asignado"); // ✅ nuevo
          setMensaje(mensaje || "No se encontraron sesiones de ciclo.");
        }
      } catch (error) {
        console.error("❌ Error al cargar sesiones:", error);
        setSesiones([]);
        setMensaje("Error al obtener datos del servidor.");
      }

      setLoading(false);
    };

    cargar();
  }, [semestre, usuario]);


  const handleChange = (value) => setSemestre(value);


  const handleAccion = (tipo, sesion) => {
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
      onVolver={() => {
        setAccion(null);             // 🔹 Limpia la acción
        setSesionSeleccionada(null); // 🔹 Limpia la sesión
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
  const token = usuario?.codigotokenautenticadorunj;
  const persona = usuario?.docente?.persona;

  // 🧩 1️⃣ Cargar sesiones disponibles desde API
  const temas = await obtenerTemasDisponibles(semestre, persona, token);

  if (!temas.length) {
    Swal.fire("⚠️", "No hay sesiones disponibles para este semestre.", "warning");
    return;
  }

  // 🧩 2️⃣ Generar las opciones HTML para el combo
  const opcionesHtml = temas
    .map(
      (t) =>
        `<option value="${t.tema}">${t.tema} - ${t.descripcion}</option>`
    )
    .join("");

  // 🧩 3️⃣ Mostrar modal con combo real
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
  }).then((result) => {
    if (result.isConfirmed) {
    const { sesion, aula, fecha, concluida } = result.value;

    const codigo = btoa(btoa(usuario.docente.persona + semestre));
    const token = usuario?.codigotokenautenticadorunj;

    guardarSesion(codigo, sesion, aula, fecha, concluida, "N", token)
      .then((resp) => {
        if (resp.exito) {
          Swal.fire("✅ Guardado", resp.mensaje, "success");

          // 🔹 Aquí debes obtener el texto limpio de la sesión
          const sesionSelect = document.getElementById("sesion");
          const sesionTexto = sesionSelect.options[sesionSelect.selectedIndex].text;
          const sesionTextoLimpio = sesionTexto.replace(/^\d+\s*[-.]\s*/, '');

          // 🔹 Refrescar la tabla con el texto limpio
          setSesiones([
            ...sesiones,
            {
              descripcion: sesionTextoLimpio,
              fecha,
              activo: concluida,
              sesion // opcional si lo necesitas para otras acciones
            }
          ]);
        } else {
          Swal.fire("⚠️ Error", resp.mensaje, "warning");
        }
      })
      .catch(() =>
        Swal.fire("❌ Error", "No se pudo conectar con el servidor.", "error")
      );
  }
  });
}}

        >
          <i className="fa fa-plus"></i> Nueva Sesión
        </Button>
      </th>
    </tr>
  </thead>

  <tbody>
    {sesiones.map((sesion, index) => (
      <tr key={index}>
        <td style={{ textAlign: "center" }}>{index + 1}</td>
        <td>{sesion.descripcion}</td>
        <td style={{ textAlign: "center" }}>{sesion.fecha}</td>
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
            onClick={() => {
              Swal.fire({
                title: `📘 Logros, dificultades y observaciones`,
                width: "650px", // 🔹 un poco más ancho
                customClass: {
                  popup: "no-scroll-modal", // 🔹 clase personalizada
                },
                html: `
                  <div style="text-align:left; font-size:15px; padding:5px;">
                    <p style="margin-bottom:15px;">
                      <b>Sesión:</b> ${sesion.descripcion}
                    </p>

                    <div style="margin-bottom:12px;">
                      <label style="font-weight:bold;">Logro:</label><br>
                      <textarea id="logro"
                        placeholder="Ingrese los logros"
                        style="width:100%; min-height:70px; border-radius:6px; border:1px solid #ccc; padding:8px; resize:none; font-size:14px;"></textarea>
                    </div>

                    <div style="margin-bottom:12px;">
                      <label style="font-weight:bold;">Dificultad:</label><br>
                      <textarea id="dificultad"
                        placeholder="Ingrese las dificultades"
                        style="width:100%; min-height:70px; border-radius:6px; border:1px solid #ccc; padding:8px; resize:none; font-size:14px;"></textarea>
                    </div>

                    <div style="margin-bottom:5px;">
                      <label style="font-weight:bold;">Recomendación:</label><br>
                      <textarea id="recomendacion"
                        placeholder="Ingrese recomendaciones"
                        style="width:100%; min-height:70px; border-radius:6px; border:1px solid #ccc; padding:8px; resize:none; font-size:14px;"></textarea>
                    </div>
                  </div>
                `,
                showCancelButton: true,
                confirmButtonText: "Guardar",
                cancelButtonText: "Cancelar",
                focusConfirm: false,
                preConfirm: () => {
                  const logro = document.getElementById("logro").value.trim();
                  const dificultad = document.getElementById("dificultad").value.trim();
                  const recomendacion = document.getElementById("recomendacion").value.trim();

                  if (!logro && !dificultad && !recomendacion) {
                    Swal.showValidationMessage("Debe ingresar al menos un campo antes de guardar.");
                    return false;
                  }

                  return { logro, dificultad, recomendacion };
                },
              }).then((result) => {
                if (result.isConfirmed) {
                  const { logro, dificultad, recomendacion } = result.value;
                  console.log("💾 Datos guardados:", {
                    sesion: sesion.descripcion,
                    logro,
                    dificultad,
                    recomendacion,
                  });

                  Swal.fire(
                    "✅ Guardado",
                    "Las observaciones fueron registradas correctamente.",
                    "success"
                  );
                }
              });
            }}
            className="me-1"
          >
            <i className="fa fa-book"></i>
          </Button>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              Swal.fire({
                title: "📸 Subir foto de la sesión",
                html: `
                  <div style="text-align:left; font-size:15px;">
                    <p><b>Sesión:</b> ${sesion.descripcion}</p>
                    <input type="file" id="foto" accept="image/*"
                      style="margin-top:10px; display:block; width:100%; border:1px solid #ccc; border-radius:6px; padding:8px;" />
                    <small style="color:#666;">Formatos permitidos: JPG, PNG, HEIC. Tamaño máx: 2 MB.</small>
                  </div>
                `,
                showCancelButton: true,
                confirmButtonText: "Subir",
                cancelButtonText: "Cancelar",
                focusConfirm: false,
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

                  // 🔹 Crear un FormData para enviar al backend
                  const formData = new FormData();
                  formData.append("foto", foto);
                  formData.append("sesion", sesion.sesion);
                  formData.append("descripcion", sesion.descripcion);

                  // 🔹 Llamada al backend (ajusta la URL según tu API)
                  fetch("https://tuapi.unj.edu.pe/api/Tutoria/subir-foto", {
                    method: "POST",
                    body: formData,
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.ok) {
                        Swal.fire("✅ Éxito", "La foto fue subida correctamente.", "success");
                      } else {
                        Swal.fire("⚠️ Error", "No se pudo subir la imagen.", "error");
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


          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleAccion("elim", sesion)}
          >
            <i className="fa fa-ban"></i>
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
