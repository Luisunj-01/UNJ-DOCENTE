import React, { useContext, useEffect, useState } from 'react';
import { useUsuario } from '../../../context/UserContext';
import { useParams } from 'react-router-dom';
import { obtenerDatostrabajoguias, eliminarTrabajoAlumno } from '../../asignatura/logica/asignatura';
import { obtenerCursosPrematricula } from '../../reutilizables/logica/docente';
import BotonPDF from '../../asignatura/componentes/BotonPDF';
import TablaCursos from '../../reutilizables/componentes/TablaCursos';
import ModalNuevoTrabajo from './ModalNuevoTrabajo';
import config from '../../../config';
import { ToastContext } from '../../../cuerpos/Layout';


const TrabajosCurso = ({ fila }) => {
  const { usuario } = useUsuario();
  const { id } = useParams();
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [trabajoEditando, setTrabajoEditando] = useState(null);

  const decoded = atob(atob(id));
  const [sede, semestre, escuela, curricula, curso, seccion, nombrecurso, nombredocente] = decoded.split('|');

  const persona = usuario.docente.persona;
  const dni = usuario.docente.numerodocumento;
  const tipo = 'D';
  const semana = fila.semana;
  const token = usuario?.codigotokenautenticadorunj;

  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  const [datos3, setDatos3] = useState([]);

  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);
  //agregar const { mostrarToast } = useContext(ToastContext);  para usar el toas como alerta
  const { mostrarToast } = useContext(ToastContext);  

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const respuestrabGuia = await obtenerDatostrabajoguias(sede, semestre, escuela, curricula, curso, seccion, semana);
      if (!respuestrabGuia || !respuestrabGuia.datos) {
        setMensajeApi('No se pudo obtener los trabajos.');
        setLoading(false);
        return;
      }
      setDatos(respuestrabGuia.datos);
      setMensajeApi(respuestrabGuia.mensaje);

      const { datos: cursos } = await obtenerCursosPrematricula(semestre, persona, dni, tipo, token);
      setDatos3(cursos);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMensajeApi('Ocurrió un error al obtener los datos.');
    }
    setLoading(false);
  };

  const confirmarEliminacion = (fila) => {
    setFilaSeleccionada(fila);
    setMostrarModalEliminar(true);
  };

  const ejecutarEliminacion = async () => {
    if (!filaSeleccionada) return;
    try {
      const respuesta = await eliminarTrabajoAlumno(
        filaSeleccionada.tra,
        sede,
        semestre,
        escuela,
        curricula,
        curso,
        seccion,
        semana
      );

      if (!respuesta.error) {
        mostrarToast("Trabajo eliminado correctamente", "success");
        setMostrarModalEliminar(false);
        cargarDatos();
      } else {
         mostrarToast(respuesta.mensaje || 'No se pudo eliminar el Trabajo.', "danger");
      }
    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al intentar eliminar el Trabajo.');
    }
  };

  const formatearFechaHora = (fecha, hora) => {
    if (!fecha || !hora) return null;
    // fecha: "DD/MM/YYYY"
    const dia = fecha.substring(0, 2);
    const mes = fecha.substring(3, 5);
    const anio = fecha.substring(6, 10);
    return `${anio}/${mes}/${dia} ${hora}`;
  };

  const handleGuardarMaterial = async (formData) => {
    try {
      const payload = {
        cod: modoEdicion && trabajoEditando ? trabajoEditando.tra : 0,
        sede,
        semestre,
        escuela,
        curricula,
        curso,
        seccion,
        semana,
        contenido: formData.contenido,
        fechalimite: formData.fechalimite,
        fechalimitefin: formData.fechalimitefin,
        tipo: (modoEdicion && trabajoEditando && trabajoEditando.tra !== 0) ? "U" : "N"
      };


      const respuesta = await fetch(`${config.apiUrl}api/curso/GrabarTrabajoalumno`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (respuesta.status === 422) {
        const errorData = await respuesta.json();
        alert("Errores de validación: " + JSON.stringify(errorData.errors));
        return;
      }

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        alert(errorData.mensaje || "Error desconocido en el servidor.");
        return;
      }

      const data = await respuesta.json();
      
     if (!data.error) {
        mostrarToast(data.mensaje, "success");
        setMostrarModalNuevo(false);
        setTrabajoEditando(null);
        setModoEdicion(false);
        cargarDatos();
      } else {
        mostrarToast(data.mensaje || "Error al guardar trabajo", "danger");
      }

    } catch (error) {
      console.error("Error en fetch:", error);
      alert("Error al guardar el trabajo");
    }
  };

 
  const columnas = [
    { clave: 'contenido', titulo: 'Contenido' },
    { clave: 'fechalimite', titulo: 'Observación' },
    {
      titulo: 'Trabajo',
      render: (fila) => {
        const cursoItem = datos3.find(
          (item) =>
            item.curso === curso &&
            item.seccion === seccion &&
            item.curricula === curricula
        );
        if (!cursoItem) {
          return <span className="text-danger">Trabajo no encontrado</span>;
        }
        return (
          <BotonPDF
            fila={cursoItem}
            semestre={semestre}
            escuela={cursoItem?.descripcionescuela}
            token={token}
            titulo={'Trabajo del curso'}
            semana={fila.tra}
            ruta="trabajo"
            tipo="trabajo"
          />
        );
      },
    },
    {
      titulo: 'Acciones',
      render: (fila) => (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => confirmarEliminacion(fila)}
          >
            Eliminar
          </button>

          <button
            className="btn btn-sm"
            style={{ backgroundColor: '#085a9b', color: 'white' }}
            onClick={() => {
              setModoEdicion(true);
              setTrabajoEditando(fila);
              setMostrarModalNuevo(true);
            }}
          >
            Modificar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '15px' }}>
        <button
          className="btn btn-success"
          onClick={() => {
            setModoEdicion(false);
            setTrabajoEditando(null);
            setMostrarModalNuevo(true);
          }}
        >
          +Nuevo 
        </button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <TablaCursos datos={datos} columnas={columnas} />
      )}

      <ModalNuevoTrabajo
        mostrar={mostrarModalNuevo}
        onClose={() => setMostrarModalNuevo(false)}
        onGuardar={handleGuardarMaterial}
        trabajo={trabajoEditando}
      />

      {mostrarModalEliminar && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirmar eliminación</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMostrarModalEliminar(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>¿Estás seguro de que deseas eliminar este trabajo?</p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setMostrarModalEliminar(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={ejecutarEliminacion}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default TrabajosCurso;
