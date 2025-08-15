import { useEffect, useState } from 'react';
import axios from 'axios';
import TablaCursos from '../reutilizables/componentes/TablaCursos';
import FichaAlumno from '../reutilizables/componentes/FichaAlumno';
import SemestreSelect from '../reutilizables/componentes/SemestreSelect';
import { obtenerDatosAlumno, obtenerCursosPrematricula } from '../reutilizables/logica/docente';
import { useUsuario } from '../../context/UserContext';


function FichaMatricula() {
  const [datos, setDatos] = useState([]);
  const [infoAlumno, setInfoAlumno] = useState(null); // ✅ ESTA LÍNEA ES IMPORTANTE
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  const [semestre, setSemestre] = useState('202501'); // <- estado dinámico
  const { usuario } = useUsuario();

  const codigo = '2019111448';
  const escuela = 'TM';
  const nivel = '1';
  
  
  const token = usuario?.codigotokenautenticadorunj;

  useEffect(() => {
    async function cargarAlumno() {
      const alumno = await obtenerDatosAlumno(codigo, escuela, nivel, 'A', 'E', token);
      setInfoAlumno(alumno);
    }
    cargarAlumno();
  }, []);

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


  
  return (
    <div className="container mt-4">
      <h2>Ficha de Matrícula</h2>
      <br />

      {/* ✅ Solo si infoAlumno existe */}
      {infoAlumno && (
        <FichaAlumno datos={infoAlumno} tipoVista="matricula" />
      )}

      <br />
      
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
        <TablaCursos datos={datos} columnas={[
          { clave: 'curso', titulo: 'Curso', ancho: '10%' },
          { clave: 'seccion', titulo: 'Sec.', ancho: '5%' },
          { clave: 'nombrecurso', titulo: 'Nombre del Curso' },
          { clave: 'ciclo', titulo: 'Ciclo', ancho: '5%' },
          { clave: 'creditos', titulo: 'Cred', ancho: '5%' },
          { clave: 'tipocurso', titulo: 'Tipo', ancho: '5%' },
          { clave: 'vez', titulo: 'Vez', ancho: '5%' },
          
        ]} />
      )}

      
    </div>
  );
}

export default FichaMatricula;
