import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import BreadcrumbUNJ from '../../cuerpos/BreadcrumbUNJ';
import { useUsuario } from '../../context/UserContext';
import {
  FaUsers,
  FaStar,
  FaBookOpen,
  FaFileAlt,
  FaBook,
  FaThumbsUp,
  FaClipboardList,
  FaLock,
  FaFileExcel,
  FaAnchor,
  FaAlignJustify,
  FaHome,
} from 'react-icons/fa';
import { obtenerdatdocente, obtenervalidacioncurso } from './logica/Curso';
import BotonPDF from '../asignatura/componentes/BotonPDF';
import { obtenerConfiguracion, obtenerCursosPrematricula } from '../reutilizables/logica/docente';
import Asistenciadocente from './componentes/Asistenciadocente';
import DetalleGuias from './componentes/DetalleGuias';
import Detallecursoprincipal from './componentes/Detallecursoprincipal';
import CalificacionesDocente from './componentes/CalificacionesDocente';
import Swal from "sweetalert2";

function Detallecursos() {
  const [activeTab, setActiveTab] = useState('principal');
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [datos, setDatos] = useState([]);
  const [validarfechasilabu, setValidarfechasilabu] = useState(null);

  const [datoscurso, setDatoscurso] = useState([]);
  const [validacioncurso, setValidacionCurso] = useState([]);
  
  const [datosdocente, setDatosDocente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;
  const location = useLocation();
  const cursoDesdeLink = location.state?.cursoSeleccionado;

  const { id } = useParams();
  let decoded = '';
  try {
    const safeId = decodeURIComponent(id);
    decoded = atob(atob(safeId));
  } catch (error) {
    console.error('Error al decodificar id:', id, error);
  }

  const [sede, semestre, escuela, curricula, curso, seccion, nombrecurso, nombredocente, unidad, estructura] =
    decoded.split('|') ?? [];

  const persona = usuario.docente.persona;
  const docente = usuario.docente.docente;
  const nivel = '1';
  const dni = usuario.docente.numerodocumento;
  const tipo = 'D';
  const accion = 'C';

  useEffect(() => {
    setDatoscurso({
      escuela,
      curso,
      seccion,
      nombrecurso,
      nombredocente,
    });

    async function cargarDatosCompletos() {
      //const obtenervalidacion = await obtenervalidacioncurso(semestre, persona, dni);
      //setValidacionCurso(obtenervalidacion);
      try {
        const respuesta = await obtenerdatdocente(
          cursoDesdeLink.persona,
          cursoDesdeLink.docente,
          nivel,
          tipo,
          accion
        );

        

        const datosDocenteArray = respuesta?.datos ?? [];
        if (Array.isArray(datosDocenteArray) && datosDocenteArray.length > 0) {
          setDatosDocente(datosDocenteArray[0]);
        } else {
          setDatosDocente(null);
        }

        /*const { datos: cursos, mensaje } = await obtenerCursosPrematricula(
          semestre,
          persona,
          dni,
          tipo,
          token
        );*/

        const { datos: cursos, mensaje } = await obtenerCursosPrematricula(
          semestre,
          persona,
          dni,
          tipo,
          token
        )
        setDatos(cursos);

        const validarfechasilabu = await obtenerConfiguracion('validarfechasilabu', {
          sede: sede,
          escuela: escuela,
          semestre: semestre,
          vperfil: 'P02',
        });

        const datosarrayvalidarfecha = validarfechasilabu ?? [];
        setValidarfechasilabu(datosarrayvalidarfecha);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setMensajeApi('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    }

    

    cargarDatosCompletos();
  }, []);

  console.log(datos);

  const cursoActual = Array.isArray(datos)
    ? datos.find(d => d.curso === curso && d.seccion === seccion)
    : null;






  return (
    <>
      <BreadcrumbUNJ />

      <div className="container mt-4">
        <div className="row justify-content-end">
          <div className="col-auto d-flex gap-2">
            {Array.isArray(datos) &&
              datos
                .filter((cursoItem) => cursoItem.curso === curso && cursoItem.seccion === seccion)
                .map((cursoItem, index) => {
                  if (Array.isArray(validarfechasilabu) && validarfechasilabu.length > 0) {
                    const pasa = validarfechasilabu[0].pasa?.toLowerCase() === 'si';

                    if (pasa) {
                      return (
                        <BotonPDF
                          key={index}
                          fila={cursoItem}
                          semestre={semestre}
                          escuela={cursoItem.descripcionescuela}
                          token={token}
                          titulo={'SÍLABO DEL CURSO'}
                          ruta="silabo"
                          tipo="silabo"
                        />
                      );
                    } else {
                      return (
                        <div key={index}>
                          <button
                            disabled
                            style={{
                              backgroundColor: '#ccc',
                              color: '#666',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '25px',
                              cursor: 'not-allowed',
                            }}
                          >
                            SÍLABO DEL CURSO
                          </button>
                          <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#555' }}>
                            {validarfechasilabu[0].mensaje}
                          </p>
                        </div>
                      );
                    }
                  }

                  return null;
                })}
          </div>
        </div>
      </div> 

      <div className="container mt-4">
        <div className="row">
          {/* Menú lateral */}
          <div className="col-12 col-md-3 order-1 order-md-2 mb-3">
            <div className="list-group shadow-sm">
              <button
                className={`list-group-item list-group-item-action ${
                  activeTab === 'principal' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('principal')}
              >
                <FaHome className="me-2" /> Principal
              </button>

              <button
                className={`list-group-item list-group-item-action ${
                  activeTab === 'Guias' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('Guias')}
              >
                <FaBookOpen className="me-2" /> Guias
              </button>

              <button
                className={`list-group-item list-group-item-action ${
                  activeTab === 'Asistencia' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('Asistencia')}
              >
                <FaUsers className="me-2" /> Asistencia
              </button>

              {/* Calificaciones con submenú */}
              <button
                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                  activeTab.startsWith('calificaciones') ? 'active' : ''
                }`}
                onClick={() => setShowSubmenu(!showSubmenu)}
              >
                <span>
                  <FaStar className="me-2" /> Calificaciones
                </span>
                <span>{showSubmenu ? '▲' : '▼'}</span>
              </button>

              {showSubmenu && (
                <div className="list-group ms-3">
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === 'calificaciones-informe' ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab('calificaciones-informe')}
                  >
                    <FaFileAlt className="me-2" /> Registro de Notas
                  </button>

                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === 'calificaciones-excel' ? 'active' : ''
                    }`}
                    onClick={() => {
                      const opciones = 'width=900,height=700,scrollbars=yes,resizable=yes';
                      const cadena = `${sede}|${semestre}|${escuela}|${curricula}|${curso}|${seccion}`;
                      const codigo = btoa(btoa(cadena));
                      window.open(`/imprimirlistamatriculados?codigo=${codigo}`, 'PreMatriculados', opciones);
                    }}
                  >
                    <FaBook className="me-2" /> Listado de matriculados
                  </button>

                  
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === 'calificaciones-registro' ? 'active' : ''
                    }`}
                    onClick={() => {
                      const opciones = 'width=900,height=700,scrollbars=yes,resizable=yes';
                      const cadena = `${sede}|${semestre}|${escuela}|${curricula}|${curso}|${seccion}|${unidad}`;
                      const codigo = btoa(btoa(cadena));
                      window.open(`/imprimirreportenota?codigo=${codigo}`, 'PreRegistro', opciones);
                    }}
                  >
                    <FaClipboardList className="me-2" /> Registro de notas
                  </button>

                  

                  

                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === 'calificaciones-guia' ? 'active' : ''
                    }`}
                    onClick={() => {
                      const opciones = 'width=900,height=700,scrollbars=yes,resizable=yes';
                      const cadena = `${sede}|${semestre}|${escuela}|${curricula}|${curso}|${seccion}`;
                      const codigo = btoa(btoa(cadena));
                      window.open(`/imprimirfichaguia?codigo=${codigo}`, 'Ficha', opciones);
                    }}
                  >
                    <FaLock className="me-2" /> Formato Guia
                  </button>

                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === 'calificaciones-preacta' ? 'active' : ''
                    }`}
                    onClick={() => {
                      const opciones = 'width=900,height=700,scrollbars=yes,resizable=yes';
                      const cadena = `${sede}|${semestre}|${escuela}|${curricula}|${curso}|${seccion}|${nombrecurso}`;
                      const codigo = btoa(btoa(cadena));
                      window.open(`/imprimiractadetalle?codigo=${codigo}`, 'PreActa', opciones);
                    }}
                  >
                    <FaAlignJustify className="me-2 text-danger" /> Pre Acta (Importante)
                  </button>

                   
                    
                  {cursoActual?.cerrado !== 1 && (

    <button
  className={`list-group-item list-group-item-action ${
    activeTab === 'calificaciones-cerrar' ? 'active' : ''
  }`}
  onClick={async () => {
    const confirmar = await Swal.fire({
      title: "¿Está seguro?",
      text: "Se cerrará el ingreso de notas y no podrá modificarlas.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar",
      cancelButtonText: "Cancelar",
    });

    if (confirmar.isConfirmed) {
      try {
        const data = await obtenervalidacioncurso(
          sede,
          semestre,
          escuela,
          curricula,
          curso,
          seccion,
          "1",
        );

        console.log(data);
        
        if (!data || data.error) {
          throw new Error(data?.mensaje || "Error en la petición");
        }

        Swal.fire({
          icon: "success",
          title: "¡Proceso completado!",
          text: data.mensaje || "✅ Calificaciones cerradas correctamente",
          confirmButtonText: "Aceptar",
        });

        setActiveTab("principal");
        window.location.reload();
      } catch (error) {
        console.error("Error cerrando curso:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "❌ Hubo un error al cerrar las calificaciones",
        });
      }
    }
  }}
>
  <FaAnchor className="me-2" /> Cerrar calificaciones
</button>



                )}
                </div>
              )}
            </div>
          </div>

          {/* Contenido dinámico */}
          <div className="col-12 col-md-9 order-2 order-md-1">
            <div className="p-3 bg-white rounded shadow-sm">
              {activeTab === 'principal' && <Detallecursoprincipal datos={datoscurso} />}
              {activeTab === 'Asistencia' && <Asistenciadocente datos={datos} />}
              {activeTab === 'Guias' && <DetalleGuias datos={datos} />}
              {activeTab.startsWith('calificaciones') && <CalificacionesDocente datosprincipal={datos} cerrado={cursoActual?.cerrado}/>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Detallecursos;
