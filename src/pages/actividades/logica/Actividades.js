import axios from "axios";
import config from "../../../config"; // ajusta si cambia la ruta

// 🔹 Export 1
export const obtenerDatosDocente = async (sede, semestre, persona) => {
  try {
    const res = await axios.get(
      `${config.apiUrl}api/actividades/docente/datos/${sede}/${semestre}/${persona}`
    );
    if (res.data) {
      return { datos: res.data, mensaje: "" };
    } else {
      return { datos: null, mensaje: "No se encontraron datos del docente." };
    }
  } catch (err) {
    console.error("Error al obtener datos docente:", err);
    return { datos: null, mensaje: "Error al conectar con la API." };
  }
};

// 🔹 Export 2
export const obtenerDatosHorario = async (sede, semestre, persona) => {
   
  try {
    const res = await axios.get(
      
      `${config.apiUrl}api/horario/datos/${sede}/${semestre}/${persona}`
     
    );
    if (res.data) {
      return { datos: res.data, mensaje: "" };
    } else {
      return { datos: null, mensaje: "No se encontraron datos del horario." };
    }
  } catch (err) {
    console.error("Error al obtener datos del horario:", err);
    return { datos: null, mensaje: "Error al conectar con la API." };
  }
};

export const obtenerhorariodocente = async (sede, semestre, personazet, token) => {
  try {
    const res = await axios.get(
      `${config.apiUrl}api/horario/horariosdocente/${sede}/${semestre}/${personazet}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,  // 🔑 El token del usuario
        },
      }
    );

    if (res.data.success) {
      return {
        cargaLectiva: res.data.cargaLectiva,
        horario: res.data.horario,
        mensaje: ''
      };
    } else {
      return { cargaLectiva: [], horario: [], mensaje: res.data.mensaje };
    }
  } catch (err) {
    console.error('Error al obtener datos:', err);
    return { cargaLectiva: [], horario: [], mensaje: 'Error al obtener el horario.' };
  }
};
