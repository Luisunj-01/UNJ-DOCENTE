import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import TablaCursos from '../../reutilizables/componentes/TablaCursos';
import { obtenerdatosasistencia } from '../logica/Curso';

import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

import ParticipantesCurso from './Participantesasistencia';
import { IconButton } from '@mui/material';
import { ToastContext } from '../../../cuerpos/Layout';

function Asistenciadocente({ datoscurso }) {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  
  const { id } = useParams();
  const decoded = atob(atob(id));
  const [sede, semestre, escuela, curricula, curso, seccion, nombrecurso, nombredocente] = decoded.split('|');
  const [mostrarParticipantes, setMostrarParticipantes] = useState(false);
  const [datosCursoSeleccionado, setDatosCursoSeleccionado] = useState(null);
  const { mostrarToast } = useContext(ToastContext);  

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);

    try {
      const respuestaAsistencia = await obtenerdatosasistencia(sede, semestre, escuela, curricula, curso, seccion);

      if (!respuestaAsistencia || !respuestaAsistencia.datos) {
        setMensajeApi('No se pudo obtener el detalle de asistencia.');
        setLoading(false);
        return;
      }

      setDatos(respuestaAsistencia.datos);
      setMensajeApi(respuestaAsistencia.mensaje);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMensajeApi('Ocurrió un error al obtener los datos.');
    }

    setLoading(false);
  };

  const handleClick = (tipo, fila) => {
    console.log(`Click en: ${tipo}`, fila);
  };

  const imprimirTodasLasAsistencias = () => {
    console.log('Imprimir todas las asistencias');
    // Aquí puedes agregar lógica para imprimir toda la tabla o generar PDF
  };

  const columnas = [
    { clave: 'sesion', titulo: 'Sesión' },
    { clave: 'contenido', titulo: 'Contenido' },
    { clave: 'fecha', titulo: 'Fecha' },
    {
      clave: '',
      titulo: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
          <span>Asistencia</span>
          <IconButton
              title="REGISTRO DE SESIONES DE CLASE"
              onClick={imprimirTodasLasAsistencias}
              size="small"
            >
              <PrintIcon style={{ color: '#28a745' }} />
            </IconButton>


            <IconButton
              title="IMPRIMIR"
              onClick={imprimirTodasLasAsistencias}
              size="small"
            >
              <PrintIcon style={{ color: '#a954b4ff' }} />
            </IconButton>
        </div>
      ),
      render: (fila) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <IconButton
            title={`Imprimir Asistencia: ${nombrecurso}`}
            onClick={() => handleClick('guia', fila)}
            color="primary"
            size="small"
          >
            <PrintIcon />
          </IconButton>

          <IconButton
            title={`Modificar Asistencia: ${nombrecurso}`}
            onClick={() => {
              setDatosCursoSeleccionado({ ...fila, modoEdicion: true });
              setMostrarParticipantes(true);
            }}
            color="success"
            size="small"
          >
            <EditIcon />
          </IconButton>

            <IconButton
                title="Eliminar"
                onClick={() => {
                const confirmar = window.confirm('¿Está seguro de eliminar el registro?');
                if (confirmar) {
                  handleClick('material', fila);
                }
                  }}
              color="error"
              size="small"
            >
              <BlockIcon />
            </IconButton>


          <IconButton
            title={`Nuevo Asistencia: ${nombrecurso}`}
            onClick={() => {
              setDatosCursoSeleccionado({ ...fila, modoEdicion: false });
              setMostrarParticipantes(true);
            }}
            color="info"
            size="small"
          >
            <NoteAddIcon />
          </IconButton>
        </div>
      ),
    }
  ];

  const handleVolver = () => {
    setMostrarParticipantes(false);
    setDatosCursoSeleccionado(null);
  };

  return mostrarParticipantes && datosCursoSeleccionado ? (
    <>
      <div className="mb-3">
        <button className="btn btn-secondary" onClick={handleVolver}>
          ← Regresar
        </button>
      </div>
      <ParticipantesCurso datoscurso={datosCursoSeleccionado} />
    </>
  ) : (
    // 👉 Aquí está tu contenido original
    <div>
      <div className="alert alert-info text-center">
        <strong style={{ color: '#085a9b' }}>ASISTENCIA</strong>
      </div>

      {loading ? (
        <div className="alert alert-warning text-center mt-4">Cargando...</div>
      ) : datos.length === 0 ? (
        <div className="alert alert-warning text-center mt-4">{mensajeApi}</div>
      ) : (
        <TablaCursos datos={datos} columnas={columnas} />
      )}
    </div>
  );
}

export default Asistenciadocente;




