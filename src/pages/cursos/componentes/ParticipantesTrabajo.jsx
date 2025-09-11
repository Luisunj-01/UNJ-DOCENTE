import React, { useContext, useEffect, useState } from 'react';
import TablaCursos from '../../reutilizables/componentes/TablaCursos';
import { useParams } from 'react-router-dom';
import { obtenerRevisionTrabajo, obtenerDatosnotas } from '../logica/Curso';
import { ToastContext } from '../../../cuerpos/Layout';
import config from '../../../config';
import BotonPDFTrabajo from '../../asignatura/componentes/BotonPDFTrabajo';
import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';
import { useUsuario } from '../../../context/UserContext';


const RevisionTraPart = ({ datoscurso, semana }) => {
    
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  const { id } = useParams();
  
  const decoded = atob(atob(id));
  const [sede, semestre, escuela, curricula, curso, seccion] = decoded.split('|');
  const { mostrarToast } = useContext(ToastContext);  
  
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;
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
      const respuestaAsistencia = await obtenerRevisionTrabajo(
        sede,
        semestre,
        escuela,
        curricula,
        curso,
        seccion,
        semana
      );

       const respuestanotas = await obtenerDatosnotas(
      sede,
      semestre,
      escuela,
      curricula,
      curso,
      seccion,
      semana,
    );

      console.log(respuestaAsistencia.datos);

      if (!respuestaAsistencia || !respuestaAsistencia.datos) {
        setMensajeApi('No se pudo obtener el detalle de los alumnos.');
        setLoading(false);
        return;
      }

      const datosInicializados = respuestaAsistencia.datos.map((item) => ({
        ...item,
        personaCompleta: (item.persona || '') + (item.alumno || ''),
        
      }));

      setDatos(datosInicializados);

      console.log(datos);
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
      
    }))
  };

  //console.log(payload);
  const response = await fetch(`${config.apiUrl}api/curso/RevisionTrabajo`, {
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


//console.log(datos);



const columnas = [
  { clave: 'alumno', titulo: 'Código' },
  { clave: 'nombrecompleto', titulo: 'Nombres Completos' },
  ...[1, 2, 3, 4, 5].map((num) => ({
    clave: `tra${num}`,
    titulo: `Trabajo ${num}`,
    render: (fila) => {
      const idTrabajo = fila[`tra${num}`];
      if (!idTrabajo) {
        return <span className="text-muted">No enviado</span>;
      }

      const filaCurso = {
        trabajo: idTrabajo,
        sede: sede,
        semestre: semestre,
        estructura: escuela,
        curricula: curricula,
        curso: curso,
        seccion: seccion,
      };

      return (
        <BotonPDFTrabajo 
          fila={filaCurso}
          semestre={semestre}
          semana={semana}
          token={token}
          titulo={``}
          idTrabajo={idTrabajo}
        />
      );
    }
  }))
];



  return (
    <div>
      

      <div className="mb-3">
        <button className="btn btn-success" onClick={guardarAsistenciaFinal}>
          Guardar
        </button>
      </div>

      {loading ? (
        <TablaSkeleton filas={9} columnas={8} />
      ) : datos.length === 0 ? (
        <div className="alert alert-warning text-center mt-4">{mensajeApi}</div>
      ) : (
        <TablaCursos datos={datos} columnas={columnas} />
      )}
    </div>
  );
};


export default RevisionTraPart;



