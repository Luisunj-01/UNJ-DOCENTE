import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUsuario } from '../../../context/UserContext';
import { obtenersemestre, obtenersemana } from '../logica/docente';

function SemestreSelect({ value, onChange, name, className = 'form-select', parametros }) {

  const [semestres, setSemestres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState();
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;
  

  const persona = usuario.docente.persona;
  //const semana = usuario.docente.semana;


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
        setSemestres(resultado.datos); // ✅ Aquí usamos solo los datos
        
      } else {
        setSemestres([]); // o podrías manejar un error
        setMensaje("No hay semestres");
      }
      setLoading(false); // ✅ Asegúrate de que el loading se desactive
  }


  async function cargarsemana() {
      const resultado = await obtenersemana(parametros.sede, parametros.semestre, parametros.escuela, parametros.curricula, parametros.curso, parametros.seccion);
      if (resultado && resultado.datos) {
        setSemestres(resultado.datos); // ✅ Aquí usamos solo los datos
      } else {
        setSemestres([]); // o podrías manejar un error
        setMensaje("No hay semana");
      }
      setLoading(false); // ✅ Asegúrate de que el loading se desactive
  }

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
        onChange={(e) => onChange(e.target.value)} // 👈 aquí
        disabled={loading}
      >

      {loading && <option>Cargando...</option>}
      {!loading && semestres.length === 0 && <option>{mensaje}</option>}
      {!loading && semestres.map((s, i) => (
        <option key={i} value={name === "cboSemestre" ? s.semestre : s.semana}>
          {name === "cboSemestre" ? s.semestre : s.semana}
        </option>
      ))}
    </select>
  );
}

export default SemestreSelect;
