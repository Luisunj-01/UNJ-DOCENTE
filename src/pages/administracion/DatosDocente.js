import { useEffect, useState } from 'react';
import Datosacademicos from './componentes/Datosacademicos';
import { obtenerdatdocente } from './logica/DatosDocenteLogica';
import { useUsuario } from '../../context/UserContext';
import Datospersonales from './componentes/Datospersonales';
import { obtenerdatosreu } from '../reutilizables/logica/docente';
import BreadcrumbUNJ from '../../cuerpos/BreadcrumbUNJ';
import { FaAddressCard, FaBookReader } from 'react-icons/fa';

function DatosDocente() {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('academicos');
  const [mensajeApi, setMensajeApi] = useState('');
  const { usuario } = useUsuario();
  

  const token = usuario?.codigotokenautenticadorunj;

  console.log(usuario?.docente.persona);
  //console.log(token);
  const persona = usuario?.docente.persona;
  const docente = usuario?.docente.docente;
  const nivel = '1';
  const tipo = 'D';
  const accion = 'C';


useEffect(() => {
  async function cargarDatosCompletos() {
    setLoading(true);

    // 1. Obtener datos principales del docente
    const { datos: datosDocenteArray, mensaje: mensajeDocente } = await obtenerdatdocente(
      persona,
      docente,
      nivel,
      tipo,
      accion,
      token
    );
    const datosDocente = Array.isArray(datosDocenteArray) ? datosDocenteArray[0] : null;
    console.log(datosDocente);

    if (!datosDocente) {
      setMensajeApi(mensajeDocente);
      setLoading(false);
      return;
    }

    // 2. Obtener datos del departamento académico
    
    const { datos: datosEstadoc, mensaje: mensajeEstado } = await obtenerdatosreu(datosDocente.estadocivil, 'mae_estadocivil', 'estadocivil');
    const datosestac = Array.isArray(datosEstadoc) ? datosEstadoc[0] : null;

    

    // 3. Combinar ambos objetos
    const datosCombinados = {
      ...datosDocente,
      ...datosestac,
      estadoc: datosestac, 
    };
    //console.log(datosCombinados);
    



    // 4. Guardar datos combinados en estado
    setDatos(datosCombinados);
    setMensajeApi('');
    setLoading(false);
  }


  cargarDatosCompletos();
}, []);

  if (loading) {
    return <div className="alert alert-info text-center mt-4">Cargando...</div>;
  }
  if (!datos && !loading) {
    return <div className="alert alert-warning text-center mt-4">{mensajeApi}</div>;
  }

  return (
    <>

      <BreadcrumbUNJ />
      
      <div className="container mt-4">
      {/*<h2> Datos del Docente <img alt="Logo UNJ" class="logounjcont mb-3 " src={logo} ></img></h2> */}
      
        <div className='containerunj'>
          <div className="">
            
            {/* Nav Tabs */}
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'academicos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('academicos')}
                >
                  <FaBookReader className="me-2"  color="#085a9b" /> Datos Académicos
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'personales' ? 'active' : ''}`}
                  onClick={() => setActiveTab('personales')}
                >
                  <FaAddressCard className="me-2"  color="#085a9b" />  Datos Personales
                </button>
              </li>
            </ul>

            {loading ? (
              <div className="alert alert-warning text-center mt-4">cargando..</div>
            ) : datos.length === 0 ? (
              <div className="alert alert-warning text-center mt-4">{mensajeApi}</div>
            ) : (
              <>
                {activeTab === 'academicos' && (
                   <Datosacademicos datos={datos} />
                )}
                {activeTab === 'personales' && (
                  <Datospersonales datos={datos} />
                )}
              </>
            )}

            

          </div>
        </div>
      </div>
    </>
    
  );

 
}

export default DatosDocente;
