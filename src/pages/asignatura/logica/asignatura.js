import axios from 'axios';
import config from "../../../config";

export const obtenermaterialguias = async (sede, semestre, escuela, curricula, curso, seccion, semana) => {
  
  try {
    //const usuario = JSON.parse(localStorage.getItem('usuario'));
    //const token = usuario?.token;

    const res = await axios.get(`${config.apiUrl}api/curso/Materialcurso/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${semana}`);

    
    if (Array.isArray(res.data) && res.data.length > 0) {
      return { datos: res.data, mensaje: '' };
    } else {
      return { datos: [], mensaje: res.data.mensaje || 'No se encontraron Material.' };
    }
  } catch (error) {
    console.error('Error al obtener datos:', error);
    return { datos: [], mensaje: 'Error al conectar con el servidor o acceso no autorizado.' };
  }

};

export const eliminarMaterialAlumno = async (cod, sede, semestre, escuela, curricula, curso, seccion, semana, token) => {
  try {
    const res = await axios.post(`${config.apiUrl}api/curso/eliminarMaterial`, {
      cod,
      sede,
      semestre,
      escuela,
      curricula,
      curso,
      seccion,
      semana
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return res.data;
  } catch (error) {
    console.error('Error al eliminar material:', error);
    return { exito: false, mensaje: 'Error al eliminar material' };
  }

};

export const eliminarTrabajoAlumno = async (cod, sede, semestre, escuela, curricula, curso, seccion, semana, token) => {
  try {
    const res = await axios.post(`${config.apiUrl}api/curso/eliminarTrabajo`, {
      cod,
      sede,
      semestre,
      escuela,
      curricula,
      curso,
      seccion,
      semana
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return res.data;
  } catch (error) {
    console.error('Error al eliminar Trabajo:', error);
    return { exito: false, mensaje: 'Error al eliminar Trabajo' };
  }

};

export const obtenerDatostrabajoguias = async (sede, semestre, escuela, curricula, curso, seccion, semana) => {
  
  try {
    //const usuario = JSON.parse(localStorage.getItem('usuario'));
    //const token = usuario?.token;

    const res = await axios.get(`${config.apiUrl}api/curso/Trabajocurso/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${semana}`);

    
    if (Array.isArray(res.data) && res.data.length > 0) {
      return { datos: res.data, mensaje: '' };
    } else {
      return { datos: [], mensaje: res.data.mensaje || 'No se encontraron Trabajos.' };
    }
  } catch (error) {
    console.error('Error al obtener datos:', error);
    return { datos: [], mensaje: 'Error al conectar con el servidor o acceso no autorizado.' };
  }

};






