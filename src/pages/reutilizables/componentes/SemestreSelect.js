//src/pages/reutilizables/SemestreSelect.js
import { useEffect, useState } from 'react';
import { useUsuario } from '../../../context/UserContext';
import { obtenersemestre, obtenersemana } from '../logica/docente';

function SemestreSelect({ value, onChange, name, className = 'form-select', parametros, onSemestresLoaded }) {
  const [semestres, setSemestres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const { usuario } = useUsuario();
  const persona = usuario?.docente?.persona;

  useEffect(() => {
    if (name === "semana") {
      cargarSemana();
    } else {
      // Si no hay name o es "cboSemestre", cargar semestres por defecto
      cargarSemestre();
    }
  }, [name, parametros]); 

  async function cargarSemestre() {
    try {
      const resultado = await obtenersemestre(persona);
      if (resultado && resultado.datos && resultado.datos.length > 0) {
        setSemestres(resultado.datos);
        
        // 🔔 Notificar al componente padre que cargamos los semestres
        if (onSemestresLoaded) {
          const primerSemestre = String(resultado.datos[0].semestre || '').trim();
          onSemestresLoaded(primerSemestre);
        
        }
      } else {
        setSemestres([]);
        setMensaje("No hay semestres disponibles para este docente");
      }
    } catch (error) {
      console.error("Error cargando semestres:", error);
      setMensaje("Error al cargar semestres");
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
      value={value || ''}
      onChange={onChange}
      disabled={loading}
    >
      {loading && <option value="">Cargando...</option>}
      {!loading && semestres.length === 0 && <option value="">{mensaje}</option>}

      {/* 👇 Si es semana mostramos opción por defecto */}
      {!loading && name !== "cboSemestre" && (
        <option value="">Seleccione semana</option>
      )}

      {!loading && semestres.map((s, i) => {
        const valorSemestre = name === "cboSemestre" ? String(s.semestre || '').trim() : String(s.semana || '').trim();
        return (
          <option key={i} value={valorSemestre}>
            {valorSemestre}
          </option>
        );
      })}
    </select>
  );
}

export default SemestreSelect;
