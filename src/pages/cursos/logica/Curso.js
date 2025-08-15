// src/api/docente.js
import axios from 'axios';
import config from '../../../config';


// Función para obtener información del Docente
export const obtenerdatdocente = async (persona, docente, nivel, tipo, accion) => {
  try {
    
    const res = await axios.get(`${config.apiUrl}api/admin/docente/${persona}/${docente}/${nivel}/${tipo}/${accion}`);

    if (Array.isArray(res.data) && res.data.length > 0) {
      return { datos: res.data, mensaje: '' };
    } else {
      return { datos: [], mensaje: res.data.mensaje || 'No se encontraron datos del Docente.' };
    }
  } catch (err) {
    console.error('Error al obtener datos del Docente:', err);
    return { datos: null, mensaje: 'Error al conectar con el servidor o token inválido.' }; // ✅ siempre retorna objeto
  }
};


export const obtenerparticipantes = async (sede, semestre, escuela, curricula, curso, seccion, semana) => {
  
  try {
    //const usuario = JSON.parse(localStorage.getItem('usuario'));
    //const token = usuario?.token;

    const res = await axios.get(`${config.apiUrl}api/curso/ParticipanteGuias/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${semana}`);

    
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

export const obtenerdatosasistencia = async (sede, semestre, escuela, curricula, curso, seccion) => {
  
  try {
    //const usuario = JSON.parse(localStorage.getItem('usuario'));
    //const token = usuario?.token;

    const res = await axios.get(`${config.apiUrl}api/curso/Asistencias/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}`);

    
    if (Array.isArray(res.data) && res.data.length > 0) {
      return { datos: res.data, mensaje: '' };
    } else {
      return { datos: [], mensaje: res.data.mensaje || 'No se encontraron Datos.' };
    }
  } catch (error) {
    console.error('Error al obtener asistencia:', error);
    return { datos: [], mensaje: 'Error al conectar con el servidor o acceso no autorizado.' };
  }

};

export const obtenerDatosguias = async (sede, semestre, escuela, curricula, curso, seccion) => {
  try {
    const res = await axios.get(`${config.apiUrl}api/curso/Guias/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}`);
    
    if (Array.isArray(res.data) && res.data.length > 0) {
      return { datos: res.data, mensaje: '' };
    } else {
      return { datos: [], mensaje: res.data.mensaje || 'No se encontraron Guias.' };
    }
  } catch (error) {
    console.error('Error al obtener datos:', error);
    return { datos: [], mensaje: 'Error al conectar con el servidor o acceso no autorizado.' };
  }
};

export const obtenerMoficarasist = async (sede, semestre, escuela, curricula, curso, seccion) => {
  try {
    const res = await axios.get(`${config.apiUrl}api/curso/ModificarAsistencia/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}`);
    
    if (Array.isArray(res.data) && res.data.length > 0) {
      return { datos: res.data, mensaje: '' };
    } else {
      return { datos: [], mensaje: res.data.mensaje || 'No se encontraron datos.' };
    }
  } catch (error) {
    console.error('Error al obtener datos:', error);
    return { datos: [], mensaje: 'Error al conectar con el servidor o acceso no autorizado.' };
  }
};


