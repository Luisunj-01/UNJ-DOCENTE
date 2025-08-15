import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUsuario } from '../../../context/UserContext';
import { obtenersemestre } from '../logica/docente';

function SemestreSelect({ value, onChange, name = 'cboSemestre', className = 'form-select' }) {
  const [semestres, setSemestres] = useState([]);
  const [loading, setLoading] = useState(true);
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;
  

  const persona = usuario.docente.persona;

  console.log(persona);
  useEffect(() => {
    async function cargarsemestre() {
      const resultado = await obtenersemestre(persona);
      if (resultado && resultado.datos) {
        setSemestres(resultado.datos); // ✅ Aquí usamos solo los datos
      } else {
        setSemestres([]); // o podrías manejar un error
      }
      setLoading(false); // ✅ Asegúrate de que el loading se desactive
    }

    cargarsemestre();
  }, []);

  /*useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/semestre/202002') // ✅ este endpoint devuelve TODOS
      .then(res => {
        if (Array.isArray(res.data)) {
          setSemestres(res.data);
        } else {
          console.warn('Respuesta inesperada:', res.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al obtener semestres:', err);
        setLoading(false);
      });
  }, []);*/

  return (
    <select
      name={name}
      className={className}
      value={value}
      onChange={onChange}
      disabled={loading}
    >
      {loading && <option>Cargando...</option>}
      {!loading && semestres.length === 0 && <option>No hay semestres</option>}
      {!loading && semestres.map((s, i) => (
        <option key={i} value={s.semestre}>{s.semestre}</option>
      ))}
    </select>
  );
}

export default SemestreSelect;
