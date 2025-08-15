import { useEffect, useState } from 'react';
import axios from 'axios';
import TablaCursos from '../reutilizables/componentes/TablaCursos';
import SemestreSelect from '../reutilizables/componentes/SemestreSelect';
import FichaAlumno from '../reutilizables/componentes/FichaAlumno';
import { obtenerCursosPrematricula } from '../reutilizables/logica/docente';
import { useUsuario } from '../../context/UserContext';

function Reportestud() {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  const [semestre, setSemestre] = useState('202501'); // <- estado dinámico
  const { usuario } = useUsuario();

  const token = usuario?.codigotokenautenticadorunj;
  
  const codigo = '2019111448';
  const escuela = 'TM';
  const nivel = '03';
  //const semestre = '202501';

  //const apiUrl = `http://127.0.0.1:8000/api/prematricula/${codigo}/${escuela}/${nivel}/${semestre}`;

  useEffect(() => {
      async function cargarCursos() {
        setLoading(true);
        const { datos: cursos, mensaje } = await obtenerCursosPrematricula(codigo, escuela, nivel, semestre, token);
        setDatos(cursos);
        setMensajeApi(mensaje);
        setLoading(false);
      }
      cargarCursos();
  }, [semestre]);

  /*useEffect(() => {
    
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
  }, [semestre]); 
  /*useEffect(() => {
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
  }, [apiUrl]);*/

  const columnas = [
    { clave: 'curso', titulo: 'Curso', ancho: '10%' },
    { clave: 'seccion', titulo: 'Seccion', ancho: '5%' },
    { clave: 'nombrecurso', titulo: 'Nombre del Curso' },
    { clave: 'creditos', titulo: 'Creditos', ancho: '5%' },
    {
      titulo: 'Silabo',
      ancho: '5%',
      render: (fila) => (
        fila.silabo
          ? (
              <a href={fila.silabo} target="_blank" rel="noopener noreferrer">
                📄 Ver
              </a>
            )
          : (
              <span>
                <img src="https://pruebas.unj.edu.pe/zetunajaen/imageneszet/actawb.gif" alt="loading" border="0" />
                
              </span>
            )
      )
    }
    
    /*{
      titulo: 'Foto',
      ancho: '8%',
      render: (fila) => (
        <img
          src={`https://siga.unj.edu.pe/fotos/${fila.curso}.jpg`}
          alt="foto curso"
          width="40"
          height="40"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40?text=?'; }}
        />
      )
    }*/
  ];


  return (
    <div className="container mt-4">
      <h2><i class="fa fa-th"></i> Reportes estudiantes</h2>
      <br></br>

      <FichaAlumno
  datos={{
    sede: 'JAEN',
    codigo: '2019111448',
    nombre: 'ABAD ALVA EDITH MARIBEL',
    carrera: 'TECNOLOGÍA MÉDICA CON ESPECIALIDAD EN LABORATORIO CLÍNICO',
    curricula: '03',
    tutor: 'ARELLANO UBILLUS JUAN ENRIQUE',
  }}
  tipoVista="reporte"
/>
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

export default Reportestud;
