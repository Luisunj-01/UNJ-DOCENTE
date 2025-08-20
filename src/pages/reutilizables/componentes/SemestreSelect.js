import { useEffect, useState } from 'react';
import { useUsuario } from '../../../context/UserContext';
import { obtenersemestre, obtenersemana } from '../logica/docente';

function SemestreSelect({ value, onChange, name, className = 'form-select', parametros }) {
  const [semestres, setSemestres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState();
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;

  const persona = usuario.docente.persona;

  useEffect(() => {
    if (name === "cboSemestre") {
      cargarsemestre();
    } else if (name === "semana") {
      cargarsemana();
    }
  }, [name]); 

  async function cargarsemestre() {
    const resultado = await obtenersemestre(persona);
    if (resultado && resultado.datos) {
      setSemestres(resultado.datos);
    } else {
      setSemestres([]);
      setMensaje("No hay semestres");
    }
    setLoading(false);
  }

  async function cargarsemana() {
    const resultado = await obtenersemana(parametros.sede, parametros.semestre, parametros.escuela, parametros.curricula, parametros.curso, parametros.seccion);
    if (resultado && resultado.datos) {
      setSemestres(resultado.datos);
    } else {
      setSemestres([]);
      setMensaje("No hay semana");
    }
    setLoading(false);
  }

  return (
    <select
      name={name}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
    >
      {loading && <option>Cargando...</option>}
      {!loading && semestres.length === 0 && <option>{mensaje}</option>}

      {/* 👇 Si no es cboSemestre, mostramos opción por defecto */}
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
