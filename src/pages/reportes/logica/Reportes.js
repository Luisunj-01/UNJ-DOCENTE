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


export const obtenerguiasemana = async (sede, semestre, escuela, curricula, curso, seccion, semana) => {
  try {
    //const res = await axios.get(`http://127.0.0.1:8000/api/alumno/${codigo}/${escuela}/${nivel}/${tipo}/${accion}`);
      const res = await axios.get(`${config.apiUrl}api/reportes/reportguiasemana/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${semana}`);

      //console.log(`${config.apiUrl}api/reportes/reportguiasemana/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${semana}`);

      

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

export const obtenerreportesesiones = async (sede, semestre, escuela, curricula, curso, seccion) => {
  try {
    //const res = await axios.get(`http://127.0.0.1:8000/api/alumno/${codigo}/${escuela}/${nivel}/${tipo}/${accion}`);
      const res = await axios.get(`${config.apiUrl}api/reportes/reporteSesiones/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}`);

      //console.log(`${config.apiUrl}api/reportes/reportguiasemana/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${semana}`);

     

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


export const obtenerasistenciaguia = async (sede, semestre, escuela, curricula, curso, seccion) => {
  try {
    //const res = await axios.get(`http://127.0.0.1:8000/api/alumno/${codigo}/${escuela}/${nivel}/${tipo}/${accion}`);
      const res = await axios.get(`${config.apiUrl}api/reportes/reportasistenciaguia/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}`);

      //console.log(`${config.apiUrl}api/reportes/reportguiasemana/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${semana}`);

      

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


export const obtenerAsistenciasemana = async (sede, semestre, escuela, curricula, curso, seccion, tipo, grupo, sesion, clave) => {
  try {
    //const res = await axios.get(`http://127.0.0.1:8000/api/alumno/${codigo}/${escuela}/${nivel}/${tipo}/${accion}`);
      const res = await axios.get(`${config.apiUrl}api/reportes/reportAsistenciasemana/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${tipo}/${grupo}/${sesion}/${clave}`);

      //console.log(`${config.apiUrl}api/reportes/reportguiasemana/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${semana}`);

      

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

export const obtenerAsistenciaporcentaje = async (sede, semestre, escuela, curricula, curso, seccion, tipo, grupo, sesion, clave) => {
  try {
    //const res = await axios.get(`http://127.0.0.1:8000/api/alumno/${codigo}/${escuela}/${nivel}/${tipo}/${accion}`);
      const res = await axios.get(`${config.apiUrl}api/reportes/reportAsistenciaporcentaje/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${tipo}/${grupo}/${sesion}/${clave}`);

      //console.log(`${config.apiUrl}api/reportes/reportguiasemana/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${semana}`);

     

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

export const obtenerAsistenciasesiones = async (sede, semestre, escuela, curricula, curso, seccion, tipo, grupo, sesion, clave) => {
  try {
    //const res = await axios.get(`http://127.0.0.1:8000/api/alumno/${codigo}/${escuela}/${nivel}/${tipo}/${accion}`);
      const res = await axios.get(`${config.apiUrl}api/reportes/reportAsistenciasesiones/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${tipo}/${grupo}/${sesion}/${clave}`);

      //console.log(`${config.apiUrl}api/reportes/reportguiasemana/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${semana}`);


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






export const obtenerActaDetalle = async (semestre, sede, escuela, curricula, curso, seccion) => {
  try {
    //const res = await axios.get(`http://127.0.0.1:8000/api/alumno/${codigo}/${escuela}/${nivel}/${tipo}/${accion}`);
      const res = await axios.get(`${config.apiUrl}api/reportes/reporteacta/${semestre}/${sede}/${escuela}/${curricula}/${curso}/${seccion}`);

      //console.log(`${config.apiUrl}api/reportes/reportguiasemana/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${semana}`);

      

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

export const obtenerListamatriculados = async (semestre, sede, escuela, curricula, curso, seccion) => {
  try {
    //const res = await axios.get(`http://127.0.0.1:8000/api/alumno/${codigo}/${escuela}/${nivel}/${tipo}/${accion}`);
      const res = await axios.get(`${config.apiUrl}api/reportes/reportelistamatriculados/${semestre}/${sede}/${escuela}/${curricula}/${curso}/${seccion}`);
    //console.log(`${config.apiUrl}api/reportes/reportguiasemana/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${semana}`);

     

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
//go
export const obtenerReportenotas = async (sede, semestre, escuela, curricula, curso, seccion, unidad) => {
  try {
    //const res = await axios.get(`http://127.0.0.1:8000/api/alumno/${codigo}/${escuela}/${nivel}/${tipo}/${accion}`);
      const res = await axios.get(`${config.apiUrl}api/reportes/reporteregistronotas/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${unidad}`);

      //console.log(`${config.apiUrl}api/reportes/reportguiasemana/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${semana}`);

      

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


export async function obtenerEscuelas(token) {
  const r = await axios.get(`${config.apiUrl}api/reportes/escuelas`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return r.data;
}

export async function generarReporte(token, escuela, tipo) {
  const r = await axios.post(
    `${config.apiUrl}api/reportes/curricular`,
    { escuela, tipo },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return r.data;
}

export async function obtenerDetalle(token, escuela, tipo) {
  const r = await axios.post(
    `${config.apiUrl}api/reportes/curriculardetalle`,
    { escuela, tipo },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  return r.data;
}

