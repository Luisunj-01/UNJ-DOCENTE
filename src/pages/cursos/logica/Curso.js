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

export const obtenervalidacioncurso = async (sede, semestre, estructura, curricula, curso, seccion, estado) => {
  
  try {
    //const usuario = JSON.parse(localStorage.getItem('usuario'));
    //const token = usuario?.token;

    const res = await axios.get(`${config.apiUrl}api/curso/validacion/${sede}/${semestre}/${estructura}/${curricula}/${curso}/${seccion}/${estado}`);

    
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







export const obtenerRevisionTrabajo = async (sede, semestre, escuela, curricula, curso, seccion, semana) => {
  
  try {
    //const usuario = JSON.parse(localStorage.getItem('usuario'));
    //const token = usuario?.token;

    const res = await axios.get(`${config.apiUrl}api/curso/RevisionTrabajo/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${semana}`);

    
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

export const obtenerDatosAsistencia = async (objeto) => {
  const codigo = 'T1';
  const tipo = codigo.slice(-2, -1);
  const grupo = codigo.slice(-1);

  try {
    const res = await axios.get(
      `${config.apiUrl}api/curso/partcipantesAsistencia/` +
      `${objeto.sede}/` +
      `${objeto.semestre}/` +
      `${objeto.escuela}/` +
      `${objeto.curricula}/` +
      `${objeto.curso}/` +
      `${objeto.seccion}/` +
      `${tipo}/` +
      `${grupo}/` +
      `${objeto.sesion}/` +
      `${objeto.sesionitem}`   // 👈 CLAVE REAL
    );

    return Array.isArray(res.data)
      ? { datos: res.data, mensaje: '' }
      : { datos: [], mensaje: 'Sin datos' };

  } catch (error) {
    console.error('Error al obtener asistencia:', error);
    return { datos: [], mensaje: 'Error al conectar con el servidor.' };
  }
};



export const obtenerDatosAsistencianuevo = async (objeto, fecha) => {
  const codigo  = 'T1';
  const tipo = codigo.slice(-2, -1); // penúltimo caracter → 'T'
  const grupo = codigo.slice(-1);
  const clave = '01';
  const tipozet = 'M';
  
  try {
    //const usuario = JSON.parse(localStorage.getItem('usuario'));
    //const token = usuario?.token;

    const res = await axios.get(`${config.apiUrl}api/curso/partcipantesAsistencianuevo/${objeto.sede}/${objeto.semestre}/${objeto.escuela}/${objeto.curricula}/${objeto.curso}/${objeto.seccion}`);
    //console.log(`${config.apiUrl}api/curso/partcipantesAsistencia/${objeto.sede}/${objeto.semestre}/${objeto.escuela}/${objeto.curricula}/${objeto.curso}/${objeto.seccion}/${tipo}/${grupo}/${objeto.sesion}/${clave}/${fecha}/${objeto.usuario}/${tipozet}`);
    
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

export const obtenerDatosnotas = async (sede, semestre, escuela, curricula, curso, seccion, semama, alumno) => {
  
  try {
    //const usuario = JSON.parse(localStorage.getItem('usuario'));
    //const token = usuario?.token;

    const res = await axios.get(`${config.apiUrl}api/curso/RevisionTrabajonotas/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${semama}/${alumno}`);

    
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


// export const descargarPdfAsistencia = async (
//  sede,
//  semestre,
//  escuela,
//  curricula,
//  curso,
//  seccion,
//  tipo,
//  grupo,
//  sesion,
//  token
// ) => {

//  try {

//   const res = await axios.get(
//    `${config.apiUrl}api/reportes/pdf/asistencia/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${tipo}/${grupo}/${sesion}`,
//    {
//     responseType: "blob", // ⭐ CLAVE
//     headers: {
//      Authorization: `Bearer ${token}`
//     }
//    }
//   );

//   return res.data;

//  } catch (error) {
//   console.error("Error descargando PDF:", error);
//   return null;
//  }

// };

