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


export const obtenercargadocente = async (sede, semestre, personazet) => {
  try {
    //const res = await axios.get(`http://127.0.0.1:8000/api/alumno/${codigo}/${escuela}/${nivel}/${tipo}/${accion}`);
      const res = await axios.get(`${config.apiUrl}api/reportes/cargadocente/${sede}/${semestre}/${personazet}`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      return { datos: res.data, mensaje: '' };
    } else {
      return { datos: [], mensaje: res.data.mensaje || 'No se encontraron cursos.' };
    }
  } catch (err) {
    console.error('Error al obtener datos:', err);
    return null;
  }
};

export const obtenerNombreConfiguracion = async (tipo, parametros = {}) => {
  try {
    const response = await axios.get(`${config.apiUrl}api/configuraciones`, {
      params: {
        tipo,
        ...parametros  // extiende cualquier parámetro adicional
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error al obtener nombre para tipo "${tipo}" con parámetros:`, parametros, error);
    return null; // o podrías devolver un valor predeterminado como ""
  }
};


export const obtenerDatoshorariodocente = async (codigo, semestre, persona) => {
  try {
    //const res = await axios.get(`http://127.0.0.1:8000/api/alumno/${codigo}/${escuela}/${nivel}/${tipo}/${accion}`);
      const res = await axios.get(`${config.apiUrl}api/reportes/horariodocente/${codigo}/${semestre}/${persona}`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      return { datos: res.data, mensaje: '' };
    } else {
      return { datos: [], mensaje: res.data.mensaje || 'No se encontraron cursos.' };
    }
  } catch (err) {
    console.error('Error al obtener datos del alumno:', err);
    return null;
  }

};

export const obtenerDatoshorariodocentecalendario = async (persona, semestre) => {
  try {
    //const res = await axios.get(`http://127.0.0.1:8000/api/alumno/${codigo}/${escuela}/${nivel}/${tipo}/${accion}`);
      const res = await axios.get(`${config.apiUrl}api/reportes/horariodocentecalendario/${persona}/${semestre}`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      return { datos: res.data, mensaje: '' };
    } else {
      return { datos: [], mensaje: res.data.mensaje || 'No se encontraron cursos.' };
    }
  } catch (err) {
    console.error('Error al obtener datos del alumno:', err);
    return null;
  }

};