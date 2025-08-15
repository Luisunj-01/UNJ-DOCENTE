import axios from 'axios';
import config from '../../../config';

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