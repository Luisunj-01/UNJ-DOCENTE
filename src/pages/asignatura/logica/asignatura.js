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
  return `${curso.sede}${curso.semestre}${curso.curricula}${cursoSinGuion}${curso.seccion}${curso.trabajo}.pdf`;
  
};


export const verificarArchivo = async (ruta, token) => {
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
};



// Obtener detalle de acta (notas de los alumnos por unidad)
export const obtenerDetalleActa = async (sede, semestre, escuela, curricula, curso, seccion, tipo) => {
  try {
    const response = await axios.get(`${config.apiUrl}api/curso/CalificacionesEstudiante/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/${tipo}`
    );
    return response; // 👈 devolvemos el response completo
  } catch (error) {
    console.error("Error en obtenerDetalleActa:", error);
    return { data: { data: [] } }; // 👈 devolvemos siempre con la misma forma
  }
};




// Guardar notas de alumnos
export const guardarNotasActa = async (sede, semestre, escuela, curricula, curso, seccion, uni, calificaciones) => {
  try {
    const response = await axios.post(
      `${config.apiUrl}api/curso/guardarNotasActa`, // 👈 cambia por tu ruta real de guardar
      {
        sede,
        semestre,
        escuela,
        curricula,
        curso,
        seccion,
        uni,
        calificaciones,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error en guardarNotasActa:", error);
    return { exito: false, mensaje: "Error en la API" };
  }
};



