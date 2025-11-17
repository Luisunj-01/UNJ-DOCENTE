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



// Lista de alumnos tutorados
export const obtenerSesionesIndividuales = async (
  semestre,
  persona,
  docente,
  escuela,
  vperfil,
  token
) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/sesiones-individuales/${semestre}/${persona}/${docente}/${escuela}/${vperfil}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("🔁 API sesiones-individuales responde:", data);
    return data;
  } catch (err) {
    console.error("❌ Error al obtener sesiones individuales:", err);
    return { success: false, message: "Error al conectar con el servidor." };
  }
};

// Detalle de un alumno específico
export const obtenerSesionIndividual = async (
  semestre,
  persona,
  docente,
  alumno,
  estructura,
  vperfil,
  token
) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/sesion-individual/${semestre}/${persona}/${docente}/${alumno}/${estructura}/${vperfil}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("🔍 API sesion-individual responde:", data);
    return data;
  } catch (err) {
    console.error("❌ Error al obtener detalle tutorando:", err);
    return { success: false, message: "Error al conectar con el servidor." };
  }
};


export const obtenerAtencionesAlumno = async (
  per,
  semestre,
  doc,
  peralu,
  alu,
  token
) => {
  const url = `${config.apiUrl}api/Tutoria/atenciones-individuales/${per}/${semestre}/${doc}/${peralu}/${alu}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return data;
};

 
export const obtenerDatosNuevaAtencion = async (
  personaTutor,     // per
  semestre,         // semestre
  usuarioDocente,   // doc (código usuario docente)
  personaAlumno,    // peralu
  codAlumno,        // alu
  estructura,       // estructura
  token
) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/atencion/combos/${personaTutor}/${semestre}/${usuarioDocente}/${personaAlumno}/${codAlumno}/${estructura}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("📥 obtenerDatosNuevaAtencion ->", data);

    return data; 
    // Esperamos:
    // {
    //   success: true,
    //   header: { semestre, tutorNombre, alumnoNombre },
    //   fechaHoy: "2025-10-29",
    //   motivos: [{codigo:'01', descripcion:'Académico'}, ...],
    //   areas:   [{codigo:'00', descripcion:'No derivado'}, ...]
    // }
  } catch (err) {
    console.error("❌ Error al cargar combos atención:", err);
    return {
      success: false,
      message: "Error al conectar con el servidor.",
    };
  }
};

export const grabarAtencionIndividual = async (
  {
    per,           // persona tutor (8 chars, ej "00003694")
    semestre,      // ej "202501"
    doc,           // usuario docente (10 chars) - lo mandamos por si acaso auditoría
    peralu,        // persona alumno (8 chars)
    alu,           // código alumno (matrícula, ej "2024220007")
    estructura,    // estructura/carrera del alumno, ej "02"  <-- IMPORTANTE QUE SEA CORTO

    descripcion,   // tema tratado / resumen corto: ej "sin dinero", "problema familiar"
    motivo,        // código del motivo seleccionado, ej "01","02","03"
    fecha,         // "YYYY-MM-DD" desde el form (ej "2025-10-29")
    areaDerivada,  // "00" si NO derivó, o por ej "03" si derivó a psicología/bienestar/etc
    observacion,   // texto libre detallado
  },
  token
) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/atencion/grabar`;

    const payload = {
      per,
      semestre,
      doc,
      peralu,
      alu,
      estructura,   // este llega al controlador y termina en el parámetro 6 del SP ✅
      descripcion,  // este termina como _tema en el SP (parámetro 7)
      motivo,       // este llega al parámetro 10 del SP
      fecha,        // el backend lo convierte a YYYYMMDD
      areaDerivada, // esto sirve para marcar si es derivado y a dónde
      observacion,  // parámetro 11 del SP
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("💾 grabarAtencionIndividual ->", data);

    return data;
    // Ejemplo esperado:
    // { success: true, message: "Atención registrada correctamente", data: [...] }

  } catch (err) {
    console.error("❌ Error al grabar atención:", err);
    return {
      success: false,
      message: "Error al conectar con el servidor.",
    };
  }
};
  

// ./logica/DatosTutoria.js
export const obtenerAtencionParaEditar = async (per, semestre, doc, peralu, alu, estructura, sesion, token) => {
  const url = `${config.apiUrl}api/Tutoria/atencion/editar/${per}/${semestre}/${doc}/${peralu}/${alu}/${estructura}/${sesion}`;
  const res = await fetch(url, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }});
  return await res.json();
};


export const actualizarAtencionIndividual = async (payload, token) => {
  const url = `${config.apiUrl}api/Tutoria/atencion/actualizar`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  return await res.json();
};


export const eliminarAtencionIndividual = async (
  per, semestre, doc, peralu, alu, estructura, sesion, token
) => {
  const pad2 = (v) => String(v ?? "").padStart(2, "0");
  const enc = (v) => encodeURIComponent(String(v ?? ""));
  const url = `${config.apiUrl}api/Tutoria/atencion/eliminar/${enc(per)}/${enc(semestre)}/${enc(doc)}/${enc(peralu)}/${enc(alu)}/${enc(estructura)}/${enc(pad2(sesion))}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.success) {
    return { success: false, message: data?.message || `Error ${res.status} al eliminar.` };
  }
  return { success: true, message: data?.message || "Eliminado." };
};


// ✅ Evidencias por sesión (asistencias y fotos)
export const obtenerEvidenciasSesion = async (persona, semestre, sesion, token) => {
  const ses = String(sesion).padStart(2, "0"); // 👈 fuerza 2 dígitos
  const url = `${config.apiUrl}api/Tutoria/evidencias/${persona}/${semestre}/${ses}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (data?.success) return data.data || { asistencias: 0, fotos: 0 };
  return { asistencias: 0, fotos: 0 };
};


// ✅ Concluir sesión (marca activo=1 si cumple reglas)
export const concluirSesion = async (persona, semestre, sesion, token) => {
  const url = `${config.apiUrl}api/Tutoria/concluir-sesion`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ persona, semestre, sesion }),
  });
  return await res.json(); // Espera: { success: true, message: "..." }
};


export const verificarSesion = async (persona, semestre, sesion, token) => {
  try {
    const url = `${config.apiUrl}api/Tutoria/verificar-sesion/${persona}/${semestre}/${sesion}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("❌ Error en verificarSesion:", error);
    return { success: false, completa: false, foto: false, asistencia: false };
  }
};



export const obtenerFichaMatricula = async (alumno, escuela, curricula, semestre, token) => {
  try {
    const url = `${config.apiUrl}api/reportes/FichaMatricula/${alumno}/${escuela}/${curricula}/${semestre}`;
    console.log("📡 URL API FichaMatricula:", url);

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await resp.json();
    console.log("📊 Respuesta API FichaMatricula:", data);
    return data;
  } catch (err) {
    console.error("❌ Error al obtener ficha de matrícula:", err);
    return { success: false, datos: [] };
  }
};

export const obtenerAvanceAcademico = async (alumno, escuela, curricula, semestre, token) => {
  try {
    const url = `${config.apiUrl}api/reportes/Avanceacademico/${alumno}/${escuela}/${curricula}/${semestre}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("❌ Error en obtenerAvanceAcademico:", error);
    return { success: false };
  }
};

export const obtenerConstanciaNotas = async (alumno, escuela, curricula, semestre, token) => {
  try {
    const url = `${config.apiUrl}api/reportes/ConstanciaNotas/${alumno}/${escuela}/${curricula}/${semestre}`;
    const respuesta = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return await respuesta.json();
  } catch (error) {
    console.error("❌ Error al obtener constancia de notas:", error);
    return { success: false, data: [] };
  }
};

export const obtenerHorarioAlumno = async (alumno, semestre, token) => {
  try {
    const url = `${config.apiUrl}api/reportes/HorarioAlumno/${alumno}/${semestre}`;
    const respuesta = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return await respuesta.json(); // 👈 devuelve { success, cabecera, detalle }
  } catch (error) {
    console.error("❌ Error en obtenerHorarioAlumno:", error);
    return { success: false, cabecera: [], detalle: [] };
  }
};

export const obtenerAsistenciaAlumno = async (alumno, escuela, semestre, token) => {
  try {
    const url = `${config.apiUrl}api/reportes/AsistenciaAlumno/${alumno}/${escuela}/${semestre}`;
    const respuesta = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return await respuesta.json();
  } catch (error) {
    console.error("❌ Error en obtenerAsistenciaAlumno:", error);
    return { success: false, data: [] };
  }
};


export const obtenerRecordNotas = async (alumno, escuela, curricula, token) => {
  try {
    const url = `${config.apiUrl}api/reportes/record/${alumno}/${escuela}/${curricula}`;

    const respuesta = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return await respuesta.json();
  } catch (error) {
    console.error("❌ Error en obtenerRecordNotas:", error);
    return { success: false, filas: [] };
  }
};

export const obtenerPlanCurricular = async (estructura, curricula, tipo, token) => {
  try {
    const url = `${config.apiUrl}api/reportes/curricular/${estructura}/${curricula}/${tipo}`;

    const respuesta = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return await respuesta.json();
  } catch (error) {
    console.error("❌ Error en obtenercurricula:", error);
    return { success: false, filas: [] };
  }
};

export const obtenerRecordCurricular = async (alumno, sede, estructura, curricula, token) => {
  try {
    const url = `${config.apiUrl}api/reportes/recordcurricular/${alumno}/${sede}/${estructura}/${curricula}`;

    const respuesta = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return await respuesta.json();

  } catch (error) {
    console.error("❌ Error en obtenerRecordCurricular:", error);
    return { success: false, data: [] };
  }
};
