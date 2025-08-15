import { useEffect, useState } from 'react';
import axios from 'axios';
import TablaCursos from '../reutilizables/componentes/TablaCursos';
import { obtenerCursosPrematricula } from '../reutilizables/logica/docente';
import SemestreSelect from '../reutilizables/componentes/SemestreSelect';
import { useUsuario } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import BotonPDF from './componentes/BotonPDF';


function Silabus() {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  const [semestre, setSemestre] = useState('202501'); // <- estado dinámico


  const { usuario } = useUsuario();
  const navigate = useNavigate();
  const token = usuario?.codigotokenautenticadorunj;

  //const semestre2 = '202501';
  const persona = '00010576';
  const dni = '40038509';
  const tipo = 'D';
  //const semestre = '202501';
 
  
   useEffect(() => {
      async function cargarCursos() {
        setLoading(true);
        const { datos: cursos, mensaje } = await obtenerCursosPrematricula(semestre, persona, dni, tipo, token);
        console.log(cursos);
        setDatos(cursos);
        setMensajeApi(mensaje);
        setLoading(false);
      }
      cargarCursos();


    }, [semestre]);


  const columnas = [
    { clave: 'curso', titulo: 'Curso', ancho: '7%' },
    { clave: 'seccion', titulo: 'Seccion', ancho: '3%' },
    { clave: 'nombre', titulo: 'Nombre del Curso', ancho: '25%' },
    { clave: 'creditos', titulo: 'Cred', ancho: '5%' },
    { clave: 'descripcionescuela', titulo: 'Escuela', ancho: '10%' },
    { clave: 'matriculados', titulo: 'Mat', ancho: '5%' },


    {
      titulo: 'Sílabo',
      ancho: '5%',
      render: (fila) => (
        <BotonPDF fila={fila} semestre={semestre} token={token} titulo={'SUBIR SILABO'}/>
      )
    }
    
  ];

  return (
    <div className="container mt-4">
      <h2><i class="fa fa-th"></i> Subir Silabo</h2>
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
export default Silabus;
