// src/pages/reutilizables/SemestreSelect2.js
import { useEffect, useState } from "react";
import { useUsuario } from "../../../context/UserContext";
import { obtenersemestre2 } from "../logica/docente";

function SemestreSelect2({ value, onChange, name, token: propToken }) {
  const [opciones, setOpciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const { usuario } = useUsuario();
  const persona = usuario?.docente?.persona;

  // Usa token del prop o del localStorage
  const token = propToken || localStorage.getItem('sanctum_token');

  useEffect(() => {
    if (!persona || !token) {
      setLoading(false);
      return;
    }

    if (name === "cboSemestre") {
      cargarSemestres();
    }
  }, [name, persona, token]);

  async function cargarSemestres() {
    setLoading(true);
    console.log("Cargando semestres...");

    try {
      const resultado = await obtenersemestre2(persona, token); // ← Token manual

      if (resultado && resultado.datos.length > 0) {
        setOpciones(resultado.datos);
        if (!value) {
          onChange(resultado.datos[0].semestre);
        }
      } else {
        setOpciones([]);
        setMensaje(resultado.mensaje);
      }
    } catch (error) {
      console.error("Error cargando semestres:", error);
      setMensaje("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      className="form-select"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
    >
      {loading && <option>Cargando...</option>}
      {!loading && opciones.length === 0 && <option>{mensaje}</option>}
      {!loading && opciones.map((item, i) => (
        <option key={i} value={item.semestre}>
          {item.semestre}
        </option>
      ))}
    </select>
  );
}

export default SemestreSelect2;