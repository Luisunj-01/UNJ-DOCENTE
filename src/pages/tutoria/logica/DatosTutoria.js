import axios from "axios";
import config from "../../../config"; // ajusta según tu proyecto


/**
 * Obtiene los alumnos de un docente tutor por semestre
 */

// 1.
export const obtenerAlumnosTutor = async (semestre, per, doc, escuela = "", vperfil = "", token) => {
  try {
   
    const url = `${config.apiUrl}api/Tutoria/rendimiento/${semestre}/${per}/${doc}/${escuela}/${vperfil}`;
    const res = await axios.get(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      
      return { datos: res.data, mensaje: "" };
    } else {
      console.warn("⚠️ Sin datos de alumnos.");
      return { datos: null, mensaje: "No se encontraron datos de alumnos." };
    }

  } catch (err) {
    console.error("❌ Error al obtener alumnos:", err.response?.data || err.message);
    return { datos: null, mensaje: "Error al conectar con la API." };
  }
};

// 2.
export const obtenerSesionesCiclo = async (per, semestre, token) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/sesCiclo/${per}/${semestre}`;
    const res = await axios.get(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    // ✅ Verifica que la API trae las dos partes esperadas
    if (res.data && res.data.sesiones && Array.isArray(res.data.sesiones)) {
      return {
        ciclo: res.data.ciclo || "No asignado",
        datos: res.data.sesiones,
        mensaje: "",
      };
    } else {
      return { ciclo: "No asignado", datos: [], mensaje: "Sin datos de sesiones." };
    }

  } catch (err) {
    console.error("❌ Error al obtener sesiones ciclo:", err.response?.data || err.message);
    return { ciclo: "No asignado", datos: [], mensaje: "Error al conectar con la API." };
  }
};

// 3.
export const obtenerAsistenciaSesiones = async (persona, semestre, sesion, token) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/asistencia/${persona}/${semestre}/${sesion}`;
    const res = await axios.get(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.data?.success) {
      return { datos: res.data.data, mensaje: "" };
    } else {
      return { datos: null, mensaje: "No se pudieron cargar los datos." };
    }
  } catch (err) {
    console.error("❌ Error al obtener asistencia:", err.response?.data || err.message);
    return { datos: null, mensaje: "Error al conectar con la API." };
  }
};

// 4.
export const guardarAsistenciaSesiones = async (persona, semestre, sesion, detalles, token) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/asistencia/guardar`;
    const res = await axios.post(url, {
      persona,
      semestre,
      sesion,
      detalles,
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.data?.success) {
      return { exito: true, mensaje: "Asistencia guardada correctamente." };
    } else {
      return { exito: false, mensaje: res.data.message || "Error al guardar." };
    }
  } catch (err) {
    console.error("❌ Error al guardar asistencia:", err.response?.data || err.message);
    return { exito: false, mensaje: "Error al conectar con la API." };
  }
};








