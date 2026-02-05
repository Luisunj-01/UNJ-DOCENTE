import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import TablaCursos from '../../reutilizables/componentes/TablaCursos';
import { obtenerdatosasistencia } from '../logica/Curso';

import PrintIcon from '@mui/icons-material/Print';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { IconButton } from '@mui/material';
import ParticipantesCurso from './Participantesasistencia';
import { ToastContext } from '../../../cuerpos/Layout';
import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';

function Asistenciadocente() {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  const { id } = useParams();
  const decoded = atob(atob(id));
  const [sede, semestre, escuela, curricula, curso, seccion, nombrecurso, nombredocente, tipo, grupo, sesion, clave] = decoded.split('|');
  const [mostrarParticipantes, setMostrarParticipantes] = useState(false);
  const [datosCursoSeleccionado, setDatosCursoSeleccionado] = useState(null);
  const { mostrarToast } = useContext(ToastContext);

  useEffect(() => {

  cargarDatos(true); // 👈 SOLO primera vez con loader

  const interval = setInterval(() => {
    cargarDatos(false); // 👈 refrescos sin loader
  }, 20000);

  return () => clearInterval(interval);

}, []);


  const cargarDatos = async (mostrarLoader = false) => {

  if (mostrarLoader) setCargandoPantalla(true);

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
     setCargandoPantalla(false);


  };

const [cargandoPantalla, setCargandoPantalla] = useState(true);



  const normalizarFecha = (fechaStr) => {
    if (!fechaStr) return null;
    const str = String(fechaStr).trim();

    let m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;

    m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;

    m = str.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;

    m = str.match(/^(\d{4})-(\d{2})-(\d{2})[T\s].*$/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;

    return null;
  };

  const contarFechasSesion = (fila) => {
    let contador = fila.fecha_programada ? 1 : 0;
    if (fila.fechas_adicionales) {
      try {
        const arr = JSON.parse(fila.fechas_adicionales);
        if (Array.isArray(arr)) contador += arr.length;
      } catch {
        contador += fila.fechas_adicionales.split(",").filter(f => f.trim() !== "").length;
      }
    }
    return contador;
  };

  const totalFechas = datos.reduce((total, fila) => total + contarFechasSesion(fila), 0);

  const columnas = [
    { clave: 'sesion', titulo: 'Sesión' },
    { clave: 'contenido', titulo: 'Contenido' },
    {
      clave: "fecha",
      titulo: "Fechas",
      render: (fila) => {
        const formatFecha = (fechaStr) => {
          if (!fechaStr) return "";
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
                .split(",")
                .map((f) => formatFecha(f.trim()))
                .filter((f) => f !== "")
            );
          }
        }

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
          <span>Asistencia ({totalFechas})</span>
        </div>
      ),
      render: (fila) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <IconButton
            title={`Imprimir Asistencia: ${nombrecurso}`}
            onClick={() => {
              const cadena = `${sede}|${semestre}|${escuela}|${curricula}|${curso}|${seccion}|${tipo}|${grupo}|${sesion}|${clave}`;
              const codigo = btoa(btoa(cadena));
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
                      .split(",")
                      .map((f) => normalizarFecha(f.trim()))
                      .filter(Boolean)
                  );
                }
              }

              setDatosCursoSeleccionado({
                ...fila,
                fechasGuia,
                todasLasAsistencias: datos
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

  if (cargandoPantalla) {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(255,255,255,0.8)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}>
      <div
        className="spinner-border text-primary"
        style={{ width: "4rem", height: "4rem" }}
      />
      <div style={{ marginTop: "15px", fontWeight: "600", color: "#0d6efd" }}>
        Cargando información....
      </div>
    </div>
  );
}


  return mostrarParticipantes && datosCursoSeleccionado ? (
    <>
      <div className="mb-3">
        <button className="btn btn-secondary" onClick={handleVolver}>
          ← Regresar
        </button>
      </div>
      <ParticipantesCurso
        datoscurso={datosCursoSeleccionado}
        totalFechas={totalFechas}
        todasLasAsistencias={datos}
      />
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
        <>
          {/* 🔹 Header con botones de impresión */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div></div>
            <div>
              <button
                className="btn btn-outline-primary btn-sm me-2"
                onClick={() => {
                const opciones = 'width=900,height=700,scrollbars=yes,resizable=yes';
                const cadena = `${sede}|${semestre}|${escuela}|${curricula}|${curso}|${seccion}|${tipo}|${grupo}|${sesion}|${clave}`;
                const codigo = btoa(btoa(cadena));
                window.open(`/imprimirasistenciaporcentaje?codigo=${codigo}`, 'Repguia', opciones);
              }}
              >
                <i className="fa fa-print"></i> Resumen de Asistencia (%)
              </button>

              <button
                className="btn btn-outline-secondary btn-sm"
                 onClick={() => {
                const opciones = 'width=900,height=700,scrollbars=yes,resizable=yes';
                const cadena = `${sede}|${semestre}|${escuela}|${curricula}|${curso}|${seccion}|${tipo}|${grupo}|${sesion}|${clave}`;
                const codigo = btoa(btoa(cadena));
                window.open(`/imprimirasistenciasesiones?codigo=${codigo}`, 'Repguia', opciones);
              }}
              >
                <i className="fa fa-print"></i> Reporte De Asistencia por Sesion
              </button>
            </div>
          </div>

          {/* 🔹 Tabla */}
          <TablaCursos datos={datos} columnas={columnas} />
        </>
      )}
    </div>
  );
}

export default Asistenciadocente;
