// src/pages/asignatura/componentes/BotonPDFTrabajo.jsx
import React, { useEffect, useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { Button } from 'react-bootstrap';
import ModalPDF from '../../../componentes/modales/ModalPDF';
import PdfViewer from '../../../componentes/modales/PdfViewer';
import { verificarArchivo } from '../../asignatura/logica/asignatura';

const BotonPDFTrabajo = ({ fila, semestre, token, titulo }) => {
  const [urlPDF, setUrlPDF] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    // ✅ si no tengo alumno o tra, no busco nada
    if (!fila?.tra || !fila?.alumno) {
      setUrlPDF(null);
      return;
    }

    const cursoSinGuion = (fila.curso || '').replace(/-/g, '');

    const nombre =
      `${fila.sede || ''}${semestre || ''}${fila.estructura || ''}${fila.curricula || ''}` +
      `${cursoSinGuion}${fila.seccion || ''}${fila.tra}${fila.alumno}.pdf`;

    const ruta = `tra/${nombre}`;

    setUrlPDF(null); // ✅ para que no se quede “rojo” con el anterior

    verificarArchivo(ruta, token).then((res) => {
      setUrlPDF(res?.success ? res.url : null);
    });
  }, [fila?.tra, fila?.alumno, fila?.sede, fila?.estructura, fila?.curricula, fila?.curso, fila?.seccion, semestre, token]);


  return (
    <>
      {urlPDF ? (
        <Button 
          onClick={() => setMostrarModal(true)}
          className="btn btn-sm btn-danger"
          style={{ border: 'none' }}
        >
          <FaFilePdf fontSize={18} />
          {titulo || ''}
        </Button>
      ) : (
        <Button
          onClick={() => window.open(`${urlPDF}?t=${Date.now()}`, '_blank', 'noopener,noreferrer')}
         className="btn btn-sm btn-secondary" disabled style={{opacity:0.5}}>
          <FaFilePdf fontSize={18} />
          {titulo || ''}
        </Button>
      )}

      <ModalPDF
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
        titulo={titulo || 'Trabajo'}
        componente={<PdfViewer url={urlPDF} />}
      />
    </>
  );
};

export default BotonPDFTrabajo;
