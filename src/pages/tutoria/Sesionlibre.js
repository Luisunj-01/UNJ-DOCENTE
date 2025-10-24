import { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
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
  const [semestre, setSemestre] = useState(semestreValue || "202501");
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accion, setAccion] = useState(null);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);

  // ✅ Formatear fecha (YYYY-MM-DD → DD/MM/YYYY)
  const formatearFecha = (fecha) => {
    if (!fecha) return "";
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
  if (fecha.includes("T")) return fecha.split("T")[0]; // formato ISO completo
  if (/^\d{4}-\d{2}-\d{2}/.test(fecha)) return fecha; // ya viene correcto
  if (/^\d{2}\/\d{2}\/\d{4}/.test(fecha)) {            // si viene como 22/10/2024
    const [d, m, y] = fecha.split("/");
    return `${y}-${m}-${d}`;
  }
  return "";
};


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
              <input type="checkbox" id="concluida" ${s.activo ? "checked" : ""}>
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

      {loading ? (
        <Spinner animation="border" variant="primary" />
      ) : (
        <Table bordered hover size="sm" responsive className="table-tutoria">
          <thead className="table-light">
            <tr>
              <th style={{ textAlign: "center", width: "5%" }}>Nro.</th>
              <th>Descripción</th>
              <th style={{ textAlign: "center", width: "10%" }}>Fecha</th>
              <th style={{ textAlign: "center", width: "10%" }}>Estado</th>
              <th style={{ textAlign: "center", width: "20%" }}>

     <Button
  variant="success"
  size="sm"
  style={{ fontWeight: "bold", border: "none", boxShadow: "none" }}
  onClick={async () => {
    const persona = usuario.docente.persona;
    const token = usuario?.codigotokenautenticadorunj;

    Swal.fire({
      title: "⏳ Cargando sesiones disponibles...",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });

    const disponibles = await obtenerSesionesLibresDisponibles(persona, semestre, token);
    console.log("🟢 Sesiones libres disponibles:", disponibles);
    Swal.close();

    if (!Array.isArray(disponibles) || disponibles.length === 0) {
      Swal.fire("⚠️", "Ya no hay sesiones disponibles para registrar.", "warning");
      return;
    }

    // ⚡ Modal con combo que usa las claves 'semana' y 'descripcion'
    Swal.fire({
      title: "🟢 Registrar nueva sesión libre",
      width: "650px",
      html: `
        <table style="width:100%; text-align:left; border-collapse:collapse;">
          <tr>
            <td style="width:30%; padding:6px;"><label>Semana:</label></td>
            <td style="padding:6px;">
              <select id="sesion" class="swal2-input" style="width:90%;">
                <option value="">-- Seleccione --</option>
                ${disponibles
                .map((d) => `<option value="${d.semana}">${d.semana}</option>`)
                .join("")}

              </select>
            </td>
          </tr>
          <tr>
            <td style="padding:6px;"><label>Descripción:</label></td>
            <td style="padding:6px;">
              <input id="descripcion" class="swal2-input" placeholder="Ingrese descripción" style="width:90%;">
            </td>
          </tr>
          <tr>
            <td style="padding:6px;"><label>Link:</label></td>
            <td style="padding:6px;">
              <input id="link" class="swal2-input" placeholder="Ingrese link" style="width:90%;">
            </td>
          </tr>
          <tr>
            <td style="padding:6px;"><label>Fecha:</label></td>
            <td style="padding:6px;">
              <input id="fecha" type="date" class="swal2-input" style="width:60%;">
            </td>
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
        const sesion = document.getElementById("sesion")?.value?.trim() || "";
        const descripcion = document.getElementById("descripcion")?.value?.trim() || "";
        const link = document.getElementById("link")?.value?.trim() || "";
        const fecha = document.getElementById("fecha")?.value?.trim() || "";
        const concluida = document.getElementById("concluida")?.checked ? 1 : 0;

        console.log("📋 Datos modal:", { sesion, descripcion, link, fecha, concluida });

        if (!sesion || !descripcion || !fecha) {
          Swal.showValidationMessage("Complete todos los campos obligatorios.");
          return false;
        }

        return { sesion, descripcion, link, fecha, concluida };
      },
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const { sesion, descripcion, link, fecha, concluida } = result.value;
      const res = await guardarSesionLibre(
        persona,
        semestre,
        sesion,
        descripcion,  // 👈 nuevo parámetro
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
  }}
>
  <i className="fa fa-plus"></i> Nueva Sesión
</Button>



              </th>
            </tr>
          </thead>
          <tbody>
            {sesiones.map((s, index) => (
              <tr key={index}>
                <td style={{ textAlign: "center" }}>{index + 1}</td>
                <td>{s.descripcion}</td>
                <td style={{ textAlign: "center" }}>{formatearFecha(s.fecha)}</td>
                <td style={{ textAlign: "center" }}>
                  {s.activo === 1 ? (
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
    </div>
  );
}

export default SesionesLibres;
