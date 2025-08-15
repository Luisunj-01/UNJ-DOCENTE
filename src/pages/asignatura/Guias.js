import { useEffect, useState } from 'react';
import axios from 'axios';
import TablaCursos from '../reutilizables/componentes/TablaCursos';
import SemestreSelect from '../reutilizables/componentes/SemestreSelect';
import { obtenerCursosPrematricula } from '../reutilizables/logica/docente';
import { useUsuario } from '../../context/UserContext';

function Guias() {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  const [semestre, setSemestre] = useState('202501'); // <- estado dinámico
  const { usuario } = useUsuario();

  
  const token = usuario?.codigotokenautenticadorunj;
  const persona = '00010576';
  const dni = '40038509';
  const tipo = 'C';

  useEffect(() => {
    async function cargarCursos() {
      setLoading(true);
      const { datos: cursos, mensaje } = await obtenerCursosPrematricula(semestre, persona, dni, tipo, token);
      setDatos(cursos);
      setMensajeApi(mensaje);
      setLoading(false);
    }
    cargarCursos();
  }, [semestre]);
  /*useEffect(() => {
    const apiUrl = `http://127.0.0.1:8000/api/prematricula/${codigo}/${escuela}/${nivel}/${semestre}`;
    setLoading(true);
    axios.get(apiUrl)
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setDatos(res.data);
          setMensajeApi('');
        } else {
          setDatos([]);
          setMensajeApi(res.data.mensaje || 'No se encontraron datos.');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error al obtener datos del alumno:', error);
        setDatos([]);
        setMensajeApi('Error al conectar con el servidor.');
        setLoading(false);
      });
  }, [semestre]); */// <-- Dependencia para que cambie al seleccionar otro semestre

  const columnas = [
    { clave: 'curso', titulo: 'Curso', ancho: '10%' },
    { clave: 'seccion', titulo: 'Seccion', ancho: '5%' },
    { clave: 'nombre', titulo: 'Nombre del Curso', ancho: '25%' },
    { clave: 'creditos', titulo: 'Creditos', ancho: '5%' },
    { clave: 'descripcionescuela', titulo: 'Escuela', ancho: '10%' },
    { clave: 'matriculados', titulo: 'Mat', ancho: '5%' },
  ];

  return (
    <div className="container mt-4">
      <h2><i class="fa fa-th"></i> Ver Guías</h2>
        <br></br>
        <br></br>
      {/* Selector de semestre */}
      <form className="mb-3">
        <div className="row">
          <div className="col-md-1">
            <label className="form-label"><strong>Semestre:</strong></label>
          </div>
          <div className="col-md-3">
            <SemestreSelect value={semestre} onChange={(e) => setSemestre(e.target.value)} />
          </div>
          
        </div>
      </form>

      {loading ? (
        <div className="alert alert-info text-center mt-4">Cargando...</div>
      ) : datos.length === 0 ? (
        <div className="alert alert-warning text-center mt-4">{mensajeApi}</div>
      ) : (
        <TablaCursos datos={datos} columnas={columnas} />
      )}
    </div>
  );
}

export default Guias;
