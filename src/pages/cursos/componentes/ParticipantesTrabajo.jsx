import React, { useContext, useEffect, useState } from 'react';
import TablaCursos from '../../reutilizables/componentes/TablaCursos';
import { useParams } from 'react-router-dom';
import { obtenerRevisionTrabajo, obtenerDatosnotas } from '../logica/Curso';
import { obtenerDatostrabajoguias } from '../../asignatura/logica/asignatura';
import { ToastContext } from '../../../cuerpos/Layout';
import config from '../../../config';
import BotonPDFTrabajo from '../../asignatura/componentes/BotonPDFTrabajo';
import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';
import { useUsuario } from '../../../context/UserContext';

const RevisionTraPart = ({ datoscurso, semana }) => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensajeApi, setMensajeApi] = useState('');
  const [trabajos, setTrabajos] = useState([]);

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
      // 1️⃣ Traer trabajos registrados
      const respTrabajos = await obtenerDatostrabajoguias(
        sede,
        semestre,
        escuela,
        curricula,
        curso,
        seccion,
        semana
      );
       
      setTrabajos(respTrabajos?.datos || []);

      // 2️⃣ Traer alumnos
      const respuestaAsistencia = await obtenerRevisionTrabajo(
        sede,
        semestre,
        escuela,
        curricula,
        curso,
        seccion,
        semana
      );
       
      await obtenerDatosnotas(sede, semestre, escuela, curricula, curso, seccion, semana);

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
      setMensajeApi(respuestaAsistencia.mensaje);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMensajeApi('Ocurrió un error al obtener los datos.');
    }
    setLoading(false);
  };

  const actualizarAsistenciaLocal = (alumno, nombrecompleto, cambios) => {
    const claveStorage = 'asistenciasSeleccionadas';
    let asistencias = JSON.parse(localStorage.getItem(claveStorage)) || [];

    const index = asistencias.findIndex((item) => item.alumno === alumno);
    if (index !== -1) {
      asistencias[index] = { ...asistencias[index], ...cambios };
    } else {
      const alumnoActual = datos.find((d) => d.alumno === alumno) || {};
      asistencias.push({
        persona: alumnoActual.personaCompleta || '',
        alumno,
        nombrecompleto,
        ...cambios,
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
      registros: asistencias.map((a) => ({
        persona: a.persona + a.alumno,
      })),
    };

    try {
      setSaving(true);
      const response = await fetch(`${config.apiUrl}api/curso/RevisionTrabajo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!data.error) {
        mostrarToast('Participantes guardados correctamente.', 'success');
      } else {
        mostrarToast(data.mensaje, 'danger');
      }
    } catch (error) {
      console.error('Error en guardado:', error);
      mostrarToast('Error al guardar.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Columnas dinámicas
  const columnas = [
    { clave: 'alumno', titulo: 'Código' },
    { clave: 'nombrecompleto', titulo: 'Nombres Completos' },
    ...trabajos.map((_, idx) => ({
      clave: `tra${idx + 1}`,
      titulo: `Trabajo ${idx + 1}`,
      render: (fila) => {
        const idTrabajo = fila[`tra${idx + 1}`];
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {idTrabajo ? (
              <BotonPDFTrabajo
                fila={{
                  trabajo: idTrabajo,
                  sede,
                  semestre,
                  estructura: escuela,
                  curricula,
                  curso,
                  seccion,
                }}
                semestre={semestre}
                semana={semana}
                token={token}
                titulo=""
                idTrabajo={idTrabajo}
              />
            ) : (
              <span className="text-muted">No enviado</span>
            )}
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="nota"
              value={fila[`nota${idx + 1}`] || ''}
              onChange={(e) =>
                actualizarAsistenciaLocal(fila.alumno, fila.nombrecompleto, {
                  [`obs${idx + 1}`]: e.target.value,
                })
              }
              style={{ width: '50px' }}
            />
          </div>
        );
      },
    })),
  ];

  return (
    <div style={{ position: 'relative' }}>
      {saving && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.7)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Guardando...</span>
          </div>
        </div>
      )}

      <div className="mb-3">
        <button className="btn btn-success" onClick={guardarAsistenciaFinal}>
          Guardar
        </button>
      </div>

      {loading ? (
        <TablaSkeleton filas={9} columnas={columnas.length} />
      ) : trabajos.length === 0 ? (
        <div className="alert alert-info text-center mt-4">
          No hay trabajos para mostrar.
        </div>
      ) : datos.length === 0 ? (
        <div className="alert alert-warning text-center mt-4">{mensajeApi}</div>
      ) : (
        <TablaCursos datos={datos} columnas={columnas} />
      )}
    </div>
  );
};

export default RevisionTraPart;
