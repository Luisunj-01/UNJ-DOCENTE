import axios from "axios";
import config from "../../../config"; // ajusta según tu proyecto


/**
 * Obtiene los alumnos de un docente tutor por semestre
 */

// 1.
export const obtenerAlumnosTutor = async (semestre, per, doc, escuela = "", vperfil = "", token) => {
  try {
   
    const url = `${config.apiUrl}api/Tutoria/rendimiento/${semestre}/${per}/${doc}/${escuela}/${vperfil}`;
    const res = await axios.get(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      
      return { datos: res.data, mensaje: "" };
    } else {
      console.warn("⚠️ Sin datos de alumnos.");
      return { datos: null, mensaje: "No se encontraron datos de alumnos." };
    }

  } catch (err) {
    console.error("❌ Error al obtener alumnos:", err.response?.data || err.message);
    return { datos: null, mensaje: "Error al conectar con la API." };
  }
};

// 2.
export const obtenerSesionesCiclo = async (per, semestre, token) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/sesCiclo/${per}/${semestre}`;
    const res = await axios.get(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    // ✅ Verifica que la API trae las dos partes esperadas
    if (res.data && res.data.sesiones && Array.isArray(res.data.sesiones)) {
      return {
        ciclo: res.data.ciclo || "No asignado",
        datos: res.data.sesiones,
        mensaje: "",
      };
    } else {
      return { ciclo: "No asignado", datos: [], mensaje: "Sin datos de sesiones." };
    }

  } catch (err) {
    console.error("❌ Error al obtener sesiones ciclo:", err.response?.data || err.message);
    return { ciclo: "No asignado", datos: [], mensaje: "Error al conectar con la API." };
  }
};

// 3.
export const obtenerAsistenciaSesiones = async (persona, semestre, sesion, token) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/asistencia/${persona}/${semestre}/${sesion}`;
    const res = await axios.get(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.data?.success) {
      return { datos: res.data.data, mensaje: "" };
    } else {
      return { datos: null, mensaje: "No se pudieron cargar los datos." };
    }
  } catch (err) {
    console.error("❌ Error al obtener asistencia:", err.response?.data || err.message);
    return { datos: null, mensaje: "Error al conectar con la API." };
  }
};


export const obtenerTemasDisponibles = async (semestre, persona, token) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/temas/${semestre}/${persona}`;
    

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

   

    // Verificamos si viene con el formato del controlador
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }

    // Si por alguna razón no hay data
    return [];
  } catch (err) {
    console.error("❌ Error al obtener temas:", err.response?.data || err.message);
    return [];
  }
};


export const guardarSesion = async (codigo, semana, aula, fecha, concluida, tipo = "N", token) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/guardar-sesion`;
    console.log("📡 Solicitando:", url);

    const res = await axios.post(
      url,
      {
        codigo,
        cboSemana: semana,
        txtLink: aula,
        txtFecha: fecha,
        chkActivo: concluida ? 1 : 0,
        txtTipo: tipo,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json", // 👈 evita que Axios lo tome como HTML
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000, // ⏳ evita falsos errores por demora
        validateStatus: () => true, // 👈 evita que Axios lance catch por códigos 4xx/5xx
      }
    );

    

    // Si llega aquí, la conexión fue exitosa
    if (res.data?.exito) {
      return { exito: true, mensaje: res.data.mensaje };
    } else {
      return { exito: false, mensaje: res.data?.mensaje || "Error al guardar." };
    }

  } catch (err) {
    console.error("❌ Error al guardar sesión:", err.message);
    console.log("🧩 err.response:", err.response);
    return { exito: false, mensaje: "Error al conectar con la API." };
  }
};


export const obtenerRecomendacion = async (codigo, token) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/obtener-recomendacion/${codigo}`;
    const res = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error al obtener recomendación:", error);
    return { success: false, message: "Error de conexión con el servidor" };
  }
};

export const guardarRecomendacion = async (
  codigo,
  semana,
  logro,
  dificultad,
  recomendacion,
  tipo = "I", // I = insertar, U = actualizar
  token
) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/guardar-recomendacion`;
    console.log("📡 Enviando datos a:", url);

    const res = await axios.post(
      url,
      {
        codigo,
        cboSemana: semana,
        txtLogroZet: logro,
        txtDificultadZet: dificultad,
        txtRecomendacionZet: recomendacion,
        txtTipo: tipo,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
        validateStatus: () => true,
      }
    );

    console.log("📥 Respuesta del servidor:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error en guardarRecomendacion:", error);
    return { error: 1, mensaje: "Error de conexión con el servidor." };
  }
};



// 4.
export const guardarAsistenciaSesiones = async (persona, semestre, sesion, detalles, token) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/asistencia/guardar`;
    const res = await axios.post(url, {
      persona,
      semestre,
      sesion,
      detalles,
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.data?.success) {
      return { exito: true, mensaje: "Asistencia guardada correctamente." };
    } else {
      return { exito: false, mensaje: res.data.message || "Error al guardar." };
    }
  } catch (err) {
    console.error("❌ Error al guardar asistencia:", err.response?.data || err.message);
    return { exito: false, mensaje: "Error al conectar con la API." };
  }
};








