import React, { useEffect, useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import config from '../../../config';
import { construirNombreArchivo, verificarArchivo } from '../../asignatura/logica/asignatura';
import { Button } from 'react-bootstrap';
import ModalPDF from '../../../componentes/modales/ModalPDF';

const BotonPDFTrabajo = ({ fila, semestre, token, titulo, semana }) => {
  const [urlPDF, setUrlPDF] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
 
  useEffect(() => {
    if (!fila || !fila.curso || !fila.estructura) return;

    const nombreArchivo = construirNombreArchivo(fila, semestre, semana, 'tra');
    const ruta = `tra/${nombreArchivo}`;

    verificarArchivo(ruta, token).then((res) => {
      if (res.success && res.url) {
        // Solo guardamos la cadena de la URL
        setUrlPDF(res.url);
      } else {
        setUrlPDF(null); // Aseguramos que quede null si no existe
      }
    });
  }, [fila, semestre, token, semana]);

  const abrirModal = () => {
    setUrlPDF((prev) => `${prev}?t=${Date.now()}`); // cache busting
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
          title="PDF no disponible"
          disabled
        >
          <FaFilePdf fontSize={18} />
          {titulo}
        </Button>
      )}

      <ModalPDF
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
        componente={urlPDF}
        titulo={fila.nombrecurso}
      />
    </>
  );
};

export default BotonPDFTrabajo;
