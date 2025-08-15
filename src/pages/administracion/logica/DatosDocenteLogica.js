// src/api/alumno.js
import axios from 'axios';
import config from '../../../config';


// Función para obtener información del Docente
export const obtenerdatdocente = async (persona, docente, nivel, tipo, accion, token) => {
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
