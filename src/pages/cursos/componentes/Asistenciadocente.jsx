import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import TablaCursos from '../../reutilizables/componentes/TablaCursos';
import { obtenerdatosasistencia } from '../logica/Curso';

import PrintIcon from '@mui/icons-material/Print';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

import ParticipantesCurso from './Participantesasistencia';
import { IconButton, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { ToastContext } from '../../../cuerpos/Layout';
import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';
import ImprimirAsistenciaSemana from '../../reportes/componentes/ImprimirAsistenciaSemana';

// 👉 Importamos el componente de impresión

function Asistenciadocente({ datoscurso }) {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');

  const { id } = useParams();
  const decoded = atob(atob(id));
  const [sede, semestre, escuela, curricula, curso, seccion, nombrecurso, nombredocente] =
    decoded.split('|');
  const [mostrarParticipantes, setMostrarParticipantes] = useState(false);
  const [datosCursoSeleccionado, setDatosCursoSeleccionado] = useState(null);
  const { mostrarToast } = useContext(ToastContext);

  // 👉 Estado para imprimir en ventana flotante
  const [openImprimir, setOpenImprimir] = useState(false);
  const [datosSeleccionados, setDatosSeleccionados] = useState(null);

  useEffect(() => {
    let interval;
    cargarDatos();
    interval = setInterval(cargarDatos, 2000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      const respuestaAsistencia = await obtenerdatosasistencia(
        sede,
        semestre,
        escuela,
        curricula,
        curso,
        seccion
      );

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

  const normalizarFecha = (fechaStr) => {
    if (!fechaStr) return null;
    const str = String(fechaStr).trim();

    // dd/mm/yyyy → yyyy-mm-dd
    let m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;

    // yyyy-mm-dd → yyyy-mm-dd
    m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;

    // yyyy/mm/dd → yyyy-mm-dd
    m = str.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;

    // ISO con T o espacio
    m = str.match(/^(\d{4})-(\d{2})-(\d{2})[T\s].*$/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;

    return null;
  };

  const columnas = [
    { clave: 'sesion', titulo: 'Sesión' },
    { clave: 'contenido', titulo: 'Contenido' },
    {
      clave: 'fecha',
      titulo: 'Fechas',
      render: (fila) => {
        const formatFecha = (fechaStr) => {
          if (!fechaStr) return '';

          const str = String(fechaStr).trim();

          if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return str;

          let m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          if (m) return `${m[3]}/${m[2]}/${m[1]}`;

          m = str.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
          if (m) return `${m[3]}/${m[2]}/${m[1]}`;

          m = str.match(/^(\d{4})-(\d{2})-(\d{2})[T\s].*$/);
          if (m) return `${m[3]}/${m[2]}/${m[1]}`;

          return str;
        };

        let fechasGuia = [formatFecha(fila.fecha_programada)];

        if (fila.fechas_adicionales) {
          try {
            const arr = JSON.parse(fila.fechas_adicionales);
            if (Array.isArray(arr)) {
              fechasGuia = fechasGuia.concat(arr.map((f) => formatFecha(f.fecha || f)));
            }
          } catch {
            fechasGuia = fechasGuia.concat(
              fila.fechas_adicionales
                .split(',')
                .map((f) => formatFecha(f.trim()))
                .filter((f) => f !== '')
            );
          }
        }

        return (
          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
            {fechasGuia.map((f, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#e0e0e0',
                  color: 'black',
                  margin: '2px',
                  padding: '3px',
                  borderRadius: '4px',
                }}
              >
                📅 {f}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      clave: '',
      titulo: 'Asistencia',
      render: (fila) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* Botón Imprimir */}
         <IconButton
            title={`Imprimir Asistencia: ${nombrecurso}`}
            onClick={() => {
              const codigo = btoa(btoa(
                `${sede}|${semestre}|${escuela}|${curricula}|${curso}|${seccion}`
              ));

              window.open(
                `/ImprimirAsistenciaSemana?codigo=${codigo}`,
                'popupImpresion',
                'width=1000,height=700,scrollbars=yes,resizable=yes'
              );
            }}
            color="primary"
            size="small"
          >
            <PrintIcon />
          </IconButton>




          {/* Botón Nuevo */}
          <IconButton
            title={`Nuevo Asistencia: ${nombrecurso}`}
            onClick={() => {
              let fechasGuia = [];
              const fPrincipal = normalizarFecha(fila.fecha_programada);
              if (fPrincipal) fechasGuia.push(fPrincipal);

              if (fila.fechas_adicionales) {
                try {
                  const arr = JSON.parse(fila.fechas_adicionales);
                  if (Array.isArray(arr)) {
                    fechasGuia = fechasGuia.concat(
                      arr.map((f) => normalizarFecha(f.fecha || f)).filter(Boolean)
                    );
                  }
                } catch {
                  fechasGuia = fechasGuia.concat(
                    fila.fechas_adicionales
                      .split(',')
                      .map((f) => normalizarFecha(f.trim()))
                      .filter(Boolean)
                  );
                }
              }
              setDatosCursoSeleccionado({
                ...fila,
                modoEdicion: false,
                fechasGuia,
              });
              setMostrarParticipantes(true);
            }}
            color="info"
            size="small"
          >
            <NoteAddIcon />
          </IconButton>
        </div>
      ),
    },
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
    <div>
      <div className="alert alert-info text-center">
        <strong style={{ color: '#085a9b' }}>ASISTENCIA</strong>
      </div>

      {loading ? (
        <TablaSkeleton filas={9} columnas={4} />
      ) : datos.length === 0 ? (
        <div className="alert alert-warning text-center mt-4">{mensajeApi}</div>
      ) : (
        <TablaCursos datos={datos} columnas={columnas} />
      )}

      {/* Dialog flotante para imprimir asistencia */}
      <Dialog
        open={openImprimir}
        onClose={() => setOpenImprimir(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Imprimir Asistencia - {nombrecurso}</DialogTitle>
        <DialogContent>
          <ImprimirAsistenciaSemana datos={datosSeleccionados} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Asistenciadocente;
