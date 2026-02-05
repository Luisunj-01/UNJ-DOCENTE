import React, { useContext, useEffect, useState } from 'react';
import TablaCursos from '../../reutilizables/componentes/TablaCursos';
import { useParams } from 'react-router-dom';
import { obtenerparticipantes } from '../logica/Curso';
import { Form } from 'react-bootstrap';
import { ToastContext } from '../../../cuerpos/Layout';
import config from '../../../config';
import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';
import { useUsuario } from '../../../context/UserContext';
import Swal from "sweetalert2";
import { Grow } from '@mui/material';
import TablaCursoParticipante from '../../reutilizables/componentes/TablaCursoParticipante';


const ParticipantesGuias = ({ datoscurso, semana }) => {

  const { usuario } = useUsuario();
    const token = usuario?.codigotokenautenticadorunj;
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  const { id } = useParams();
  
  const decoded = atob(atob(id));
  const [sede, semestre, escuela, curricula, curso, seccion] = decoded.split('|');
  const { mostrarToast } = useContext(ToastContext);  
  const [checkAllActividad, setCheckAllActividad] = useState(false);
const [checkAllEvidencia, setCheckAllEvidencia] = useState(false);
const [checkAllParticipo, setCheckAllParticipo] = useState(false);
const [guardando, setGuardando] = useState(false);


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

const marcarTodos = (campo, valor) => {
  const claveStorage = 'asistenciasSeleccionadas';
  let asistencias = JSON.parse(localStorage.getItem(claveStorage)) || [];

  const nuevosDatos = datos.map(item => {
    const cambios = { [campo]: valor ? 1 : 0 };

    const index = asistencias.findIndex(a => a.alumno === item.alumno);

    if (index !== -1) {
      asistencias[index] = { ...asistencias[index], ...cambios };
    } else {
      asistencias.push({
        persona: item.personaCompleta || '',
        alumno: item.alumno,
        nombrecompleto: item.nombrecompleto,
        actividad: item.actividad ?? 0,
        evidencia: item.evidencia ?? 0,
        participo: item.participo ?? 0,
        minutos: item.minutos,
        tema: item.tema,
        ...cambios
      });
    }

    return { ...item, ...cambios };
  });

  localStorage.setItem(claveStorage, JSON.stringify(asistencias));
  setDatos(nuevosDatos);
};

useEffect(() => {
  if (datos.length > 0) {
    setCheckAllActividad(datos.every(d => d.actividad === 1));
    setCheckAllEvidencia(datos.every(d => d.evidencia === 1));
    setCheckAllParticipo(datos.every(d => d.participo === 1));
  }
}, [datos]);




 const guardarAsistenciaFinal = async () => {

  setGuardando(true); // 👈 INICIA loading

  try {

    const claveStorage = 'asistenciasSeleccionadas';
    const asistencias = JSON.parse(localStorage.getItem(claveStorage)) || [];

    if (asistencias.length === 0) {
      mostrarToast('No hay asistencias seleccionadas para guardar.', 'danger');
      setGuardando(false);
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

    const response = await fetch(`${config.apiUrl}api/curso/GrabarParticipantes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data.error) {
      Swal.fire("✅ Éxito", 'Participantes guardados correctamente.', "success");
    } else {
      mostrarToast(data.mensaje, 'danger');
    }

  } catch (error) {
    console.error(error);
    mostrarToast('Error al guardar', 'danger');
  }

  setGuardando(false); // 👈 TERMINA loading
};


  const columnas = [
  { clave: 'alumno', titulo: 'Código' },
  { clave: 'nombrecompleto', titulo: 'Nombres'},
  {
  clave: 'actividad',
 titulo: (
  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <span>Act</span>
    <Form.Check
      type="checkbox"
      checked={checkAllActividad}
      onChange={(e) => {
        const valor = e.target.checked;
        setCheckAllActividad(valor);
        marcarTodos("actividad", valor);
      }}
    />
  </div>
),


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
  titulo: (
  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <span>Evi</span>
    <Form.Check
      type="checkbox"
      checked={checkAllEvidencia}
      onChange={(e) => {
        const valor = e.target.checked;
        setCheckAllEvidencia(valor);
        marcarTodos("evidencia", valor);
      }}
    />
  </div>
),


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
  titulo: (
  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <span>Par</span>
    <Form.Check
      type="checkbox"
      checked={checkAllParticipo}
      onChange={(e) => {
        const valor = e.target.checked;
        setCheckAllParticipo(valor);
        marcarTodos("participo", valor);
      }}
    />
  </div>
),


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


  {/*
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
  */},
  {/*
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
  */},
];

  return (
    <div>
      <div className="alert alert-info text-center">
        <strong style={{ color: '#085a9b' }}>PARTICIPANTES</strong>
      </div>

      <div className="mb-3">
        <button
        className="btn btn-success"
        onClick={guardarAsistenciaFinal}
        disabled={guardando}
      >
        {guardando ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Guardando...
          </>
        ) : (
          "Guardar"
        )}
      </button>

      </div>

      {loading ? (
  <TablaSkeleton filas={9} columnas={8} />
) : datos.length === 0 ? (
  <TablaCursoParticipante datos={datos} columnas={columnas}/>
) : (
  <TablaCursoParticipante datos={datos} columnas={columnas}/>
)}

    </div>
  );
};

export default ParticipantesGuias;

