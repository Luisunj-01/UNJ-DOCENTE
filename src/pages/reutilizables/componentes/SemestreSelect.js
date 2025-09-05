import { useEffect, useState } from 'react';
import { useUsuario } from '../../../context/UserContext';
import { obtenersemestre, obtenersemana } from '../logica/docente';

function SemestreSelect({ value, onChange, name, className = 'form-select', parametros }) {
  const [semestres, setSemestres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const { usuario } = useUsuario();
  const persona = usuario?.docente?.persona;

  useEffect(() => {
    if (name === "cboSemestre") {
      cargarSemestre();
    } else if (name === "semana") {
      cargarSemana();
    }
  }, [name]); 

  async function cargarSemestre() {
    try {
      const resultado = await obtenersemestre(persona);
      if (resultado && resultado.datos) {
        setSemestres(resultado.datos);
      } else {
        setSemestres([]);
        setMensaje("No hay semestres");
      }
    } catch (error) {
      console.error("Error cargando semestres:", error);
      setMensaje("Error cargando semestres");
    } finally {
      setLoading(false);
    }
  }

  async function cargarSemana() {
    try {
      const resultado = await obtenersemana(
        parametros?.sede, 
        parametros?.semestre, 
        parametros?.escuela, 
        parametros?.curricula, 
        parametros?.curso, 
        parametros?.seccion
      );
      if (resultado && resultado.datos) {
        setSemestres(resultado.datos);
      } else {
        setSemestres([]);
        setMensaje("No hay semanas");
      }
    } catch (error) {
      console.error("Error cargando semanas:", error);
      setMensaje("Error cargando semanas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      name={name}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}   // 👈 aquí el cambio clave
      disabled={loading}
    >
      {loading && <option>Cargando...</option>}
      {!loading && semestres.length === 0 && <option>{mensaje}</option>}

      {/* 👇 Si es semana mostramos opción por defecto */}
      {!loading && name !== "cboSemestre" && (
        <option value="">Seleccione semana</option>
      )}

      {!loading && semestres.map((s, i) => (
        <option key={i} value={name === "cboSemestre" ? s.semestre : s.semana}>
          {name === "cboSemestre" ? s.semestre : s.semana}
        </option>
      ))}
    </select>
  );
}

export default SemestreSelect;
