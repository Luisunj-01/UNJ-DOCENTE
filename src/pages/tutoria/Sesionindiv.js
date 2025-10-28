import { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../context/UserContext";
import Swal from "sweetalert2";
import {
  obtenerSesionesIndividuales,
  obtenerSesionIndividual,
  obtenerAtencionesAlumno,
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
    });

    // llamamos backend para traer historial
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
    setVista("detalle");
  };

  // =====================================================
  // ACCIONES EN LA VISTA DETALLE
  // =====================================================

  // botón "Regresar"
  const handleRegresarLista = () => {
    setVista("lista");
  };

  // botón "Nuevo" (ícono fa-file-o)
  const handleNuevoAtencion = () => {
    Swal.fire(
      "📝 Nuevo",
      "Aquí iremos con el formulario para registrar una nueva atención individual.",
      "info"
    );
  };

  // botón editar (ícono fa-edit)
  const handleEditarAtencion = (item) => {
    Swal.fire(
      "✏ Editar",
      `Aquí se editaría la atención código ${item.codigo}.`,
      "info"
    );
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
        <Table striped bordered size="sm" responsive>
          <thead className="text-center" style={{ fontSize: "0.8rem" }}>
            <tr>
              <th style={{ width: "10%" }}>Código</th>
              <th>Descripción</th>
              <th style={{ width: "12%" }}>Fecha</th>
              <th style={{ width: "15%" }}>Acción</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "0.8rem" }}>
            {atenciones.map((item, idx) => (
              <tr key={idx}>
                <td className="text-center">{item.codigo || "-"}</td>
                <td>{item.descripcion || ""}</td>
                <td className="text-center">{item.fecha || ""}</td>
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
