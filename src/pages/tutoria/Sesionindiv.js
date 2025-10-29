import { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../context/UserContext";
import Swal from "sweetalert2";
import {
  obtenerSesionesIndividuales,
  obtenerSesionIndividual,
  obtenerAtencionesAlumno,
  obtenerDatosNuevaAtencion,
  grabarAtencionIndividual,
  obtenerAtencionParaEditar,
  actualizarAtencionIndividual
} from "./logica/DatosTutoria";

function SesionesIndividuales({ semestreValue }) {
  const { usuario } = useUsuario();

  // vista actual: "lista" (tabla de tutorados) o "detalle" (historial 1 alumno)
  const [vista, setVista] = useState("lista");

  // semestre activo
  const [semestre, setSemestre] = useState(semestreValue || "202501");

  // ---------------------------
  // estado de la vista LISTA
  // ---------------------------
  const [alumnos, setAlumnos] = useState([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);

  // ---------------------------
  // estado de la vista DETALLE
  // ---------------------------
  const [ctxAtencion, setCtxAtencion] = useState({
    semestre: "",
    tutorPersona: "",
    tutorUsuario: "",
    tutorNombre: "",
    alumnoPersona: "",
    alumnoCodigo: "",
    alumnoNombre: "",
    alumnoEstructura: "" // 👈 agregado para poder llamar combos/guardar derivación
  });

  const [atenciones, setAtenciones] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // =====================================================
  // Cargar lista de alumnos tutorados (vista "lista")
  // =====================================================
  const cargarAlumnos = async () => {
    if (!usuario || !usuario.docente) return;

    setLoadingAlumnos(true);

    const token = usuario.codigotokenautenticadorunj;

    const persona = usuario.docente.persona; // persona del tutor ("per")
    const docente = usuario.docente.usuario; // usuario/dni tutor ("doc")

    // Determinar escuela con fallbacks
    const escuelaFromUser =
      usuario.docente.estructura ||
      usuario.docente.escuela ||
      usuario.docente.cod_escuela ||
      usuario.docente.codigoescuela ||
      "";

    // si viene vacío mandamos "xx" (el backend lo convierte a '')
    const escuela = escuelaFromUser !== "" ? escuelaFromUser : "xx";

    const vperfil = "P02";

    console.log("👉 Llamando sesiones-individuales con:", {
      semestre,
      persona,
      docente,
      escuela,
      vperfil,
    });

    const resp = await obtenerSesionesIndividuales(
      semestre,
      persona,
      docente,
      escuela,
      vperfil,
      token
    );

    console.log("📦 Respuesta sesiones-individuales:", resp);

    if (resp.success) {
      // resp.data[i] debe incluir:
      // alumno, nombrecompletos, estructura, celular, email_institucional
      // semestre, tutorPersona, tutorUsuario, personaalumno
      setAlumnos(resp.data || []);
    } else {
      setAlumnos([]);
      Swal.fire(
        "⚠️",
        resp.message || "No se pudo cargar alumnos asignados.",
        "warning"
      );
    }

    setLoadingAlumnos(false);
  };

  // cargar cada vez que cambia semestre
  useEffect(() => {
    cargarAlumnos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semestre]);

  // =====================================================
  // Lupa 🔍 -> comentario / recomendación rápida del alumno
  // =====================================================
  const handleVerDetalleRapido = async (rowAlumno) => {
    // rowAlumno tiene:
    // semestre, tutorPersona, tutorUsuario, alumno, estructura
    const token = usuario.codigotokenautenticadorunj;
    const vperfil = "P02";

    const detalle = await obtenerSesionIndividual(
      rowAlumno.semestre,
      rowAlumno.tutorPersona,
      rowAlumno.tutorUsuario,
      rowAlumno.alumno,
      rowAlumno.estructura,
      vperfil,
      token
    );

    console.log("📄 Detalle rápido (lupa):", detalle);

    if (!detalle.success || !detalle.data) {
      Swal.fire(
        "⚠️",
        "No se pudo obtener la información del tutorando.",
        "warning"
      );
      return;
    }

    const d = detalle.data;

    Swal.fire({
      title: "👨‍🎓 Detalle del Tutorando",
      html: `
        <p><b>Alumno:</b> ${rowAlumno.alumno}</p>
        <p><b>Nombre:</b> ${rowAlumno.nombrecompletos}</p>
        <p><b>Estructura:</b> ${rowAlumno.estructura || "-"}</p>
        <p><b>Comentario:</b> ${d.comentario || "Sin comentario"}</p>
        <p><b>Recomendación:</b> ${d.recomendacion || "Sin recomendación"}</p>
      `,
      confirmButtonText: "Cerrar",
    });
  };

  // =====================================================
  // Utilidad: cargar historial de atenciones del alumno
  // =====================================================
  const cargarHistorialAtenciones = async (contexto) => {
    setLoadingDetalle(true);

    const token = usuario.codigotokenautenticadorunj;

    const resp = await obtenerAtencionesAlumno(
      contexto.per,        // per
      contexto.semestre,   // semestre
      contexto.doc,        // doc
      contexto.peralu,     // peralu
      contexto.alu,        // alu
      token
    );

    console.log("📝 Respuesta atenciones-individuales:", resp);

    if (resp.success) {
      // resp.data = [{ codigo, descripcion, fecha }, ...]
      setAtenciones(resp.data || []);
    } else {
      setAtenciones([]);
      Swal.fire(
        "⚠️",
        resp.message ||
          "No se pudo cargar el historial de atenciones del estudiante.",
        "warning"
      );
    }

    setLoadingDetalle(false);
  };

  // =====================================================
  // ✏ -> Abrir vista DETALLE con historial de atenciones
  // (equivalente a tut_atencion_detalle.php)
  // =====================================================
  const handleAbrirDetalleAlumno = async (rowAlumno) => {
    // rowAlumno viene de la lista principal y trae:
    // tutorPersona, tutorUsuario, personaalumno, alumno, semestre, nombrecompletos...

    const contexto = {
      per: rowAlumno.tutorPersona,         // persona del tutor
      semestre: rowAlumno.semestre,        // semestre
      doc: rowAlumno.tutorUsuario,         // dni/usuario tutor
      peralu: rowAlumno.personaalumno,     // persona del alumno
      alu: rowAlumno.alumno,               // código del alumno
      estructura: rowAlumno.estructura,    // 👈 agregamos la estructura aquí

      alumnoNombre: rowAlumno.nombrecompletos,
      tutorNombre: usuario.docente?.nombrecompleto || "",
    };

    console.log("🟠 Contexto para detalle alumno:", contexto);

    // validación defensiva antes de llamar API
    if (
      !contexto.per ||
      !contexto.semestre ||
      !contexto.doc ||
      !contexto.peralu ||
      !contexto.alu
    ) {
      Swal.fire(
        "⚠️",
        "Faltan datos internos (per / semestre / doc / peralu / alu).",
        "warning"
      );
      console.warn("rowAlumno recibido:", rowAlumno);
      return;
    }

    // seteamos info para cabecera de la vista detalle
    setCtxAtencion({
      semestre: contexto.semestre,
      tutorPersona: contexto.per,
      tutorUsuario: contexto.doc,
      tutorNombre: contexto.tutorNombre,
      alumnoPersona: contexto.peralu,
      alumnoCodigo: contexto.alu,
      alumnoNombre: contexto.alumnoNombre,
      alumnoEstructura: contexto.estructura || "" // 👈 guardamos estructura
    });

    // llamamos backend para traer historial
    await cargarHistorialAtenciones(contexto);

    setVista("detalle");
  };

  // =====================================================
  // ACCIONES EN LA VISTA DETALLE
  // =====================================================

  // botón "Regresar"
  const handleRegresarLista = () => {
    setVista("lista");
  };

  // botón "Nuevo" (ícono fa-file-o / + Derivación)
  const handleNuevoAtencion = async () => {
    // Usamos datos actuales del contexto (alumno seleccionado en vista detalle)
    const token = usuario.codigotokenautenticadorunj;

    // Armamos los parámetros que necesita la API para combos
    const per = ctxAtencion.tutorPersona;          // persona tutor
    const sem = ctxAtencion.semestre;              // semestre
    const doc = ctxAtencion.tutorUsuario;          // usuario docente
    const peralu = ctxAtencion.alumnoPersona;      // persona alumno
    const alu = ctxAtencion.alumnoCodigo;          // código alumno
    const estructura = ctxAtencion.alumnoEstructura; // escuela/programa

    if (!per || !sem || !doc || !peralu || !alu) {
      Swal.fire(
        "⚠️",
        "No se puede abrir el formulario. Faltan datos internos.",
        "warning"
      );
      return;
    }

    // 1. Cargar combos iniciales (motivos / áreas derivación / fechaHoy)
    const combosData = await obtenerDatosNuevaAtencion(
      per,
      sem,
      doc,
      peralu,
      alu,
      estructura,
      token
    );

    console.log("📥 Datos para nueva atención:", combosData);

    if (!combosData.success) {
      Swal.fire(
        "⚠️",
        combosData.message || "No se pudo cargar datos iniciales.",
        "warning"
      );
      return;
    }

    // Prearmar selects y campos
    const motivosOptions = (combosData.motivos || [])
      .map(
        (m) =>
          `<option value="${m.codigo}">${m.descripcion}</option>`
      )
      .join("");

    const areasOptions = (combosData.areas || [])
      .map(
        (a) =>
          `<option value="${a.codigo}">${a.descripcion}</option>`
      )
      .join("");

    const fechaHoy = combosData.fechaHoy || "";

    // 2. Mostrar Swal con el formulario completo (Descripción, Motivo, Fecha, Derivado, Observación)
    const { value: formValues } = await Swal.fire({
  title: "➕ Nueva Atención / Derivación",
  width: 650,
  html: `
    <style>
      .swal2-popup .form-wrap { font-size: .95rem; }
      .swal2-popup .row { margin-bottom: 12px; }
      .swal2-popup .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
      .swal2-popup label { font-weight: 600; display:block; margin-bottom: 6px; }
      .swal2-popup .swal2-input { width: 100%; margin: 0; }
      .swal2-popup select.swal2-input { height: 38px; }
      @media (max-width: 520px) {
        .swal2-popup .grid-2 { grid-template-columns: 1fr; }
      }
    </style>


    <div style="margin-bottom:12px;">
  <span style="font-weight:600;">Sesión:</span>
  <span style="margin-left:8px;">&laquo;&laquo; Automático &raquo;&raquo;</span>
</div>
    <div class="form-wrap" style="text-align:left;">
      
      <!-- Descripción -->
      <div class="row">
        <label for="swal-descripcion">Descripción:</label>
        <input id="swal-descripcion" class="swal2-input" placeholder="Describir brevemente la atención" />
      </div>

      <!-- Motivo / Fecha -->
      <div class="grid-2">
        <div>
          <label for="swal-motivo">Motivo:</label>
          <select id="swal-motivo" class="swal2-input">
            <option value="00">Seleccione...</option>
            ${motivosOptions}
          </select>
        </div>
        <div>
          <label for="swal-fecha-mostrar">Fecha:</label>
          <input id="swal-fecha-mostrar" class="swal2-input" value="${(fechaHoy || '').split('-').reverse().join('/')}" disabled />
          <input id="swal-fecha" type="hidden" value="${fechaHoy}" />
        </div>
      </div>

      <!-- Derivado / Observación -->
      <div class="grid-2">
        <div>
          <label for="swal-derivado">Derivado:</label>
          <select id="swal-derivado" class="swal2-input">
            ${areasOptions}
          </select>
        </div>
        <div>
          <label for="swal-observacion">Observación:</label>
          <input id="swal-observacion" class="swal2-input" placeholder="Observación / recomendación" />
        </div>
      </div>

    </div>
  `,
  focusConfirm: false,
  showCancelButton: true,
  confirmButtonText: "Grabar",
  cancelButtonText: "Cancelar",
  preConfirm: () => {
    const descripcion = document.getElementById("swal-descripcion").value.trim();
    const motivo = document.getElementById("swal-motivo").value;
    const fechaSel = document.getElementById("swal-fecha").value; // YYYY-MM-DD (hidden)
    const areaDerivada = document.getElementById("swal-derivado").value;
    const observacion = document.getElementById("swal-observacion").value.trim();

    if (!descripcion) {
      Swal.showValidationMessage("La descripción es obligatoria");
      return;
    }
    if (!fechaSel) {
      Swal.showValidationMessage("La fecha es obligatoria");
      return;
    }

    return { descripcion, motivo, fecha: fechaSel, areaDerivada, observacion };
  },
});


    // si canceló, salimos
    if (!formValues) {
      return;
    }

  

    // 3. Enviar al backend para grabar
    const respGrabar = await grabarAtencionIndividual(
      {
        per: per,                     // persona tutor
        semestre: sem,                // semestre
        doc: doc,                     // usuario docente
        peralu: peralu,               // persona alumno
        alu: alu,                     // código alumno
        estructura: estructura,       // estructura/escuela

        descripcion: formValues.descripcion,
        motivo: formValues.motivo,
        fecha: formValues.fecha,               // "YYYY-MM-DD"
        areaDerivada: formValues.areaDerivada, // "00" => no derivado
        observacion: formValues.observacion,
      },
      token
    );



    if (!respGrabar.success) {
      Swal.fire(
        "⚠️",
        respGrabar.message || "No se pudo guardar la atención.",
        "warning"
      );
      return;
    }

    await Swal.fire({
      icon: "success",
      title: "Guardado",
      text: "La atención fue registrada correctamente.",
    });

    // 4. Recargar historial de atenciones en la vista detalle
    await cargarHistorialAtenciones({
      per,
      semestre: sem,
      doc,
      peralu,
      alu,
    });
  };


  // ✅ Helper: si trabajamos con código en TEXTO PLANO
const extraerSesionDeCodigo = (codigo) => {
  try {
    return (codigo || "").substring(44, 46); // pos 44, largo 2
  } catch {
    return "";
  }
};

// ✏ Botón editar
const handleEditarAtencion = async (item) => {
  const token = usuario.codigotokenautenticadorunj;

  const per        = ctxAtencion.tutorPersona;
  const semestre   = ctxAtencion.semestre;
  const doc        = ctxAtencion.tutorUsuario;
  const peralu     = ctxAtencion.alumnoPersona;
  const alu        = ctxAtencion.alumnoCodigo;
  const estructura = String(ctxAtencion.alumnoEstructura || "").padStart(2, "0");

  // 👇 YA NO ADIVINAMOS. Viene del backend en el listado:
  const sesion = item?.sesion || "00";

  // 1) Traer data para editar (M)
  const datos = await obtenerAtencionParaEditar(per, semestre, doc, peralu, alu, estructura, sesion, token);
  if (!datos?.success) {
    Swal.fire("⚠️", datos?.message || "No se pudo obtener la atención.", "warning");
    return;
  }
  const info = datos.data || {};

  // 2) Catálogos
  const combosData = await obtenerDatosNuevaAtencion(per, semestre, doc, peralu, alu, estructura, token);
  if (!combosData?.success) {
    Swal.fire("⚠️", "No se pudieron cargar los catálogos.", "warning");
    return;
  }

  const motivosOptions = (combosData.motivos || [])
    .map(m => `<option value="${m.codigo}" ${m.codigo===info.motivo?'selected':''}>${m.descripcion}</option>`)
    .join("");

  const areasOptions = (combosData.areas || [])
    .map(a => `<option value="${a.codigo}" ${a.codigo===(info.areaDerivada||'00')?'selected':''}>${a.descripcion}</option>`)
    .join("");

  const fechaISO = (info.fecha && info.fecha.includes('-')) ? info.fecha : "";
  const fechaMostrar = fechaISO ? fechaISO.split('-').reverse().join('/') : "";

  // 3) Modal EDITAR (mismo layout)
  const { value: formValues } = await Swal.fire({
    title: "✏️ Modificar Atención / Derivación",
    width: 650,
    html: `
      <style>
        .swal2-popup .form-wrap { font-size: .95rem; }
        .swal2-popup .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        .swal2-popup label { font-weight: 600; display:block; margin-bottom: 6px; }
        .swal2-popup .swal2-input { width: 100%; margin: 0; }
        .swal2-popup select.swal2-input { height: 38px; }
      </style>

      <div class="form-wrap" style="text-align:left;">
        <div style="margin-bottom:12px;">
          <span style="font-weight:600;">Sesión:</span>
          <span style="margin-left:8px;">${sesion}</span>
        </div>

        <div style="margin-bottom:12px;">
          <label for="swal-descripcion">Descripción:</label>
          <input id="swal-descripcion" class="swal2-input" value="${(info.descripcion||'').replace(/"/g,'&quot;')}" />
        </div>

        <div class="grid-2">
          <div>
            <label for="swal-motivo">Motivo:</label>
            <select id="swal-motivo" class="swal2-input">
              <option value="00">Seleccione...</option>
              ${motivosOptions}
            </select>
          </div>
          <div>
            <label for="swal-fecha-mostrar">Fecha:</label>
            <input id="swal-fecha-mostrar" class="swal2-input" value="${fechaMostrar}" disabled />
            <input id="swal-fecha" type="hidden" value="${fechaISO}" />
          </div>
        </div>

        <div class="grid-2">
          <div>
            <label for="swal-derivado">Derivado:</label>
            <select id="swal-derivado" class="swal2-input">
              ${areasOptions}
            </select>
          </div>
          <div>
            <label for="swal-observacion">Observación:</label>
            <input id="swal-observacion" class="swal2-input" value="${(info.observacion||'').replace(/"/g,'&quot;')}" />
          </div>
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Guardar cambios",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const descripcion = document.getElementById("swal-descripcion").value.trim();
      const motivo = document.getElementById("swal-motivo").value;
      const fechaSel = document.getElementById("swal-fecha").value;
      const areaDerivada = document.getElementById("swal-derivado").value;
      const observacion = document.getElementById("swal-observacion").value.trim();

      if (!descripcion) return Swal.showValidationMessage("La descripción es obligatoria");
      if (!fechaSel)     return Swal.showValidationMessage("La fecha es obligatoria");

      return { descripcion, motivo, fecha: fechaSel, areaDerivada, observacion };
    },
  });

  if (!formValues) return;

  // 4) Actualizar (W)
  const resp = await actualizarAtencionIndividual({
    per, semestre, doc, peralu, alu, estructura,
    sesion,
    descripcion: formValues.descripcion,
    motivo: formValues.motivo,
    fecha: formValues.fecha,
    areaDerivada: formValues.areaDerivada,
    observacion: formValues.observacion,
  }, token);

  if (!resp?.success) {
    Swal.fire("⚠️", resp?.message || "No se pudo actualizar.", "warning");
    return;
  }

  await Swal.fire({ icon: "success", title: "Actualizado", text: "Cambios guardados correctamente." });

  // 5) Recargar historial
  await cargarHistorialAtenciones({ per, semestre, doc, peralu, alu });
};




  // botón eliminar (ícono fa-ban)
  const handleEliminarAtencion = (item) => {
    Swal.fire({
      icon: "warning",
      title: "¿Eliminar?",
      text: `¿Seguro que deseas eliminar la atención ${item.codigo}?`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((r) => {
      if (r.isConfirmed) {
        Swal.fire(
          "🗑 Eliminado",
          "Eliminar pendiente de implementar en backend.",
          "success"
        );
      }
    });
  };

  // =====================================================
  // RENDER: VISTA LISTA (todos los tutorados)
  // =====================================================
  const renderLista = () => (
    <div className="container mt-3">
      {/* Selección Semestre */}
      <div className="mb-3 row align-items-center">
        <div className="col-md-1">
          <label className="form-label">
            <strong>Semestre:</strong>
          </label>
        </div>
        <div className="col-md-3">
          <SemestreSelect
            value={semestre}
            onChange={(v) => setSemestre(v)}
            name="cboSemestre"
          />
        </div>
      </div>

      {/* Docente Tutor + botón imprimir */}
      <div className="d-flex justify-content-between mb-2">
        <div>
          <strong>Docente Tutor:</strong>{" "}
          {usuario?.docente?.nombrecompleto || "Sin nombre"}
        </div>

        <div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => Swal.fire("🖨", "Impresión en desarrollo")}
          >
            <i className="fa fa-print"></i> Registro de reuniones
          </Button>
        </div>
      </div>

      {/* Tabla alumnos */}
      {loadingAlumnos ? (
        <Spinner animation="border" />
      ) : (
        <Table
          bordered
          hover
          size="sm"
          responsive
          className="table-tutoria"
          style={{ backgroundColor: "white" }}
        >
          <thead className="table-light text-center">
            <tr>
              <th style={{ width: "10%" }}>Código</th>
              <th>Apellidos y Nombres</th>
              <th style={{ width: "5%" }}>Esc.</th>
              <th style={{ width: "10%" }}>Teléfono</th>
              <th style={{ width: "20%" }}>Email</th>
              <th style={{ width: "10%" }}>Acción</th>
            </tr>
          </thead>

          <tbody>
            {alumnos.map((a, i) => (
              <tr key={i}>
                <td className="text-center">{a.alumno || "-"}</td>
                <td>{a.nombrecompletos || "-"}</td>
                <td className="text-center">{a.estructura || "-"}</td>
                <td className="text-center">{a.celular || "-"}</td>
                <td>{a.email_institucional || "-"}</td>
                <td className="text-center">
                  {/* 🔍: ver comentario / recomendación rápida */}
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="me-1 btn-icon"
                    onClick={() => handleVerDetalleRapido(a)}
                    title="Ver detalle breve"
                  >
                    <i className="fa fa-search icono-azul"></i>
                  </Button>

                  {/* ✏: ver historial de atenciones */}
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="me-1 btn-icon"
                    onClick={() => handleAbrirDetalleAlumno(a)}
                    title="Atenciones individuales"
                  >
                    <i className="fa fa-edit icono-negro"></i>
                  </Button>
                </td>
              </tr>
            ))}

            {alumnos.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No hay alumnos asignados.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );

  // =====================================================
  // RENDER: VISTA DETALLE (historial atenciones 1 alumno)
  // =====================================================
  const renderDetalle = () => (
    <div className="container mt-3">
      {/* Botón Regresar */}
      <div className="mb-2">
        <Button
          variant="link"
          size="sm"
          onClick={handleRegresarLista}
          style={{ textDecoration: "none" }}
        >
          <i className="fa fa-mail-reply"></i> Regresar
        </Button>
      </div>

      {/* Cabecera tipo bloque gris/amarillo del sistema antiguo */}
      <div
        className="mb-3 p-2"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #ddd",
          borderRadius: "6px",
          fontSize: "0.9rem",
          lineHeight: "1.3rem",
        }}
      >
        <div>
          <strong>Semestre:</strong> {ctxAtencion.semestre || "-"}
        </div>
        <div>
          <strong>Docente Tutor:</strong>{" "}
          {ctxAtencion.tutorNombre ||
            ctxAtencion.tutorPersona ||
            "-"}
        </div>
        <div>
          <strong>Estudiante:</strong>{" "}
          {ctxAtencion.alumnoNombre ||
            ctxAtencion.alumnoCodigo ||
            "-"}
        </div>
      </div>

      {/* Botón "Nuevo" alineado a la derecha */}
      <div className="d-flex justify-content-end mb-2">
        <button
          className="btn btn-light btn-sm border-secondary"
          style={{
            fontSize: "12px",
            lineHeight: 1.2,
            padding: "4px 8px",
          }}
          onClick={handleNuevoAtencion}
          title="Registrar derivación"
        >
          + Derivación
        </button>
      </div>

      {/* Tabla historial de atenciones */}
      {loadingDetalle ? (
        <Spinner animation="border" />
      ) : (
        <Table 
        bordered
          hover
          size="sm"
          responsive
          className="table-tutoria"
          style={{ backgroundColor: "white" }}
        >
          <thead className="table-light text-center">

            <tr>
              <th style={{ width: "10%" }}>Código</th>
              <th>Descripción</th>
              <th style={{ width: "12%" }}>Fecha</th>
              <th style={{ width: "12%" }}>Fecha_Atencion</th>
              <th style={{ width: "12%" }}>Estado</th>
              <th style={{ width: "15%" }}>Acción</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "0.8rem" }}>
            {atenciones.map((item, idx) => (
              <tr key={idx}>
                <td className="text-center">{item.codigo || "-"}</td>
                <td>{item.descripcion || ""}</td>
                <td className="text-center">{item.fecha || ""}</td>
                <td className="text-center">{item.fecha_atencion || ""}</td>
                <td className="text-center">{item.estado_atencion || ""}</td>

                <td className="text-center">
                  {/* Editar */}
                  <button
                    className="btn btn-light btn-sm border-secondary rounded-circle d-inline-flex align-items-center justify-content-center me-2"
                    style={{ width: "28px", height: "28px" }}
                    onClick={() => handleEditarAtencion(item)}
                    title="Editar"
                  >
                    <i
                      className="fa fa-edit"
                      style={{ color: "#1f98cfff", fontSize: "13px" }}
                    ></i>
                  </button>

                  {/* Eliminar */}
                  <button
                    className="btn btn-light btn-sm border-secondary rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: "28px", height: "28px" }}
                    onClick={() => handleEliminarAtencion(item)}
                    title="Eliminar"
                  >
                    <i
                      className="fa fa-ban"
                      style={{ color: "#970000ff", fontSize: "13px" }}
                    ></i>
                  </button>
                </td>
              </tr>
            ))}

            {atenciones.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  Sin atenciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );

  // =====================================================
  // Render final según vista
  // =====================================================
  return vista === "lista" ? renderLista() : renderDetalle();
}

export default SesionesIndividuales;
