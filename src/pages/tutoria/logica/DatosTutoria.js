import axios from "axios";
import config from "../../../config"; // ajusta según tu proyecto



/**
 * Obtiene los alumnos de un docente tutor por semestre
 */
export const obtenerAlumnosTutor = async (semestre, persona, docente, escuela = "", vperfil = "") => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${config.apiUrl}api/Tutoria/rendimiento/${semestre}/${persona}/${docente}/${escuela}/${vperfil}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.data && res.data.length > 0) {
      return { datos: res.data, mensaje: "" };
    } else {
      return { datos: null, mensaje: "No se encontraron datos de alumnos." };
    }
  } catch (err) {
    console.error("❌ Error al obtener alumnos:", err.response?.data || err.message);
    return { datos: null, mensaje: "Error al conectar con la API." };
  }
};
