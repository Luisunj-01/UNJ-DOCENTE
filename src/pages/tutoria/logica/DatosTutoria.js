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

export const obtenerRecomendacion = async (persona, semestre, sesion, token) => {
  try {
    // 🔹 Concatenar el código directamente en texto plano
    const codigo = `${persona}${semestre}${sesion}`;
    console.log("🔍 Código generado:", codigo);
    const url = `${config.apiUrl}api/Tutoria/obtener-recomendacion/${codigo}`;

    console.log("🌐 URL:", url);
    console.log("🔑 Token:", token);

    const respuesta = await fetch(url, {
  method: "GET",
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
});

const json = await respuesta.json();
console.log("📥 Respuesta obtenerRecomendacion:", json);

if (json.success && json.data) {
  return {
    descripcion: json.data.descripcion || "",
    logrozet: json.data.logrozet || "",
    dificultadzet: json.data.dificultadzet || "",
    recomendacionzet: json.data.recomendacionzet || "",
  };
} else {
  return {
    descripcion: "",
    logrozet: "",
    dificultadzet: "",
    recomendacionzet: "",
  };
}


  } catch (error) {
    console.error("❌ Error al obtener recomendación:", error);
    return { logro: "", dificultad: "", recomendacion: "" };
  }
};

export const guardarRecomendacion = async (
  persona,
  semestre,
  sesion,
  logro,
  dificultad,
  recomendacion,
  token
) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/guardar-recomendacion`;

    console.log("📡 Enviando datos a:", url);

    const res = await axios.post(
      url,
      {
        persona,          // 👈 mismos nombres que espera el backend Laravel
        semestre,
        sesion,
        logrozet: logro,
        dificultadzet: dificultad,
        recomendacionzet: recomendacion,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );

    console.log("📥 Respuesta del servidor:", res.data);

    // ✅ Manejo correcto de la respuesta
    if (res.status === 200 && res.data?.success) {
      return { error: 0, mensaje: res.data.message || "✅ Información guardada correctamente" };
    } else {
      return {
        error: 1,
        mensaje: res.data?.message || "⚠️ No se pudo guardar la información.",
      };
    }
  } catch (err) {
    console.error("❌ Error al guardar recomendación:", err.message);
    return {
      error: 1,
      mensaje: "Error de conexión o autorización con el servidor.",
    };
  }
};


export const eliminarSesion = async (persona, semestre, sesion, token) => {
  try {
    const codigo = `${persona}${semestre}${sesion}`;
    const url = `${config.apiUrl}api/Tutoria/eliminar-sesion/${codigo}`;
    console.log("🗑️ Eliminando sesión:", url);

    const respuesta = await fetch(url, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await respuesta.json();
    console.log("📥 Respuesta eliminarSesion:", data);

    if (data.success) {
      return { error: 0, mensaje: data.message };
    } else {
      return { error: 1, mensaje: data.message || "⚠️ No se pudo eliminar la sesión" };
    }
  } catch (error) {
    console.error("❌ Error al eliminar sesión:", error);
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


// 🔹 Obtener sesión
export const obtenerSesion = async (persona, semestre, sesion, token) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/sesion/${persona}/${semestre}/${sesion}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("❌ Error al obtener sesión:", err);
    return { success: false, message: "Error al conectar con el servidor." };
  }
};

// 🔹 Actualizar sesión
export const actualizarSesion = async (persona, semestre, sesion, aula, fecha, activo, token) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/sesion/actualizar`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ persona, semestre, sesion, aula, fecha, activo }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("❌ Error al actualizar sesión:", err);
    return { success: false, message: "Error al conectar con la API." };
  }
};


export const obtenerSesionesLibres = async (persona, semestre, token) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/sesiones-libres/${persona}/${semestre}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    return await res.json();
  } catch (err) {
    console.error("❌ Error al obtener sesiones libres:", err);
    return [];
  }
};


export const obtenerSesionLibre = async (persona, semestre, sesion, token) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/obtener-sesion-libre/${persona}/${semestre}/${sesion}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    return await res.json();
  } catch (err) {
    console.error("❌ Error al obtener sesión libre:", err);
    return { success: false };
  }
};



// 🔹 Obtener sesiones disponibles (no registradas)
export const obtenerSesionesLibresDisponibles = async (persona, semestre, token) => {
  
  try {
    const url = `${config.apiUrl}api/Tutoria/sesiones-libres-disponibles/${persona}/${semestre}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (data.success) return data.data || [];
    return [];
  } catch (error) {
    console.error("❌ Error al obtener sesiones disponibles libres:", error);
    return [];
  }
};


export const guardarSesionLibre = async (persona, semestre, sesion, descripcion, fecha, concluida, link, token) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/guardar-sesion-libre`;

    const body = {
      persona,
      semestre,
      sesion,
      descripcion,   // 👈 se envía al backend
      fecha,
      activo: concluida,
      aula: link,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    return await res.json();
  } catch (err) {
    console.error("❌ Error al guardar sesión libre:", err);
    return { success: false };
  }
};



export const actualizarSesionLibre = async (
  persona,
  semestre,
  sesion,
  descripcion,
  fecha,
  concluida,
  link,
  token
) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/actualizar-sesion-libre`;

    const body = {
      persona,
      semestre,
      sesion,
      descripcion,
      fecha,
      activo: concluida,
      aula: link,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    return await res.json();
  } catch (err) {
    console.error("❌ Error al actualizar sesión libre:", err);
    return { success: false };
  }
};




export const eliminarSesionLibre = async (persona, semestre, sesion, token) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/eliminar-sesion-libre`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ persona, semestre, sesion }),
    });
    return await res.json();
  } catch (err) {
    console.error("❌ Error al eliminar sesión libre:", err);
    return { success: false };
  }
};






