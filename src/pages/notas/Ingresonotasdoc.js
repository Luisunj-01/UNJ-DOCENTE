import { useEffect, useState } from 'react';
import axios from 'axios';
import TablaCursos from '../reutilizables/componentes/TablaCursos';
import { obtenerCursosPrematricula } from '../reutilizables/logica/docente';
import SemestreSelect from '../reutilizables/componentes/SemestreSelect';
import { useUsuario } from '../../context/UserContext';


function Ingresonotasdoc(){
const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  const [semestre, setSemestre] = useState('202501'); // <- estado dinámico


  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;

  //const semestre2 = '202501';
  const persona = '00010576';
  const dni = '40038509';
  const tipo = 'D';
  //const semestre = '202501';

  ///const apiUrl = `http://127.0.0.1:8000/api/prematricula/${codigo}/${escuela}/${nivel}/${semestre}`;


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
    { clave: 'curso', titulo: 'Curso', ancho: '6%' },
    { clave: 'seccion', titulo: 'Seccion', ancho: '5%' },
    { clave: 'nombre', titulo: 'Nombre del Curso', ancho: '25%' },
    { clave: 'descripcionescuela', titulo: 'Escuela', ancho: '12%' },
    { clave: 'matriculados', titulo: 'Mat', ancho: '5%' },
    { clave: 'reserva', titulo: 'Res', ancho: '5%' },
    { clave: 'creditos', titulo: 'Creditos', ancho: '5%' },
    { clave: 'cerrado', titulo: 'Estado', ancho: '5%' },


    {
      titulo: 'Opciones',
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
    
  ];
  return (
    <div className="container mt-4">
      <h2><i class="fa fa-th"></i> Ingreso Notas Docente</h2>
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
      <div className="row">
        <div className="col-md-12">
            <div class="alert alert-info">
                <span class="semi-bold">Leyenda:</span>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <i class="fa fa-building-o"></i> Informe Academico
                &nbsp;&nbsp;&nbsp;&nbsp;
                <i class="fa fa-print"></i> Listado de matriculados
                &nbsp;&nbsp;&nbsp;&nbsp;
                <i class="fa fa-subscript"></i> Lista de matriculados
                 &nbsp;&nbsp;&nbsp;&nbsp;
                <i class="fa fa-subscript"></i> Registro de Notas
                 &nbsp;&nbsp;&nbsp;&nbsp;
                <i class="fa fa-subscript"></i> Registro de Notas excel 'formato1'
                 &nbsp;&nbsp;&nbsp;&nbsp;
                <i class="fa fa-subscript"></i> Registro de Notas excel 'formato2'
                 &nbsp;&nbsp;&nbsp;&nbsp;
                <i class="fa fa-subscript"></i> Formato guia
                 &nbsp;&nbsp;&nbsp;&nbsp;
                <i class="fa fa-subscript"></i> Pre Acta 'Importante'
                &nbsp;&nbsp;&nbsp;&nbsp;
                <i class="fa fa-subscript"></i> Pre Acta Adicional
                &nbsp;&nbsp;&nbsp;&nbsp;
                <i class="fa fa-subscript"></i> Cerrar curso

            </div>
        </div>
      </div>
    
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

export default Ingresonotasdoc