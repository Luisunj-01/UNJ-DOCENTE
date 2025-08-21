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

    // 👇 usamos "trabajo" como nombre de carpeta
    const nombreArchivo = construirNombreArchivo(fila, semestre, semana, 'trabajo');
  //console.log(nombreArchivo);
    const ruta = `tra/${nombreArchivo}`;

    verificarArchivo(ruta, token).then((url) => {
      if (url) {
        setUrlPDF(url);
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
        url={urlPDF}
        titulo={fila.nombrecurso}
      />
    </>
  );
};

export default BotonPDFTrabajo;
