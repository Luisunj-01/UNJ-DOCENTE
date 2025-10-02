import axios from "axios";
import config from "../../../config"; // ajusta si cambia la ruta

// 🔹 Export 1
export const obtenerDatosDocente = async (sede, semestre, persona) => {
  try {
    const res = await axios.get(
      `${config.apiUrl}api/actividades/docente/datos/${sede}/${semestre}/${persona}`
    );
    if (res.data) {
      return { datos: res.data, mensaje: "" };
    } else {
      return { datos: null, mensaje: "No se encontraron datos del docente." };
    }
  } catch (err) {
    console.error("Error al obtener datos docente:", err);
    return { datos: null, mensaje: "Error al conectar con la API." };
  }
};

// 🔹 Export 2
export const obtenerDatosHorario = async (sede, semestre, persona, token) => {
  try {
    const url = `${config.apiUrl}api/horario/datos/${sede}/${semestre}/${persona}`;
    console.log("📡 URL solicitada:", url);
    console.log("🔑 Token enviado:", token);

    const res = await axios.get(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ Respuesta API:", res.data);
    return { datos: res.data, mensaje: "" };
  } catch (err) {
    console.error("❌ Error al obtener datos del horario:", err.response?.data || err.message);
    return { datos: null, mensaje: "Error al conectar con la API." };
  }
};


