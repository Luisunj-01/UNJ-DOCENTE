import React, { useContext, useEffect, useState } from 'react';
import TablaCursos from '../../reutilizables/componentes/TablaCursos';
import { useParams } from 'react-router-dom';
import { obtenerparticipantes } from '../logica/Curso';
import { Form } from 'react-bootstrap';
import { ToastContext } from '../../../cuerpos/Layout';
import config from '../../../config';


const ParticipantesGuias = ({ datoscurso, semana }) => {

  
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  const { id } = useParams();
  
  const decoded = atob(atob(id));
  const [sede, semestre, escuela, curricula, curso, seccion] = decoded.split('|');
  const { mostrarToast } = useContext(ToastContext);  
  

  useEffect(() => {
    if (!datoscurso?.modoEdicion) {
      localStorage.removeItem('asistenciasSeleccionadas');
    }
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        seccion,
        semana
      );

      if (!respuestaAsistencia || !respuestaAsistencia.datos) {
        setMensajeApi('No se pudo obtener el detalle de la Asistencia.');
        setLoading(false);
        return;
      }

      const datosInicializados = respuestaAsistencia.datos.map((item) => ({
        ...item,
        personaCompleta: (item.persona || '') + (item.alumno || ''),
        actividad: item.actividad ?? 0,   // antes act
        evidencia: item.evidencia ?? 0,   // antes evi
        participo: item.participo ?? 0,   // antes par
        minutos: item.minutos ?? 0,
        tema: item.tema || ''
      }));

      setDatos(datosInicializados);
      setMensajeApi(respuestaAsistencia.mensaje);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMensajeApi('Ocurrió un error al obtener los datos.');
    }
    setLoading(false);
  };

  //console.log(datos);
  
  const actualizarAsistenciaLocal = (alumno, nombrecompleto, cambios) => {
  const claveStorage = 'asistenciasSeleccionadas';
  let asistencias = JSON.parse(localStorage.getItem(claveStorage)) || [];

  const index = asistencias.findIndex((item) => item.alumno === alumno);

  if (index !== -1) {
    // Si ya existe, actualiza solo el campo cambiado
    asistencias[index] = { ...asistencias[index], ...cambios };
  } else {
    // Si no existe, inicializa con TODOS los valores actuales del alumno
    const alumnoActual = datos.find(d => d.alumno === alumno) || {};
    asistencias.push({
      persona: alumnoActual.personaCompleta || '',
      alumno,
      nombrecompleto,
      actividad: alumnoActual.actividad ?? 0,
      evidencia: alumnoActual.evidencia ?? 0,
      participo: alumnoActual.participo ?? 0,
      minutos: alumnoActual.minutos,
      tema: alumnoActual.tema,
      ...cambios // Sobrescribe con el cambio actual
    });
  }

  localStorage.setItem(claveStorage, JSON.stringify(asistencias));

  setDatos((prevDatos) =>
    prevDatos.map((item) =>
      item.alumno === alumno ? { ...item, ...cambios } : item
    )
  );
};



  const guardarAsistenciaFinal = async () => {
  const claveStorage = 'asistenciasSeleccionadas';
  const asistencias = JSON.parse(localStorage.getItem(claveStorage)) || [];

  if (asistencias.length === 0) {
    mostrarToast('No hay asistencias seleccionadas para guardar.', 'danger');
    return;
  }

  const payload = {
    txtTipo: 'U',
    total: asistencias.length,
    sede,
    semestre,
    escuela,
    curricula,
    curso,
    seccion,
    semana: datoscurso.semana,
    registros: asistencias.map(a => ({
      persona: a.persona + a.alumno,
      minutos: a.minutos ?? 0,
      tema: a.tema ?? '',
      act: a.actividad ? 1 : 0,
      evi: a.evidencia ? 1 : 0,
      par: a.participo ? 1 : 0
    }))
  };

  console.log(payload);
  const response = await fetch(`${config.apiUrl}api/curso/GrabarParticipantes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!data.error) {
    mostrarToast('Participantes guardados correctamente.', 'success');
    /*localStorage.removeItem(claveStorage);
    setDatos(prev =>
      prev.map(alumno => ({
        ...alumno,
        actividad: 0,
        evidencia: 0,
        participo: 0,
        min: 0,
        observacion: ''
      }))
    );*/
  } else {
    mostrarToast(data.mensaje, 'danger');
  }
};





console.log(datos);

  const columnas = [
  { clave: 'alumno', titulo: 'Código' },
  { clave: 'nombrecompleto', titulo: 'Nombres' },
  {
    clave: 'actividad',
    titulo: 'Act',
    render: (fila) => (
      <Form.Check
        type="checkbox"
        checked={fila.actividad === 1 || fila.actividad === true}
        onChange={(e) =>
          actualizarAsistenciaLocal(
            fila.alumno,
            fila.nombrecompleto,
            { actividad: e.target.checked ? 1 : 0 }
          )
        }
      />
    ),
  },
  {
    clave: 'evidencia',
    titulo: 'Evi',
    render: (fila) => (
      <Form.Check
        type="checkbox"
        checked={fila.evidencia === 1 || fila.evidencia === true}
        onChange={(e) =>
          actualizarAsistenciaLocal(
            fila.alumno,
            fila.nombrecompleto,
            { evidencia: e.target.checked ? 1 : 0 }
          )
        }
      />
    ),
  },
  {
    clave: 'participo',
    titulo: 'Par',
    render: (fila) => (
      <Form.Check
        type="checkbox"
        checked={fila.participo === 1 || fila.participo === true}
        onChange={(e) =>
          actualizarAsistenciaLocal(
            fila.alumno,
            fila.nombrecompleto,
            { participo: e.target.checked ? 1 : 0 }
          )
        }
      />
    ),
  },
  {
    clave: 'min',
    titulo: 'Min',
    render: (fila) => (
      <Form.Control
        type="number"
        min="0"
        value={fila.minutos ?? 0} // leer minutos
        onChange={(e) =>
          actualizarAsistenciaLocal(
            fila.alumno,
            fila.nombrecompleto,
            { minutos: Number(e.target.value) } // actualizar minutos
          )
        }
      />
    ),
  },
  {
    clave: 'observacion',
    titulo: 'Observación',
    render: (fila) => (
      <Form.Control
        type="text"
        value={fila.tema || ''} // leer tema
        onChange={(e) =>
          actualizarAsistenciaLocal(
            fila.alumno,
            fila.nombrecompleto,
            { tema: e.target.value } // actualizar tema
          )
        }
      />
    ),
  },
];

  return (
    <div>
      <div className="alert alert-info text-center">
        <strong style={{ color: '#085a9b' }}>PARTICIPANTES</strong>
      </div>

      <div className="mb-3">
        <button className="btn btn-success" onClick={guardarAsistenciaFinal}>
          Guardar
        </button>
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
};

export default ParticipantesGuias;

