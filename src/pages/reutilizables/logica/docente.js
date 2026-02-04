// src/pages/reutilizables/logica/docente.js
import axios from 'axios';
import config from '../../../config';


// Función para obtener información del alumno
export const obtenersemestre = async (codigo) => {
  try {
    const res = await axios.get(`${config.apiUrl}api/Reportedoc/semestre/202002/${codigo}`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      return { datos: res.data, mensaje: '' };
    } else {
      return { datos: [], mensaje: res.data.mensaje || 'No se encontraron cursos.' };
    }
  } catch (err) {
    console.error('Error al obtener datos del Docente:', err);
    return null;
  }
};

export const obtenersemestre2 = async (codigo) => {
  try {
    const res = await axios.get(`${config.apiUrl}api/Reportedoc/semestre2/${codigo}`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      return { datos: res.data, mensaje: '' };
    } else {
      return { datos: [], mensaje: res.data.mensaje || 'No se encontraron cursos.' };
    }
  } catch (err) {
    console.error('Error al obtener datos del Docente:', err);
    return null;
  }
};

export const obtenersemana = async (sede, semestre, escuela, curricula, curso, seccion) => {
  try {
    const res = await axios.get(`${config.apiUrl}api/Reportedoc/semana/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      return { datos: res.data, mensaje: '' };
    } else {
      return { datos: [], mensaje: res.data.mensaje || 'No se encontraron cursos.' };
    }
  } catch (err) {
    console.error('Error al obtener datos del Docente:', err);
    return null;
  }
};

// Función para obtener los cursos de prematrícula
export const obtenerCursosPrematricula = async (
  semestre,
  persona,
  usuario,
  tipo
) => {
  try {
    const res = await axios.get(
      `${config.apiUrl}api/Asignatura/Silabo/${semestre}/${persona}/${usuario}/${tipo}`
    );

    return {
      datos: Array.isArray(res.data) ? res.data : [],
      mensaje: res.data?.mensaje || ''
    };
  } catch (error) {
    console.error('❌ Error al obtener cursos:', error);
    return {
      datos: [],
      mensaje: 'Error al conectar con el servidor'
    };
  }
};


export const obtenerdatosreu = async (id, tabla, tipocampo) => {

  try {
    //const usuario = JSON.parse(localStorage.getItem('usuario'));
    //const token = usuario?.token;

    const res = await axios.get(`${config.apiUrl}api/datosreu/${id}/${tabla}/${tipocampo}`);

    if (Array.isArray(res.data) && res.data.length > 0) {
      return { datos: res.data, mensaje: '' };
    } else {
      return { datos: [], mensaje: res.data.mensaje || 'No se encontraron cursos.' };
    }
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    return { datos: [], mensaje: 'Error al conectar con el servidor o acceso no autorizado.' };
  }
};


export const obtenerReza = async (semestre, persona, dni, codigotokenautenticadorunj) => {

  try {
    //const usuario = JSON.parse(localStorage.getItem('usuario'));
    //const token = usuario?.token;

    const res = await axios.get(`${config.apiUrl}api/Notas/registrezag/${semestre}/${persona}/${dni}`);

   
    if (Array.isArray(res.data) && res.data.length > 0) {
      return { datos: res.data, mensaje: '' };
    } else {
      return { datos: [], mensaje: res.data.mensaje || 'No se encontraron cursos.' };
    }
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    return { datos: [], mensaje: 'Error al conectar con el servidor o acceso no autorizado.' };
  }
};

export const obtenerAplaz = async (semestre, persona, dni, codigotokenautenticadorunj) => {

  try {
    //const usuario = JSON.parse(localStorage.getItem('usuario'));
    //const token = usuario?.token;

    const res = await axios.get(`${config.apiUrl}api/Notas/registaplaz/${semestre}/${persona}/${dni}`);

  
    if (Array.isArray(res.data) && res.data.length > 0) {
      return { datos: res.data, mensaje: '' };
    } else {
      return { datos: [], mensaje: res.data.mensaje || 'No se encontraron cursos.' };
    }
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    return { datos: [], mensaje: 'Error al conectar con el servidor o acceso no autorizado.' };
  }
};


export const obtenerConfiguracion = async (tipo, parametros = {}) => {
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

// Función para obtener el periodo académico actual desde aca_parametrosgenerales
export const obtenerPeriodoAcademicoActual = async (sede = '01') => {
  try {
    const res = await axios.get(
      `${config.apiUrl}api/Asignatura/parametrosgenerales/${sede}`
    );

    return {
      periodoacademico: res.data.periodoacademico,
      sem: res.data.sem,
      sem_cp: res.data.sem_cp,
      mensaje: ''
    };
  } catch (error) {
    console.error('❌ Error al obtener periodo académico:', error);
    return {
      periodoacademico: null,
      mensaje: 'No se pudo obtener el semestre'
    };
  }
};
