// src/pages/asignatura/componentes/BotonPDF.js
import React, { useEffect, useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import config from '../../../config';
import { construirNombreArchivoverpdf, verificarArchivo } from '../../asignatura/logica/asignatura';
import { Button } from 'react-bootstrap';
import ModalPDFver from '../../../componentes/modales/ModalverPDF';
 // Ajusta la ruta según tu estructura

const BotonPDFver = ({ fila, token, semestre, titulo, nombrecarpeta, semana }) => {


  
  const [urlPDF, setUrlPDF] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  /*seEffect(() => {
    const nombreArchivo = construirNombreArchivo(fila, semestre);
    const ruta = `${nombrecarpeta}/${nombreArchivo}`;

    // Agregamos un timestamp para evitar la caché
    const rutaConCacheBusting = `${ruta}?t=${Date.now()}`;
    console.log(ruta);
    verificarArchivo(rutaConCacheBusting, token).then((url) => {
      setUrlPDF(url);
    });
  }, [fila, semestre, token]);*/

  useEffect(() => {
    if (!fila || !fila.curso || !fila.estructura) return;

    const nombreArchivo = construirNombreArchivoverpdf(fila, semestre, semana, nombrecarpeta);
    
    const ruta = `${nombrecarpeta}/${nombreArchivo}`;
    

    verificarArchivo(ruta, token).then((url) => {
      if (url) {
        setUrlPDF(url);
      }
    });
  }, [fila, semestre, token]);




const abrirModal = () => {
  setUrlPDF((prev) => `${prev}?t=${Date.now()}`);
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


      <ModalPDFver
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
        url={urlPDF}
        titulo={`${fila.nombrecurso}`}
      />
    </>
  );
};

export default BotonPDFver;
