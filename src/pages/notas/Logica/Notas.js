// src/api/notas.js
import axios from 'axios';


// Función para obtener información de notas
export const obtenersemestre = async (semestre, persona, usuario, tipo) => {
  try {
    //const res = await axios.get(`http://127.0.0.1:8000/api/alumno/${codigo}/${escuela}/${nivel}/${tipo}/${accion}`);
    const res = await axios.get(`https://pydrsu.unj.edu.pe/apidocente3/api/Notas/${semestre}/${persona}/${usuario}/${tipo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (Array.isArray(res.data) && res.data.length > 0) {
      return { datos: res.data, mensaje: '' };
    } else {
      return { datos: [], mensaje: res.data.mensaje || 'No se encontraron datos.' };
    }
  } catch (err) {
    console.error('Error al obtener datos:', err);
    return null;
  }
};