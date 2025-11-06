import { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../context/UserContext";
import { obtenerAlumnosTutor, guardarObservacion } from "./logica/DatosTutoria";
import Swal from "sweetalert2";
import config from "../../config"; // Ajusta la ruta según tu proyecto

function ObsRendimiento({ semestreValue }) {
  const { usuario } = useUsuario();
  const [semestre, setSemestre] = useState(semestreValue || "202501");
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!usuario || !usuario.docente) return;
    console.log("Usuario contexto:", usuario);

    const cargar = async () => {
      setLoading(true);

      const token = usuario?.codigotokenautenticadorunj;
      if (!token) {
        setMensaje("Token no disponible. Inicie sesión nuevamente.");
        setAlumnos([]);
        setLoading(false);
        return;
      }

      try {
        const escuela = usuario.docente.escuela ?? "P02";
        const vperfil = usuario.docente.vperfil ?? "G";
        const docenteDni = usuario.docente.numerodocumento || usuario.docente.usuario;
        const persona = usuario.docente.persona;

        const { datos, mensaje } = await obtenerAlumnosTutor(
          semestre,
          persona,
          docenteDni,
          escuela,
          vperfil,
          token
        );

        if (datos && datos.length > 0) {
          // 🔹 Consultar detalles de observación para cada alumno
          const alumnosConObs = await Promise.all(
            datos.map(async (alumno) => {
              const codigo =
                alumno.persona +
                alumno.docente +
                alumno.personaalumno +
                alumno.alumno +
                alumno.estructura +
                alumno.semestre;

              const detalle = await obtenerDetalleObservacion(codigo, token);
              return {
                ...alumno,
                obs: detalle?.comentario || alumno.obs || "",
                recomendacion: detalle?.recomendacion || alumno.recomendacion || "",
              };
            })
          );

          setAlumnos(alumnosConObs);
          setMensaje("");
        } else {
          setAlumnos([]);
          setMensaje(mensaje || "No se encontraron resultados.");
        }
      } catch (error) {
        console.error("❌ Error al cargar alumnos:", error);
        setAlumnos([]);
        setMensaje("Error al obtener datos del servidor.");
      }

      setLoading(false);
    };

    cargar();
  }, [semestre, usuario]);

  const handleChange = (value) => setSemestre(value);

  const obtenerDetalleObservacion = async (codigo, token) => {
    try {
      const respuesta = await fetch(`${config.apiUrl}api/Tutoria/detalle-observacion/${codigo}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await respuesta.json();
      if (data.success && data.data) {
        return data.data; // { comentario, recomendacion }
      } else {
        return { comentario: "", recomendacion: "" }; // si no hay registros
      }
    } catch (error) {
      console.error("Error al obtener detalle de observación:", error);
      return { comentario: "", recomendacion: "" };
    }
  };

  const handleObservacion = async (alumno, alumnos, setAlumnos, token) => {
    const { persona, docente, personaalumno, alumno: idAlumno, estructura, semestre } = alumno;

    if (!persona || !docente || !personaalumno || !idAlumno || !estructura || !semestre) {
      Swal.fire("Error", "Faltan datos necesarios para generar el código del alumno.", "error");
      return;
    }

    const codigo = persona + docente + personaalumno + idAlumno + estructura + semestre;

    // 🔹 Consultar detalle antes de abrir el modal
    const detalle = await obtenerDetalleObservacion(codigo, token);
    const comentarioPrevio = detalle?.comentario || alumno.obs || "";
    const recomendacionPrevia = detalle?.recomendacion || alumno.recomendacion || "";

    // 🔹 Mostrar SweetAlert con los datos existentes
    const { value: formValues } = await Swal.fire({
      title: `${alumno.nombrecompleto}`,
      html: `
        <label for="swal-comentario" style="font-weight:bold;">Comentario:</label>
        <textarea id="swal-comentario" class="swal2-textarea" placeholder="Ingrese el comentario">${comentarioPrevio}</textarea>
        
        <label for="swal-recomendacion" style="font-weight:bold; margin-top:10px;">Recomendación:</label>
        <textarea id="swal-recomendacion" class="swal2-textarea" placeholder="Ingrese la recomendación">${recomendacionPrevia}</textarea>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      width: "450px",
      preConfirm: () => {
        const comentario = document.getElementById("swal-comentario").value;
        const recomendacion = document.getElementById("swal-recomendacion").value;
        return { comentario, recomendacion };
      },
    });

    if (!formValues) return;

    try {
      const payload = {
        codigo,
        comentario: formValues.comentario,
        recomendacion: formValues.recomendacion,
      };

      const respuesta = await fetch(`${config.apiUrl}api/Tutoria/grabar-observacion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await respuesta.json();

      if (respuesta.ok && data.success) {
        const actualizados = alumnos.map((a) =>
          a.alumno === alumno.alumno
            ? { ...a, obs: formValues.comentario, recomendacion: formValues.recomendacion }
            : a
        );
        setAlumnos(actualizados);

        Swal.fire({
          icon: "success",
          title: "Guardado",
          text: "La observación y recomendación fueron registradas correctamente.",
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", data.message || "No se pudo guardar la observación", "error");
      }
    } catch (error) {
      console.error("Error al conectar con la API:", error);
      Swal.fire("Error", "Error al conectar con la API.", "error");
    }
  };

  // 🔹 Nueva función: mostrar ficha con datos del alumno
const handleVerFichaAlumno = (alumno) => {
  // 📦 Armamos el código con los 4 parámetros requeridos
  const codigoBase = `${alumno.alumno}|${alumno.estructura}|${alumno.curricula || "01"}|${semestre}`;
  const codigo = btoa(btoa(codigoBase)); // Doble codificación Base64

  Swal.fire({
    title: `<strong>${alumno.nombrecompleto}</strong>`,
    html: `
      <div style="text-align:left; line-height:1.8; font-size:0.95em;">
        <p><b>📘 Código:</b> ${alumno.alumno}</p>
        <p><b>🏫 Escuela:</b> ${alumno.nombreescuela}</p>
        <p><b>📘 Currícula:</b> ${alumno.curricula || "No registrada"}</p>
        <p><b>👨‍🏫 Tutor:</b> ${usuario?.docente?.nombrecompleto || "No asignado"}</p>

        <hr>
        <p style="color:#0d6efd; font-weight:bold;">🔎 Reportes disponibles</p>
        <a href="/tutoria/fichaMatricula?codigo=${codigo}" target="_blank">🧾 Ficha de Matrícula</a><br>
        <a href="#/tutoria/avanceAcademico?codigo=${codigo}" target="_blank">📊 Avance Académico</a><br>
        <a href="#/tutoria/horario?codigo=${codigo}" target="_blank">🕒 Horario</a><br>
        <a href="#/tutoria/record?codigo=${codigo}" target="_blank">📚 Record Académico</a>
      </div>
    `,
    width: "420px",
    showCloseButton: true,
    showConfirmButton: false,
  });
};


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

      {loading && <Spinner animation="border" variant="primary" />}
      {!loading && mensaje && <p>{mensaje}</p>}
      {!loading && alumnos.length > 0 && (
        <>
          {/* 👉 Aquí agregas el nombre del docente tutor */}
          <div className="p-2 mb-3 bg-light rounded border">
            <span className="fw-bold text-primary">Docente Tutor:</span>{" "}
            <span className="text-dark">{usuario?.docente?.nombrecompleto || "Sin nombre"}</span>
          </div>

          {/* Tabla de alumnos */}
          <Table bordered hover size="sm" responsive>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Escuela</th>
                <th>Segunda</th>
                <th>Tercera</th>
                <th>Cuarta</th>
                <th>Obs</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((alumno, index) => (
                <tr key={index}>
                  <td>{alumno.alumno}</td>
                  <td>
                    <button
                      onClick={() => handleVerFichaAlumno(alumno)}
                      className="btn btn-link p-0 text-primary fw-semibold"
                      style={{ textDecoration: "none", cursor: "pointer" }}
                    >
                      {alumno.nombrecompleto}
                    </button>
                    <div style={{ fontSize: "0.8em", color: "#0e0f0fff" }}>{alumno.nombreescuela}</div>
                  </td>
                  <td>{alumno.telefono}</td>
                  <td>{alumno.estructura}</td>

                  {/* 👉 Texto largo se adapta al ancho y hace salto de línea */}
                  <td style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", maxWidth: "200px" }}>
                    {alumno.segunda}
                  </td>
                  <td style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", maxWidth: "200px" }}>
                    {alumno.tercera}
                  </td>
                  <td style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", maxWidth: "200px" }}>
                    {alumno.cuarta}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() =>
                        handleObservacion(alumno, alumnos, setAlumnos, usuario?.codigotokenautenticadorunj)
                      }
                    >
                      📝
                    </Button>

                    <span className="ms-2">
                      {alumno.obs ? (
                        <small className="text-success">✔</small>
                      ) : (
                        <small className="text-muted">Sin obs.</small>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
}

export default ObsRendimiento;
