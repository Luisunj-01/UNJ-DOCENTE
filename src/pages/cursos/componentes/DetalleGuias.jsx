import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from "axios";
import Swal from "sweetalert2";

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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem, Tooltip , ListItemText } from '@mui/material';
import { obtenerDatosguias } from '../logica/Curso';
import { useUsuario } from '../../../context/UserContext';
import { obtenerCursosPrematricula } from '../../reutilizables/logica/docente';
import MaterialesCurso from './MaterialesCurso';
import TrabajosCurso from './TrabajosCurso';
import ParticipantesGuias from './ParticipantesGuias';
import { Modal, Button } from 'react-bootstrap';
import RevisionTraPart from './ParticipantesTrabajo';
import RecursosModal from '../../reutilizables/componentes/RecursosModal';
import NuevoGuia from './Nuevoguia';
import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';
import config from "../../../config"; // 🔹 Asegúrate que la ruta de tu API esté aquí
import ModalEditarGuia from "./ModalEditarGuia";
import AccionesMenu from './AccionesMenu';
import { io } from "socket.io-client";  // 👈 IMPORTANTE: agrega esta línea

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
  const datoscursos = { sede, semestre, escuela, curricula, curso, seccion };
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [filaEditar, setFilaEditar] = useState(null);


  
  const codex = `${sede}|${semestre}|${escuela}|${curricula}|${curso}|${seccion}`;
  //$cod = $alumno.$sede.$escuela.$curricula;
  //const codex = alumno + escuela + curricula + semestre;
  //const cod =  alumno + sede + escuela + curricula;	
  const code_zet = btoa(btoa(codex));

  const [mostrarParticipantes, setMostrarParticipantes] = useState(false);
  const [filaParticipantes, setFilaParticipantes] = useState(null);
  const [filanuevoguia, setFilanuevoguia] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [filaDetalles, setFilaDetalles] = useState(null);
  const [mostrarnuevoguia, setMostrarnuevoguia] = useState(false); 

  const [mostrarRecursos, setMostrarRecursos] = useState(false);
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);
  const [tipoRecursoSeleccionado, setTipoRecursoSeleccionado] = useState(null);

  const token = usuario?.codigotokenautenticadorunj;
  const persona = usuario.docente.persona;
  const dni = usuario.docente.numerodocumento;
  const tipo = 'D';

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
      cargarDatos(); // primera carga de datos

    
    }, []); // 👈 se ejecuta una sola vez al montar

    const ventanaSecundaria = (url) => {
      window.open(url, 'Certificado', 'width=1200,height=700,scrollbars=yes');
    };

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

  // 🔹 FUNCIÓN ELIMINAR GUÍA
  const eliminarGuia = async (fila) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `Se eliminará la guía de la semana ${fila.semana}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(`${config.apiUrl}api/curso/EliminarGuias`, {
            sede,
            semestre,
            escuela,
            curricula, 
            curso,
            seccion,
            semana: fila.semana
          });

          if (!response.data.error) {
            Swal.fire("Eliminado", response.data.mensaje, "success");
            cargarDatos(); // refresca la tabla
          } else {
            Swal.fire("Error", response.data.mensaje, "error");
          }
        } catch (error) {
          Swal.fire("Error", "No se pudo eliminar la guía.", "error");
          console.error(error);
        }
      }
    }); 
  };

  const handleClick = (tipo, fila) => {
    if (tipo === 'materiales' || tipo === 'trabajos') {
      setFilaSeleccionada(fila);
      setTipoRecursoSeleccionado(tipo);
      setMostrarRecursos(true);
    } else if (tipo === 'participantes') {
      setFilaParticipantes(fila);
      setMostrarParticipantes(true);
    } else if (tipo === 'nuevoguia') {
      setFilanuevoguia(fila);
      setMostrarnuevoguia(true);
    } else if (tipo === 'detalles') { 
      setFilaDetalles(fila);
      setMostrarDetalles(true);
    }
  };

  const columnas = [
    { clave: 'semana', titulo: 'Semana' },
    { clave: 'contenido', titulo: 'Contenido' },
    {
      clave: 'fecha',
      titulo: 'Fecha',
      render: (fila) => {
        // 👇 Función para formatear fecha
        const formatFecha = (fechaStr) => {
          if (!fechaStr) return "";
          
          // Caso: viene como yyyy-mm-dd
          if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
            const [y, m, d] = fechaStr.split("-");
            return `${d}/${m}/${y}`;
          }

          // Caso: viene como dd/mm/yyyy (ya lista)
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaStr)) {
            return fechaStr;
          }

          // Último recurso: usar Date (puede restar un día según zona horaria)
          const d = new Date(fechaStr);
          if (isNaN(d)) return fechaStr;
          return d.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        };
        // 👇 Parsear fechas adicionales
        const fechasExtras = [];
        try {
          if (fila.fechas_adicionales) {
            fechasExtras.push(...JSON.parse(fila.fechas_adicionales));
          }
        } catch (e) {
          console.error("Error parseando fechas adicionales", e);
        }

        return (
          <div>
            {/* Fecha principal */}
            <div>{formatFecha(fila.fecha)}</div>

            {/* Fechas adicionales */}
            {fechasExtras.map((f, i) => (
              <div key={i}>{formatFecha(f.fecha)}</div>
            ))}
          </div>
        );
      }
    },

    {
      titulo: 'Guía',
      render: (fila) => {
        const cursoItem = datos3.find(item =>
          item.curso === curso &&
          item.seccion === seccion &&
          item.curricula === curricula
        );

       

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
      },
    },
    {
      clave: '',
      titulo: 'Acciones',
      render: (fila) => (
        <AccionesMenu 
          fila={fila}
          onEliminar={eliminarGuia}
          onEditar={(fila) => { setFilaEditar(fila); setMostrarEditar(true); }}
          onVer={handleClick}
        />
      )
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

        {/* 🔵 BOTONES ARRIBA DERECHA */}
        <div className="d-flex justify-content-end align-items-center gap-2 mb-3">

          {/* Botones de imprimir */}
          <Tooltip title="Registro de sesiones de clase">
            <IconButton
              color="primary"
              onClick={() => {
                const opciones = 'width=900,height=700,scrollbars=yes,resizable=yes';
                const cadena = `${sede}|${semestre}|${escuela}|${curricula}|${curso}|${seccion}`;
                const codigo = btoa(btoa(cadena));
                window.open(`/imprimirreportesesiones?codigo=${codigo}`, 'RepSesion', opciones);
              }}
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Registro de asistencia (Guias)">
            <IconButton
              color="secondary"
              onClick={() => {
                const opciones = 'width=900,height=700,scrollbars=yes,resizable=yes';
                const cadena = `${sede}|${semestre}|${escuela}|${curricula}|${curso}|${seccion}`;
                const codigo = btoa(btoa(cadena));
                window.open(`/imprimirasistenciaguia?codigo=${codigo}`, 'Repguia', opciones);
              }}
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>

        

          {/* Botón Nuevo Guía */}
          <Button 
            variant="info" 
            className="d-flex align-items-center gap-2"
            onClick={() => handleClick('nuevoguia', {})}
          >
            <NoteAddIcon /> Nuevo Guía
          </Button>
        </div>


        {loading ? (
          <TablaSkeleton filas={9} columnas={6} />
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
        <Modal show={mostrarParticipantes} onHide={() => setMostrarParticipantes(false)} size="xl">
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

        {/* Modal Detalles */}
        <Modal show={mostrarDetalles} onHide={() => setMostrarDetalles(false)} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Revisión de Trabajos</Modal.Title> 
          </Modal.Header>
          <Modal.Body>
            {filaDetalles && <RevisionTraPart datoscurso={filaDetalles} semana={filaDetalles.semana}  />}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setMostrarDetalles(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal Nuevo Guía */}
        <Modal show={mostrarnuevoguia} onHide={() => setMostrarnuevoguia(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Nuevo Guía</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {filanuevoguia && (
              <NuevoGuia 
                datoscurso={datoscursos} 
                semana={filanuevoguia.semana} 
                onUpdated={cargarDatos} 
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setMostrarnuevoguia(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ✅ Modal Editar Guía separado */}
          <ModalEditarGuia
            show={mostrarEditar}
            onClose={() => setMostrarEditar(false)}
            fila={filaEditar}
            datoscursos={datoscursos}
            onUpdated={cargarDatos}
          />

      </div>
    </>
  ); 
}

export default DetalleGuias;
