import { useEffect, useState } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import BreadcrumbUNJ from '../../cuerpos/BreadcrumbUNJ';
import { useUsuario } from '../../context/UserContext';
import { FaUsers, FaStar, FaBookOpen, FaFileAlt, FaBook, FaThumbsUp, FaClipboardList, FaLock, FaFileExcel, FaAnchor, FaAlignJustify } from 'react-icons/fa';
import { obtenerdatdocente } from './logica/Curso';
import BotonPDF from '../asignatura/componentes/BotonPDF';
import { obtenerConfiguracion, obtenerCursosPrematricula } from '../reutilizables/logica/docente';
import Asistenciadocente from './componentes/Asistenciadocente';
import DetalleGuias from './componentes/DetalleGuias';
import Detallecursoprincipal from './componentes/Detallecursoprincipal';
import CalificacionesDocente from './componentes/CalificacionesDocente';
import { FaHome} from 'react-icons/fa';


//import CalificacionesDocente from './componentes/CalificacionesDocente';

function Detallecursos() {
  const [activeTab, setActiveTab] = useState('principal');
  const [showSubmenu, setShowSubmenu] = useState(false);
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

  // 🔹 Manejo seguro del parámetro id
  const { id } = useParams();
  let decoded = '';
  try {
    const safeId = decodeURIComponent(id);
    decoded = atob(atob(safeId));
  } catch (error) {
    console.error('Error al decodificar id:', id, error);
  }

  const [sede, semestre, escuela, curricula, curso, seccion, nombrecurso, nombredocente,unidad] =
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

        const { datos: cursos, mensaje } = await obtenerCursosPrematricula(
          semestre,
          persona,
          dni,
          tipo,
          token
        );
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

  return (
    <>
      <BreadcrumbUNJ />

      <div className="container mt-4">
        <div className="row justify-content-end">
          <div className="col-auto d-flex gap-2">
            {/* Botón para PDF del Sílabo */}
            {Array.isArray(datos) &&
              datos
                .filter((cursoItem) => cursoItem.curso === curso && cursoItem.seccion === seccion)
                .map((cursoItem, index) => {
                  if (Array.isArray(validarfechasilabu) && validarfechasilabu.length > 0) {
                    const pasa = validarfechasilabu[0].pasa?.toLowerCase() === 'si';

                    if (pasa) {
                      // Caso habilitado
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
                      // Caso deshabilitado
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
                      const opciones = "width=900,height=700,scrollbars=yes,resizable=yes";

                      // 🔹 Armamos el código base64
                      const cadena = `${sede}|${semestre}|${escuela}|${curricula}|${curso}|${seccion}`;
                      const codigo = btoa(btoa(cadena));

                      // 🔹 Abrimos nueva ventana apuntando a tu ruta Laravel
                      window.open(`/imprimirlistamatriculados?codigo=${codigo}`, "PreMatriculados", opciones);
                    }}

                  >
                    <FaBook className="me-2" /> Listado de matriculados
                  </button>

                  {/*
                    <button
                      className={`list-group-item list-group-item-action ${
                        activeTab === 'calificaciones-lista' ? 'active' : ''
                      }`}
                      onClick={() => setActiveTab('calificaciones-lista')}
                    >
                      <FaThumbsUp className="me-2" /> Lista de matriculados
                    </button>
                    */}


                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === 'calificaciones-registro' ? 'active' : ''
                    }`}
                    onClick={() => {
                      const opciones = "width=900,height=700,scrollbars=yes,resizable=yes";

                      // 🔹 Armamos el código base64
                      const cadena = `${sede}|${semestre}|${escuela}|${curricula}|${curso}|${seccion}|${unidad}`;
                      const codigo = btoa(btoa(cadena));

                      // 🔹 Abrimos nueva ventana apuntando a tu ruta Laravel
                      window.open(`/imprimirreportenota?codigo=${codigo}`, "PreRegistro", opciones);
                    }}
                  >
                    <FaClipboardList className="me-2" /> Registro de notas
                  </button>

                  {/*
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === 'calificaciones-excel1' ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab('calificaciones-excel1')}
                  >
                    <FaFileExcel className="me-2 text-danger" /> Registro de notas excel (formato 1)
                  </button>
                   */}


                   {/*

                   <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === 'calificaciones-excel2' ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab('calificaciones-excel2')}
                  >
                    <FaFileExcel className="me-2 text-success" /> Registro de notas excel (formato 2)
                  </button>

                   */}

                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === 'calificaciones-guia' ? 'active' : ''
                    }`}

                    onClick={() => {
                      const opciones = "width=900,height=700,scrollbars=yes,resizable=yes";

                      // 🔹 Armamos el código base64
                      const cadena = `${sede}|${semestre}|${escuela}|${curricula}|${curso}|${seccion}`;
                      const codigo = btoa(btoa(cadena));

                      // 🔹 Abrimos nueva ventana apuntando a tu ruta Laravel
                      window.open(`/imprimirfichaguia?codigo=${codigo}`, "Ficha", opciones);
                    }}

                  >
                    <FaLock className="me-2" /> Formato Guia
                  </button>

                  
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === 'calificaciones-preacta' ? 'active' : ''
                    }`}
                    onClick={() => {
                      const opciones = "width=900,height=700,scrollbars=yes,resizable=yes";

                      // 🔹 Armamos el código base64
                      const cadena = `${sede}|${semestre}|${escuela}|${curricula}|${curso}|${seccion}|${nombrecurso}`;
                      const codigo = btoa(btoa(cadena));

                      // 🔹 Abrimos nueva ventana apuntando a tu ruta Laravel
                      window.open(`/imprimiractadetalle?codigo=${codigo}`, "PreActa", opciones);
                    }}
                  >
                    <FaAlignJustify className="me-2 text-danger" /> Pre Acta (Importante)
                  </button>


                  {/*

                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === 'calificaciones-preacta-adicional' ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab('calificaciones-preacta-adicional')}
                  >
                    <FaAlignJustify className="me-2 text-purple-500" /> Pre Acta Adicional
                  </button>

                   */}
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === 'calificaciones-cerrar' ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab('calificaciones-cerrar')}
                  >
                    <FaAnchor className="me-2" /> Cerrar curso
                  </button>
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
              {activeTab.startsWith('calificaciones') && <CalificacionesDocente datosprincipal={datos} />}
              {/*{activeTab === 'personales' && <Datospersonalesdocente datosdocente={datosdocente} />}
              {activeTab === 'participantes' && <ParticipantesCurso curso={curso} seccion={seccion} />}
              {activeTab === 'calificaciones' && <CalificacionesCurso curso={curso} />} */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Detallecursos;
