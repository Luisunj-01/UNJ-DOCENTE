import { useEffect, useState } from 'react';
import { useParams, useLocation, Link} from 'react-router-dom';
import BreadcrumbUNJ from '../../cuerpos/BreadcrumbUNJ';
import { useUsuario } from '../../context/UserContext';
import { FaBookReader, FaAddressCard, FaUsers, FaStar, FaBookOpen } from 'react-icons/fa';
import { obtenerdatdocente } from './logica/Curso';
import BotonPDF from '../asignatura/componentes/BotonPDF';
import { obtenerConfiguracion, obtenerCursosPrematricula } from '../reutilizables/logica/docente';
import Asistenciadocente from './componentes/Asistenciadocente';
import DetalleGuias from './componentes/DetalleGuias';
import Detallecursoprincipal from './componentes/Detallecursoprincipal';

function Detallecursos() {
  const [activeTab, setActiveTab] = useState('principal');
  const [datos, setDatos] = useState([]);
  const [validarfechasilabu, setValidarfechasilabu] = useState(null);
  
   const [datoscurso, setDatoscurso] = useState([]);
  const [datosdocente, setDatosDocente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;
  const location = useLocation();
  const cursoDesdeLink = location.state?.cursoSeleccionado; 
  

  const { id } = useParams();
  const decoded = atob(atob(id)); 
  
  const [sede, semestre, escuela, curricula, curso, seccion, nombrecurso, nombredocente] = decoded.split('|');
  
  //console.log(cursoDesdeLink);

  const persona = usuario.docente.persona;
  const docente = usuario.docente.docente;
  const nivel = "1";
  const dni = usuario.docente.numerodocumento;;
  
  const tipo = 'D';
  const accion = "C";
  useEffect(() => {


 setDatoscurso({
    escuela,
    curso,
    seccion,
    nombrecurso,
    nombredocente,
  });

  
  async function cargarDatosCompletos() {

    const respuesta = await obtenerdatdocente(
        cursoDesdeLink.persona,
        cursoDesdeLink.docente,
        nivel,
        tipo,
        accion
    );

    const datosDocenteArray = respuesta?.datos ?? []; // usamos "datos" del JSON

    if (Array.isArray(datosDocenteArray) && datosDocenteArray.length > 0) {
        setDatosDocente(datosDocenteArray[0]);
    } else {
        setDatosDocente(null);
    }

            const { datos: cursos, mensaje } = await obtenerCursosPrematricula(semestre, persona, dni, tipo, token);
            
            setDatos(cursos);

            const validarfechasilabu = await obtenerConfiguracion('validarfechasilabu', { sede: sede, escuela: escuela, semestre: semestre, vperfil: 'P02'})
            

            const datosarrayvalidarfecha= validarfechasilabu ?? [];
            setValidarfechasilabu(datosarrayvalidarfecha);
    
  
  }


  cargarDatosCompletos();
}, []);



  return (
    <>
      <BreadcrumbUNJ />
      

      <div className="container mt-4">
        <div className="row justify-content-end">
          <div className="col-auto d-flex gap-2"> 
            {/* Botón para PDF del Sílabo */}
            
           
           {Array.isArray(datos) &&
  datos
    .filter(cursoItem => cursoItem.curso === curso && cursoItem.seccion === seccion)
    .map((cursoItem, index) => {
      if (Array.isArray(validarfechasilabu) && validarfechasilabu.length > 0) {
        const pasa = validarfechasilabu[0].pasa?.toLowerCase() === "si";

        if (pasa) {
          // Caso habilitado
          return (
            <BotonPDF
              key={index}
              fila={cursoItem}
              semestre={semestre}
              escuela={cursoItem.descripcionescuela}
              token={token}
              titulo={"SÍLABO DEL CURSO"}
              ruta="silabo"
              tipo="silabo"
            />
          );
        } else {
          // Caso deshabilitado
          return (
            <div key={index}>
              <button
                disabled
                style={{
                  backgroundColor: "#ccc",
                  color: "#666",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "25px",
                  cursor: "not-allowed"
                }}
              >
                SÍLABO DEL CURSO
              </button>
              <p style={{ margin: "4px 0", fontSize: "0.9rem", color: "#555" }}>
                {validarfechasilabu[0].mensaje}
              </p>
            </div>
          );
        }
      }

      return null;
    })}



            {/* Botón para redirección a Guías */}
            {/*<Link
              to={`/Curso/detalle_guias/${btoa(btoa(`${usuario.docente.sede}|${semestre}|${escuela}|${cursoDesdeLink.curricula}|${curso}|${seccion}|${nombrecurso}|${nombredocente}`))}`}
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              title="Ver Guías del Curso"
            >
              <FaBookOpen size={18} />
              GUÍAS
            </Link> */}
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
            {/* Menú lateral se mostrará primero en móviles */}
            <div className="col-12 col-md-3 order-1 order-md-2 mb-3">
            <div className="list-group shadow-sm">
                <button
                className={`list-group-item list-group-item-action ${activeTab === 'principal' ? 'active' : ''}`}
                onClick={() => setActiveTab('principal')}
                >
                <FaBookOpen className="me-2" /> Principal
                </button>
               
                <button
                className={`list-group-item list-group-item-action ${activeTab === 'Guias' ? 'active' : ''}`}
                onClick={() => setActiveTab('Guias')}
                >
                <FaBookOpen className="me-2" /> Guias
                </button>
               
                <button
                className={`list-group-item list-group-item-action ${activeTab === 'Asistencia' ? 'active' : ''}`}
                onClick={() => setActiveTab('Asistencia')}
                >
                <FaUsers className="me-2" /> Asistencia
                </button>
                <button
                className={`list-group-item list-group-item-action ${activeTab === 'calificaciones' ? 'active' : ''}`}
                onClick={() => setActiveTab('calificaciones')}
                >
                <FaStar className="me-2" /> Calificaciones
                </button>
            </div>
            </div>

            {/* Contenido dinámico */}
            <div className="col-12 col-md-9 order-2 order-md-1">
            <div className="p-3 bg-white rounded shadow-sm">
                {activeTab === 'principal' && <Detallecursoprincipal datos={datoscurso} />}
                {activeTab === 'Asistencia' && <Asistenciadocente datos={datos} />}
                {activeTab === 'Guias' && <DetalleGuias datos={datos} />}
                {/*{activeTab === 'personales' && <Datospersonalesdocente datosdocente={datosdocente} />}
                {activeTab === 'participantes' && <ParticipantesCurso curso={curso} seccion={seccion} />}
                {activeTab === 'calificaciones' && <CalificacionesCurso curso={curso} />}  */}
            </div>
            </div>
        </div>
        </div>

    </>
  );
}

export default Detallecursos;
