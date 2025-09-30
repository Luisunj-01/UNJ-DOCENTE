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

export const eliminarMaterialAlumno = async (cod, sede, semestre, escuela, curricula, curso, seccion, semana) => {
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
    });

    return res.data;
  } catch (error) {
    console.error('Error al eliminar material:', error);
    return { exito: false, mensaje: 'Error al eliminar material' };
  }

};

export const eliminarTrabajoAlumno = async (cod, sede, semestre, escuela, curricula, curso, seccion, semana) => {
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

    console.log(`${config.apiUrl}api/curso/Trabajocurso/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${semana}`);
    
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


export const construirNombreArchivo = (curso) => {
  
  const cursoSinGuion = curso.curso.replace('-', '');
  return `${curso.sede}${curso.semestre}${curso.curricula}${cursoSinGuion}${curso.seccion}${curso.trabajo}${curso.alumno}.pdf`;
  
};

export const construirNombreArchivo2 = (curso, semestre, semana, nombrecarpeta) => {
  
  const cursoSinGuion = curso.curso.replace('-', '');
  if(nombrecarpeta == 'guia'){
    return `${curso.practica}${semestre}${curso.estructura}${curso.curricula}${cursoSinGuion}${curso.seccion}${semana}.pdf`;
  } else if(nombrecarpeta == 'material'){
    return `${curso.practica}${semestre}${curso.estructura}${curso.curricula}${cursoSinGuion}${curso.seccion}${semana}.pdf`;
  } else if(nombrecarpeta == 'trabajo'){
    return `${curso.practica}${semestre}${curso.estructura}${curso.curricula}${cursoSinGuion}${curso.seccion}${semana}.pdf`;
  } else if(nombrecarpeta == 'tra'){
    
    return `${curso.sede}${curso.semestre}${curso.curricula}${cursoSinGuion}${curso.seccion}${curso.trabajo}${curso.alumno}.pdf`;
  } else {
    return `${curso.practica}${semestre}${curso.estructura}${curso.curricula}${cursoSinGuion}${curso.seccion}.pdf`;
  }

};




export const construirNombreArchivoverpdf = (curso, semestre, semana, nombrecarpeta) => {
  console.log(curso);
  const cursoSinGuion = curso.curso.replace('-', '');
  if(nombrecarpeta == 'falta_justificada'){
    return `01202501AL-21AL012023210002.pdf`;
  } else if(nombrecarpeta == 'material'){
    return `${curso.practica}${semestre}${curso.estructura}${curso.curricula}${cursoSinGuion}${curso.seccion}${semana}.pdf`;
  } else if(nombrecarpeta == 'trabajo'){
    return `${curso.practica}${semestre}${curso.estructura}${curso.curricula}${cursoSinGuion}${curso.seccion}${semana}.pdf`;
  } else if(nombrecarpeta == 'tra'){
    
    return `${curso.sede}${curso.semestre}${curso.curricula}${cursoSinGuion}${curso.seccion}${curso.trabajo}.pdf`;
  } else {
    return `${curso.practica}${semestre}${curso.estructura}${curso.curricula}${cursoSinGuion}${curso.seccion}.pdf`;
  }

};


/*export const verificarArchivo = async (ruta, token) => {
  try {
    const res = await fetch(`${config.apiUrl}api/verificar-archivo?ruta=${encodeURIComponent(ruta)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    return data.success ? data.url : null;
  } catch (error) {
    return null;
  }
};*/

export const verificarArchivo = async (ruta, token) => {
  // Validar que ruta no esté vacía
  if (!ruta || typeof ruta !== 'string') {
    console.error('Ruta inválida o vacía');
    return { success: false, url: null, error: 'Ruta inválida o vacía' };
  }

  try {
    const response = await fetch(
      `${config.apiUrl}api/verificar-archivo?ruta=${encodeURIComponent(ruta)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Si la respuesta no es OK (200–299)
    if (!response.ok) {
      console.error(`Error HTTP: ${response.status}`);
      return { success: false, url: null, error: `HTTP ${response.status}` };
    }

    const data = await response.json();

    // Manejo de la estructura de datos
    if (data?.success && data?.url) {
      return { success: true, url: data.url };
    } else {
      return {
        success: false,
        url: null,
        error: data?.message || 'Archivo no encontrado o respuesta inválida',
      };
    }
  } catch (err) {
    console.error('Error en la solicitud:', err);
    return { success: false, url: null, error: err.message };
  }
};



// Obtener detalle de acta (notas de los alumnos por unidad)
export const obtenerDetalleActa = async (sede, semestre, escuela, curricula, curso, seccion, uni) => {
  try {
    //const usuario = JSON.parse(localStorage.getItem('usuario'));
    //const token = usuario?.token;

    const res = await axios.get(`${config.apiUrl}api/curso/CalificacionesEstudiante/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${uni}`);
    
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





