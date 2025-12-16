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
      const respTrabajos = await obtenerDatostrabajoguias(
        sede, semestre, escuela, curricula, curso, seccion, semana
      );
      console.log(respTrabajos);
      const listaTrabajos = respTrabajos?.datos || [];
      setTrabajos(listaTrabajos);

      // 👇 Ajuste aquí
      const respAlumnos = await obtenerRevisionTrabajo(
        sede, semestre, escuela, curricula, curso, seccion, semana
      );

      const alumnos = respAlumnos?.datos || [];  // <— usamos .datos

      if (alumnos.length === 0) {
        setMensajeApi('No se encontraron alumnos para esta sección.');
        setLoading(false);
        return;
      }

      const datosConNotas = await Promise.all(
        alumnos.map(async (al) => {
          const notasResp = await obtenerDatosnotas(
            sede, semestre, escuela, curricula, curso, seccion, semana, al.alumno
          );
          const notas = notasResp?.datos || [];

          const notasMap = {};
          listaTrabajos.forEach((trabajo, idx) => {
            const n = notas.find((x) => x.tra === trabajo.tra);
            notasMap[`nota${idx + 1}`] = n ? n.nota : '';
          });

          return {
            ...al,
            personaCompleta: `${al.persona || ''}${al.alumno || ''}`,
            ...notasMap,
          };
        })
      );

      setDatos(datosConNotas);
      setMensajeApi('');
    } catch (err) {
      console.error('Error al cargar datos:', err);
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



  const guardarNotaTrabajo = async (tra, alumno, nota) => {
    const payload = {
      tra,
      alumno,
      docente: usuario?.docente.numerodocumento, // Asegúrate que tengas esto en tu contexto de usuario
      nota: parseFloat(nota),
    };

    try {
      const respuesta = await fetch(`${config.apiUrl}api/curso/GrabarNotaTrabajo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await respuesta.json();

      if (!respuesta.ok || data.error) {
        mostrarToast(data.mensaje || 'Error al guardar nota', 'danger');
        return;
      }

      mostrarToast('Nota guardada correctamente.', 'success');
    } catch (error) {
      console.error('Error al guardar nota:', error);
      mostrarToast('Error de conexión al guardar nota.', 'danger');
    }
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
  // Columnas dinámicas
  const columnas = [
    { clave: 'alumno', titulo: 'Código' },
    { clave: 'nombrecompleto', titulo: 'Nombres Completos' },
    ...trabajos.map((trabajo, idx) => {
      // 🔹 convertir a minúsculas y truncar a 20 caracteres con “...”
      const nombre = trabajo.contenido.toLowerCase();
      const nombreCorto =
        nombre.length > 15 ? nombre.slice(0, 15) + '…' : nombre;

      return {
        clave: `tra${idx + 1}`,
        titulo: (
          <div
            style={{
              fontSize: '0.75rem',
              textAlign: 'center',
              lineHeight: 1.2,
              whiteSpace: 'normal'
            }}
          >
            <strong>TRABAJO {idx + 1}</strong>
            <br />
            <p style={{ fontSize: '11px', marginTop: '4px' }}>{nombreCorto}</p>
          </div>
        ),
        render: (fila) => {
          const idTrabajo = fila[`tra${idx + 1}`];
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {idTrabajo ? (
                <BotonPDFTrabajo
                  fila={{
                    tra: idTrabajo,                 // id del trabajo (tra)
                    alumno: fila.alumno,            // ✅ codigo alumno
                    sede,
                    estructura: datoscurso?.estructura ?? escuela, // ✅ estructura real
                    curricula,
                    curso,
                    seccion,
                  }}
                  semestre={semestre}
                  token={token}
                />


              ) : (
                <span className="text-muted">No enviado</span>
              )}
              <input
                type="number"
                min="0"
                max="20"
                step="0.01"
                className="form-control form-control-sm"
                placeholder="nota"
                value={fila[`nota${idx + 1}`] || ''}
                style={{ width: '60px' }}

                onChange={(e) => {
                  const nuevaNota = e.target.value.replace(',', '.');

                  // Permitir vacío (para editar)
                  if (nuevaNota === '') {
                    actualizarAsistenciaLocal(fila.alumno, fila.nombrecompleto, {
                      [`nota${idx + 1}`]: '',
                    });
                    return;
                  }

                  // Validar que sea número
                  const notaNum = Number(nuevaNota);

                  if (isNaN(notaNum)) {
                    mostrarToast('La nota debe ser numérica', 'warning');
                    return;
                  }

                  // Validar rango 0 - 20
                  if (notaNum < 0 || notaNum > 20) {
                    mostrarToast('❌ Nota incorrecta: debe estar entre 0 y 20', 'danger');
                    return;
                  }

                  // Validar máximo 2 decimales
                  if (!/^\d{1,2}(\.\d{0,2})?$/.test(nuevaNota)) {
                    mostrarToast('La nota solo puede tener hasta 2 decimales', 'warning');
                    return;
                  }

                  const trabajoId = trabajos[idx].tra;

                  // ✅ Actualiza estado local
                  actualizarAsistenciaLocal(fila.alumno, fila.nombrecompleto, {
                    [`nota${idx + 1}`]: nuevaNota,
                  });

                  // ✅ Guarda en backend
                  guardarNotaTrabajo(trabajoId, fila.alumno, notaNum);
                }}


            

              />

            </div>
          );
        },
      };
    }),
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
