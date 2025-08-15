import { useEffect, useState } from 'react';
import axios from 'axios';
import TablaCursos from '../reutilizables/componentes/TablaCursos';
import { obtenerReza, obtenerAplaz } from '../reutilizables/logica/docente';
import SemestreSelect from '../reutilizables/componentes/SemestreSelect';
import { useUsuario } from '../../context/UserContext';



function IngresoRezaAplaz() {
const [datos, setDatos] = useState([]);
const [datos2, setDatos2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  const [mensajeApi2, setMensajeApi2] = useState('');
  const [semestre, setSemestre] = useState('202501'); // <- estado dinámico


  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;

 
  const persona = '00010576';
  const dni = '40038509';   
  const tipo = 'D';
  //const semestre = '202501';



   useEffect(() => {
      async function cargarCursos() {
        setLoading(true);
        const { datos: cursos, mensaje } = await obtenerReza(semestre, persona, dni, token);
        console.log(cursos);
        setDatos(cursos);
        const { datos2: cursos2, mensaje2 } = await obtenerAplaz(semestre, persona, dni, token);
        setDatos2(cursos2);

        setMensajeApi2(mensaje2);
        setMensajeApi(mensaje);
        setLoading(false);
      }
      cargarCursos();
    }, [semestre]);

  const columnas = [
      { clave: 'curso', titulo: 'Curso', ancho: '6%' },
      { clave: '', titulo: 'Nombre del Curso', ancho: '20%' },
      { clave: '', titulo: 'Alumno', ancho: '12%' },
      { clave: '', titulo: 'Apellidos', ancho: '18%' },
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
                <img src="https://pruebas.unj.edu.pe/zetunajaen/imageneszet/actawb.gif" alt="fa fa-print" border="0" />
                
              </span>
            )
      )
    }
    
  ];

  const columnas2 = [
      { clave: 'curso', titulo: 'Curso', ancho: '6%' },
      { clave: '', titulo: 'Nombre del Curso', ancho: '20%' },
      { clave: '', titulo: 'Alumno', ancho: '12%' },
      { clave: '', titulo: 'Apellidos', ancho: '18%' },
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
                <img src="https://pruebas.unj.edu.pe/zetunajaen/imageneszet/actawb.gif" alt="fa fa-print" border="0" />
                
              </span>
            )
      )
    }
    
  ];

  return (
    <div className="container mt-4">
      <h2><i class="fa fa-th"></i> Ingreso Reza/Aplaza</h2>
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
                <i class="fa fa-print"></i> Registro de Rezagados
                &nbsp;&nbsp;&nbsp;&nbsp;
            
            </div>
        </div>
      </div>

      {loading ? (
        <div className="alert alert-info text-center mt-4">Cargando...</div>
        ) : Array.isArray(datos) && datos.length === 0 ? (
        <div className="alert alert-warning text-center mt-4">{mensajeApi}</div>
        ) : (
        <TablaCursos datos={datos || []} columnas={columnas} />
        )}


      <div className="row">
        <div className="col-md-12">
            <div class="alert alert-info">
                <span class="semi-bold">Leyenda:</span>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <i class="fa fa-print"></i> Registro de Aplazados
                &nbsp;&nbsp;&nbsp;&nbsp;
            
            </div>
        </div>
      </div>
      {loading ? (
        <div className="alert alert-info text-center mt-4">Cargando...</div>
        ) : Array.isArray(datos2) && datos2.length === 0 ? (
        <div className="alert alert-warning text-center mt-4">{mensajeApi2}</div>
        ) : (
        <TablaCursos datos={datos2 || []} columnas={columnas2} />
        )}

    </div>
  );
  
}

export default IngresoRezaAplaz