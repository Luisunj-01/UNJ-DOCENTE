import { useContext, useEffect, useState } from 'react';
import TablaCursos from '../../reutilizables/componentes/TablaCursos';
import { useParams } from 'react-router-dom';
import { obtenerparticipantes } from '../logica/Curso';
import { Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContext } from '../../../cuerpos/Layout';

function ParticipantesTrabajo({ datoscurso }) {
  const [datos, setDatos] = useState([]);
  const [asistencias, setAsistencias] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const { id } = useParams();
  const decoded = atob(atob(id));
  const [sede, semestre, escuela, curricula, curso, seccion] = decoded.split('|');
  const { mostrarToast } = useContext(ToastContext);  
  
  useEffect(() => {
    if (!datoscurso?.modoEdicion) {
      localStorage.removeItem('asistenciasSeleccionadas');
    }
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const respuestaAsistencia = await obtenerparticipantes(
        sede,
        semestre,
        escuela,
        curricula,
        curso,
        seccion
      );

      if (!respuestaAsistencia || !respuestaAsistencia.datos) {
        setMensajeApi('No se pudo obtener el detalle de la Asistencia.');
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

  const actualizarAsistenciaLocal = (alumno, nombrecompleto, asistencia, observacion = '') => {
    const claveStorage = 'asistenciasSeleccionadas';
    let asistencias = JSON.parse(localStorage.getItem(claveStorage)) || [];

    if (asistencia === '0') {
      asistencias = asistencias.filter((item) => item.alumno !== alumno);
    } else {
      const index = asistencias.findIndex((item) => item.alumno === alumno);
      if (index !== -1) {
        asistencias[index].asistencia = asistencia;
        asistencias[index].observacion = observacion;
      } else {
        asistencias.push({ alumno, nombrecompleto, asistencia, observacion });
      }
    }

    localStorage.setItem(claveStorage, JSON.stringify(asistencias));

    setDatos((prevDatos) =>
      prevDatos.map((item) =>
        item.alumno === alumno ? { ...item, asistencia, observacion } : item
      )
    );
  };

  const guardarAsistenciaFinal = () => {
    const claveStorage = 'asistenciasSeleccionadas';
    const asistencias = JSON.parse(localStorage.getItem(claveStorage)) || [];

    if (asistencias.length === 0) {
      mostrarToast('No hay asistencias seleccionadas para guardar.', 'info');
      //alert('No hay asistencias seleccionadas para guardar.');
      return;
    }

    const fechaFormateada = fechaSeleccionada.toISOString().split('T')[0];
    setAsistencias(asistencias);
    console.log('📅 Fecha seleccionada:', fechaFormateada); 
    console.log('📤 Asistencias a guardar:', asistencias);
    mostrarToast('Asistencia guardada correctamente.', 'success');
    //alert('Asistencia guardada correctamente.');

    localStorage.removeItem(claveStorage);

    const datosLimpiados = datos.map((alumno) => ({
      ...alumno,
      asistencia: '0',
      observacion: '',
    }));

    setDatos(datosLimpiados);
  };

  console.log(datos);
  const columnas = [
    //{ clave: 'dato', titulo: 'Nro.' },
    { clave: 'alumno', titulo: 'Código' },
    { clave: 'nombrecompleto', titulo: 'Nombres Completos' },
    
    {
      clave: 'observacion',
      titulo: 'Observación',
      render: (fila, index) => (
        <Form.Group controlId={`observacion${index + 1}`}>
          <Form.Control
            type="text"
            placeholder="Escribe una observación"
            value={fila.observacion || ''}
            onChange={(e) => {
              const nuevaObservacion = e.target.value;
              actualizarAsistenciaLocal(
                fila.alumno,
                fila.nombrecompleto,
                fila.asistencia || '0',
                nuevaObservacion
              );
            }}
          />
        </Form.Group>
      ),
    },
    {
      clave: 'asistencia',
      titulo: 'Asistencia',
      render: (fila, index) => (
        <Form.Group controlId={`asistencia${index + 1}`}>
          <Form.Select
            value={fila.asistencia || '0'}
            onChange={(e) => {
              const valor = e.target.value;
              actualizarAsistenciaLocal(
                fila.alumno,
                fila.nombrecompleto,
                valor,
                fila.observacion || ''
              );
            }}
          >
            <option value="0">Seleccione Asistencia</option>
            <option value="A">Asistencia</option>
            <option value="F">Falta Just.</option>
            <option value="I">Falta</option>
            <option value="T">Tardanza Just.</option>
            <option value="J">Tardanza</option>
          </Form.Select>
        </Form.Group>
      ),
    },
  ];

  return (
    <div>
      <div className="alert alert-info text-center">
        <strong style={{ color: '#085a9b' }}>PARTICIPANTES</strong>
      </div>

      {/* 🔒 Sección comentada: detalles del curso
      <div className="mb-3">
        <p><strong>Sede:</strong> {sede}</p>
        <p><strong>Escuela:</strong> {escuela}</p>
        <p><strong>Curso:</strong> {curso}</p>
        <p><strong>Semestre:</strong> {semestre}</p>
        <p><strong>Sección:</strong> {seccion}</p>
      </div>
      */}

      <div className="mb-3">
        <label><strong>Fecha:</strong></label>
        <DatePicker
          selected={fechaSeleccionada}
          onChange={(date) => setFechaSeleccionada(date)}
          dateFormat="dd/MM/yyyy"
          className="form-control mb-2"
        />
        <div className="d-flex justify-content-start">
          <button className="btn btn-success" onClick={guardarAsistenciaFinal}>
            Guardar Asistencia
          </button>
        </div>
      </div>

      {loading ? (
        <div className="alert alert-warning text-center mt-4">{mensajeApi}</div>
      ) : datos.length === 0 ? (
        <div className="alert alert-warning text-center mt-4">{mensajeApi}</div>
      ) : (
        <TablaCursos datos={datos} columnas={columnas} />
      )}
    </div>
  );
}

export default ParticipantesTrabajo;

