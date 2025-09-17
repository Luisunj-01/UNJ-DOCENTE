import React, { useEffect, useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { Button } from 'react-bootstrap';
import config from '../../../config';
import { construirNombreArchivo, verificarArchivo } from '../../asignatura/logica/asignatura';
import ModalPDF from '../../../componentes/modales/ModalPDF';

/**
 * Botón que muestra un PDF si existe en el servidor.
 *
 * @param {object} props
 *  - fila: datos del curso (objeto con curso, estructura, nombrecurso, etc.)
 *  - semestre: string, semestre actual
 *  - token: string, token de autenticación Bearer
 *  - titulo: string, texto del botón
 *  - semana: string o número, semana correspondiente
 */
const BotonPDFTrabajo = ({ fila, semestre, token, titulo, semana }) => {
  const [urlPDF, setUrlPDF] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Validaciones mínimas
    if (!fila?.curso || !fila?.estructura || !semestre || !token) {
      setErrorMsg('Datos insuficientes para buscar el archivo.');
      return;
    }

    const nombreArchivo = construirNombreArchivo(fila, semestre, semana, 'trabajo');
    const ruta = `tra/${nombreArchivo}`;
    console.log('Buscando PDF en:', ruta);

    // Verificar existencia del archivo en el servidor
    (async () => {
      const result = await verificarArchivo(ruta, token);
      if (result?.success && result?.url) {
        console.log('PDF encontrado:', result.url);
        setUrlPDF(result.url);
      } else {
        console.warn('No se encontró el PDF:', result?.error || 'Sin detalles');
        setErrorMsg(result?.error || 'PDF no disponible.');
      }
    })();
  }, [fila, semestre, token, semana]);

  const abrirModal = () => {
    // Actualiza la URL para evitar caché del navegador
    setUrlPDF((prev) => (prev ? `${prev}?t=${Date.now()}` : null));
    setMostrarModal(true);
  };

  return (
    <>
      {urlPDF ? (
        <Button
          onClick={abrirModal}
          className="btn btn-sm btn-danger d-flex align-items-center gap-1"
          style={{ border: 'none' }}
        >
          <FaFilePdf fontSize={18} />
          {titulo}
        </Button>
      ) : (
        <Button
          className="btn btn-sm btn-secondary d-flex align-items-center gap-1"
          style={{ cursor: 'not-allowed', opacity: 0.5, border: 'none' }}
          title={errorMsg || 'PDF no disponible'}
          disabled
        >
          <FaFilePdf fontSize={18} />
          {titulo}
        </Button>
      )}

      {/* Modal para mostrar el PDF */}
      <ModalPDF
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
        url={urlPDF}
        titulo={fila?.nombrecurso || 'Documento'}
      />
    </>
  );
};

export default BotonPDFTrabajo;
