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
import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';

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
    let interval;
    cargarDatos();
    interval = setInterval(cargarDatos, 2000);
      return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    //setLoading(true);

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
  //console.log(datos);
  const columnas = [
    { clave: 'sesion', titulo: 'Sesión' },
    { clave: 'contenido', titulo: 'Contenido' },
    {
  clave: "fecha",
  titulo: "Fechas",
  render: (fila) => {
    // 👉 Normalizador de fechas a dd/mm/yyyy
    const formatFecha = (fechaStr) => {
      if (!fechaStr) return "";

      const str = String(fechaStr).trim();

      // Caso 1: ya viene dd/mm/yyyy
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return str;

      // Caso 2: yyyy-mm-dd
      let m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) return `${m[3]}/${m[2]}/${m[1]}`;

      // Caso 3: yyyy/mm/dd
      m = str.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
      if (m) return `${m[3]}/${m[2]}/${m[1]}`;

      // Caso 4: ISO con T o espacio → yyyy-mm-ddTHH:mm:ss
      m = str.match(/^(\d{4})-(\d{2})-(\d{2})[T\s].*$/);
      if (m) return `${m[3]}/${m[2]}/${m[1]}`;

      // Si no se reconoce, devolver tal cual
      return str;
    };


    // 👉 Tomamos la fecha principal
    let fechasGuia = [formatFecha(fila.fecha_programada)];

    // 👉 Y las adicionales si existen
    if (fila.fechas_adicionales) {
      try {
        const arr = JSON.parse(fila.fechas_adicionales);
        if (Array.isArray(arr)) {
          fechasGuia = fechasGuia.concat(arr.map((f) => formatFecha(f.fecha || f)));
        }
      } catch {
        fechasGuia = fechasGuia.concat(
          fila.fechas_adicionales
            .split(",")
            .map((f) => formatFecha(f.trim()))
            .filter((f) => f !== "")
        );
      }
    }

    // 👉 Mostramos todas las fechas (solo guía)
    return (
      <div style={{ textAlign: "center", fontWeight: "bold" }}>
        {fechasGuia.map((f, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#e0e0e0",
              color: "black",
              margin: "2px",
              padding: "3px",
              borderRadius: "4px",
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
      titulo: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
          <span>Asistencia</span>
          {/*<IconButton
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
            </IconButton> */}
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
            title={`Nuevo Asistencia: ${nombrecurso}`}
            onClick={() => {
              // 👉 Normaliza todas las fechas de la guía a formato yyyy-mm-dd
              const normalizar = (f) => {
                if (!f) return null;
                const partes = f.split("/");
                if (partes.length !== 3) return null;
                const [d, m, y] = partes;
                if (!d || !m || !y) return null;
                return `${y.padStart(4,"0")}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
              };
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
                      .split(",")
                      .map((f) => normalizarFecha(f.trim()))
                      .filter(Boolean)
                  );
                }
              }
              setDatosCursoSeleccionado({
                ...fila,
                modoEdicion: false,
                fechasGuia, // 👈 ahora mandamos las fechas válidas
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
        <TablaSkeleton filas={9} columnas={4} />
      ) : datos.length === 0 ? (
        <div className="alert alert-warning text-center mt-4">{mensajeApi}</div>
      ) : (
        <TablaCursos datos={datos} columnas={columnas} />
      )}
    </div>
  );
}

export default Asistenciadocente;




