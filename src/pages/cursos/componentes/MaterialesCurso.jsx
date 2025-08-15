import React, { useContext, useEffect, useState } from 'react';
import { useUsuario } from '../../../context/UserContext';
import { useParams } from 'react-router-dom';
import { obtenermaterialguias, eliminarMaterialAlumno } from '../../asignatura/logica/asignatura';
import { obtenerCursosPrematricula } from '../../reutilizables/logica/docente';
import BotonPDF from '../../asignatura/componentes/BotonPDF';
import TablaCursos from '../../reutilizables/componentes/TablaCursos';
import ModalNuevoMaterial from './ModalNuevoMaterial';
import config from '../../../config';
import { ToastContext } from '../../../cuerpos/Layout';

const MaterialesCurso = ({ fila }) => {
  const { usuario } = useUsuario();
  const { id } = useParams();
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);

  const decoded = atob(atob(id));
  const [sede, semestre, escuela, curricula, curso, seccion, nombrecurso, nombredocente] = decoded.split('|');

  const persona = usuario.docente.persona;
  const dni = usuario.docente.numerodocumento;
  const tipo = 'D';
  const semana = fila.semana;
  const token = usuario?.codigotokenautenticadorunj;

  const [datos, setDatos] = useState([]);
  const [datos3, setDatos3] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');

  const [mostrarModal, setMostrarModal] = useState(false);
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);
  const { mostrarToast } = useContext(ToastContext); 

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const respuestrabGuia = await obtenermaterialguias(sede, semestre, escuela, curricula, curso, seccion, semana);

      if (!respuestrabGuia || !respuestrabGuia.datos) {
        setMensajeApi('No se pudo obtener el detalle de guías.');
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
    setMostrarModal(true);
  };

  const ejecutarEliminacion = async () => {
    if (!filaSeleccionada) return;

    const fila = filaSeleccionada;
    console.log(fila);
    const codigoMaterial = fila.guiamaterial;

    try {
      const respuesta = await eliminarMaterialAlumno(
        codigoMaterial,
        sede,
        semestre,
        escuela,
        curricula,
        curso,
        seccion,
        semana
      );

      if (!respuesta.error) {
        mostrarToast('Material eliminado correctamente.', "success")
        
        setMostrarModal(false);
        cargarDatos();
      } else {
        alert(respuesta.mensaje || 'No se pudo eliminar el material.');
      }
    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al intentar eliminar el material.');
    }
  };

  // Guardar nuevo material con Laravel
  // Guardar nuevo material con Laravel (corregido)
const handleGuardarMaterial = async (formData) => {
  try {
    const payload = {
      cod: Number(usuario.docente.persona),
      sede,
      semestre,
      escuela,
      curricula,
      curso,
      seccion,
      semana,
      contenido: formData.contenido,
      observacion: formData.observacion,
      tipo: formData.tipo || "C" // 👈 valor por defecto si viene vacío
    };

    console.log("Enviando datos a API:", payload);

    const respuesta = await fetch(`${config.apiUrl}api/curso/GrabarMaterialalumno`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (respuesta.status === 422) {
      const errorData = await respuesta.json();
      console.error("Errores de validación Laravel:", errorData.errors);
      alert("Errores de validación: " + JSON.stringify(errorData.errors));
      return;
    }

    if (!respuesta.ok) {
      const errorData = await respuesta.json();
      console.error("Error en la API:", errorData);
      alert(errorData.mensaje || "Error desconocido en el servidor.");
      return;
    }

    const data = await respuesta.json();
    console.log("Respuesta del procedimiento:", data);

    if (!data.error) {
      mostrarToast("Material guardado correctamente", "success")
      
      setMostrarModalNuevo(false);
      cargarDatos();
    } else {
      alert(data.mensaje || "Error al guardar material");
    }

  } catch (error) {
    console.error("Error en fetch:", error);
    alert("Error al guardar el material");
  }
};




  const columnas = [
    { clave: 'contenido', titulo: 'Contenido' },
    { clave: 'observacion', titulo: 'Observación' },
    {
      titulo: 'Material',
      render: (fila) => {
        const cursoItem = datos3.find(item =>
          item.curso === curso &&
          item.seccion === seccion &&
          item.curricula === curricula
        );

        if (!cursoItem) {
          return <span className="text-danger">Material no encontrado</span>;
        }

        return (
          <BotonPDF
            fila={cursoItem}
            semestre={semestre}
            escuela={cursoItem?.descripcionescuela}
            token={token}
            titulo="SUBIR MATERIAL DEL CURSO"
            semana={fila.guiamaterial}
            ruta="material"
            tipo="material"
          />
        );
      }
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
        </div>
      )
    }
  
  ];

  return (
    <div>
       <button
            className="btn btn-primary btn-sm mb-2"
            onClick={() => setMostrarModalNuevo(true)}
          >
            + Nuevo
          </button>
      {loading ? (
        <div>Cargando materiales...</div>
      ) : datos.length === 0 ? (
        <TablaCursos datos={datos} columnas={columnas} />
      ) : (
        <>
         

          <TablaCursos datos={datos} columnas={columnas} />
        </>
      )}

      {/* Modal Nuevo Material */}
      <ModalNuevoMaterial
        mostrar={mostrarModalNuevo}
        onClose={() => setMostrarModalNuevo(false)}
        onGuardar={handleGuardarMaterial}
      />

      {/* Modal Confirmar Eliminación */}
      {mostrarModal && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered"> {/* centrado vertical */}
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirmar eliminación</h5>
                  <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>¿Estás seguro de que deseas eliminar este material?</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setMostrarModal(false)}>
                    Cancelar
                  </button>
                  <button className="btn btn-danger" onClick={ejecutarEliminacion}>
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

export default MaterialesCurso;

