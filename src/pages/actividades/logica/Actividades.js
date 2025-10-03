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

    
    return { datos: res.data, mensaje: "" };
  } catch (err) {
    console.error("❌ Error al obtener datos del horario:", err.response?.data || err.message);
    return { datos: null, mensaje: "Error al conectar con la API." };
  }
};

// 🔹 Export 3: Validar fechas
export const validarFechas = async (sede, estructura, semestre, vperfil) => {
  try {
    const url = `${config.apiUrl}api/horario/validar-fechas`;
    console.log("🌐 Llamando a:", url);  // 👈 ver la URL exacta

    const res = await axios.post(url, {
      sede,
      estructura,
      semestre,
      vperfil,
    });

    return res.data;
  } catch (err) {
    console.error("❌ Error al validar fechas:", err.response?.data || err.message);
    return { success: false, message: "Error al conectar con la API." };
  }
};


