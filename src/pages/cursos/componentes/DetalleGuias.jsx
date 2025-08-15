import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import TablaCursos from '../../reutilizables/componentes/TablaCursos';
import BotonPDF from '../../asignatura/componentes/BotonPDF';

import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

import { IconButton } from '@mui/material';
import { obtenerDatosguias } from '../logica/Curso';
import { useUsuario } from '../../../context/UserContext';
import { obtenerCursosPrematricula } from '../../reutilizables/logica/docente';
import MaterialesCurso from './MaterialesCurso';
import RecursosModal from '../../reutilizables/componentes/RucrusosModal';
import TrabajosCurso from './TrabajosCurso';
import ParticipantesGuias from './ParticipantesGuias';
import { Modal, Button } from 'react-bootstrap';

function DetalleGuias({ datoscurso = [] }) {
  const { usuario } = useUsuario();
  const [datos, setDatos] = useState([]);
  const [datos2, setDatos2] = useState([]);
  const [datos3, setDatos3] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  const { id } = useParams();
  const location = useLocation();
  const decoded = atob(atob(id));
  const [sede, semestre, escuela, curricula, curso, seccion, nombre, nombredocente] = decoded.split('|');

  const [mostrarParticipantes, setMostrarParticipantes] = useState(false);
  const [filaParticipantes, setFilaParticipantes] = useState(null);

  const [mostrarRecursos, setMostrarRecursos] = useState(false);
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);
  const [tipoRecursoSeleccionado, setTipoRecursoSeleccionado] = useState(null);

  const token = usuario?.codigotokenautenticadorunj;
  const cursoDesdeLink = location.state?.cursoSeleccionado;
  const persona = usuario.docente.persona;
  const docente = usuario.docente.docente;
  const nivel = "1";
  const dni = usuario.docente.numerodocumento;
  const tipo = 'D';
  const accion = "C";

  const recursosItems = [
    {
      valor: 'materiales',
      titulo: 'Materiales del Curso',
      componente: (fila) => <MaterialesCurso fila={fila} />
    },
    {
      valor: 'trabajos',
      titulo: 'Trabajos del Curso',
      componente: (fila) => <TrabajosCurso fila={fila} />
    }
  ];

  useEffect(() => {
    cargarDatos();
    setDatos2({
      escuela,
      curso,
      seccion,
      nombre,
      nombredocente,
    });
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const respuestguias = await obtenerDatosguias(sede, semestre, escuela, curricula, curso, seccion);

      if (!respuestguias || !respuestguias.datos) {
        setMensajeApi('No se pudo obtener el detalle de Guias.');
        setLoading(false);
        return;
      }
      setDatos(respuestguias.datos);
      setMensajeApi(respuestguias.mensaje);

      const { datos: cursos } = await obtenerCursosPrematricula(semestre, persona, dni, tipo, token);
      setDatos3(cursos);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMensajeApi('Ocurrió un error al obtener los datos.');
    }
    setLoading(false);
  };

  const handleClick = (tipo, fila) => {
    if (tipo === 'materiales' || tipo === 'trabajos') {
      setFilaSeleccionada(fila);
      setTipoRecursoSeleccionado(tipo);
      setMostrarRecursos(true);
    } else if (tipo === 'participantes') {
      setFilaParticipantes(fila);
      setMostrarParticipantes(true);
    }
    // otros tipos...
  };

  const columnas = [
    { clave: 'semana', titulo: 'Semana' },
    { clave: 'contenido', titulo: 'Contenido' },
    { clave: 'fecha', titulo: 'Fecha' },
    {
      titulo: 'Guía',
      render: (fila) => {
        const cursoItem = datos3.find(item =>
          item.curso === curso &&
          item.seccion === seccion &&
          item.curricula === curricula
        );

        if (!cursoItem) {
          return <span className="text-danger">Curso no encontrado</span>;
        }

        return (
          <BotonPDF
            fila={cursoItem}
            semestre={semestre}
            escuela={cursoItem?.descripcionescuela}
            token={token}
            titulo={'GUÍAS DEL CURSO'}
            semana={fila.semana}
            ruta="guia"
            tipo="guia"
          />
        );
      }
    },
    {
      clave: '',
      titulo: 'Acciones',
      render: (fila) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <IconButton title="Ver Participantes" onClick={() => handleClick('participantes', fila)} color="primary" size="small">
            <PersonIcon />
          </IconButton>
          <IconButton title="Ver Trabajos" onClick={() => handleClick('trabajos', fila)} color="secondary" size="small">
            <NotificationsIcon />
          </IconButton>
          <IconButton title="Ver Detalles" onClick={() => handleClick('detalles', fila)} color="default" size="small">
            <MenuIcon />
          </IconButton>
          <IconButton title="Ver Materiales" onClick={() => handleClick('materiales', fila)} color="inherit" size="small">
            <FolderOpenIcon />
          </IconButton>
          <IconButton title="Imprimir" onClick={() => handleClick('guia', fila)} color="primary" size="small">
            <PrintIcon />
          </IconButton>
          <IconButton title="Modificar Guia" color="success" size="small">
            <EditIcon />
          </IconButton>
          <IconButton title="Eliminar" onClick={() => handleClick('material', fila)} color="error" size="small">
            <BlockIcon />
          </IconButton>
          <IconButton title="Nuevo Guia" color="info" size="small">
            <NoteAddIcon />
          </IconButton>
        </div>
      ),
    }
  ];
  

  return (
    <>
      <div>
        <div className="alert alert-info d-flex flex-wrap align-items-center gap-3">
          <span className="semi-bold">Leyenda:</span>
          <div className="d-flex align-items-center gap-1">
            <PersonIcon fontSize="small" style={{ color: '#1976d2' }} /> Participantes
          </div>
          <div className="d-flex align-items-center gap-1">
            <NotificationsIcon fontSize="small" style={{ color: '#9c27b0' }} /> Trabajos
          </div>
          <div className="d-flex align-items-center gap-1">
            <MenuIcon fontSize="small" style={{ color: '#555' }} /> Revision de trabajos
          </div>
          <div className="d-flex align-items-center gap-1">
            <FolderOpenIcon fontSize="small" style={{ color: '#000' }} /> Materiales
          </div>
          <div className="d-flex align-items-center gap-1">
            <PrintIcon fontSize="small" style={{ color: '#1976d2' }} /> Imprimir
          </div>
          <div className="d-flex align-items-center gap-1">
            <EditIcon fontSize="small" style={{ color: 'green' }} /> Editar
          </div>
          <div className="d-flex align-items-center gap-1">
            <BlockIcon fontSize="small" style={{ color: 'red' }} /> Eliminar
          </div>
          <div className="d-flex align-items-center gap-1">
            <NoteAddIcon fontSize="small" style={{ color: '#1976d2' }} /> Nuevo
          </div>
        </div>

        {loading ? (
          <div className="alert alert-warning text-center mt-4">cargando..</div>
        ) : datos.length === 0 ? (
          <div className="alert alert-warning text-center mt-4">{mensajeApi}</div>
        ) : (
          <TablaCursos datos={datos} columnas={columnas} />
        )}

        {mostrarRecursos && (
          <RecursosModal
            fila={filaSeleccionada}
            tipoRecurso={tipoRecursoSeleccionado}
            items={recursosItems}
            onClose={() => setMostrarRecursos(false)}
          />
        )}

        {/* Modal Participantes */}
        <Modal  show={mostrarParticipantes} onHide={() => setMostrarParticipantes(false)} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Participantes</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            
            {filaParticipantes && <ParticipantesGuias datoscurso={filaParticipantes} semana={filaParticipantes.semana}  />}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setMostrarParticipantes(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}

export default DetalleGuias;
